'use client'

import React, { useState, useEffect, useCallback } from 'react';
import { useAppContext } from '@/context/AppContext';
import { useGameProgression } from '@/hooks/useGameProgression';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Zap, Car, Users, Dice1, Coins, CreditCard, Shield } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import storiRealStages  from '@/lib/storyStages'
//const storiRealStages:StoryStage[] = storyStages
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
  const [showAutomationPipeline, setShowAutomationPipeline] = useState(false);
  const [currentComponent, setCurrentComponent] = useState('');


//   useEffect(() => {
//     const fetchStoryStages = async () => {
//       const { data, error } = await supabase
//         .from('story_stages')
//         .select('*')
//         .order('stage', { ascending: true });

//       if (error) {
//         console.error('Error fetching story stages:', error);
//       } else {
//         setStoryStages(data || []);
//       }
//     };

//     fetchStoryStages();
//   }, []);
const fetchStoryStages = useCallback(async () => {
    setStoryStages(storiRealStages)
  }, [])
  
  useEffect(() => {
    fetchStoryStages()
  }, [fetchStoryStages])

  useEffect(() => {
    const currentStage = state.user?.game_state?.stage || 0;
    const unlockOptions = storyStages.filter(stage => stage.stage === currentStage && stage.parentid === null);
    setCurrentUnlockOptions(unlockOptions);

    const sideHustleOptions = storyStages.filter(stage => stage.stage === currentStage && stage.parentid !== null);
    setSideHustles(sideHustleOptions);
  }, [storyStages, state.user?.game_state?.stage]);

  const handleUnlock = async (component: string, nextStage: number) => {
    setCurrentComponent(component);
    setShowAutomationPipeline(true);

    // Wait for the automation pipeline to complete
    await new Promise(resolve => setTimeout(resolve, 12000)); // Adjust this time based on your simulation duration

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
    setShowAutomationPipeline(false);
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
    <Dialog open={true} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('chooseUnlock')}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          {currentUnlockOptions.map((option) => {
            const IconComponent = getIconComponent(option.activecomponent);
            return (
              <Card key={option.id} className="bg-card">
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
      </DialogContent>
    </Dialog>
  );
};

export default UnlockChoice;