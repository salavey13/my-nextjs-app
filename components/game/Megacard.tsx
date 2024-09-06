import React, { useState, useEffect } from 'react';
import { useSpring, animated } from 'react-spring';
import { useGesture } from '@use-gesture/react';
import { supabase } from '../../lib/supabaseClient';
import {cardsImages }from './CardsImgs'

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
  //, cardsImages cardsImages: { [key in CardId]: string }; // cardId mapped to base64-encoded images
}

const Megacard: React.FC<MegacardProps> = ({ gameState, cardId}) => {
  const [cardState, setCardState] = useState<Card | null>(null);
  const [trajectory, setTrajectory] = useState<Point[]>([]);
  const [isFlipped, setFlipped] = useState(false);

  // Position, rotation, shadow animation setup
  const [{ x, y, rot, shadow }, set] = useSpring(() => ({
    x: 0,
    y: 0,
    rot: 0,
    shadow: 5,
    config: { mass: 1, tension: 280, friction: 20 },
  }));

  // Get card state from game
  useEffect(() => {
    if (gameState) {
      const card = gameState.cards.find((c) => c.id === cardId);
      setCardState(card || null);
      if (card) {
        set({ x: card.position.x, y: card.position.y });
        setFlipped(card.flipped);
      }
    }
  }, [gameState, cardId]);

  // Drag gesture handling
  const bind = useGesture({
    onDrag: ({ down, movement: [mx, my], velocity = 0 }) => {
      // Ensure velocity is a number and perform the calculation safely
      const safeVelocity = typeof velocity === 'number' ? velocity : 0;
      set({
        x: mx,
        y: my,
        shadow: down ? Math.min(30, safeVelocity * 20) : 5, // Ensure the velocity calculation works
      });
      const newTrajectory = [...trajectory, { x: mx, y: my }];
      setTrajectory(newTrajectory);
    },
    onDragEnd: async () => {
      // Update card state in Supabase
      const updatedGameState = {
        ...gameState,
        cards: gameState.cards.map((card) =>
          card.id === cardId ? { ...card, position: { x: x.get(), y: y.get() }, last_trajectory: trajectory } : card
        ),
      };
      await supabase.from("rents").update({ game_state: updatedGameState }).eq("id", "28");
    },
  });

  return (
    <animated.div
      {...bind()}
      style={{
        transform: `translate(${x.get()}px, ${y.get()}px) rotate(${rot.get()}deg)`,
        boxShadow: shadow.to((s) => `0px ${s}px ${2 * s}px rgba(0,0,0,0.2)`),
        width: '100px', 
        height: '150px',
        backgroundImage: isFlipped ? `url(${cardsImages[cardId as keyof typeof cardsImages]})` : `url(${cardsImages["shirt"]})`,
        backgroundColor: isFlipped ? 'darkblue' : 'lightblue',
        borderRadius: '8px',
        cursor: 'grab',
        backgroundSize: 'cover',
      }}
    >
      <div>{/* Additional card content if needed */}</div>
    </animated.div>
  );
};

export default Megacard;
