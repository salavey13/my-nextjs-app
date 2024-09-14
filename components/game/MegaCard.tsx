import React, { useEffect, useState, useRef } from 'react';
import { useSpring, animated } from 'react-spring';
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
    x: card.position.x * window.innerWidth,
    y: card.position.y * window.innerHeight,
    rotX: 0,
    rotZ: card.rotations * 180,
    config: { mass, tension, friction },
  }));

  // Subscribe to real-time updates from Supabase
  useEffect(() => {
    const channel = supabase
      .channel('realtime-cards')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'cards', filter: `id=eq.${card.id}` }, (payload) => {
        const updatedCard = payload.new as Card;
        if (updatedCard.id === card.id) {
          onCardUpdate(updatedCard);
          setSpring.start({
            x: updatedCard.position.x * window.innerWidth,
            y: updatedCard.position.y * window.innerHeight,
            rotZ: updatedCard.rotations * 180,
          });
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [card.id, onCardUpdate, setSpring]);

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
    onDragEnd: ({ velocity: [vx, vy] }) => {
      setIsDragging(false);
      if (isYeeted) {
        // Apply yeet logic based on the final velocity
        const newVelocityX = vx * yeetCoefficient;
        const newVelocityY = vy * yeetCoefficient;

        const newCard = {
          ...card,
          velocity: { x: newVelocityX, y: newVelocityY },
        };

        onCardUpdate(newCard);
        setSpring.start({
          x: newCard.position.x * window.innerWidth,
          y: newCard.position.y * window.innerHeight,
          rotZ: newCard.rotations * 180,
        });
      } else {
        // Reset the yeet state
        setIsYeeted(false);
        yeetLocked.current = false;
      }
    },
  });

  return (
    <animated.div
      {...bind()}
      ref={cardRef}
      className="absolute"
      style={{
  transform: x.to((xVal) => 
    y.to((yVal) =>
      rotZ.to((rZ) => `translateX(${xVal}px) translateY(${yVal}px) rotateZ(${rZ}deg)`)
    )
  ),
      }}
    >
      <div className="bg-white rounded-lg shadow-lg p-4 text-center">
        <p>{t('card')}: {card.id}</p>
      </div>
    </animated.div>
  );
};

export default MegaCard;
