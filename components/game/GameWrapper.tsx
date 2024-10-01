// components/game/GameWrapper.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useAppContext } from '@/context/AppContext';
import { supabase } from '@/lib/supabaseClient';
import GameBoard from './GameBoard';
import DiceGame from './DiceGame';
import LoadingSpinner from "../ui/LoadingSpinner";

const GameWrapper: React.FC = () => {
  const { state } = useAppContext();
  const [gameType, setGameType] = useState<string | null>(null);

  useEffect(() => {
    const fetchGameType = async () => {
      if (!state?.user?.currentGameId) return;

      try {
        const { data, error } = await supabase
          .from('rents')
          .select('game_state')
          .eq('id', state?.user.currentGameId)
          .single();

        if (error) throw error;

        setGameType(data.game_state.gameType || 'GameBoard');
      } catch (error) {
        console.error('Error fetching game type:', error);
        setGameType('GameBoard'); // Default to GameBoard if there's an error
      }
    };

    fetchGameType();

    const channel = supabase
      .channel(`game_type_updates_${state?.user?.currentGameId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'rents', filter: `id=eq.${state?.user?.currentGameId}` },
        (payload) => {
          setGameType(payload.new.game_state.gameType || 'GameBoard');
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [state?.user?.currentGameId]);

  if (!gameType) {
    return <LoadingSpinner />;
  }

  switch (gameType) {
    case 'DiceGame':
      return <DiceGame />;
    case 'GameBoard':
    default:
      return <GameBoard />;
  }
};

export default GameWrapper;