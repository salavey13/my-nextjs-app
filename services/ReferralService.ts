// services/ReferralService.ts
import { supabase } from '../lib/supabaseClient';

export const updateUserReferral = async (userId: number, referrerId: number) => {
  try {
    await supabase
      .from('users')
      .update({ referer: referrerId })
      .eq('id', userId);
  } catch (error) {
    console.error('Update referral error:', error);
  }
};

export const increaseReferrerX = async (referrerId: number) => {
  try {
    const { data: referrer, error } = await supabase
      .from('users')
      .select('X')
      .eq('id', referrerId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    if (referrer) {
      const newXValue = parseInt(referrer.X, 10) + 1;
      await supabase
        .from('users')
        .update({ X: newXValue })
        .eq('id', referrerId);
    }
  } catch (error) {
    console.error('Increase referrer X error:', error);
  }
};

export const addReferralEntry = async (userId: number, referredUserId: number, refCode: string) => {
  try {
    const { error } = await supabase
      .from('referrals')
      .insert({ user_id: userId, referred_user_id: referredUserId, ref_code: refCode });

    if (error) throw error;
  } catch (error) {
    console.error('Error adding referral entry:', error);
  }
};
