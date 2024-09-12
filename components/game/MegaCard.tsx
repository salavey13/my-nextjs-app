// components/game/MegaCard.tsx

import { animated, useSpring } from 'react-spring';
import { useRef, useEffect, useState } from 'react';
import { useGesture } from '@use-gesture/react';
import { cardsImages } from './CardsImgs';
import { useAppContext } from '@/context/AppContext';

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
  syncTrajectory: (cardId: CardId, trajectory: { x: number; y: number; rotation: number }) => void;
}

export const MegaCard: React.FC<MegaCardProps> = ({ gameState, cardId, syncTrajectory }) => {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const lastPositionRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isYeeted, setIsYeeted] = useState<boolean>(false);
  const [currentFlipAngle, setCurrentFlipAngle] = useState<number>(0);
  const { user } = useAppContext();

  const cardImage = gameState.cards.find((c) => c.id === cardId)?.flipped ? 'shirt' : cardId;

  // Spring for handling card animation
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
    syncTrajectory(cardId, { x: update.x, y: update.y, rotation: currentFlipAngle });
  };

  const updateCardPosition = (x: number, y: number, rotation: number) => {
    setSpring({ x, y });
  };

  // Handle special YEET movement with overshoot
  const handleYeet = (velocityX: number, velocityY: number, deltaX: number, deltaY: number) => {
    if (!lastPositionRef.current || !cardRef.current) return;

    setIsYeeted(true);
    setSpring({ flipAngle: 180 });

    const signedDistanceX = deltaX > 0 ? Math.abs(velocityX) : -Math.abs(velocityX);
    const signedDistanceY = deltaY > 0 ? Math.abs(velocityY) : -Math.abs(velocityY);

    // Overshoot by 3 times the original distance
    const overshootX = lastPositionRef.current.x + signedDistanceX * 300;
    const overshootY = lastPositionRef.current.y + signedDistanceY * 300;

    setSpring({
      x: overshootX,
      y: overshootY,
      shadow: 15,
      config: { tension: 400, friction: 10 },
    });

    setTimeout(() => setIsYeeted(false), 500);

    updateGameState({
      x: overshootX / window.innerWidth,
      y: overshootY / window.innerHeight,
      flipped: true,
    });
  };

  // Gentle glide back for non-yeet movements
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

  const flipCard = () => {
    setCurrentFlipAngle((prev) => (prev === 0 ? 180 : 0));
    const flipped = currentFlipAngle === 0;
    updateGameState({ x: lastPositionRef.current.x, y: lastPositionRef.current.y, flipped });
  };

  const bind = useGesture({
    onDrag: ({ down, movement: [mx, my], velocity: [vx, vy], direction: [dx, dy] }) => {
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

        if (dy > 0 && avgVelocity > 1.5) {
          // Yeet if dragged downwards with sufficient velocity
          handleYeet(vx, vy, mx, my);
        } else {
          // Gentle glide for regular movement
          glideGently(avgVelocity, mx, my);
        }
      }
    },
    onDoubleClick: () => flipCard(),
  });

  return (
    <animated.div
      ref={cardRef}
      {...bind()}
      style={{
        width: '69px',
        height: '100px',
        backgroundImage: `url(${cardsImages[cardImage]})`,
        borderRadius: '10px',
        transform: flipAngle.to((angle) => `rotateY(${angle}deg)`),
        boxShadow: shadow.to((s) => `0px ${s}px ${s * 2}px rgba(0, 0, 0, 0.3)`),
      }}
    />
  );
};
