"use client"; // Add this line at the top

import Link from "next/link";
import { usePathname } from "next/navigation"; // Import usePathname
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faList, faPlus, faBell, faUser } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';
import { useAppContext } from "@/context/AppContext";

interface NavigationLink {
  href: string;
  icon: any;
  label: string;
}

const BottomShelf: React.FC = () => {
  const pathname = usePathname(); // Use usePathname to get the current path
  //const { t } = useTranslation();
  const { t } = useAppContext();

  const navigationLinks: NavigationLink[] = [
    { href: '/', icon: faHome, label: t('home') },
    { href: '/list', icon: faList, label: t('list') },
    { href: '/create', icon: faPlus, label: t('create') },
    { href: '/notifications', icon: faBell, label: t('notifications') },
    { href: '/profile', icon: faUser, label: t('profile') },
  ];

   // Determine if the current page is the home page
   const isHomePage = pathname === "/";

  return (
    <div className="fixed bottom-0 w-full h-16 bg-gray-900 flex justify-around items-center text-gray-400">
      {navigationLinks.map((link, index) => (
        (<Link
          key={index}
          href={link.href}
          className={`flex flex-col items-center justify-center w-12 h-12 ${
            pathname === link.href ? 'text-blue-500' : 'text-gray-400'
          }`}>

          <FontAwesomeIcon icon={link.icon} size="lg" />
          <span className="text-xs">{link.label}</span>

        </Link>)
      ))}
      <div className="absolute left-1/2 transform -translate-x-1/2 w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
        <Link href="/create">

          <FontAwesomeIcon icon={faPlus} size="lg" className="text-white" />

        </Link>
      </div>
    </div>
  );
};

export default BottomShelf;
