"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useAppContext } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { supabase } from "@/lib/supabaseClient";
import GameBoard from './game/GameBoard';
import DiceGame from './game/DiceGame';
import { toast } from '@/hooks/use-toast';
import { useTelegram } from '@/hooks/useTelegram';
import { useGameProgression } from '@/hooks/useGameProgression';
import UnlockChoice from '@/components/UnlockChoice';

const HackButton: React.FC = () => {
  const { state, dispatch, t } = useAppContext();
  const user = state.user;
  const [selectedGame, setSelectedGame] = useState<'cards' | 'dice' | null>(null);
  const [gamesVisited, setGamesVisited] = useState({ cards: false, dice: false });
  const [showUnlockChoice, setShowUnlockChoice] = useState(false);
  const [hackCount, setHackCount] = useState(0); // Added state for hack count
  const { simulateCrash, progressStage } = useGameProgression();
  
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

  useEffect(() => {
    const currentStage = user?.game_state?.stage ?? 0;
    if (gamesVisited.cards && gamesVisited.dice && currentStage === 0) {
      progressStage(1, ['hack_button']);
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
      const newHackCount = hackCount + 1;
      setHackCount(newHackCount);

      const { error } = await supabase
        .from('users')
        .update({ 
          coins: newCoinsValue, 
          game_state: { ...userData.game_state, hackCount: newHackCount }
        })
        .eq('id', user.id);

      if (error) throw error;

      dispatch({
        type: 'UPDATE_USER',
        payload: { 
          coins: newCoinsValue, 
          game_state: { ...(userData?.game_state || {}), hackCount: newHackCount } 
        },
      });

      toast({
        title: t('success'),
        description: t('congratulationsMessage'),
        stage: currentStage,
      });

      if (newHackCount === 13) {
        await simulateCrash(); // Added function call
        await progressStage(3, ['crypto', 'createEvent']);
        setShowUnlockChoice(true);
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

  const currentStage = user?.game_state?.stage ?? 0;;

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
      {showUnlockChoice && <UnlockChoice />}
    </div>
  );
};

export default HackButton;