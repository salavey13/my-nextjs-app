import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const GAME_ID = '28'; // Hardcoded test game ID

const useGameState = () => {
  const [gameState, setGameState] = useState(null);

  useEffect(() => {
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

      // Real-time subscription to updates
      const channel = supabase
        .channel('game-updates')
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'rents',
          filter: `id=eq.${GAME_ID}`,
        }, (payload) => {
          console.log('Game state update received:', payload.new.game_state);
          setGameState(payload.new.game_state);
        })
        .subscribe();

      // Clean up subscription on unmount
      return () => {
        supabase.removeChannel(channel);
      };
    };

    handleSubscription();
  }, []);

  return gameState;
};

export default useGameState;
