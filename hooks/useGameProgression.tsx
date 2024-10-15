import { useCallback } from 'react';
import { useAppContext } from '@/context/AppContext';
import { supabase } from "@/lib/supabaseClient";
import { toast } from '@/hooks/use-toast';

export const useGameProgression = () => {
  const { state, dispatch, t } = useAppContext();

  const progressStage = useCallback(async (newStage: number) => {
    if (!state.user?.id) return;
    try {
      const { error } = await supabase
        .from('users')
        .update({ game_state: { ...state.user.game_state, stage: newStage } })
        .eq('id', state.user.id);

      if (error) throw error;

      dispatch({
        type: 'UPDATE_GAME_STATE',
        payload: { ...state.user.game_state, stage: newStage },
      });

      toast({
        title: t('stageProgression'),
        description: t(`stage${newStage}Unlocked`),
        stage: newStage,
        lang: state.user.lang,
      });
    } catch (error) {
      console.error('Error updating game stage:', error);
    }
  }, [state.user, dispatch, t]);

  return { progressStage };
};