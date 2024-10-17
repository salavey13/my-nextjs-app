'use client'

import React from 'react';
import { useAppContext } from '@/context/AppContext';
import { useGameProgression } from '@/hooks/useGameProgression';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, Car, Users, Dice1 } from 'lucide-react';

const UnlockChoice: React.FC = () => {
  const { state, t } = useAppContext();
  const { progressStage, simulateCrash } = useGameProgression();

  const handleUnlock = async (component: string) => {
    await progressStage(5, [component]); // Pass an array of strings
    simulateCrash();
  };

  if (state.user?.game_state?.stage !== 4) {
    return null;
  }

  const unlockOptions = [
    { component: 'bets', icon: Zap, title: 'betsComponent', description: 'betsDescription' },
    { component: 'rent', icon: Car, title: 'rentsComponent', description: 'rentsDescription' },
    { component: 'referral', icon: Users, title: 'referralComponent', description: 'referralDescription' },
    { component: 'questsForCoins', icon: Dice, title: 'questsComponent', description: 'questsDescription' },
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <h2 className="text-2xl font-bold mb-6">{t('chooseUnlock')}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
        {unlockOptions.map((option) => (
          <Card key={option.component} className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center">
                <option.icon className="mr-2" />
                {t(option.title)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">{t(option.description)}</p>
              <Button 
                onClick={() => handleUnlock(option.component)}
                className="w-full"
              >
                {t(`unlock${option.component.charAt(0).toUpperCase() + option.component.slice(1)}`)}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default UnlockChoice;
