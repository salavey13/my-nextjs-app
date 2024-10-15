'use client'

import React from 'react';
import { useAppContext } from '@/context/AppContext';
import { useGameProgression } from '@/hooks/useGameProgression';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, Car } from 'lucide-react';

const UnlockChoice: React.FC = () => {
  const { state, t } = useAppContext();
  const { progressStage, simulateCrash } = useGameProgression();

  const handleUnlock = async (component: string) => {
    await progressStage(5, component);
    simulateCrash();
  };

  if (state.user?.game_state?.stage !== 4) {
    return null;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <h2 className="text-2xl font-bold mb-6">{t('chooseUnlock')}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Zap className="mr-2" />
              {t('betsComponent')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">{t('betsDescription')}</p>
            <Button onClick={() => handleUnlock('bets')}>{t('unlockBets')}</Button>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Car className="mr-2" />
              {t('rentsComponent')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">{t('rentsDescription')}</p>
            <Button onClick={() => handleUnlock('rent')}>{t('unlockRents')}</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UnlockChoice;