"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useAppContext } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { supabase } from "@/lib/supabaseClient";
import GameBoard from './game/GameBoard';
import DiceGame from './game/DiceGame';
import { toast } from '@/hooks/use-toast';
import { useTelegram } from '@/hooks/useTelegram';

const HackButton: React.FC = () => {
  const { state, dispatch, t } = useAppContext();
  const user = state.user;
  const [selectedGame, setSelectedGame] = useState<'cards' | 'dice' | null>(null);
  const [gamesVisited, setGamesVisited] = useState({ cards: false, dice: false });
  
  const { showBackButton } = useTelegram({
    onBackButtonPressed: () => {
      if (selectedGame !== null) {
        setSelectedGame(null);
      }
    },
  });

  useEffect(() => {
    showBackButton();
  }, [selectedGame, showBackButton]);

  const progressStage = useCallback(async (newStage: number) => {
    if (!user?.id) return;
    try {
      const { error } = await supabase
        .from('users')
        .update({ game_state: { stage: newStage } })
        .eq('id', user.id);

      if (error) throw error;

      dispatch({
        type: 'UPDATE_GAME_STATE',
        payload: { ...(user.game_state || {}), stage: newStage },
      });

      toast({
        title: t('stageProgression'),
        description: t(`stage${newStage}Unlocked`),
        stage: newStage,
        lang: user.lang,
      });
    } catch (error) {
      console.error('Error updating game stage:', error);
    }
  }, [user, dispatch, t]);

  useEffect(() => {
    const currentStage = user?.game_state?.stage ?? 0;
    if (gamesVisited.cards && gamesVisited.dice && currentStage === 0) {
      progressStage(1);
    }
  }, [gamesVisited, user?.game_state?.stage, progressStage]);
  
  const handleHackButtonClick = async () => {
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
      const currentStage = userData?.game_state?.stage ?? 0;
      const newStage = currentStage === 1 ? 2 : currentStage;

      const { error } = await supabase
        .from('users')
        .update({ 
          coins: newCoinsValue, 
          game_state: { ...userData.game_state, stage: newStage }
        })
        .eq('id', user.id);

      if (error) throw error;

      dispatch({
        type: 'UPDATE_USER',
        payload: { 
          coins: newCoinsValue, 
          game_state: { ...(userData?.game_state || {}), stage: newStage } 
        },
      });

      toast({
        title: t('success'),
        description: t('congratulationsMessage'),
        stage: newStage,
      });

      if (newStage === 2) {
        progressStage(2);
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

  const goBack = () => {
    setSelectedGame(null);
  };

  const currentStage = user?.game_state?.stage ?? 0;

  return (
    <div className="flex flex-col justify-center items-center min-h-full w-full py-4">
      {!selectedGame && (
        <>
          <Button
            onClick={() => handleGameSelect('cards')}
            className="bg-blue-500 text-xl px-6 py-3 rounded-lg hover:bg-blue-600 transition-all mb-4 drop-shadow-custom"
          >
            {t('playCards')}
          </Button>
          <Button
            onClick={() => handleGameSelect('dice')}
            className="bg-green-500 text-xl px-6 py-3 rounded-lg hover:bg-green-600 transition-all mb-4 drop-shadow-custom"
          >
            {t('playDice')}
          </Button>
          {currentStage === 1 && (
            <Button
              onClick={handleHackButtonClick}
              className="bg-yellow-500 text-xl px-6 py-3 rounded-lg hover:bg-yellow-600 transition-all drop-shadow-custom"
            >
              {t('hackButton')}
            </Button>
          )}
        </>
      )}
      {selectedGame === 'cards' && <GameBoard goBack={goBack} />}
      {selectedGame === 'dice' && <DiceGame goBack={goBack} />}
    </div>
  );
};

export default HackButton;