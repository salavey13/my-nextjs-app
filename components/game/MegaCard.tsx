import React, { useEffect, useState, useRef } from 'react';
import { useSpring, animated, to, config } from 'react-spring';
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

  const [{ x, y, rotX, rotY, rotZ, scale, shadowBlur, shadowY }, setSpring] = useSpring(() => ({
    x: cardPosition.x * window.innerWidth,
    y: cardPosition.y * window.innerHeight,
    rotX: 0,
    rotY: isFlipped ? 180 : 0,
    rotZ: card.rotations * 180,
    scale: 1,
    shadowBlur: 0,
    shadowY: 0,
    config: { ...config.wobbly, clamp: true },
  }));

  useEffect(() => {
    setSpring.start({
      x: cardPosition.x * window.innerWidth,
      y: cardPosition.y * window.innerHeight,
      rotY: isFlipped ? 180 : 0,
    });
    setRotations(card.rotations);
  }, [card, setSpring, isFlipped, cardPosition]);

  useEffect(() => {
    if (isShuffling) {
      const targetX = card.position.x * window.innerWidth;
      const targetY = card.position.y * window.innerHeight;
      const targetRotZ = card.rotations * 360;

      setSpring.start({
        x: targetX,
        y: targetY,
        rotX: 0,
        rotY: 0,
        rotZ: targetRotZ,
        config: { tension: 170, friction: 26 },
      });
    }
  }, [isShuffling, card.position, card.rotations, setSpring]);

  useEffect(() => {
    if (forceFlipped && forceFlipped !== isFlipped) {
      setIsFlipped(forceFlipped);
      setSpring.start({ rotY: forceFlipped ? 0 : 180 });
    }
  }, [forceFlipped, isFlipped, setSpring]);

  const normalizePosition = (x: number, y: number) => ({
    x: x / window.innerWidth,
    y: y / window.innerHeight,
  });

  const flipCard = () => {
    setIsFlipped(!isFlipped);
    setSpring.start({ rotY: isFlipped ? 0 : 180 });
    onCardUpdate({ ...card, flipped: !isFlipped });
  };

  const bind = useGesture({
    onDragStart: () => {
      setIsDragging(true);
      preDragPositionRef.current = { x: cardPosition.x, y: cardPosition.y };
      yeetLocked.current = false;
      setSpring.start({ shadowBlur: 10, shadowY: 5, scale: 1.05 });
    },
    onDrag: ({ movement: [mx, my], velocity: [vx, vy] }) => {
      const currentX = preDragPositionRef.current.x * window.innerWidth + mx;
      const currentY = preDragPositionRef.current.y * window.innerHeight + my;

      const isYeetPrep = Math.sqrt(vx * vx + vy * vy) > physicsParams.yeetVelocityThreshold && 
                         Math.sqrt(mx * mx + my * my) > physicsParams.minMovementThreshold;

      if (isYeetPrep && !yeetLocked.current) {
        setIsYeeted(true);
        yeetLocked.current = true;
      }

      if (!isDragging || yeetLocked.current) return;

      setCardPosition(normalizePosition(currentX, currentY));
      setSpring.start({ x: currentX, y: currentY });
    },
    onDragEnd: ({ movement: [mx, my], velocity: [vx, vy] }) => {
      setIsDragging(false);

      if (isYeeted) {
        const yeetDistanceX = Math.max(1, Math.abs(vx)) * physicsParams.yeetCoefficient * Math.max(1, Math.abs(mx));
        const yeetDistanceY = Math.max(1, Math.abs(vy)) * physicsParams.yeetCoefficient * Math.max(1, Math.abs(my));
        const yeetDistance = Math.sqrt(yeetDistanceX * yeetDistanceX + yeetDistanceY * yeetDistanceY);
        const newRotations = Math.floor(yeetDistance / (physicsParams.rotationDistance * 2)) % 42; // Limit to 0-13 rotations

        const newX = (preDragPositionRef.current.x * window.innerWidth + yeetDistanceX + window.innerWidth) % window.innerWidth;
        const newY = (preDragPositionRef.current.y * window.innerHeight + yeetDistanceY + window.innerHeight) % window.innerHeight;

        const yeetDuration = 500 + yeetDistance / 2; // Adjusted for faster animation

        setSpring.start({
          x: newX,
          y: newY,
          rotX: Math.random() * 360 - 180,
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
            setSpring.start({ 
              shadowBlur: 0, 
              shadowY: 0, 
              rotX: 0,
              rotY: isFlipped ? 180 : 0,
              rotZ: newRotations * 360,
              scale: 1,
              config: { duration: 300 },
            });
          },
        });

        const newPos = normalizePosition(newX, newY);
        const newFlipped = !isFlipped;
        
        onCardUpdate({
          ...card,
          position: newPos,
          rotations: newRotations,
          velocity: { x: vx, y: vy },
          last_position: preDragPositionRef.current,
          flipped: newFlipped,
        });

        setIsFlipped(newFlipped);
        setIsYeeted(false);
      } else {
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

  return (
    <animated.div
      ref={cardRef}
      {...bind()}
      style={{
        width: '30px',
        height: '45px',
        borderRadius: '2px',
        backgroundSize: 'cover',
        transform: to([x, y, rotX, rotY, rotZ, scale], (x, y, rX, rY, rZ, s) =>
          `translate3d(${x}px, ${y}px, 0) rotateX(${rX}deg) rotateY(${rY}deg) rotateZ(${rZ}deg) scale(${s})`
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