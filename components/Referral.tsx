"use client";

import React, { useState, useEffect, Suspense, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAppContext } from '../context/AppContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserPlus, faPaperPlane, faTrophy, faSave } from '@fortawesome/free-solid-svg-icons';
import LoadingSpinner from "./ui/LoadingSpinner";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { toast } from '@/hooks/use-toast';

const Referral: React.FC = () => {
  const { state, dispatch, t } = useAppContext();
  const user = state.user;
  const [referralName, setReferralName] = useState('');
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [inviteCount, setInviteCount] = useState(0);

  const generateReferralCode = useCallback(async (defaultReferralName: string) => {
    try {
      const newReferralCode = `${defaultReferralName}`;
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
  }, [user]);

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

  const fetchReferralData = useCallback(async () => {
    if (!user) return;

    try {
      const defaultReferralName = user.ref_code ? user.ref_code : user.telegram_username;
      setReferralName(defaultReferralName || '');

      if (!user.ref_code) {
        const newReferralCode = await generateReferralCode(defaultReferralName);
        setReferralCode(newReferralCode);
        dispatch({ type: 'UPDATE_USER', payload: { ref_code: newReferralCode } });
      } else {
        setReferralCode(user.ref_code);
      }

      const count = await getInviteCount(user.ref_code);
      setInviteCount(count);
    } catch (error) {
      console.error('Error fetching referral data:', error);
    }
  }, [user, dispatch, generateReferralCode]);
  
  useEffect(() => {
    fetchReferralData();
  }, [fetchReferralData]);

  const handleGenerateReferralCode = async () => {
    if (!user) return;

    try {
      const newReferralCode = await generateReferralCode(user.telegram_username || '');
      setReferralCode(newReferralCode);
      dispatch({ type: 'UPDATE_USER', payload: { ref_code: newReferralCode } });
      toast({
        title: t('referralCodeGenerated'),
        description: t('referralCodeGeneratedDescription'),
      });
    } catch (error) {
      console.error('Error generating referral code:', error);
      toast({
        title: t('error'),
        description: t('referralCodeGenerationError'),
        variant: 'destructive',
      });
    }
  };

  const sendTelegramInvite = useCallback(async (referralCode: string) => {
    if (!process.env.BOT_TOKEN || !user) {
      console.error('Bot token is missing');
      return;
    }

    const botToken = process.env.BOT_TOKEN;
    const inviteLink = `https://t.me/oneSitePlsBot/vip?ref=${referralCode}`;
    const url = new URL(`https://api.telegram.org/bot${botToken}/sendMessage`);
    const message = `${t('playWithUs')} ${user.telegram_username} ! 🎮✨`;

    url.searchParams.append("chat_id", user.telegram_id.toString());
    url.searchParams.append("text", message);
    url.searchParams.append("reply_markup", JSON.stringify({
      inline_keyboard: [
        [{ text: t("startPlaying"), url: inviteLink }],
        [{ text: t("visitSite"), url: "https://oneSitePls.framer.ai" }],
        [{ text: t("joinCommunity"), url: "https://t.me/aibotsites" }],
        [{ text: t("youtubeChannel"), url: "https://youtube.com/@salavey13" }],
      ],
    }));

    try {
      const response = await fetch(url.toString());
      if (!response.ok) throw new Error('Failed to send Telegram message');
    } catch (error) {
      console.error('Error sending Telegram message:', error);
    }
  }, [t, user]);

  const handleSendInvite = useCallback(async () => {
    if (!referralCode) return;

    try {
      const inviteLink = `https://t.me/oneSitePlsBot/vip?ref=${referralCode}`;
      await navigator.clipboard.writeText(inviteLink);

      await sendTelegramInvite(referralCode);

      toast({
        title: t('inviteSent'),
        description: t('inviteLinkCopied'),
      });
    } catch (error) {
      console.error('Error sending invite:', error);
      toast({
        title: t('error'),
        description: t('failedToSendInvite'),
        variant: 'destructive',
      });
    }
  }, [sendTelegramInvite, referralCode, t]);

  const handleReferralNameChange = (newName: string) => {
    setReferralName(newName);
  };

  const handleSaveRefName = async () => {
    if (!user || !referralName.trim()) return;

    try {
      const newReferralCode = await generateReferralCode(referralName);
      setReferralCode(newReferralCode);
      dispatch({ type: 'UPDATE_USER', payload: { ref_code: newReferralCode } });
      toast({
        title: t('referralCodeSaved'),
        description: t('referralCodeSavedDescription'),
      });
    } catch (error) {
      console.error('Error saving referral code:', error);
      toast({
        title: t('error'),
        description: t('failedToSaveReferralCode'),
        variant: 'destructive',
      });
    }
  };

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
          <Input
            value={referralName}
            onChange={(e) => handleReferralNameChange(e.target.value)}
            className="w-full bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label={t('referralName')}
          />
        </div>
        <Button
          onClick={handleSaveRefName}
          className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition justify-center w-full"
          aria-label={t('saveRefCode')}
          variant="outline"
        >
          <FontAwesomeIcon icon={faSave} className="mr-2" />
          {t('saveRefCode')}
        </Button>
        <Button
          onClick={handleSendInvite}
          className="flex mt-6 items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition justify-center w-full"
          aria-label={t('sendInvite')}
          variant="outline"
        >
          <FontAwesomeIcon icon={faPaperPlane} className="mr-2" />
          {t('sendInvite')}
        </Button>
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
