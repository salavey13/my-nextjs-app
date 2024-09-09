import React, { useState, useEffect, useRef } from 'react';
import { useSpring, animated } from 'react-spring';
import { useGesture } from '@use-gesture/react';
import { supabase } from '../../lib/supabaseClient';
import { cardsImages } from './CardsImgs';
import { CardPhysics } from './CardPhysics'; 
import PhysicsControls from './PhysicsControls'; // Import the new physics control component

const GAME_ID = 28;

interface Point {
  x: number;
  y: number;
}

interface Card {
  id: string;
  position: Point;
  flipped: boolean;
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
interface PhysicsParams {
    gravity: number;
    airFriction: number;
    surfaceFriction: number;
    mass: number;
    liftCoefficient: number;
    minRotationSpeedForLift: number;
  }
const Megacard: React.FC<MegacardProps> = ({ gameState, cardId, syncTrajectory }) => {
  const cardRef = useRef(null);
  const physicsRef = useRef<CardPhysics | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [physicsParams, setPhysicsParams] = useState<PhysicsParams>({
    gravity: 9.81,
    airFriction: 0.98,
    surfaceFriction: 0.92,
    mass: 5,
    liftCoefficient: 0.03,
    minRotationSpeedForLift: 3,
  });

  const [{ x, y, rotation, shadow }, set] = useSpring(() => ({
    x: 0,
    y: 0,
    rotation: 0,
    shadow: 0, // Initialize shadow
    config: { mass: 1, tension: 200, friction: 13 },
  }));

  // Initialize card physics
  useEffect(() => {
    if (gameState) {
      const card = gameState.cards.find((c) => c.id === cardId);
      if (card) {
        const posX = card.position.x * window.innerWidth;
        const posY = card.position.y * window.innerHeight;
        physicsRef.current = new CardPhysics({ x: posX, y: posY }, physicsParams);
        set({ x: posX, y: posY, rotation: 0, shadow: 0 });
      }
    }
  }, [gameState, cardId, set, physicsParams]);

  // Update physics and position when dragging ends
  const handleRelease = async (newX: number, newY: number) => {
    setIsDragging(false);

    if (physicsRef.current) {
      physicsRef.current.step(); 
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

  // Gesture handling for dragging and updating position
  const bind = useGesture({
    onDrag: ({ down, movement: [mx, my], velocity: [velocityX, velocityY], memo = { x: 0, y: 0 } }) => {
      const card = gameState.cards.find((c) => c.id === cardId);
      if (!card) return;

      if (down && !isDragging) {
        memo = { x: x.get(), y: y.get() }; // Use the current position to prevent jumping
        setIsDragging(true);
      }

      const newX = memo.x + mx;
      const newY = memo.y + my;

      set({
        x: newX,
        y: newY,
        shadow: Math.min(30, Math.abs(mx + my) / 10),
        rotation: physicsRef.current?.rotation.angle ?? 0,
      });

      if (!down) {
        handleRelease(newX, newY);
      }

      return memo;
    },
  });

  return (
    <>
      <animated.div
        {...bind()}
        style={{
          transform: x.to((xVal) => `translate(${xVal}px, ${y.get()}px) rotate(${rotation.get()}deg)`),
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
      <PhysicsControls physicsParams={physicsParams} setPhysicsParams={setPhysicsParams} />
    </>
  );
};

export default Megacard;
