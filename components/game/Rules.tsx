// components/game/Rules.tsx
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { useAppContext } from '@/context/AppContext';

interface RulesProps {
  onClose: () => void;
}

const Rules: React.FC<RulesProps> = ({ onClose }) => {
  const { t } = useAppContext();
  const [language, setLanguage] = useState<'en' | 'ru'>('en');

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'ru' : 'en');
  };

  const rules = {
    en: `
      1. Each player rolls two dice.
      2. The sum of the dice values is added to the player's score.
      3. In two-player mode, the player with the highest score after a set number of rounds wins.
      4. In single-player mode, try to achieve the highest score possible.
    `,
    ru: `
      1. Каждый игрок бросает два кубика.
      2. Сумма значений на кубиках добавляется к счету игрока.
      3. В режиме для двух игроков побеждает игрок с наибольшим счетом после определенного количества раундов.
      4. В одиночном режиме попытайтесь достичь максимально возможного счета.
    `
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <h2 className="text-2xl font-bold mb-4">{t('rules')}</h2>
      <pre className="whitespace-pre-wrap mb-4">{rules[language]}</pre>
      <Button onClick={toggleLanguage} className="mb-4">
        {language === 'en' ? 'Switch to Russian' : 'Переключить на английский'}
      </Button>
      <Button onClick={onClose}>{t('back')}</Button>
    </div>
  );
};

export default Rules;