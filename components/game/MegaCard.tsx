import React, { useEffect, useState, useRef } from 'react';
import { useSpring, animated, to } from 'react-spring';
import { useGesture } from '@use-gesture/react';
import { cardsImages } from './CardsImgs';
import { useAppContext } from '@/context/AppContext';
import { supabase } from '../../lib/supabaseClient';

interface Card {
  id: CardId;
  position: { x: number; y: number };
  last_position: { x: number; y: number };
  flipped: boolean;
  rotations: number;
  velocity: { x: number; y: number };
  direction: { x: number; y: number };
}

export type CardId = keyof typeof cardsImages;

interface MegaCardProps {
  card: Card;
  onCardUpdate: (card: Card) => void;
}

export const MegaCard: React.FC<MegaCardProps> = ({ card, onCardUpdate }) => {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [cardPosition, setCardPosition] = useState(card.position);
  const preDragPositionRef = useRef({ x: card.last_position.x, y: card.last_position.y });
  const yeetLocked = useRef(false); // Lock for "yeet" state
  const [isDragging, setIsDragging] = useState(false);
  const [isYeeted, setIsYeeted] = useState(false);
  const { user, t } = useAppContext(); // Accessing context for user and translation
  const [rotations, setRotations] = useState(card.rotations);

  // Physics settings from local storage or defaults
  const [yeetCoefficient, setYeetCoefficient] = useState(() => Number(localStorage.getItem('yeetCoefficient')) || 2);
  const [mass, setMass] = useState(() => Number(localStorage.getItem('mass')) || 1);
  const [tension, setTension] = useState(() => Number(localStorage.getItem('tension')) || 210);
  const [rotationDistance, setRotationDistance] = useState(() => Number(localStorage.getItem('rotationDistance')) || 69);
  const [friction, setFriction] = useState(() => Number(localStorage.getItem('friction')) || 20);
  const [yeetVelocityThreshold, setYeetVelocityThreshold] = useState(() => Number(localStorage.getItem('yeetVelocityThreshold')) || 3.1);
  const [minMovementThreshold, setMinMovementThreshold] = useState(() => Number(localStorage.getItem('minMovementThreshold')) || 20);

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
        if (cardRef.current) cardRef.current.style.border = "none"; // Reset card border
  
        if (!isYeeted) {
          // Normal drag, update the card position in Supabase
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
          
          // Update Supabase with the new position
          supabase
            .from('rents')
            .update({ cards: [{ ...card, position: newPos }] })
            .eq('id', user?.currentGameId)
            .then(({ error }) => {
              if (error) console.error("Error updating card position:", error);
            });
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
  
          // Update card data in Supabase with new position, rotation, and velocity
          const newPos = normalizePosition(newX, newY);
          onCardUpdate({
            ...card,
            position: newPos,
            rotations: newRotations,
            velocity: { x: vx, y: vy },
            last_position: preDragPositionRef.current,
          });
  
          // Update the local card position state
          setCardPosition(newPos);

          // Update Supabase with the new position and rotation after yeet
          supabase
            .from('rents')
            .update({ cards: [{ ...card, position: newPos, rotations: newRotations }] })
            .eq('id', user?.currentGameId)
            .then(({ error }) => {
              if (error) console.error("Error updating card after yeet:", error);
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
      backgroundImage: `url(${cardsImages[card.flipped ? card.id : "shirt"]})`,
      borderRadius: '2px',
      backgroundSize: 'cover',
      transform: to([x, y, rotZ], (xVal, yVal, rZ) => 
    `translateX(${xVal}px) translateY(${yVal}px) rotateZ(${rZ}deg)`
  ),
      touchAction: 'none',
      position: 'absolute',
    }}
  />
  );
};

export default MegaCard;
