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
  position: Point;
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
    shadow: 13,
    config: { mass: 13, tension: 280, friction: 10 },
  }));

  useEffect(() => {
    if (gameState) {
      const card = gameState.cards.find((c) => c.id === cardId);
      if (card) {
        setCardState(card);
        set({ x: card.position.x, y: card.position.y });
        setFlipped(card.flipped);
      }
    }
  }, [gameState, cardId]);

  const isNearTrashPlace = (x: number, y: number) => {
    const trashPlace = { x: 200, y: 200 }; // Trash place coordinates
    const radius = 50; // Radius within which the card should snap to the trash place
    const distance = Math.sqrt((x - trashPlace.x) ** 2 + (y - trashPlace.y) ** 2);
    return distance < radius;
  };

  const moveToTrashPlace = async () => {
    set({ x: 200, y: 200, shadow: 5 });
    // Update game state in Supabase
    const updatedGameState = {
      ...gameState,
      cards: gameState.cards.map((card) =>
        card.id === cardId ? { ...card, position: { x: 200, y: 200 }, last_trajectory: trajectory } : card
      ),
    };
    const { error } = await supabase.from('rents').update({ game_state: updatedGameState }).eq('id', '28');
    if (error) console.error('Error updating game state:', error);
  };

  const bind = useGesture({
    onDrag: ({ down, movement: [mx, my], velocity = 0 }) => {
      // Ensure velocity is a number and perform the calculation safely
      const safeVelocity = typeof velocity === 'number' ? velocity : 0;
      set({
        x: mx + (gameState.cards.find((c) => c.id === cardId)?.position.x || 0), // Adjust based on initial position
        y: my + (gameState.cards.find((c) => c.id === cardId)?.position.y || 0),
        shadow: down ? Math.min(30, safeVelocity * 20) : 5,
      });
      const newTrajectory = [{ x: mx, y: my }];
      setTrajectory(newTrajectory);
    },
    onDragEnd: async ({ movement: [mx, my] }) => {
      if (isNearTrashPlace(mx, my)) {
        await moveToTrashPlace();
      } else {
        // Update card state in Supabase
        const updatedGameState = {
          ...gameState,
          cards: gameState.cards.map((card) =>
            card.id === cardId ? { ...card, position: { x: x.get(), y: y.get() }, last_trajectory: trajectory } : card
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
        position: 'absolute', // Ensure cards are positioned absolutely
      }}
    >
      <div>{/* Additional card content if needed */}</div>
    </animated.div>
  );
};

export default Megacard;
