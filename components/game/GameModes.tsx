// components/game/GameModes.tsx
import React from 'react';
import { Button } from "@/components/ui/button";
import { useAppContext } from '@/context/AppContext';

interface GameModesProps {
  onSelectMode: (mode: string) => void;
  onShowRules: () => void;
}

const GameModes: React.FC<GameModesProps> = ({ onSelectMode, onShowRules }) => {
  const { t } = useAppContext();

  return (
    <div className="flex flex-col items-center space-y-4">
      <Button onClick={() => onSelectMode('single')}>{t('singlePlayer')}</Button>
      <Button onClick={() => onSelectMode('twoPlayer')}>{t('twoPlayer')}</Button>
      <Button onClick={() => onSelectMode('ai')}>{t('playWithAI')}</Button>
      <Button onClick={() => onSelectMode('random')}>{t('randomOpponent')}</Button>
      <Button onClick={onShowRules} variant="outline">{t('rules')}</Button>
    </div>
  );
};

export default GameModes;