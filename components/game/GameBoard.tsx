// components/GameBoard.tsx
"use client";
// game_id,game_state
// 28,"{
  // {
  //   "cards": [
  //     {
  //       "id": "ace_of_spades",
  //       "position": { "x": 0.45, "y": 0.16 },
  //       "is_flipped": false,
  //       "trajectory": {
  //         "position": { "x": 0.1, "y": 0.1 },
  //         "rotation": 15,
  //         "velocity": { "x": 0.5, "y": 0.5 },
  //         "rotationSpeed": 0.02
  //       },
  //       "target_position": { "x": 0.6, "y": 0.5 },
  //       "target_rotation": 0
  //     }
  //   ],
  //   "players": [
  //     {
  //       "id": "43",
  //       "position": { "x": 184, "y": 64 }
  //     }
  //   ]
  // }
  

import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Button } from '@/components/ui/button';
import Megacard_1 from './Megacard_0.1'; // Import the Megacard component
import { useAppContext } from '@/context/AppContext';

const GAME_ID = 28;  // Replace with actual game ID

interface Card {
  id: string;
  position: { x: number; y: number };
  flipped: boolean;
}

interface GameState {
  cards: Card[];
}

const GameBoard: React.FC = () => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const { user, t } = useAppContext();

  useEffect(() => {
    // Subscribe to changes in the `rents` table for the current game
    const handleSubscription = async () => {
      // Initial fetch for game state
      const { data, error } = await supabase
        .from('rents')
        .select('game_state')
        .eq('id', GAME_ID)
        .single();

      if (error) {
        console.error('Error fetching game state:', error);
      } else {
        setGameState(data.game_state);
      }

      // Set up the real-time subscription using a Supabase Channel
      const channel = supabase
        .channel('notify_game_updates')
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'rents', filter: `id=eq.${GAME_ID}` }, (payload) => {
          setGameState(payload.new.game_state);
        })
        .subscribe();

      // Clean up the subscription on unmount
      setSubscription(channel);
      return () => {
        supabase.removeChannel(channel);
      };
    };

    handleSubscription();
  }, [GAME_ID]);

   // Fetch game state from Supabase
useEffect(() => {
    const fetchGameState = async () => {
      const { data, error } = await supabase
        .from('rents')
        .select('game_state')
        .eq('id', GAME_ID)
        .single();
      if (!error) setGameState(data.game_state);
    };
    fetchGameState();
  }, []);                              
  const shuffleCards = async () => {
    if (!gameState) return;

    // Shuffle the cards array
    const shuffledCards = gameState.cards
      .map(card => ({ ...card, position: { x: Math.random(), y: Math.random() } })) // Randomize positions
      .sort(() => Math.random() - 0.5); // Shuffle array

    // Update the game state with the shuffled cards
    const updatedGameState = { ...gameState, cards: shuffledCards };

    // Save the updated game state to Supabase
    const { error } = await supabase
      .from('rents')
      .update({ game_state: updatedGameState })
      .eq('id', GAME_ID);

    if (error) {
      console.error('Error updating game state:', error);
    } else {
      setGameState(updatedGameState); // Update local state
    }
  };

  return (
    <div className="game-board">
      {/* Render cards */}
      <div>
        {gameState && gameState.cards.map((card) => (
          <Megacard_1 key={card.id} gameState={gameState} cardId={card.id} />
        ))}
      </div>

      <Button className="shuffle-button" onClick={shuffleCards}>
        {t("shuffle")}
      </Button>
    </div>
  );
};

export default GameBoard;
