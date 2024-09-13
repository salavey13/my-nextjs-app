import { animated, useSpring } from 'react-spring';
import { useRef, useEffect, useState } from 'react';
import { useGesture } from '@use-gesture/react';
import { cardsImages } from './CardsImgs';
import { useAppContext } from '@/context/AppContext';
import { supabase } from '../../lib/supabaseClient';

interface Card {
  id: CardId;
  position: { x: number; y: number }; // normalized (0-1)
  last_position: { x: number; y: number };
  flipped: boolean;
  rotations: number;
  velocity: { x: number; y: number };
  direction: { x: number; y: number };
}

interface Point {
  x: number;
  y: number;
}

export type CardId = keyof typeof cardsImages;

interface MegaCardProps {
  card: Card;
  onCardUpdate: (card: Card) => void;
}

export const MegaCard: React.FC<MegaCardProps> = ({ card, onCardUpdate }) => {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const preDragPositionRef = useRef<{ x: number; y: number }>({ x: card.position.x, y: card.position.y });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isYeeted, setIsYeeted] = useState<boolean>(false);
  const [currentFlipAngle, setCurrentFlipAngle] = useState<number>(0);
  const { user } = useAppContext();
  const [rotations, setRotations] = useState<number>(card.rotations);

  // Sync card updates with Supabase notifications
  useEffect(() => {
    const channel = supabase
      .channel('notify_game_update')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'rents' }, (payload) => {
        const updatedCard = payload.new.game_state.cards.find((c: Card) => c.id === card.id);
        if (updatedCard) {
          const preDragPosition = updatedCard.last_position;

          setSpring.start({
            x: preDragPosition.x * window.innerWidth,
            y: preDragPosition.y * window.innerHeight,
            rotZ: updatedCard.rotations * 180,
            config: { tension: 210, friction: 30 },
          });

          setTimeout(() => {
            setSpring.start({
              x: updatedCard.position.x * window.innerWidth,
              y: updatedCard.position.y * window.innerHeight,
              rotZ: (updatedCard.rotations + 1) * 180,
              config: { tension: 120, friction: 15 },
            });
          }, 100); // slight delay to create a smooth yeet animation
          onCardUpdate(updatedCard);
        }
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [card, onCardUpdate, user]);

  const flipCard = () => {
    const newFlipAngle = currentFlipAngle === 0 ? 180 : 0;
    setCurrentFlipAngle(newFlipAngle);

    const flipped = newFlipAngle === 180;
    onCardUpdate({ ...card, flipped });
  };

  // Spring for animation
  const [{ x, y, rotX, rotZ }, setSpring] = useSpring(() => ({
    x: card.position.x * window.innerWidth,
    y: card.position.y * window.innerHeight,
    rotX: 0,
    rotZ: card.rotations * 180,
    config: { mass: 1, tension: 210, friction: 20 },
  }));

  useEffect(() => {
    setSpring.start({
      x: card.position.x * window.innerWidth,
      y: card.position.y * window.innerHeight,
      rotZ: card.rotations * 180,
    });
    setRotations(card.rotations);
  }, [card, setSpring]);

  const normalizePosition = (x: number, y: number) => ({
    x: x / window.innerWidth,
    y: y / window.innerHeight,
  });

  const YEET_VELOCITY_THRESHOLD = 1.5;
  const MIN_MOVEMENT_THRESHOLD = 20;
  let yeetLocked = false;

  const bind = useGesture({
    onDragStart: () => {
      setIsDragging(true);
      preDragPositionRef.current = { x: card.position.x, y: card.position.y };
      yeetLocked = false;
    },

    onDrag: ({ movement: [mx, my], velocity: [vx, vy], direction: [dx, dy] }) => {
      const currentX = preDragPositionRef.current.x * window.innerWidth + mx;
      const currentY = preDragPositionRef.current.y * window.innerHeight + my;

      const isYeetPrep = vy > YEET_VELOCITY_THRESHOLD && Math.abs(my) > MIN_MOVEMENT_THRESHOLD && dy > 0;

      if (isYeetPrep && !yeetLocked) {
        setIsYeeted(true);
        yeetLocked = true;
      }

      if (isDragging && !isYeeted && cardRef.current) {
        setSpring.start({ x: currentX, y: currentY });
      } else if (isYeeted && cardRef.current) {
        cardRef.current.style.border = "3px solid #e1ff01";
      }
    },

    onDragEnd: ({ movement: [mx, my], velocity: [vx, vy], direction: [dx, dy] }) => {
      setIsDragging(false);
      setIsYeeted(false);
      if (cardRef.current) cardRef.current.style.border = "none";

      if (!isYeeted) {
        onCardUpdate({
          ...card,
          position: normalizePosition(preDragPositionRef.current.x * window.innerWidth + mx, preDragPositionRef.current.y * window.innerHeight + my),
          last_position: preDragPositionRef.current,
        });
      } else {
        const yeetDistanceX = mx * 3;
        const yeetDistanceY = my * 3;
        const newRotations = Math.floor(Math.sqrt(yeetDistanceX ** 2 + yeetDistanceY ** 2) / 69);

        setSpring.start({
          x: preDragPositionRef.current.x * window.innerWidth + yeetDistanceX,
          y: preDragPositionRef.current.y * window.innerHeight + yeetDistanceY,
          rotZ: newRotations * 180,
        });

        onCardUpdate({
          ...card,
          position: normalizePosition(preDragPositionRef.current.x * window.innerWidth + yeetDistanceX, preDragPositionRef.current.y * window.innerHeight + yeetDistanceY),
          rotations: newRotations,
          velocity: { x: vx, y: vy },
          direction: { x: dx, y: dy },
          last_position: preDragPositionRef.current,
        });
      }
    },

    onDoubleClick: () => {
      flipCard();
    },
  });

  return (
    <animated.div
      ref={cardRef}
      {...bind()}
      style={{
        width: '69px',
        height: '102px',
        backgroundImage: `url(${cardsImages[card.flipped ? card.id : "shirt"]})`,
        borderRadius: '10px',
        backgroundSize: 'cover',
        position: 'absolute',
        cursor: 'grab',
        zIndex: 1,
        touchAction: 'none',
        transform: x.to((xVal, yVal) => `translate(${xVal}px, ${yVal}px) rotateX(${rotX.get()}deg) rotateZ(${rotZ.get()}deg)`),
      }}
    />
  );
};
