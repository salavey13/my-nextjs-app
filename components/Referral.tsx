"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient'; // Updated import path
import { useAppContext } from '../context/AppContext';

const Referral: React.FC = () => {
  const { user, t } = useAppContext();
  const [friendName, setFriendName] = useState('');
  const [referralCode, setReferralCode] = useState('');

  useEffect(() => {
    if (!user) return;

    // Fetch or generate a referral code for the user
    const fetchReferralCode = async () => {
      const { data, error } = await supabase
        .from('referrals')
        .select('ref_code')
        .eq('user_id', user?.telegram_id)
        .single();

      if (error || !data) {
        // Handle case where referral code doesn't exist (create a new one)
        const newRefCode = `${user?.telegram_id}-${Date.now()}`;
        const { error: insertError } = await supabase
          .from('referrals')
          .insert([{ user_id: user?.telegram_id, ref_code: newRefCode }]);

        if (insertError) {
          console.error('Error generating referral code:', insertError);
        } else {
          setReferralCode(newRefCode);
        }
      } else {
        setReferralCode(data.ref_code);
      }
    };

    fetchReferralCode();
  }, [user]);

  const handleInviteFriend = () => {
    if (!user || !referralCode) return;

    const telegramMessage = `${friendName}! ${t("inviteMessage")} t.me/oneSitePlsBot/vip?ref=${referralCode}`;

    const telegramUrl = `https://telegram.me/share/url?url=${encodeURIComponent(telegramMessage)}`;

    window.open(telegramUrl, '_blank');
  };

  

  const inviteFriend = () => {
    const url = `t.me/oneSitePlsBot/vip?ref=${referralCode}`
    window.open(`https://telegram.me/share/url?url=${url}`, "_blank")
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">{t("referFriend")}</h2>
      <input
        type="text"
        placeholder={t("friendNamePlaceholder")}
        value={friendName}
        onChange={(e) => setFriendName(e.target.value)}
        className="input input-bordered w-full sm:w-3/4 md:w-2/3 lg:w-1/2 mb-2"
      />
      <button onClick={handleInviteFriend} className="btn btn-primary">
        {t("inviteFriendButton")}
      </button>
    </div>
  );
};

export default Referral;
