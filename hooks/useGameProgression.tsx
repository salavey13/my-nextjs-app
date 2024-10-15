import { useCallback } from 'react';
import { useAppContext } from '@/context/AppContext';
import { supabase } from "@/lib/supabaseClient";
import { toast } from '@/hooks/use-toast';
import ReactDOM from 'react-dom';

export const useGameProgression = () => {
  const { state, dispatch, t } = useAppContext();

  const progressStage = useCallback(async (newStage: number, unlockedComponent?: string) => {
    if (!state.user?.id) return;
    try {
        const updatedGameState = {
            ...state.user.game_state,
            stage: newStage,
            unlockedComponents: [
              ...(state.user.game_state.unlockedComponents || []),
              unlockedComponent,
            ].filter(Boolean) as string[], // Explicit cast to string[] to ensure type safety
          };

      const { error } = await supabase
        .from('users')
        .update({ game_state: updatedGameState })
        .eq('id', state.user.id);

      if (error) throw error;

      dispatch({
        type: 'UPDATE_GAME_STATE',
        payload: updatedGameState,
      });

      toast({
        title: t('stageProgression'),
        description: t(`stage${newStage}Unlocked`),
        stage: newStage,
        lang: state.user.lang,
      });

      if (unlockedComponent) {
        toast({
          title: t('componentUnlocked'),
          description: t(`${unlockedComponent}Unlocked`),
          stage: newStage,
          lang: state.user.lang,
        });
      }
    } catch (error) {
      console.error('Error updating game stage:', error);
    }
  }, [state.user, dispatch, t]);

  const simulateCrash = useCallback(async () => {
    const CrashSimulation = (await import('@/components/CrashSimulation')).default;
    const root = document.createElement('div');
    document.body.appendChild(root);
  
    const onCrashComplete = () => {
      document.body.removeChild(root);
      progressStage(5, 'versimcel');
    };
  
    ReactDOM.render(<CrashSimulation onCrashComplete={onCrashComplete} />, root);
  }, [progressStage]);

  return { progressStage, simulateCrash };
};