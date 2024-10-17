//hooks\useGameProgression.tsx
import { useCallback } from 'react';
import { useAppContext } from '@/context/AppContext';
import { supabase } from "@/lib/supabaseClient";
import { toast } from '@/hooks/use-toast';
import ReactDOM from 'react-dom';

export const useGameProgression = () => {
  const { state, dispatch, t } = useAppContext();

  const progressStage = useCallback(async (newStage: number, unlockedComponents: string[] = [], skipToast: boolean = false) => {
  if (!state.user?.id) return;
  try {
    // Fetch the latest game state from the database
    const { data: latestUserData, error: fetchError } = await supabase
      .from('users')
      .select('game_state')
      .eq('id', state.user.id)
      .single();

    if (fetchError) throw fetchError;

    const latestGameState = latestUserData.game_state;

    // Merge the latest game state with the new changes
    const updatedGameState = {
      ...latestGameState,
      stage: Math.max(latestGameState.stage, newStage),
      unlockedComponents: Array.from(new Set([
        ...(latestGameState.unlockedComponents || []),
        ...unlockedComponents
      ])), // Ensure no duplicates
    };

    // Update the database with the merged game state
    const { error: updateError } = await supabase
      .from('users')
      .update({ game_state: updatedGameState })
      .eq('id', state.user.id);

    if (updateError) throw updateError;

    // Update the local state
    dispatch({
      type: 'UPDATE_GAME_STATE',
      payload: updatedGameState,
    });

    // Show toasts for stage progression and newly unlocked components
    if (!skipToast) {
      if (updatedGameState.stage > latestGameState.stage) {
        toast({
          title: t('stageProgression'),
          description: t(`stage${updatedGameState.stage}Unlocked`),
          stage: updatedGameState.stage,
          lang: state.user.lang,
        });
      }

      unlockedComponents.forEach(component => {
        if (!latestGameState.unlockedComponents?.includes(component)) {
          toast({
            title: t('componentUnlocked'),
            description: t(`${component}Unlocked`),
            stage: updatedGameState.stage,
            lang: state.user?.lang,
          });
        }
      });
    }
  } catch (error) {
    console.error('Error updating game stage:', error);
    toast({
      title: t('error'),
      description: t('errorUpdatingGameState'),
      variant: 'destructive',
    });
  }
}, [state.user, dispatch, t]);


  const simulateCrash = useCallback(async () => {
    const CrashSimulation = (await import('@/components/CrashSimulation')).default;
    const root = document.createElement('div');
    document.body.appendChild(root);

    const onCrashComplete = () => {
      document.body.removeChild(root);
      progressStage(5, ['versimcel']);
    };

    ReactDOM.render(<CrashSimulation onCrashComplete={onCrashComplete} />, root);
  }, [progressStage]);

  return { progressStage, simulateCrash };
};
