// components/GameBoard.tsx
"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Button } from '@/components/ui/button';
import Megacard from './Megacard'; // Import the Megacard component
const GAME_ID = 28;  // Replace with actual game ID
const INITIAL_STATE = { cards: [], players: {} };
// Define a type for the card
interface Card {
    id: string;
    position: { x: number; y: number };
    flipped: boolean;
  }
  
  // Define a type for the game state
  interface GameState {
    cards: Card[];
  }
  

const GameBoard: React.FC = () => {
    const [gameState, setGameState] = useState<GameState | null>(null);

  const [playerId, setPlayerId] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<any>(null);

  useEffect(() => {
    // Get the player ID from the context or some global state
    const fetchPlayerId = async () => {
      // Fetch player ID logic here
      setPlayerId("player1"); // Example player ID
    };
    fetchPlayerId();
  }, []);

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

  return (
    <div className="game-board">
      {/* Render cards */}
      <div>
      {gameState && gameState.cards.map((card) => (
        <Megacard key={card.id} gameState={gameState} cardId={card.id}/>
      ))}
    </div>

      <button className="shuffle-button" onClick={() => console.log('Shuffling cards')}>
        Shuffle Cards
      </button>
    </div>
  );
};

export default GameBoard;
