// components/game/Profile.tsx
"use client";

import { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import Image from 'next/image';
import { supabase } from '../lib/supabaseClient';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import QRCode from 'react-qr-code';
import { Crown } from 'lucide-react';  // Replacing FontAwesome with Lucide icons

interface UserData {
  id: number;
  telegram_id: number;
  telegram_username: string;
  lang: 'ru' | 'en' | 'ukr';
  avatar_url: string;
  coins: number;
  rp: number;
  X: number;
  ref_code: string;
  rank: string;
  social_credit: number;
  role: number;
  cheers_count: number;
  referer?: number | null;
  tasksTodo?: string | null;
  currentGameId?: number | null;
  game_state?: string | null;
  ton_wallet?: string | null;
  initial_readings?: Record<string, any> | null;
  monthly_prices?: Record<string, any> | null;
  site?: string | null;
  dark_theme: boolean,
  loot?: {
    fool?: {
      cards?: {
        cards_img_url?: string;
        shirt_img_url?: string;
      }
    }
  }
}

const Profile: React.FC = () => {
  const { user, t } = useAppContext();
  const [site, setSite] = useState<string>('');
  const [telegramUsername, setTelegramUsername] = useState<string>(user?.telegram_username || '');
  const [walletAddress, setWalletAddress] = useState<string>(user?.ton_wallet || '');
  const [avatarUrl, setAvatarUrl] = useState<string>(user?.avatar_url || '');

  useEffect(() => {
    if (user) {
      setSite(user.site || '');
      setTelegramUsername(user.telegram_username || '');
      setWalletAddress(user.ton_wallet || '');
      setAvatarUrl(user.avatar_url || '');
    }
  }, [user]);

  const handleProfileUpdate = async () => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from('users')
        .update({
          telegram_username: telegramUsername,
          ton_wallet: walletAddress,
          site: site,
          avatar_url: avatarUrl,  // Updating avatar URL
        })
        .eq('id', user.id);

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
            src={avatarUrl || "/placeholder-user.jpg"}  // Use avatarUrl state or fallback to placeholder
            alt={t('profilePicture')}
            width={100}
            height={100}
            className="rounded-full border-4 border-gray-700"
          />
          {walletAddress && (
            <div className="absolute bottom-0 right-0 p-2 bg-gray-700 rounded-full">
              <QRCode value={walletAddress} size={50} /> {/* Adjusted size to prevent overlap */}
            </div>
          )}
        </div>
        <div className="ml-6">
          <p className="text-xl font-semibold">{telegramUsername}</p>
          <p className="text-sm text-gray-400">{t('userId')}: {user?.telegram_id}</p>
        </div>
      </div>
      <div className="space-y-4">
        {/* Input for site */}
        <div className="mb-4">
          <label className="block text-gray-400 text-sm mb-1">{t('site')}</label>
          <Input
            value={site}
            onChange={(e) => setSite(e.target.value)}
            className="w-full bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-[#e1ff01]"
            aria-label={t('site')}
          />
        </div>
        {/* Input for Telegram username */}
        <div className="mb-4">
          <label className="block text-gray-400 text-sm mb-1">{t('telegramUsername')}</label>
          <Input
            value={telegramUsername}
            onChange={(e) => setTelegramUsername(e.target.value)}
            className="w-full bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-[#e1ff01]"
            aria-label={t('telegramUsername')}
          />
        </div>
        {/* Input for Wallet Address */}
        <div className="mb-4">
          <label className="block text-gray-400 text-sm mb-1">{t('walletAddress')}</label>
          <Input
            value={walletAddress}
            onChange={(e) => setWalletAddress(e.target.value)}
            className="w-full bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-[#e1ff01]"
            aria-label={t('walletAddress')}
          />
        </div>
        {/* Input for Avatar URL */}
        <div className="mb-4">
          <label className="block text-gray-400 text-sm mb-1">{t('avatarUrl')}</label>
          <Input
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            className="w-full bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-[#e1ff01]"
            aria-label={t('avatarUrl')}
          />
        </div>
        {/* Save button */}
        <Button
          onClick={handleProfileUpdate}
          className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition justify-center w-full"
          aria-label={t('saveProfile')}
          variant="outline"
        >
          <Crown className="mr-2" />  {/* Replaced FontAwesomeIcon with Lucide Crown icon */}
          {t('saveProfile')}
        </Button>
        {/* Additional profile info */}
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
