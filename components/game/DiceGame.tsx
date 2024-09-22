// components/game/DiceGame.tsx
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useAppContext } from '@/context/AppContext';
import { supabase } from '@/lib/supabaseClient';
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faVolumeUp, faVolumeMute, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import DiceRoll from './DiceRoll';
import GameModes from './GameModes'; 
import Rules from './Rules'; 
import useTelegram from '@/hooks/useTelegram';

const DiceGame: React.FC = () => {
  const { user, t } = useAppContext();
  const { tg } = useTelegram();
  const [gameMode, setGameMode] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showRules, setShowRules] = useState(false);

  const toggleSound = () => setSoundEnabled(!soundEnabled);

  const startGame = (mode: string) => {
    setGameMode(mode);
    // Initialize game state based on mode
  };

  const goBack = () => {
    setGameMode(null);
    setShowRules(false);
  };

  useEffect(() => {
    tg?.MainButton?.hide();
    tg?.BackButton?.show();
    tg?.BackButton?.onClick(goBack);

    return () => {
      tg?.BackButton?.onClick(goBack);
    };
  }, [tg]);

  if (showRules) {
    return <Rules onClose={() => setShowRules(false)} />;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <div className="flex justify-between w-full mb-4">
        <Button onClick={goBack} variant="ghost" size="icon">
          <FontAwesomeIcon icon={faArrowLeft} />
        </Button>
        <Button onClick={toggleSound} variant="ghost" size="icon">
          <FontAwesomeIcon icon={soundEnabled ? faVolumeUp : faVolumeMute} />
        </Button>
      </div>

      <h1 className="text-3xl font-bold mb-6">{t('diceGame')}</h1>

      {!gameMode ? (
        <GameModes onSelectMode={startGame} onShowRules={() => setShowRules(true)} />
      ) : (
        <DiceRoll mode={gameMode} soundEnabled={soundEnabled} />
      )}
    </div>
  );
};

export default DiceGame;