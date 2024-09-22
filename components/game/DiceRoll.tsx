// components/game/DiceRoll.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { useAppContext } from '@/context/AppContext';
import { supabase } from '@/lib/supabaseClient';
import { toast } from "@/hooks/use-toast";

interface DiceRollProps {
  mode: string;
  soundEnabled: boolean;
}

const DiceRoll: React.FC<DiceRollProps> = ({ mode, soundEnabled }) => {
  const { user, t } = useAppContext();
  const [dice1, setDice1] = useState(1);
  const [dice2, setDice2] = useState(1);
  const [isRolling, setIsRolling] = useState(false);
  const [score, setScore] = useState(0);

  const rollDice = () => {
    if (isRolling) return;

    setIsRolling(true);
    const rollInterval = setInterval(() => {
      setDice1(Math.floor(Math.random() * 6) + 1);
      setDice2(Math.floor(Math.random() * 6) + 1);
    }, 50);

    setTimeout(() => {
      clearInterval(rollInterval);
      const newDice1 = Math.floor(Math.random() * 6) + 1;
      const newDice2 = Math.floor(Math.random() * 6) + 1;
      setDice1(newDice1);
      setDice2(newDice2);
      setScore(prevScore => prevScore + newDice1 + newDice2);
      setIsRolling(false);

      if (soundEnabled) {
        playDiceSound();
      }
    }, 1000);
  };

  const playDiceSound = () => {
    // Implement sound playing logic here
    console.log("Playing dice sound");
  };

  const renderDice = (value: number) => (
    <div className="w-20 h-20 bg-red-600 rounded-lg flex items-center justify-center text-4xl font-bold text-white">
      {value}
    </div>
  );

  return (
    <div className="flex flex-col items-center">
      <div className="text-2xl mb-4">{t('score')}: {score}</div>
      <div className="flex space-x-4 mb-6">
        {renderDice(dice1)}
        {renderDice(dice2)}
      </div>
      <Button
        onClick={rollDice}
        disabled={isRolling}
        className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-4 rounded-full"
      >
        {isRolling ? t('rolling') : t('rollDice')}
      </Button>
    </div>
  );
};

export default DiceRoll;