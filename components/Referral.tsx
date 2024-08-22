"use client";

import React, { useState, useEffect, Suspense, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAppContext } from '../context/AppContext';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserPlus, faPaperPlane, faTrophy } from '@fortawesome/free-solid-svg-icons';
import toast from 'react-hot-toast';
import LoadingSpinner from "../components/ui/LoadingSpinner";

const Referral: React.FC = () => {
  const { user, updateUserReferrals, t } = useAppContext();
  const [referralName, setReferralName] = useState('');
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [inviteCount, setInviteCount] = useState(0);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const fetchReferralData = async () => {
      if (user) {
        const defaultReferralName = user.ref_code ? user.ref_code.replace('_13', '') : user.telegram_username;
        setReferralName(defaultReferralName || '');

        if (!user.ref_code) {
          // Only generate a new referral code if one does not exist
          const newReferralCode = `${defaultReferralName}_13`;
          try {
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
          } catch (error) {
            console.error(error);
            toast.error(t('error'));
          }
        } else {
          setReferralCode(user.ref_code);
        }

        try {
          const { count, error: inviteError } = await supabase
            .from('referrals')
            .select('*', { count: 'exact' })
            .eq('ref_code', referralCode);

          if (inviteError) {
            console.error(inviteError);
          } else {
            setInviteCount(count || 0);
          }
        } catch (error) {
          console.error(error);
        }
      }
    };

    fetchReferralData();
  }, [user, t, referralCode]);

  const handleSendInvite = useCallback(async () => {
    if (!referralCode) return;

    try {
      const inviteLink = `https://t.me/oneSitePlsBot/vip?ref=${referralCode}`;

      // Copy the link to the clipboard
      await navigator.clipboard.writeText(inviteLink);

      // Show a success message
      toast.success(t('inviteCopied'));

      // Send Telegram message
      await sendTelegramInvite(referralCode);
    } catch (error) {
      console.error('Error sending invite:', error);
      toast.error(t('error'));
    }
  }, [referralCode]);

  const handleReferralNameChange = async (newName: string) => {
    if (newName.trim() === '') return;

    // Prevent excessive updates
    if (isUpdating  || !user) return;

    setIsUpdating(true);

    const newReferralCode = `${newName}`;

    try {
      const { error } = await supabase
        .from('users')
        .update({ ref_code: newReferralCode })
        .eq('telegram_id', user.telegram_id);

      if (error) {
        toast.error(t('error'));
        console.error(error);
        return;
      }

      setReferralCode(newReferralCode);
      setReferralName(newName);
      updateUserReferrals(newReferralCode);
    } finally {
      setIsUpdating(false);
    }
  };

  const getRandomMeme = async () => {
    // Placeholder URL; replace with actual API if available
    const response = await fetch('https://api.example.com/random-meme?topic=russo-ukrainian-war');
    if (!response.ok) {
      console.error('Failed to fetch meme');
      return "https://th.bing.com/th/id/OIG2.fwYLXgRzLnnm2DMcdfl1"; // Fallback image URL
    }
    const data = await response.json();
    return data?.memeUrl || "https://th.bing.com/th/id/OIG2.fwYLXgRzLnnm2DMcdfl1"; // Fallback image URL
  };
  
  const sendTelegramInvite = useCallback(async (referralCode: string) => {
    if (!process.env.NEXT_PUBLIC_BOT_TOKEN || !user) {
      console.error('Bot token is missing');
      return;
    }

    const botToken = process.env.NEXT_PUBLIC_BOT_TOKEN;
    const inviteLink = `https://t.me/oneSitePlsBot/vip?ref=${referralCode}`;
    const memeUrl = "https://th.bing.com/th/id/OIG2.fwYLXgRzLnnm2DMcdfl1"//await getRandomMeme();
    const message = `${t("playWithUs")} ${user?.telegram_username }! 🎮✨`;

    const url = new URL(`https://api.telegram.org/bot${botToken}/sendPhoto`);
    url.searchParams.append("chat_id", user.telegram_id.toFixed());
    url.searchParams.append("caption", message);
    url.searchParams.append("photo", memeUrl);
    url.searchParams.append("reply_markup", JSON.stringify({
      inline_keyboard: [
        [{ text: t("startPlaying"), url: inviteLink }],
        [{ text: t("visitSite"), url: "https://oneSitePls.framer.ai" }],
        [{ text: t("joinCommunity"), url: "https://t.me/aibotsites" }],
        [{ text: t("youtubeChannel"), url: "https://youtube.com/@salavey13" }],
      ],
    }));

    try {
      await fetch(url.toString());
    } catch (error) {
      console.error('Error sending Telegram message:', error);
    }
  }, [user]); // Include all dependencies in the dependency array

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <div className="p-6 bg-gray-800 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-white mb-4">
          <FontAwesomeIcon icon={faUserPlus} className="gradient-icon mr-2" />
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
