"use client"; 
import { useAppContext } from '../../context/AppContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCrown } from '@fortawesome/free-solid-svg-icons';

const TopShelf: React.FC = () => {
  const { user, t } = useAppContext();

  return (
    <header className="fixed top-0 left-0 w-full h-16 bg-gray-900 text-white flex justify-between items-center px-4 z-20 backdrop-blur-lg shadow-lg">
      <div className="flex items-center">
        <FontAwesomeIcon icon={faCrown} size="lg" className="mr-2" />
        <span className="text-lg">{t('rank')}: {user?.rank}</span>
      </div>
      <div className="flex items-center">
        <span className="text-lg">{t('username')}: {user?.telegram_username}</span>
      </div>
    </header>
  );
};

export default TopShelf;
