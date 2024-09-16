import React, { useEffect, useState, useRef } from 'react';
import { useSpring, animated, to, config } from 'react-spring';
import { useGesture } from '@use-gesture/react';
import { cardsImages } from './CardsImgs';
import { useAppContext } from '@/context/AppContext';

interface Point { x: number; y: number };
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
}

const isInPersonalRadius = (cardPos: Point, playerPos: Point) => {
  const dx = cardPos.x - playerPos.x;
  const dy = cardPos.y - playerPos.y;
  return Math.sqrt(dx * dx + dy * dy) <= 113;
};

export const MegaCard: React.FC<MegaCardProps> = ({ card, onCardUpdate }) => {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [cardPosition, setCardPosition] = useState(card.position);
  const preDragPositionRef = useRef({ x: card.last_position.x, y: card.last_position.y });
  const yeetLocked = useRef(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isYeeted, setIsYeeted] = useState(false);
  const { t } = useAppContext();
  const [rotations, setRotations] = useState(card.rotations);
  const [isFlipped, setIsFlipped] = useState(card.flipped);

  const [playerPosition, setPlayerPosition] = useState<Point>({ x: window.innerWidth/2, y: window.innerHeight });

  const [yeetCoefficient, setYeetCoefficient] = useState(2);
  const [mass, setMass] = useState(1);
  const [tension, setTension] = useState(210);
  const [rotationDistance, setRotationDistance] = useState(69);
  const [friction, setFriction] = useState(20);
  const [yeetVelocityThreshold, setYeetVelocityThreshold] = useState(3.1);
  const [minMovementThreshold, setMinMovementThreshold] = useState(20);

  const [{ x, y, rotX, rotY, rotZ, shadowBlur, shadowY }, setSpring] = useSpring(() => ({
    x: cardPosition.x * window.innerWidth,
    y: cardPosition.y * window.innerHeight,
    rotX: 0,
    rotY: isFlipped ? 180 : 0,
    rotZ: card.rotations * 180,
    shadowBlur: 10,
    shadowY: 5,
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
    },
    onDrag: ({ movement: [mx, my], velocity: [vx, vy] }) => {
      const currentX = preDragPositionRef.current.x * window.innerWidth + mx;
      const currentY = preDragPositionRef.current.y * window.innerHeight + my;

      const isYeetPrep = Math.sqrt(vx * vx + vy * vy) > yeetVelocityThreshold && 
                         Math.sqrt(mx * mx + my * my) > minMovementThreshold;

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
        const yeetDistanceX = vx * yeetCoefficient * mx;
        const yeetDistanceY = vy * yeetCoefficient * my;
        const yeetDistance = Math.sqrt(yeetDistanceX * yeetDistanceX + yeetDistanceY * yeetDistanceY);
        const newRotations = Math.floor(yeetDistance / rotationDistance);

        const newX = (preDragPositionRef.current.x * window.innerWidth + yeetDistanceX + window.innerWidth) % window.innerWidth;
        const newY = (preDragPositionRef.current.y * window.innerHeight + yeetDistanceY + window.innerHeight) % window.innerHeight;

        const yeetDuration = 1000 + yeetDistance;

        setSpring.start({
          x: newX,
          y: newY,
          rotX: Math.random() * 720 - 360, // Random rotation between -360 and 360 degrees
          rotY: 720, // Two full flips
          rotZ: newRotations * 360,
          shadowBlur: 30,
          shadowY: 20,
          config: { 
            ...config.wobbly,
            duration: yeetDuration,
          },
          onRest: () => {
            // Reset shadow and flip state after yeet
            setSpring.start({ 
              shadowBlur: 10, 
              shadowY: 5, 
              rotX: 0,
              rotY: isFlipped ? 180 : 0,
              rotZ: newRotations * 360,
              config: { duration: 300 },
            });
          },
        });

        const newPos = normalizePosition(newX, newY);
        const newFlipped = !isFlipped; // Always flip on yeet
        
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
        transform: to([x, y, rotX, rotY, rotZ], (xVal, yVal, rX, rY, rZ) =>
          `translateX(${xVal}px) translateY(${yVal}px) rotateX(${rX}deg) rotateY(${rY}deg) rotateZ(${rZ}deg)`
        ),
        boxShadow: to([shadowBlur, shadowY], (blur, y) => 
          `0px ${y}px ${blur}px rgba(0, 0, 0, 0.3)`
        ),
        touchAction: 'none',
        position: 'absolute',
        zIndex: card.zIndex,
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