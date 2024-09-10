// components\game\Megacard.tsx
import React, { useState, useEffect, useRef } from 'react';
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
  position: Point; // Relative position (0 to 1)
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

const MegaOrigCard: React.FC<MegacardProps> = ({ gameState, cardId }) => {
  const [cardState, setCardState] = useState<Card | null>(null);
  const [initialPosition, setInitialPosition] = useState<Point>({ x: 0, y: 0 });
  const [isFlipped, setFlipped] = useState(false);

  const [{ x, y, shadow }, set] = useSpring(() => ({
    x: 0,
    y: 0,
    shadow: 5,
    config: { mass: 1, tension: 200, friction: 13 },
  }));

  useEffect(() => {
    if (gameState) {
      const card = gameState.cards.find((c) => c.id === cardId);
      if (card) {
        setCardState(card);
        const posX = card.position.x * window.innerWidth;
        const posY = card.position.y * window.innerHeight;
        setInitialPosition({ x: posX, y: posY });
        set({ x: posX, y: posY });
        setFlipped(card.flipped);
      }
    }
  }, [gameState, cardId, set]);

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
    const { error } = await supabase.from('rents').update({ game_state: updatedGameState }).eq('id', '28');
    if (error) console.error('Error updating game state:', error);
  };

  const bind = useGesture({
    onDrag: ({ down, movement: [mx, my], offset: [ox, oy] }) => {
      if (down) {
        set({
          x: initialPosition.x + ox,
          y: initialPosition.y + oy,
          shadow: Math.min(30, Math.abs(ox + oy) / 10),
        });
      }
    },
    onDragEnd: async ({ movement: [mx, my], velocity }) => {
      const newX = initialPosition.x + mx;
      const newY = initialPosition.y + my;
      
      if (isNearTrashPlace(newX, newY)) {
        await moveToTrashPlace();
      } else {
        set({
          x: newX,
          y: newY,
          shadow: 5,
          config: { mass: 1, tension: 200, friction: 30 },
        });

        const updatedGameState = {
          ...gameState,
          cards: gameState.cards.map((card) =>
            card.id === cardId ? { ...card, position: { x: newX / window.innerWidth, y: newY / window.innerHeight } } : card
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
        transform: x.interpolate((x) => `translate(${x}px, ${y.get()}px)`),
        boxShadow: shadow.to((s) => `0px ${s}px ${2 * s}px rgba(0,0,0,0.2)`),
        width: '100px',
        height: '150px',
        backgroundImage: isFlipped ? `url(${cardsImages[cardId as CardId]})` : `url(${cardsImages["shirt"]})`,
        backgroundColor: isFlipped ? 'darkblue' : 'lightblue',
        borderRadius: '8px',
        cursor: 'grab',
        backgroundSize: 'cover',
        position: 'absolute',
        touchAction: 'none',
      }}
    >
      <div>{/* Additional card content if needed */}</div>
    </animated.div>
  );
};

export default MegaOrigCard;
