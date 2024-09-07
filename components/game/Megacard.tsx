import React, { useState, useEffect } from 'react';
import { useSpring, animated } from 'react-spring';
import { useGesture } from '@use-gesture/react';
import { supabase } from '../../lib/supabaseClient';
import { cardsImages } from './CardsImgs';

interface Point {
  x: number;
  y: number;
}

interface Card {
  id: string;
  position: Point; // Relative position in percentage (0 to 1)
  flipped: boolean;
  last_trajectory?: Point[];
}

interface GameState {
  cards: Card[];
}

type CardId = keyof typeof cardsImages;

interface MegacardProps {
  gameState: GameState;
  cardId: string;
}

const Megacard: React.FC<MegacardProps> = ({ gameState, cardId }) => {
  const [cardState, setCardState] = useState<Card | null>(null);
  const [trajectory, setTrajectory] = useState<Point[]>([]);
  const [isFlipped, setFlipped] = useState(false);

  // Position, rotation, shadow animation setup
  const [{ x, y, shadow }, set] = useSpring(() => ({
    x: 0,
    y: 0,
    shadow: 5,
    config: { mass: 1, tension: 150, friction: 20 },
  }));

  useEffect(() => {
    if (gameState) {
      const card = gameState.cards.find((c) => c.id === cardId);
      if (card) {
        setCardState(card);
        set({ x: card.position.x * window.innerWidth, y: card.position.y * window.innerHeight });
        setFlipped(card.flipped);
      }
    }
  }, [gameState, cardId]);

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
        card.id === cardId ? { ...card, position: { x: 200 / window.innerWidth, y: 200 / window.innerHeight }, last_trajectory: trajectory } : card
      ),
    };
    const { error } = await supabase.from('rents').update({ game_state: updatedGameState }).eq('id', '28');
    if (error) console.error('Error updating game state:', error);
  };

  const bind = useGesture({
    onDrag: ({ down, movement: [mx, my], velocity }) => {
      const safeVelocity = typeof velocity === 'number' ? velocity : 0;
      const newX = mx + (cardState?.position.x || 0) * window.innerWidth;
      const newY = my + (cardState?.position.y || 0) * window.innerHeight;
      set({
        x: newX,
        y: newY,
        shadow: down ? Math.min(30, safeVelocity * 20) : 5,
      });
      setTrajectory([{ x: newX, y: newY }]);
    },
    onDragEnd: async ({ velocity: [vx, vy] }) => {
      if (isNearTrashPlace(x.get(), y.get())) {
        await moveToTrashPlace();
      } else {
        // Apply inertia effect
        const bounceFactor = 0.7; // Bouncing factor
        const boundaryPadding = 20; // Padding from the edge of the container
        const containerWidth = window.innerWidth;
        const containerHeight = window.innerHeight;
        const xPos = x.get();
        const yPos = y.get();

        // Bounce off the edges
        let newX = xPos + vx * 10;
        let newY = yPos + vy * 10;
        if (newX < boundaryPadding || newX > containerWidth - boundaryPadding) {
          newX = boundaryPadding + Math.sign(vx) * bounceFactor * (containerWidth - boundaryPadding - xPos);
        }
        if (newY < boundaryPadding || newY > containerHeight - boundaryPadding) {
          newY = boundaryPadding + Math.sign(vy) * bounceFactor * (containerHeight - boundaryPadding - yPos);
        }
        set({ x: newX, y: newY, shadow: 5 });
        
        // Update card state in Supabase
        const updatedGameState = {
          ...gameState,
          cards: gameState.cards.map((card) =>
            card.id === cardId ? { ...card, position: { x: newX / window.innerWidth, y: newY / window.innerHeight }, last_trajectory: trajectory } : card
          ),
        };
        const { error } = await supabase.from('rents').update({ game_state: updatedGameState }).eq('id', '28');
        if (error) console.error('Error updating game state:', error);
      }
    },
  });

  return (
    <animated.div
      {...bind()}
      style={{
        transform: `translate(${x.get()}px, ${y.get()}px)`,
        boxShadow: shadow.to((s) => `0px ${s}px ${2 * s}px rgba(0,0,0,0.2)`),
        width: '100px',
        height: '150px',
        backgroundImage: isFlipped ? `url(${cardsImages[cardId as CardId]})` : `url(${cardsImages["shirt"]})`,
        backgroundColor: isFlipped ? 'darkblue' : 'lightblue',
        borderRadius: '8px',
        cursor: 'grab',
        backgroundSize: 'cover',
        position: 'absolute',
      }}
    >
      <div>{/* Additional card content if needed */}</div>
    </animated.div>
  );
};

export default Megacard;
