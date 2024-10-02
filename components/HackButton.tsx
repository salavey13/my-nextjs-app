"use client";

import React, { useState, useEffect } from 'react';
import { useAppContext } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { supabase } from "@/lib/supabaseClient";
import GameBoard from './game/GameBoard';
import DiceGame from './game/DiceGame';
import { toast } from "@/hooks/use-toast";

const HackButton: React.FC = () => {
  const { state, dispatch, t } = useAppContext();
  const user = state.user;
  const [selectedGame, setSelectedGame] = useState<'cards' | 'dice' | null>(null);
  const [gamesVisited, setGamesVisited] = useState({ cards: false, dice: false });

  useEffect(() => {
    if (gamesVisited.cards && gamesVisited.dice && user?.game_state?.stage === 0) {
      progressToStage1();
    }
  }, [gamesVisited, user?.game_state?.stage]);

  const progressToStage1 = async () => {
    if (!user?.id) return;
    try {
      const { error } = await supabase
        .from('users')
        .update({ 'game_state.stage': 1 })
        .eq('id', user.id);

      if (error) throw error;

      dispatch({
        type: 'UPDATE_GAME_STATE',
        payload: { ...user.game_state, stage: 1 },
      });

      toast({
        title: t('stageProgression'),
        description: t('unlockedHackButton'),
      });
    } catch (error) {
      console.error('Error updating game stage:', error);
    }
  };

  const handleClick = async () => {
    if (!user?.id) {
      toast({
        title: t('error'),
        description: t('userNotFound'),
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: userData, error: fetchError } = await supabase
        .from('users')
        .select('coins, game_state')
        .eq('id', user.id)
        .single();

      if (fetchError) throw fetchError;

      const newCoinsValue = (userData?.coins || 0) + 13000;
      const newGameState = {
        ...userData?.game_state,
        stage: userData?.game_state?.stage === 1 ? 2 : userData?.game_state?.stage,
      };

      const { error } = await supabase
        .from('users')
        .update({ coins: newCoinsValue, game_state: newGameState })
        .eq('id', user.id);

      if (error) throw error;

      dispatch({
        type: 'UPDATE_USER',
        payload: { coins: newCoinsValue, game_state: newGameState },
      });

      toast({
        title: t('success'),
        description: t('congratulationsMessage'),
      });

      if (newGameState.stage === 2) {
        toast({
          title: t('stageProgression'),
          description: t('unlockedSkinCustomization'),
        });
      }
    } catch (error) {
      console.error('Error updating balance:', error);
      toast({
        title: t('error'),
        description: t('generalError'),
        variant: "destructive",
      });
    }
  };

  const handleGameSelect = (game: 'cards' | 'dice') => {
    setSelectedGame(game);
    setGamesVisited(prev => ({ ...prev, [game]: true }));
  };

  return (
    <div className="flex flex-col justify-center items-center min-h-[calc(100vh-128px)]">
      {!selectedGame && (
        <>
          <Button
            onClick={() => handleGameSelect('cards')}
            className="bg-blue-500 text-white text-xl px-6 py-3 rounded-lg shadow-lg hover:bg-blue-600 transition-all mb-4"
          >
            {t('playCards')}
          </Button>
          <Button
            onClick={() => handleGameSelect('dice')}
            className="bg-green-500 text-white text-xl px-6 py-3 rounded-lg shadow-lg hover:bg-green-600 transition-all mb-4"
          >
            {t('playDice')}
          </Button>
          {user?.game_state?.stage === 1 && (
            <Button
              onClick={handleClick}
              className="bg-yellow-500 text-black text-xl px-6 py-3 rounded-lg shadow-lg hover:bg-yellow-600 transition-all"
            >
              {t('hackButton')}
            </Button>
          )}
        </>
      )}
      {selectedGame === 'cards' && <GameBoard />}
      {selectedGame === 'dice' && <DiceGame />}
      {selectedGame && (
        <Button
          onClick={() => setSelectedGame(null)}
          className="mt-4 bg-gray-500 text-white text-xl px-6 py-3 rounded-lg shadow-lg hover:bg-gray-600 transition-all"
        >
          {t('backToMenu')}
        </Button>
      )}
    </div>
  );
};

export default HackButton;
