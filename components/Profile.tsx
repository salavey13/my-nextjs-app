"use client";

import { useAppContext } from '../context/AppContext';
import Image from 'next/image';

const Profile: React.FC = () => {
  const { user, t } = useAppContext();

  return (
    <div className="p-6 shadow-md rounded-lg max-w-md mx-auto mt-8">
      <div className="flex items-center mb-4">
        <Image 
          src="/placeholder-user.jpg" 
          alt={t('profilePicture')} 
          width={80} 
          height={80} 
          className="rounded-full"
        />
        <div className="ml-4">
          <h1 className="text-2xl font-thin">{t('profile')}</h1>
          <p className="text-gray-600">{user?.telegram_username}</p>
        </div>
      </div>
      <div className="space-y-4">
        <div>
          <p className="font-medium">{t('username')}:</p>
          <p className="text-gray-700">{user?.telegram_username}</p>
        </div>
        <div>
          <p className="font-medium">{t('rank')}:</p>
          <p className="text-gray-700">{user?.rank}</p>
        </div>
        {/* Add more profile details here */}
        <div>
          <p className="font-medium">{t('coins')}:</p>
          <p className="text-gray-700">{user?.coins}</p>
        </div>
        <div>
          <p className="font-medium">{t('xp')}:</p>
          <p className="text-gray-700">{user?.xp}</p>
        </div>
      </div>
    </div>
  );
};

export default Profile;
