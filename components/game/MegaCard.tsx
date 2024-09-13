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
        console.log('Supabase event received:', payload);
        const updatedCard = payload.new.game_state.cards.find((c: Card) => c.id === card.id);
        if (updatedCard) {
          const preDragPosition = updatedCard.last_position;
          console.log('Card updated from Supabase:', updatedCard);

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
    console.log('FLIP DETECTED');
    const newFlipAngle = currentFlipAngle === 0 ? 180 : 0;
    setCurrentFlipAngle(newFlipAngle);

    const flipped = newFlipAngle === 180;
    console.log(`Card flipped: ${flipped}`);
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
    const { position, rotations } = card;
    console.log('Card state updated from props:', { position, rotations });
    setSpring.start({
      x: position.x * window.innerWidth,
      y: position.y * window.innerHeight,
    });
    setRotations(rotations);
  }, [card, setSpring]);

  const normalizePosition = (x: number, y: number) => ({
    x: x / window.innerWidth,
    y: y / window.innerHeight,
  });

  const bind = useGesture({
    onDrag: ({ movement: [mx, my], velocity: [vx, vy], direction: [dx, dy], intentional }) => {
      if (!isDragging) {
        setIsDragging(true);
        console.log('Dragging started', { mx, my });
        preDragPositionRef.current = { x: card.position.x, y: card.position.y }; // Store pre-drag position
      }

      console.log('Drag event', { mx, my, vx, vy, dx, dy, intentional });
      const slowDrag = Math.abs(vx) < 0.3 && Math.abs(vy) < 0.3;

      if (!slowDrag) {
        console.log('Fast movement detected, preparing yeet.');
        setIsYeeted(true);
      }
    },
    onDragEnd: ({ movement: [mx, my], velocity: [vx, vy], direction: [dx, dy], memo }) => {
      setIsDragging(false);
      console.log('Drag ended:', { mx, my, vx, vy });

      if (isYeeted) {
        console.log('Yeet initiated:', { mx, my });
        const yeetDistanceX = mx * 3 * (-1);
        const yeetDistanceY = my * 3 * (-1);
        const rotationCount = Math.floor(Math.sqrt(yeetDistanceX ** 2 + yeetDistanceY ** 2) / 13);

        setSpring.start({
          x: preDragPositionRef.current.x * window.innerWidth + yeetDistanceX,
          y: preDragPositionRef.current.y * window.innerHeight + yeetDistanceY,
          rotZ: rotationCount * 180,
          config: { tension: 300, friction: 30 },
        });

        console.log('Updated card position after yeet:', {
          newX: preDragPositionRef.current.x * window.innerWidth + yeetDistanceX,
          newY: preDragPositionRef.current.y * window.innerHeight + yeetDistanceY,
        });

        onCardUpdate({
          ...card,
          position: normalizePosition(
            preDragPositionRef.current.x * window.innerWidth + yeetDistanceX,
            preDragPositionRef.current.y * window.innerHeight + yeetDistanceY
          ),
          last_position: preDragPositionRef.current,
          rotations: rotations + rotationCount,
          velocity: { x: vx, y: vy },
          direction: { x: dx, y: dy },
        });
        setIsYeeted(false);
      }
    },
    onDoubleClick: () => {
      console.log('Double click detected');
      flipCard();
    },
  });

  return (
    <animated.div
      ref={cardRef}
      {...bind()}
      style={{
        width: '69px',
        height: '103px',
        backgroundImage: `url(${cardsImages[card.flipped ? card.id : "shirt"]})`,
        borderRadius: '10px',
        backgroundSize: 'cover',
        position: 'absolute',
        cursor: 'grab',
        zIndex: 1,
        touchAction: 'none',
        transform: x.to((x, y) => `translate(${x}px, ${y}px) rotateX(${rotX.get()}deg) rotateZ(${rotZ.get()}deg)`),
      }}
    />
  );
};
