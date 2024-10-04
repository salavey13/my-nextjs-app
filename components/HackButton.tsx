"use client";

import React, { useState, useEffect } from 'react';
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
  
  const { showBackButton, showCloseButton } = useTelegram({
    onBackButtonPressed: () => {
      if (selectedGame !== null) {
        setSelectedGame(null);
      }
    },
  });

  useEffect(() => {
    if (selectedGame === null) {
      showCloseButton();
    } else {
      showBackButton();
    }
  }, [selectedGame, showBackButton, showCloseButton]);

  const progressStage = async (newStage: number) => {
    if (!user?.id) return;
    try {
      const { error } = await supabase
        .from('users')
        .update({ 'game_state.stage': newStage })
        .eq('id', user.id);

      if (error) throw error;

      dispatch({
        type: 'UPDATE_GAME_STATE',
        payload: { ...user.game_state, stage: newStage },
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
  };

  useEffect(() => {
    if (gamesVisited.cards && gamesVisited.dice && user?.game_state?.stage === 0) {
      progressStage(1);
    }
  }, [gamesVisited, user?.game_state?.stage]);

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
      const newStage = userData?.game_state?.stage === 1 ? 2 : userData?.game_state?.stage;

      const { error } = await supabase
        .from('users')
        .update({ coins: newCoinsValue, 'game_state.stage': newStage })
        .eq('id', user.id);

      if (error) throw error;

      dispatch({
        type: 'UPDATE_USER',
        payload: { coins: newCoinsValue, game_state: { ...userData?.game_state, stage: newStage } },
      });

      toast({
        title: t('success'),
        description: t('congratulationsMessage'),
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
              onClick={handleHackButtonClick}
              className="bg-yellow-500 text-black text-xl px-6 py-3 rounded-lg shadow-lg hover:bg-yellow-600 transition-all"
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
