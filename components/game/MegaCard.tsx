import { animated, useSpring } from 'react-spring';
import { useRef, useEffect, useState } from 'react';
import { useGesture } from '@use-gesture/react';
import { supabase } from '../../lib/supabaseClient';
import { cardsImages } from './CardsImgs';
import { useAppContext } from '@/context/AppContext';

// Types for the game state, card, and props
interface Card {
  id: CardId;
  position: { x: number; y: number };
  trajectory: { rotation: number };
  flipped: boolean;
}

interface Point {
    x: number;
    y: number;
    }
    
    
    interface Player {
    id: string;
    position: Point;
    }
    
    interface GameState {
    cards: Card[];
    players: Player[];
    }
    
export type CardId = keyof typeof cardsImages;

interface MegaCardProps {
  gameState: GameState;
  cardId: CardId;
  syncTrajectory: (trajectory: { x: number; y: number; rotation: number }) => void;
}

const GAME_ID = 28;

const MegaCard: React.FC<MegaCardProps> = ({ gameState, cardId, syncTrajectory }) => {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const lastPositionRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isYeeted, setIsYeeted] = useState<boolean>(false);
  const [currentFlipAngle, setCurrentFlipAngle] = useState<number>(0);
  const { user } = useAppContext();

  // Determine the correct card image to show based on whether it's flipped
  const cardImage = gameState.cards.find((c) => c.id === cardId)?.flipped
    ? 'shirt'
    : cardId; // Convert cardId to the card string like '10_of_clubs'

  // Handle spring animations for position and shadow
  const [{ x, y, shadow, flipAngle }, setSpring] = useSpring(() => ({
    x: 0,
    y: 0,
    shadow: 5,
    flipAngle: 0,
    config: { mass: 1, tension: 200, friction: 13 },
  }));

  useEffect(() => {
    const card = gameState.cards.find((c) => c.id === cardId);
    if (card) {
      const posX = card.position.x * window.innerWidth;
      const posY = card.position.y * window.innerHeight;
      lastPositionRef.current = { x: posX, y: posY };
      updateCardPosition(posX, posY, card.trajectory.rotation);
      setCurrentFlipAngle(card.flipped ? 180 : 0);
    }
  }, [gameState, cardId]);

  const updateGameState = (update: { x: number; y: number; flipped: boolean }) => {
    syncTrajectory({ x: update.x, y: update.y, rotation: currentFlipAngle });
  };

  const updateCardPosition = (x: number, y: number, rotation: number) => {
    setSpring({ x, y });
  };

  const handleYeet = (velocityX: number, velocityY: number, deltaX: number, deltaY: number) => {
    if (!lastPositionRef.current || !cardRef.current) return;

    setIsYeeted(true);
    setSpring({
      flipAngle: 180, // Flip the card when yeeted
    });

    const signedDistanceX = deltaX > 0 ? Math.abs(velocityX) : -Math.abs(velocityX);
    const signedDistanceY = deltaY > 0 ? Math.abs(velocityY) : -Math.abs(velocityY);

    setSpring({
      x: lastPositionRef.current.x + signedDistanceX * 100,
      y: lastPositionRef.current.y + signedDistanceY * 100,
      shadow: 15,
      config: { tension: 400, friction: 10 },
    });

    // Simulate card position update after the yeet
    setTimeout(() => setIsYeeted(false), 500);

    updateGameState({
      x: (lastPositionRef.current.x + signedDistanceX * 100) / window.innerWidth,
      y: (lastPositionRef.current.y + signedDistanceY * 100) / window.innerHeight,
      flipped: true,
    });
  };

  const glideGently = (avgVelocity: number, deltaX: number, deltaY: number) => {
    if (!lastPositionRef.current) return;

    setSpring({
      x: lastPositionRef.current.x + deltaX * 10,
      y: lastPositionRef.current.y + deltaY * 10,
      shadow: 5,
      config: { tension: 120, friction: 26 },
    });

    updateGameState({
      x: (lastPositionRef.current.x + deltaX * 10) / window.innerWidth,
      y: (lastPositionRef.current.y + deltaY * 10) / window.innerHeight,
      flipped: false,
    });
  };

  const bind = useGesture({
    onDrag: ({ down, movement: [mx, my], velocity: [vx, vy] }) => {
      const avgVelocity = (Math.abs(vx) + Math.abs(vy)) / 2;

      if (down) {
        setIsDragging(true);
        setSpring({
          x: lastPositionRef.current.x + mx,
          y: lastPositionRef.current.y + my,
          shadow: 10,
          config: { tension: 300, friction: 20 },
        });
      } else {
        setIsDragging(false);

        if (avgVelocity > 1.5) {
          handleYeet(vx, vy, mx, my);
        } else {
          glideGently(avgVelocity, mx, my);
        }
      }
    },
  });

  return (
    <animated.div
      ref={cardRef}
      {...bind()}
      style={{
        width: '69px',
        height: '100px',
        backgroundImage: `url(${cardsImages[cardImage]})`, // Use the cardImage based on flip state
        borderRadius: '8px',
        backgroundSize: 'cover',
        position: 'absolute',
        cursor: 'grab',
        zIndex: 1,
        touchAction: 'none',
        transform: x.to((xVal) => `translate(${xVal}px, ${y.get()}px) rotateY(${flipAngle.get()}deg)`),
        boxShadow: shadow.to((s) => `0px ${s}px ${s * 2}px rgba(0, 0, 0, 0.3)`),
      }}
    />
  );
};

// Helper function to convert cardId to the appropriate string (like '10_of_clubs')
const cardIdToCardString = (id: number) => {
  const cards = [
    '10_of_clubs',
    '10_of_diamonds',
    '10_of_hearts',
    '10_of_spades',
    // ...add other cards here
  ];
  return cards[id] || 'shirt';
};

export default MegaCard;
