import React, { useEffect, useState, useRef } from 'react';
import { useSpring, animated, to } from 'react-spring';
import { useGesture } from '@use-gesture/react';
import { cardsImages } from './CardsImgs';
import { useAppContext } from '@/context/AppContext';
import { PhysicsSettings } from './Settings';

interface Card {
  id: CardId;
  position: { x: number; y: number };
  last_position: { x: number; y: number };
  flipped: boolean;
  rotations: number;
  velocity: { x: number; y: number };
  direction: { x: number; y: number };
  zIndex: number;
}

export type CardId = keyof typeof cardsImages;

interface MegaCardProps {
  card: Card;
  onCardUpdate: (card: Card) => void;
  forceFlipped: boolean;
  isShuffling: boolean;
  physicsParams: PhysicsSettings;
}

export const MegaCard: React.FC<MegaCardProps> = ({ card, onCardUpdate, forceFlipped, isShuffling, physicsParams }) => {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [cardPosition, setCardPosition] = useState(card.position);
  const preDragPositionRef = useRef({ x: card.last_position.x, y: card.last_position.y });
  const yeetLocked = useRef(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isYeeted, setIsYeeted] = useState(false);
  const { t } = useAppContext();
  const [rotations, setRotations] = useState(card.rotations);
  const [isFlipped, setIsFlipped] = useState(card.flipped);
  const prevFlippedState = useRef(card.flipped);
  const [isAnimating, setIsAnimating] = useState(false);
  const [{ x, y, rotY, rotZ, scale, shadowBlur, shadowY }, setSpring] = useSpring(() => ({
    x: cardPosition.x * window.innerWidth,
    y: cardPosition.y * window.innerHeight,
    rotY: isFlipped ? 180 : 0,
    rotZ: card.rotations * 180,
    scale: 1,
    shadowBlur: 0,
    shadowY: 0,
    config: { mass: 1, tension: 210, friction: 20 },
  }));

  useEffect(() => {
    setCardPosition(card.position);
    setIsFlipped(card.flipped);
    setRotations(card.rotations);
    setSpring.start({
      x: card.position.x * window.innerWidth,
      y: card.position.y * window.innerHeight,
      rotY: card.flipped ? 180 : 0,
      rotZ: card.rotations * 180,
      immediate: !isShuffling,
    });
  }, [card, setSpring, isShuffling]);

  useEffect(() => {
    if (isShuffling) {
      setSpring.start({
        x: card.position.x * window.innerWidth,
        y: card.position.y * window.innerHeight,
        rotY: 0,
        rotZ: Math.random() * 720 - 360,
        config: { tension: 300, friction: 10 },
      });
    }
  }, [isShuffling, card.position, setSpring]);

  useEffect(() => {
    if (forceFlipped && forceFlipped !== isFlipped) {
      setIsFlipped(forceFlipped);
      setSpring.start({ rotY: forceFlipped ? 180 : 0 });
    }
  }, [forceFlipped, isFlipped]);

  
  
  // Function to handle card flip
  const flipCard = () => {
    const newFlipped = !isFlipped;
    setIsFlipped(newFlipped);
    setSpring.start({
      rotY: newFlipped ? 180 : 0,
      scale: 1.1,
      config: { tension: 200, friction: 15, duration: 300 },
    });
    onCardUpdate({ ...card, flipped: newFlipped });
  };

  const bind = useGesture({
    onDragStart: () => {
      if (isAnimating) return; // Ignore drag start if already animating
  
      setIsDragging(true);
      preDragPositionRef.current = { x: cardPosition.x, y: cardPosition.y };
      yeetLocked.current = false;
      setSpring.start({ shadowBlur: 10, shadowY: 5, scale: 1.05 });
    },
    onDrag: ({ movement: [mx, my], velocity: [vx, vy] }) => {
      if (!isDragging || yeetLocked.current) return;
  
      const currentX = preDragPositionRef.current.x * window.innerWidth + mx;
      const currentY = preDragPositionRef.current.y * window.innerHeight + my;
  
      const isYeetPrep = Math.sqrt(vx * vx + vy * vy) > physicsParams.yeetVelocityThreshold && 
                         Math.sqrt(mx * mx + my * my) > physicsParams.minMovementThreshold;
  
      if (isYeetPrep && !yeetLocked.current) {
        setIsYeeted(true);
        yeetLocked.current = true;
      }
  
      setCardPosition(normalizePosition(currentX, currentY));
      setSpring.start({ x: currentX, y: currentY });
    },
    onDragEnd: ({ movement: [mx, my], velocity: [vx, vy] }) => {
      setIsDragging(false);
  
      if (isYeeted) {
        setIsAnimating(true); // Lock state during animation
        const yeetDistanceX = Math.max(1, vx) * physicsParams.yeetCoefficient * mx;
        const yeetDistanceY = Math.max(1, vy) * physicsParams.yeetCoefficient * my;
        const yeetDistance = Math.sqrt(yeetDistanceX * yeetDistanceX + yeetDistanceY * yeetDistanceY);
        const newRotations = Math.floor(yeetDistance / (physicsParams.rotationDistance * 2)) % 4;
  
        const newX = (preDragPositionRef.current.x * window.innerWidth + yeetDistanceX + window.innerWidth) % window.innerWidth;
        const newY = (preDragPositionRef.current.y * window.innerHeight + yeetDistanceY + window.innerHeight) % window.innerHeight;
  
        const yeetDuration = 500 + yeetDistance / 2;
  
        setSpring.start({
          x: newX,
          y: newY,
          rotY: 360,
          rotZ: newRotations * 360,
          shadowBlur: 20,
          shadowY: 10,
          scale: 1.1,
          config: { 
            mass: physicsParams.mass,
            tension: physicsParams.tension,
            friction: physicsParams.friction,
            duration: yeetDuration,
          },
          onRest: () => {
            // State update after animation completes
            setIsAnimating(false); // Unlock state after animation
            onCardUpdate({
              ...card,
              position: normalizePosition(newX, newY),
              rotations: newRotations,
              velocity: { x: vx, y: vy },
              last_position: preDragPositionRef.current,
              flipped: !isFlipped,
            });
            setIsFlipped(forceFlipped || !isFlipped);
            setIsYeeted(false);
          }
        });
  
      } else {
        // Non-yeet end of drag
        const newPos = normalizePosition(
          preDragPositionRef.current.x * window.innerWidth + mx,
          preDragPositionRef.current.y * window.innerHeight + my
        );
  
        onCardUpdate({
          ...card,
          position: newPos,
          last_position: preDragPositionRef.current,
        });
  
        setCardPosition(newPos);
        setSpring.start({ shadowBlur: 0, shadowY: 0, scale: 1 });
      }
    },
    onDoubleClick: flipCard,
  });
  
  // Flip only if state changed
  useEffect(() => {
    if (prevFlippedState.current !== card.flipped) {
      flipCard();
    }
    prevFlippedState.current = card.flipped;
  }, [card.flipped]);
  
  // Helper function to normalize position
  const normalizePosition = (x: number, y: number) => ({
    x: x / window.innerWidth,
    y: y / window.innerHeight,
  });
  

  return (
    <animated.div
      ref={cardRef}
      {...bind()}
      style={{
        width: '30px',
        height: '45px',
        borderRadius: '2px',
        backgroundSize: 'cover',
        transform: to([x, y, rotY, rotZ, scale], (x, y, rY, rZ, s) =>
          `translate3d(${x}px, ${y}px, 0) rotateY(${rY}deg) rotateZ(${rZ}deg) scale(${s})`
        ),
        boxShadow: to([shadowBlur, shadowY], (blur, y) => 
          `0px ${y}px ${blur}px rgba(0, 0, 0, 0.3)`
        ),
        touchAction: 'none',
        position: 'absolute',
        zIndex: card.zIndex,
        willChange: 'transform, box-shadow',
      }}
    >
      <animated.div
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          backfaceVisibility: 'hidden',
          backgroundImage: `url(${cardsImages["shirt"]})`,
          backgroundSize: 'cover',
          transform: to([rotY], (rY) => `rotateY(${rY <= 90 || rY >= 270 ? '0deg' : '180deg'})`)
        }}
      />
      <animated.div
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          backfaceVisibility: 'hidden',
          backgroundImage: `url(${cardsImages[card.id]})`,
          backgroundSize: 'cover',
          transform: to([rotY], (rY) => `rotateY(${rY <= 90 || rY >= 270 ? '180deg' : '0deg'})`)
        }}
      />
    </animated.div>
  );
};