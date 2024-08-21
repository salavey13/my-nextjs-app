"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAppContext } from '../context/AppContext';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserPlus, faPaperPlane, faTrophy } from '@fortawesome/free-solid-svg-icons';
import toast from 'react-hot-toast';

const Referral: React.FC = () => {
  const { user, updateUserReferrals, t  } = useAppContext();
  //const { t } = useTranslation();
  const [referralName, setReferralName] = useState('');
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [inviteCount, setInviteCount] = useState(0);

  useEffect(() => {
    const fetchReferralData = async () => {
      if (user) {
        // Set the default referral name to the user's username or existing referral code
        const defaultReferralName = user.ref_code ? user.ref_code.replace('_13', '') : user.telegram_username;
        setReferralName(defaultReferralName || '');

        // Generate or fetch referral code
        if (!user.ref_code) {
          // Generate a new referral code
          const newReferralCode = `${defaultReferralName}_13`;
          
          // Save the referral code to the user's profile
          const { error } = await supabase
            .from('users')
            .update({ ref_code: newReferralCode })
            .eq('id', user.id);
          
          if (error) {
            toast.error(t('error'));
            console.error(error);
            return;
          }
          
          setReferralCode(newReferralCode);
        } else {
          // Use existing referral code
          setReferralCode(user.ref_code);
        }

        // Fetch the number of successful invites
        const { count, error: inviteError } = await supabase
          .from('referrals')
          .select('*', { count: 'exact' })
          .eq('ref_code', referralCode);

        if (inviteError) {
          console.error(inviteError);
        } else {
          setInviteCount(count || 0);
        }
      }
    };

    fetchReferralData();
  }, [user, t, referralCode]);

  const handleSendInvite = async () => {
    if (!referralCode) return;

    try {
        // Prepare Telegram link with referral code
        const telegramUrl = `https://t.me/oneSitePlsBot/vip?ref=${referralCode}`;

        // Use Telegram's openLink method to open the link
        if (window.Telegram?.WebApp) {
            window.Telegram.WebApp.openLink(telegramUrl);
        } else {
            // Fallback in case Telegram's method is not available
            window.open(telegramUrl, '_blank');
        }

        // toast.success(t('inviteSent'));
    } catch (error) {
        console.error('Error sending invite:', error);
        toast.error(t('error'));
    }
};

  const handleReferralNameChange = async (newName: string) => {
    if (newName.trim() === '') return;

    const newReferralCode = `${newName}_13`;

    // Save the new referral code to the user's profile
    const { error } = await supabase
      .from('users')
      .update({ ref_code: newReferralCode })
      .eq('id', user?.id);

    if (error) {
      toast.error(t('error'));
      console.error(error);
      return;
    }

    setReferralCode(newReferralCode);
    setReferralName(newName);
    updateUserReferrals(newReferralCode);
  };

  return (
    <Suspense fallback={<div>Loading...</div>}>
        <div className="p-6 bg-gray-800 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-white mb-4">
            <FontAwesomeIcon icon={faUserPlus} className="mr-2" />
            {t('inviteFriend')}
        </h2>
        <div className="mb-4">
            <label className="block text-gray-400 text-sm mb-1">
            {t('referralName')}
            </label>
            <input
            type="text"
            value={referralName}
            onChange={(e) => handleReferralNameChange(e.target.value)}
            className="input input-bordered w-full bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
        </div>
        <button
            onClick={handleSendInvite}
            className="btn btn-primary flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition w-full"
        >
            <FontAwesomeIcon icon={faPaperPlane} className="mr-2" />
            {t('sendInvite')}
        </button>
        <div className="mt-6 text-center">
            <FontAwesomeIcon icon={faTrophy} className="text-yellow-400 mb-2" />
            <p className="text-gray-400">
            {t('successfulInvites')}: {inviteCount}
            </p>
        </div>
        </div>
    </Suspense>
  );
};

export default Referral;
