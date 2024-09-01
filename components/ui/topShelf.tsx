"use client"; 
import { useAppContext } from '../../context/AppContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCrown } from '@fortawesome/free-solid-svg-icons';
import Link from "next/link";
import { usePathname } from "next/navigation";
import { faHome, faList, faPlus, faBell, faUser, faCalendarPlus, faLightbulb } from '@fortawesome/free-solid-svg-icons';


const TopShelf: React.FC = () => {
  const { user, t } = useAppContext();
  const pathname = usePathname();

  return (
    <header className="fixed top-0 left-0 w-full h-16 bg-gray-900 text-white flex justify-between items-center px-4 z-20  backdrop-blur-lg shadow-lg">
      <div className="flex items-center">
        <FontAwesomeIcon icon={faCrown} size="lg" className="mr-2" />
        <span className="text-lg">{t('rank')}: {user?.rank}</span>
      </div>
      <div className="flex items-center">
      <Link
          href='/profile'
          className={`flex items-center ${
            pathname === '/profile' ? 'text-blue-500' : 'text-gray-400'
          }`}>
            <FontAwesomeIcon icon={faUser} size="lg" className="mr-2" />
            <span className="text-lg">{user?.telegram_username}</span>
      </Link>
      </div>
    </header>
  );
};

export default TopShelf;
