// components/HackButton.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useAppContext } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { supabase } from "../lib/supabaseClient";
import GameBoard from './game/GameBoard';
import DiceGame from './game/DiceGame';
import { toast } from "@/hooks/use-toast";

interface GameState {
  cards: any[];
  players: any[];
  // Add other necessary fields from GameBoard's GameState
}

const HackButton: React.FC = () => {
  const { state, dispatch, t } = useAppContext()
  const user = state.user
  const [selectedGame, setSelectedGame] = useState<'cards' | 'dice' | null>(null);



  const handleClick = async () => {
    try {
      if (!user?.id) {
        toast({
          title: t('error'),
          description: t('userNotFound'),
          variant: "destructive",
        });
        return;
      }

      // Fetch the current value of the 'coins' field
      const { data: userData, error: fetchError } = await supabase
        .from('users')
        .select('coins')
        .eq('id', user.id)
        .single();

      if (fetchError) {
        console.error('Error fetching user data:', fetchError);
        return;
      }

      // Increment the 'coins' field by 13000
      const newCoinsValue = (userData?.coins || 0) + 13000;

      const { error } = await supabase
        .from('users')
        .update({ coins: newCoinsValue })
        .eq('id', user.id);

      if (error) {
        console.error('Error updating coins:', error);
        toast({
          title: t('error'),
          description: t('updateCoinsError'),
          variant: "destructive",
        });
      } else {
        toast({
          title: t('success'),
          description: t('congratulationsMessage'),
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

  return (
    <div className="flex flex-col justify-center items-center min-h-[calc(100vh-128px)]">
      {!selectedGame && (
        <>
          <Button
            onClick={() => setSelectedGame('cards')}
            className="bg-blue-500 text-white text-xl px-6 py-3 rounded-lg shadow-lg hover:bg-blue-600 transition-all mb-4"
          >
            {t('playCards')}
          </Button>
          <Button
            onClick={() => setSelectedGame('dice')}
            className="bg-green-500 text-white text-xl px-6 py-3 rounded-lg shadow-lg hover:bg-green-600 transition-all mb-4"
          >
            {t('playDice')}
          </Button>
          <Button
            onClick={handleClick}
            className="bg-yellow-500 text-black text-xl px-6 py-3 rounded-lg shadow-lg hover:bg-yellow-600 transition-all"
          >
            {t('hackButton')}
          </Button>
        </>
      )}
      {selectedGame === 'cards' && <GameBoard />}
      {selectedGame === 'dice' && <DiceGame />}
      {/* {selectedGame && (
        <Button
          onClick={() => setSelectedGame(null)}
          className="mt-4 bg-gray-500 text-white text-xl px-6 py-3 rounded-lg shadow-lg hover:bg-gray-600 transition-all"
        >
          {t('backToMenu')}
        </Button>
      )} */}
    </div>
  );
};

export default HackButton;