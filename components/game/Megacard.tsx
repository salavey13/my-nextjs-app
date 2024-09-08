import React, { useState, useEffect, useRef } from 'react';
import { useSpring, animated } from 'react-spring';
import { useGesture } from '@use-gesture/react';
import { supabase } from '../../lib/supabaseClient';
import { cardsImages } from './CardsImgs';
import { CardPhysics } from './CardPhysics'; // Import the physics module

const GAME_ID = 28; // Replace with actual game ID

interface Point {
  x: number;
  y: number;
}

interface Card {
  id: string;
  position: Point; // Relative position (0 to 1)
  flipped: boolean;
  last_trajectory?: Point[];
  trajectory: {
    position: Point,
    rotation: number,
    velocity: Point,
    rotationSpeed: number,
  };
}

interface Player {
  id: string;
  position: Point;
  iceCandidates?: any[]; // Optional array for iceCandidates
}

interface GameState {
  cards: Card[];
  players: Player[];
}

type CardId = keyof typeof cardsImages;
interface MegacardProps {
  gameState: GameState;
  cardId: string;
  syncTrajectory: (trajectoryData: any) => void;
}

const Megacard: React.FC<MegacardProps> = ({ gameState, cardId, syncTrajectory }) => {
  const cardRef = useRef(null);
  const physicsRef = useRef<CardPhysics | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isOnTable, setIsOnTable] = useState(false);

  const [{ x, y, shadow }, set] = useSpring(() => ({
    x: 0,
    y: 0,
    shadow: 5,
    config: { mass: 1, tension: 200, friction: 13 },
  }));

  // Initialize card physics
  useEffect(() => {
    if (gameState) {
      const card = gameState.cards.find((c: any) => c.id === cardId);
      if (card) {
        const posX = card.position.x * window.innerWidth;
        const posY = card.position.y * window.innerHeight;
        physicsRef.current = new CardPhysics({ x: posX, y: posY });
        set({ x: posX, y: posY });
      }
    }
  }, [gameState, cardId, set]);

  // Update physics and position when dragging ends
  const handleRelease = async (newX: number, newY: number) => {
    setIsDragging(false);

    if (physicsRef.current) {
      physicsRef.current.step(); // Trigger the physics step
    }

    const updatedGameState = {
      ...gameState,
      cards: gameState.cards.map((card) =>
        card.id === cardId
          ? { ...card, position: { x: newX / window.innerWidth, y: newY / window.innerHeight } }
          : card
      ),
    };

    const { error } = await supabase
      .from('rents')
      .update({ game_state: updatedGameState })
      .eq('id', GAME_ID);

    if (error) {
      console.error('Error updating game state:', error);
    }

    syncTrajectory({
      position: { x: newX, y: newY },
      velocity: physicsRef.current?.velocity,
      rotation: physicsRef.current?.rotation.angle,
      rotationSpeed: physicsRef.current?.rotation.speed,
    });
  };

  const isNearTrashPlace = (x: number, y: number) => {
    const trashPlace = { x: 200, y: 200 };
    const radius = 50;
    const distance = Math.sqrt((x - trashPlace.x) ** 2 + (y - trashPlace.y) ** 2);
    return distance < radius;
  };

  const moveToTrashPlace = async () => {
    set({ x: 200, y: 200, shadow: 5 });
    const updatedGameState = {
      ...gameState,
      cards: gameState.cards.map((card) =>
        card.id === cardId ? { ...card, position: { x: 200 / window.innerWidth, y: 200 / window.innerHeight } } : card
      ),
    };
    const { error } = await supabase.from('rents').update({ game_state: updatedGameState }).eq('id', GAME_ID);
    if (error) console.error('Error updating game state:', error);
  };

  const bind = useGesture({
    onDrag: ({ down, movement: [mx, my], velocity: [velocityX, velocityY], memo = { x: 0, y: 0 } }) => {
      const card = gameState.cards.find((c) => c.id === cardId);
      if (!card) return;

      if (down && !memo) {
        memo = { x: card.position.x * window.innerWidth, y: card.position.y * window.innerHeight };
      }

      const newX = memo.x + mx;
      const newY = memo.y + my;

      set({
        x: newX,
        y: newY,
        shadow: Math.min(30, Math.abs(mx + my) / 10),
      });

      if (Math.abs(mx) > 10 || Math.abs(my) > 10) {
        physicsRef.current?.calculateRotationSpeed(mx, my, velocityX, velocityY);
      }

      if (!down) {
        handleRelease(newX, newY);
      }

      return memo;
    },
  });

  useEffect(() => {
    if (gameState) {
      const card = gameState.cards.find((c) => c.id === cardId);
      if (card) {
        const posX = card.position.x * window.innerWidth;
        const posY = card.position.y * window.innerHeight;
        set({ x: posX, y: posY });
      }
    }
  }, [gameState, cardId, set]);

  return (
    <animated.div
      {...bind()}
      style={{
        transform: x.interpolate((x) => `translate(${x}px, ${y.get()}px) rotate(${physicsRef.current?.rotation.angle ?? 0}deg)`),
        boxShadow: shadow.to((s) => `0px ${s}px ${2 * s}px rgba(0,0,0,0.2)`),
        width: '100px',
        height: '150px',
        backgroundImage: `url(${cardsImages[cardId as CardId]})`,
        borderRadius: '8px',
        cursor: 'grab',
        backgroundSize: 'cover',
        position: 'absolute',
        touchAction: 'none',
      }}
    >
      <div>{/* Additional card content */}</div>
    </animated.div>
  );
};

export default Megacard;
