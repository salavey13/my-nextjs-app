//components/Profile.tsx
"use client";

import { useState, useEffect} from 'react';
import { useAppContext } from '../context/AppContext';
import Image from 'next/image';
import { supabase } from '../lib/supabaseClient';
import { Button } from "./ui/button";
import {Input} from "./ui/input";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCrown } from '@fortawesome/free-solid-svg-icons';

const Profile: React.FC = () => {
  const { user, t } = useAppContext();
  const [site, setSite] = useState('');

  useEffect(() => {
    fetchSiteData();
  }, [user]);

  const fetchSiteData = async () => {
    if (!user) return;

    try {
      const defaultSite = user.site ? user.site : "";
      setSite(defaultSite);

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
      console.error('Error upadating personal site:', error);
      throw error;
    }
  };

  return (
    <div className="p-8 shadow-lg rounded-lg max-w-lg mx-auto mt-10 bg-gradient-to-r from-gray-800 to-gray-900 text-white">
      <h1 className="text-3xl font-bold mb-6">{t('profile')}</h1>
      <div className="flex items-center mb-6">
        <Image 
          src="/placeholder-user.jpg" 
          alt={t('profilePicture')} 
          width={100} 
          height={100} 
          className="rounded-full border-4 border-gray-700"
        />
        <div className="ml-6">
          <p className="text-xl font-semibold">{user?.telegram_username}</p>
          <p className="text-sm text-gray-400">{t('userId')}: {user?.telegram_id}</p>
        </div>
      </div>
      <div className="space-y-1">
        <div className="mb-4">
          <label className="block text-gray-400 text-sm mb-1">
            {t('site')}
          </label>
          <Input
            value={site}
            onChange={(e) => setSite(e.target.value)}
            className="w-full bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label={t('referralName')}
          />
        </div>
        <Button
          onClick={() => handleSiteChange(site)}
          className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition justify-center w-full"
          aria-label={t('sendInvite')}
          variant="outline"
        >
          <FontAwesomeIcon icon={faCrown} className="mr-2" />
          {t('saveSite')}
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
