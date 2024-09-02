"use client";

import { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import Image from 'next/image';
import { supabase } from '../lib/supabaseClient';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import QRCode from 'react-qr-code';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCrown } from '@fortawesome/free-solid-svg-icons';

const Profile: React.FC = () => {
  const { user, t } = useAppContext();
  const [site, setSite] = useState('');
  const [telegramUsername, setTelegramUsername] = useState(user?.telegram_username || '');
  const [walletAddress, setWalletAddress] = useState(user?.ton_wallet || '');

  useEffect(() => {
    fetchSiteData();
  }, [user]);

  const fetchSiteData = async () => {
    if (!user) return;

    try {
      const defaultSite = user.site ? user.site : "";
      const defaultWallet = user.ton_wallet ? user.ton_wallet : "";
      setSite(defaultSite);
      setTelegramUsername(user.telegram_username)
      setWalletAddress(defaultWallet)

    } catch (error) {
      console.error('Error fetching site data:', error);
    }
  };

  const handleSiteChange = async (newSite: string) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ site: newSite })
        .eq('id', user?.id);

      if (error) throw error;

    } catch (error) {
      console.error('Error updating personal:', error);
      throw error;
    }
  };

  const handleProfileUpdate = async () => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ 
          telegram_username: telegramUsername,
          ton_wallet: walletAddress,
          site: site
        })
        .eq('id', user?.id);

      if (error) throw error;

    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  return (
    <div className="p-8 shadow-lg rounded-lg max-w-lg mx-auto mt-10 bg-gradient-to-r from-gray-800 to-gray-900 text-white">
      <h1 className="text-3xl font-bold mb-6">{t('profile')}</h1>
      <div className="flex items-center mb-6">
        <div className="relative">
          <Image 
            src="/placeholder-user.jpg" 
            alt={t('profilePicture')} 
            width={100} 
            height={100} 
            className="rounded-full border-4 border-gray-700"
          />
          {walletAddress && (
            <div className="absolute bottom-0 right-0 p-2 bg-gray-700 rounded-full">
              <QRCode value={walletAddress} size={100} />
            </div>
          )}
        </div>
        <div className="ml-6">
          <p className="text-xl font-semibold">{telegramUsername}</p>
          <p className="text-sm text-gray-400">{t('userId')}: {user?.telegram_id}</p>
        </div>
      </div>
      <div className="space-y-4">
        <div className="mb-4">
          <label className="block text-gray-400 text-sm mb-1">
            {t('site')}
          </label>
          <Input
            value={site}
            onChange={(e) => setSite(e.target.value)}
            className="w-full bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label={t('site')}
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-400 text-sm mb-1">
            {t('telegramUsername')}
          </label>
          <Input
            value={telegramUsername}
            onChange={(e) => setTelegramUsername(e.target.value)}
            className="w-full bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label={t('telegramUsername')}
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-400 text-sm mb-1">
            {t('walletAddress')}
          </label>
          <Input
            value={walletAddress}
            onChange={(e) => setWalletAddress(e.target.value)}
            className="w-full bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label={t('walletAddress')}
          />
        </div>
        <Button
          onClick={handleProfileUpdate}
          className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition justify-center w-full"
          aria-label={t('saveProfile')}
          variant="outline"
        >
          <FontAwesomeIcon icon={faCrown} className="mr-2" />
          {t('saveProfile')}
        </Button>
        <div className="bg-gray-700 p-4 rounded-lg">
          <p className="text-sm font-medium text-gray-300">{t('rank')}:</p>
          <p className="text-lg font-semibold">{user?.rank}</p>
        </div>
        <div className="bg-gray-700 p-4 rounded-lg">
          <p className="text-sm font-medium text-gray-300">{t('coins')}:</p>
          <p className="text-lg font-semibold">{user?.coins}</p>
        </div>
        <div className="bg-gray-700 p-4 rounded-lg">
          <p className="text-sm font-medium text-gray-300">{t('rp')}:</p>
          <p className="text-lg font-semibold">{user?.rp}</p>
        </div>
        <div className="bg-gray-700 p-4 rounded-lg">
          <p className="text-sm font-medium text-gray-300">{t('X')}:</p>
          <p className="text-lg font-semibold">{user?.X}</p>
        </div>
        <div className="bg-gray-700 p-4 rounded-lg">
          <p className="text-sm font-medium text-gray-300">{t('cheers_count')}:</p>
          <p className="text-lg font-semibold">{user?.cheers_count}</p>
        </div>
        <div className="bg-gray-700 p-4 rounded-lg">
          <p className="text-sm font-medium text-gray-300">{t('social_credit')}:</p>
          <p className="text-lg font-semibold">{user?.social_credit}</p>
        </div>
      </div>
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-400">{t('ref_code')}: {user?.ref_code || t('none')}</p>
      </div>
    </div>
  );
};

export default Profile;
