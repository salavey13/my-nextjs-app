"use client"; 
import { useAppContext } from '../../context/AppContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCrown } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';

const TopShelf: React.FC = () => {
  const { user, t } = useAppContext();
  //const { t } = useTranslation();

  return (
    <div className="fixed top-0 w-full h-16 bg-gray-900 flex justify-between items-center text-gray-400">
      <div className="flex items-center ml-4">
        <FontAwesomeIcon icon={faCrown} size="lg" className="mr-2" />
        <span className="text-lg">{t('rank')}: {user?.rank}</span>
      </div>
      <div className="flex items-center mr-4">
        <span className="text-lg">{t('username')}: {user?.telegram_username}</span>
      </div>
    </div>
  );
};

export default TopShelf;
