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
    
    setSpring.start({
      x: position.x * window.innerWidth,
      y: position.y * window.innerHeight,
    });
    console.log('Card state updated from props:', x, y);
    console.log("Window dimensions:", window.innerWidth, window.innerHeight);
console.log("Updated positions:", card.position.x * window.innerWidth, card.position.y * window.innerHeight);
    setRotations(rotations);
  }, [card, setSpring]);

  const normalizePosition = (x: number, y: number) => ({
    x: x / window.innerWidth,
    y: y / window.innerHeight,
  });

  const YEET_VELOCITY_THRESHOLD = 3.1; // Adjust based on testing
const MIN_MOVEMENT_THRESHOLD = 20; // Adjust based on pixel distance
let yeetLocked = false; // Prevent yeet reversion once triggered

const bind = useGesture({
  onDragStart: ({ movement: [mx, my], direction: [dx, dy], velocity: [vx, vy] }) => {
    console.log('New DRAG start');
    setIsDragging(true);
    preDragPositionRef.current = { x: card.position.x, y: card.position.y };
    yeetLocked = false; // Reset the yeet lock for the new drag
  },

  onDrag: ({ movement: [mx, my], velocity: [vx, vy], direction: [dx, dy], memo }) => {
    // Log current position for debugging
    const currentX = preDragPositionRef.current.x * window.innerWidth + mx;
    const currentY = preDragPositionRef.current.y * window.innerHeight + my;
    console.log('Current position:', { currentX, currentY });

    // Distinguish between a regular drag and a yeet based on velocity and movement
    const isYeetPrep = (Math.abs(vx) > YEET_VELOCITY_THRESHOLD || Math.abs(vy) > YEET_VELOCITY_THRESHOLD) && Math.abs(my) > MIN_MOVEMENT_THRESHOLD;

    if (isYeetPrep && !yeetLocked) {
      setIsYeeted(true);
      yeetLocked = true; // Lock yeet state, cannot undo
      console.log('YEETing DECIDED', { mx, my }, { dx, dy }, { vx, vy });
      //preDragPositionRef.current = { x: preDragPositionRef.current.x * window.innerWidth + mx, y: preDragPositionRef.current.y * window.innerHeight + my };
    } 

    if (isDragging && !isYeeted && cardRef.current) {
      console.log('DRAG');
      // Normal drag, update position continuously
      cardRef.current.style.border = "none";
      setSpring.start({
        x: currentX,
        y: currentY,
      });
    } else if (isYeeted && cardRef.current) {
      console.log('YEET prep');
      // Yeet prep: add visual border cue
      cardRef.current.style.border = "3px solid #e1ff01";
    }
  },

  onDragEnd: ({ movement: [mx, my], velocity: [vx, vy], direction: [dx, dy], memo }) => {
    setIsDragging(false);
    
    if (cardRef.current ) {cardRef.current.style.border = "none";}
    console.log('DRAG end');
    
    if (!isYeeted) {
      // Normal drag ends, save position to Supabase
      onCardUpdate({
        ...card,
        position: normalizePosition(preDragPositionRef.current.x * window.innerWidth + mx, preDragPositionRef.current.y * window.innerHeight + my),
        last_position: preDragPositionRef.current,
      });
    } else {
      // Yeet action
      const yeetDistanceX = mx * (2) ;
      const yeetDistanceY = my * (2);
      const newRotations = Math.floor(Math.sqrt(yeetDistanceX ** 2 + yeetDistanceY ** 2) / 69);

      console.log('Yeet action', { yeetDistanceX, yeetDistanceY, newRotations });

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
        height: '102px',
        backgroundImage: `url(${cardsImages[card.flipped ? card.id : "shirt"]})`,
        borderRadius: '10px',
        backgroundSize: 'cover',
        position: 'absolute',
        cursor: 'grab',
        zIndex: 1,
        touchAction: 'none',
        transform: x.to((xVal) => `translate(${xVal}px, ${y.get()}px) rotateX(${rotX.get()}deg) rotateZ(${rotZ.get()}deg)`),
      }}
    />
  );
};
