// src/components/Referral.tsx
import React, { useState, useEffect } from 'react';
import { useGame } from '../context/AppContext';

const Referral: React.FC = () => {
  const { user, store, supabase, fetchPlayer } = useGame();
  const [referralLink, setReferralLink] = useState<string | null>(null);

  useEffect(() => {
    if (!store.tg_id && user) {
      fetchPlayer(user.telegram_id, user.telegram_username);
    }
    if (!store.coins) {
      alert('Please add your TON wallet address to your profile to receive payments.');
    }
  }, [store.tg_id, user, store.coins, fetchPlayer]);

  const generateReferralLink = async () => {
    const { data, error } = await supabase.from('referrals').insert([{ referrer_id: store.tg_id }]).select().single();
    if (error) {
      console.error('Error generating referral link:', error);
    } else {
      setReferralLink(`${window.location.origin}/signup?referral_id=${data.id}`);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Invite Friends</h2>
      <button onClick={generateReferralLink} className="btn btn-primary mb-4">
        Generate Referral Link
      </button>
      {referralLink && (
        <div className="mb-4">
          <p>Share this link with friends:</p>
          <a href={referralLink} className="text-blue-500">{referralLink}</a>
        </div>
      )}
    </div>
  );
};

export default Referral;
