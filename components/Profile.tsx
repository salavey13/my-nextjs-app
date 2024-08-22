"use client";

import { useAppContext } from '../context/AppContext';
import Image from 'next/image';

const Profile: React.FC = () => {
  const { user, t } = useAppContext();

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
      <div className="space-y-5">
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
