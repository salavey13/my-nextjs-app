// components/GameBoard.tsx
"use client";
// game_id,game_state
// test_game_1,"{
//   ""cards"": [
//     {
//       ""id"": ""card1"",
//       ""position"": { ""x"": 100, ""y"": 200 },
//       ""last_trajectory"": [
//         { ""x"": 100, ""y"": 200 },
//         { ""x"": 120, ""y"": 220 },
//         { ""x"": 140, ""y"": 240 }
//       ],
//       ""is_flipped"": false
//     },
//     {
//       ""id"": ""card2"",
//       ""position"": { ""x"": 300, ""y"": 100 },
//       ""last_trajectory"": [
//         { ""x"": 300, ""y"": 100 },
//         { ""x"": 320, ""y"": 80 },
//         { ""x"": 340, ""y"": 60 }
//       ],
//       ""is_flipped"": true
//     },
//     {
//       ""id"": ""trash_card"",
//       ""position"": { ""x"": 600, ""y"": 400 },
//       ""last_trajectory"": [
//         { ""x"": 600, ""y"": 400 },
//         { ""x"": 580, ""y"": 380 },
//         { ""x"": 560, ""y"": 360 }
//       ],
//       ""is_flipped"": false
//     }
//   ]
// }"

import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Button } from '@/components/ui/button';
import Megacard from './Megacard'; // Import the Megacard component
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
        .channel('game-updates')
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
      .map(card => ({ ...card, position: { x: Math.random() * 800, y: Math.random() * 600 } })) // Randomize positions
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
          <Megacard key={card.id} gameState={gameState} cardId={card.id} />
        ))}
      </div>

      <Button className="shuffle-button" onClick={shuffleCards}>
        {t("shuffle")}
      </Button>
    </div>
  );
};

export default GameBoard;
