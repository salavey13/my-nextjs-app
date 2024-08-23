"use client";

import React, { useState, useEffect, Suspense, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAppContext } from '../context/AppContext';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserPlus, faPaperPlane, faTrophy } from '@fortawesome/free-solid-svg-icons';
import LoadingSpinner from "../components/ui/LoadingSpinner";

const Referral: React.FC = () => {
  const { user, updateUserReferrals, t  } = useAppContext();
  const [referralName, setReferralName] = useState('');
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [inviteCount, setInviteCount] = useState(0);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchReferralData();
  }, [user]);

  const fetchReferralData = async () => {
    if (!user) return;

    try {
      const defaultReferralName = user.ref_code ? user.ref_code: user.telegram_username;
      setReferralName(defaultReferralName || '');

      if (!user.ref_code) {
        const newReferralCode = await generateReferralCode(defaultReferralName);
        setReferralCode(newReferralCode);
      } else {
        setReferralCode(user.ref_code);
      }

      const count = await getInviteCount(user.ref_code);
      setInviteCount(count);

    } catch (error) {
      console.error('Error fetching referral data:', error);
    }
  };

  const generateReferralCode = async (defaultReferralName: string) => {
    const newReferralCode = `${defaultReferralName}_13`;
    try {
      const { error } = await supabase
        .from('users')
        .update({ ref_code: newReferralCode })
        .eq('id', user?.id);

      if (error) throw error;
      return newReferralCode;

    } catch (error) {
      console.error('Error generating referral code:', error);
      throw error;
    }
  };

  const getInviteCount = async (referralCode: string | null) => {
    if (!referralCode) return 0;

    try {
      const { count, error } = await supabase
        .from('referrals')
        .select('*', { count: 'exact' })
        .eq('ref_code', referralCode);

      if (error) throw error;
      return count || 0;

    } catch (error) {
      console.error('Error fetching invite count:', error);
      return 0;
    }
  };

  const handleSendInvite = useCallback(async () => {
    if (!referralCode) return;

    try {
      const inviteLink = `https://t.me/oneSitePlsBot/vip?ref=${referralCode}`;
      await navigator.clipboard.writeText(inviteLink);

      await sendTelegramInvite(referralCode);

    } catch (error) {
      console.error('Error sending invite:', error);
    }
  }, [referralCode]);

  const handleReferralNameChange = async (newName: string) => {
    if (newName.trim() === '' || isUpdating) return;

    setIsUpdating(true);

    try {
      const newReferralCode = await generateReferralCode(newName);
      setReferralCode(newReferralCode);
      setReferralName(newName);
      updateUserReferrals(newReferralCode);

    } catch (error) {
      console.error('Error updating referral name:', error);

    } finally {
      setIsUpdating(false);
    }
  };

  const sendTelegramInvite = useCallback(async (referralCode: string) => {
    if (!process.env.NEXT_PUBLIC_BOT_TOKEN || !user) {
      console.error('Bot token is missing');
      return;
    }

    const botToken = process.env.NEXT_PUBLIC_BOT_TOKEN;
    const inviteLink = `https://t.me/oneSitePlsBot/vip?ref=${referralCode}`;
    const url = new URL(`https://api.telegram.org/bot${botToken}/sendPhoto`);
    const message = `${t("playWithUs")} ${user?.telegram_username }! 🎮✨`;
    url.searchParams.append("chat_id", user.telegram_id.toFixed());
    url.searchParams.append("caption", message);
    url.searchParams.append("photo", "https://th.bing.com/th/id/OIG2.fwYLXgRzLnnm2DMcdfl1");
    url.searchParams.append("reply_markup", JSON.stringify({
      inline_keyboard: [
        [{ text: t("startPlaying"), url: inviteLink }],
        [{ text: t("visitSite"), url: "https://oneSitePls.framer.ai" }],
        [{ text: t("joinCommunity"), url: "https://t.me/aibotsites" }],
        [{ text:  t("youtubeChannel"), url: "https://youtube.com/@salavey13" }],
      ],
    }));

    try {
      const response = await fetch(url.toString());
      if (!response.ok) throw new Error('Failed to send Telegram message');

    } catch (error) {
      console.error('Error sending Telegram message:', error);
    }
  }, [user]); // Include all dependencies in the dependency array

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <div className="p-6 bg-gray-800 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-white mb-4">
          <FontAwesomeIcon icon={faUserPlus} className="mr-2" />
          {t('inviteFriend')}
        </h1>
        <div className="mb-4">
          <label className="block text-gray-400 text-sm mb-1">
            {t('referralName')}
          </label>
          <input
            type="text"
            value={referralName}
            onChange={(e) => handleReferralNameChange(e.target.value)}
            className="input input-bordered w-full bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Referral Name"
          />
        </div>
        <button
          onClick={handleSendInvite}
          className="btn btn-primary flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition w-full"
          aria-label="Send Invite"
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
