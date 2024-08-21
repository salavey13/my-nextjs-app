"use client";

import { useAppContext } from '../context/AppContext';

const Profile: React.FC = () => {
  const { user, t } = useAppContext();

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">{t('profile')}</h2>
      <p><strong>{t('username')}:</strong> {user?.telegram_username}</p>
      <p><strong>{t('rank')}:</strong> {user?.rank}</p>
      {/* Add more profile details here */}
    </div>
  );
};

export default Profile;
