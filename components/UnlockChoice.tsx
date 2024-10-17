'use client'

import React, { useState, useEffect } from 'react';
import { useAppContext } from '@/context/AppContext';
import { useGameProgression } from '@/hooks/useGameProgression';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Zap, Car, Users, Dice1, Coins, CreditCard, Shield } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

interface StoryStage {
  id: number;
  parentid: number | null;
  stage: number;
  storycontent: string;
  xuinitydialog: string;
  trigger: string;
  activecomponent: string;
  minigame: string;
  achievement: string;
  bottomshelfbitmask: number;
}

const UnlockChoice: React.FC = () => {
  const { state, dispatch, t } = useAppContext();
  const { progressStage, simulateCrash } = useGameProgression();
  const [showSideHustleModal, setShowSideHustleModal] = useState(false);
  const [storyStages, setStoryStages] = useState<StoryStage[]>([]);
  const [currentUnlockOptions, setCurrentUnlockOptions] = useState<StoryStage[]>([]);
  const [sideHustles, setSideHustles] = useState<StoryStage[]>([]);

  useEffect(() => {
    const fetchStoryStages = async () => {
      const { data, error } = await supabase
        .from('story_stages')
        .select('*')
        .order('stage', { ascending: true });

      if (error) {
        console.error('Error fetching story stages:', error);
      } else {
        setStoryStages(data || []);
      }
    };

    fetchStoryStages();
  }, []);

  useEffect(() => {
    const currentStage = state.user?.game_state?.stage || 0;
    const unlockOptions = storyStages.filter(stage => stage.stage === currentStage && stage.parentid === null);
    setCurrentUnlockOptions(unlockOptions);

    const sideHustleOptions = storyStages.filter(stage => stage.stage === currentStage && stage.parentid !== null);
    setSideHustles(sideHustleOptions);
  }, [storyStages, state.user?.game_state?.stage]);

  const handleUnlock = async (component: string, nextStage: number) => {
    await progressStage(nextStage, [component]);
    dispatch({
      type: 'UPDATE_GAME_STATE',
      payload: { 
        stage: nextStage, 
        unlockedComponents: [...(state.user?.game_state?.unlockedComponents || []), component] 
      }
    });
    simulateCrash();
    triggerSideHustleChoice();
  };

  const triggerSideHustleChoice = () => {
    if (sideHustles.length > 0) {
      setShowSideHustleModal(true);
    }
  };

  const handleSideHustleChoice = async (sideHustle: StoryStage) => {
    console.log(`Chosen side hustle: ${sideHustle.storycontent}`);
    setShowSideHustleModal(false);

    const updatedGameState = {
      ...state.user?.game_state,
      currentSideHustle: sideHustle.id,
    };

    dispatch({
      type: 'UPDATE_GAME_STATE',
      payload: updatedGameState,
    });

    const { error } = await supabase
      .from('users')
      .update({ game_state: updatedGameState })
      .eq('id', state.user?.id);

    if (error) {
      console.error('Error updating user game state:', error);
    }
  };

  const getIconComponent = (activeComponent: string) => {
    switch (activeComponent.toLowerCase()) {
      case 'crypto wallet': return CreditCard;
      case 'events': return Zap;
      case 'rents': return Car;
      case 'versimcel': return Shield;
      case 'github': return Users;
      default: return Dice1;
    }
  };

  if (currentUnlockOptions.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <h2 className="text-2xl font-bold mb-6">{t('chooseUnlock')}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
        {currentUnlockOptions.map((option) => {
          const IconComponent = getIconComponent(option.activecomponent);
          return (
            <Card key={option.id} className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <IconComponent className="mr-2" />
                  {t(option.activecomponent)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">{option.storycontent}</p>
                <Button 
                  onClick={() => handleUnlock(option.activecomponent, option.stage + 1)}
                  className="w-full"
                >
                  {t(`unlock${option.activecomponent.charAt(0).toUpperCase() + option.activecomponent.slice(1)}`)}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={showSideHustleModal} onOpenChange={setShowSideHustleModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('chooseSideHustle')}</DialogTitle>
            <DialogDescription>{t('sideHustleDescription')}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            {sideHustles.map((sideHustle) => (
              <Card key={sideHustle.id}>
                <CardHeader>
                  <CardTitle>{sideHustle.activecomponent}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{sideHustle.storycontent}</p>
                  <p className="font-bold mt-2">{t('achievement')}: {sideHustle.achievement}</p>
                  <Button onClick={() => handleSideHustleChoice(sideHustle)}>
                    {t('choose')}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UnlockChoice;