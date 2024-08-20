// src/components/Referral.tsx
"use client";

import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient'; // Updated import path
import { useAppContext } from '../context/AppContext';

const Referral: React.FC = () => {
  const { user } = useAppContext();
  const [refereeUsername, setRefereeUsername] = useState('');
  const [referralLevel, setReferralLevel] = useState(1); // Default to level 1

  const handleReferUser = async () => {
    if (!user) return; // Ensure user is defined

    // Check if the referee exists
    const { data: refereeData, error: refereeError } = await supabase
      .from('users')
      .select('id')
      .eq('telegram_username', refereeUsername)
      .single();

    if (refereeError || !refereeData) {
      console.error('Error fetching referee data:', refereeError);
      return;
    }

    // Insert referral data with level
    const { error: referralError } = await supabase.from('referrals').insert([
      { referrer_id: user.id, referee_id: refereeData.id, level: referralLevel },
    ]);

    if (referralError) {
      console.error('Error referring user:', referralError);
      return;
    }

    // Update referrer's total referrals
    const { error: updateError } = await supabase.from('users').update({ total_referrals: user.total_referrals + 1 }).eq('id', user.id);

    if (updateError) {
      console.error('Error updating referrer referrals:', updateError);
      return;
    }

    setRefereeUsername('');
    setReferralLevel(referralLevel + 1); // Increase level for next referral
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Refer a Friend</h2>
      <input
        type="text"
        placeholder="Friend's Username"
        value={refereeUsername}
        onChange={(e) => setRefereeUsername(e.target.value)}
        className="input input-bordered w-full mb-2"
      />
      <button onClick={handleReferUser} className="btn btn-primary">
        Refer User
      </button>
    </div>
  );
};

export default Referral;
