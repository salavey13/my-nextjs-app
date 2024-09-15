import React, { useEffect, useState, useRef } from 'react';
import { useSpring, animated, to } from 'react-spring';
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
const isInPersonalRadius = (cardPos:Point, playerPos:Point) => {
  const dx = cardPos.x - playerPos.x;
  const dy = cardPos.y - playerPos.y;
  return Math.sqrt(dx * dx + dy * dy) <= 113;
};
export const MegaCard: React.FC<MegaCardProps> = ({ card, onCardUpdate }) => {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [cardPosition, setCardPosition] = useState(card.position);
  const preDragPositionRef = useRef({ x: card.last_position.x, y: card.last_position.y });
  const yeetLocked = useRef(false); // Lock for "yeet" state
  const [isDragging, setIsDragging] = useState(false);
  const [isYeeted, setIsYeeted] = useState(false);
  const { t } = useAppContext(); // Accessing context for user and translation
  const [rotations, setRotations] = useState(card.rotations);

  // Example player's position (replace this with actual data)
  const [playerPosition, setPlayerPosition] = useState<Point>({ x: window.innerWidth/2, y: window.innerHeight });

  // Physics settings from local storage or defaults
  const [yeetCoefficient, setYeetCoefficient] = useState(2);
  const [mass, setMass] = useState(1);
  const [tension, setTension] = useState(210);
  const [rotationDistance, setRotationDistance] = useState(69);
  const [friction, setFriction] = useState(20);
  const [yeetVelocityThreshold, setYeetVelocityThreshold] = useState(3.1);
  const [minMovementThreshold, setMinMovementThreshold] = useState(20);

  // Spring for animated movement
  const [{ x, y, rotX, rotZ }, setSpring] = useSpring(() => ({
    x: cardPosition.x * window.innerWidth,
    y: cardPosition.y * window.innerHeight,
    rotX: 0,
    rotZ: card.rotations * 180,
    config: { mass, tension, friction },
  }));

  // Update spring on card position change
  useEffect(() => {
    setSpring.start({
      x: cardPosition.x * window.innerWidth,
      y: cardPosition.y * window.innerHeight,
    });
    setRotations(card.rotations);
  }, [card, setSpring, mass, tension, friction]);

  const normalizePosition = (x: number, y: number) => ({
    x: x / window.innerWidth,
    y: y / window.innerHeight,
  });

  const flipCard = () => {
    const newFlipAngle = rotX.get() % 180 === 0 ? 180 : 0;
    setRotations(rotX.get() / 180);
    onCardUpdate({ ...card, flipped: newFlipAngle === 180 });
  };

  const bind = useGesture({
    onDragStart: () => {
      setIsDragging(true);
      preDragPositionRef.current = { x: cardPosition.x, y: cardPosition.y }; // Store the initial position
      yeetLocked.current = false; // Reset yeet lock
    },
    onDrag: ({ movement: [mx, my], velocity: [vx, vy] }) => {
      const currentX = preDragPositionRef.current.x * window.innerWidth + mx;
      const currentY = preDragPositionRef.current.y * window.innerHeight + my;

      // Check if the velocity exceeds the yeet threshold
      const isYeetPrep = Math.abs(vx) > yeetVelocityThreshold && Math.abs(my) > minMovementThreshold;

      if (isYeetPrep && !yeetLocked.current) {
        setIsYeeted(true); // Enable yeet mode
        yeetLocked.current = true; // Lock yeet to avoid multiple triggers
      }

      if (!isDragging || yeetLocked.current) return;

      setCardPosition(normalizePosition(currentX, currentY));
      setSpring.start({ x: currentX, y: currentY });
    },
    onDragEnd: ({ movement: [mx, my], velocity: [vx, vy] }) => {
      setIsDragging(false); // Stop dragging

      if (!isYeeted) {
        // Normal drag, update via callback only
        const newPos = normalizePosition(
          preDragPositionRef.current.x * window.innerWidth + mx,
          preDragPositionRef.current.y * window.innerHeight + my
        );
        
        onCardUpdate({
          ...card,
          position: newPos,
          last_position: preDragPositionRef.current,
        });
        
        // Update the local card position state
        setCardPosition(newPos);
      } else {
        // Yeet logic
        const yeetDistanceX = mx * yeetCoefficient;
        const yeetDistanceY = my * yeetCoefficient;
        const newRotations = Math.floor(Math.sqrt(yeetDistanceX ** 2 + yeetDistanceY ** 2) / rotationDistance);

        // Screen wrapping logic for new position after yeet
        const newX = (preDragPositionRef.current.x * window.innerWidth + yeetDistanceX) % window.innerWidth;
        const newY = (preDragPositionRef.current.y * window.innerHeight + yeetDistanceY) % window.innerHeight;

        // Update card's spring with new position and rotation
        setSpring.start({
          x: newX,
          y: newY,
          rotZ: newRotations * 180,
        });

        // Notify via callback
        const newPos = normalizePosition(newX, newY);
        onCardUpdate({
          ...card,
          position: newPos,
          rotations: newRotations,
          velocity: { x: vx, y: vy },
          last_position: preDragPositionRef.current,
        });

        setIsYeeted(false); // Reset yeet status
      }

      // Handle flip logic based on rotation angle
      const flippedStatus = rotX.get() % 180 === 0;
      onCardUpdate({ ...card, flipped: flippedStatus });
    },
    onDoubleClick: flipCard, // Handle card flipping on double-click
  });

  return (
    <animated.div
      ref={cardRef}
      {...bind()}
      style={{
        width: '30px',  // Adjusted card width
        height: '45px', // Adjusted card height
        backgroundImage: `url(${cardsImages[(card.flipped || isInPersonalRadius(card.position, playerPosition)) ? card.id : "shirt"]})`,
        borderRadius: '2px',
        backgroundSize: 'cover',
        transform: to([x, y, rotZ], (xVal, yVal, rZ) =>
          `translateX(${xVal}px) translateY(${yVal}px) rotateZ(${rZ}deg)`
        ),
        touchAction: 'none',
        position: 'absolute',
        zIndex: card.zIndex
      }}
    />
  );
};
