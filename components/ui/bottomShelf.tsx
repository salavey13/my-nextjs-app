//components/ui/bottomShelf.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faList, faPlus, faBell, faUser, faCalendarPlus, faLightbulb } from '@fortawesome/free-solid-svg-icons';
import { useAppContext } from "@/context/AppContext";

export interface NavigationLink {
  href: string;
  icon: any;
  label: string;
}

const BottomShelf: React.FC = () => {
  const pathname = usePathname();
  const { t } = useAppContext();

  const navigationLinks: NavigationLink[] = [
    { href: '/', icon: faHome, label: t('home') },
    { href: '/admin', icon: faList, label: t('admin') },
    { href: '/createEvent', icon: faCalendarPlus, label: '' },
    { href: '/referral', icon: faPlus, label: t('referral') },
    //{ href: '/notifications', icon: faBell, label: t('notifications') },
    //{ href: '/profile', icon: faUser, label: t('profile') },
    { href: '/dev', icon: faLightbulb, label: t('dev') }
  ];

  return (
    <footer className="fixed bottom-0 left-0 w-full h-16 bg-gray-900 text-white flex justify-around items-center z-20 backdrop-blur-lg shadow-lg">
      {navigationLinks.map((link, index) => (
        <Link
          key={index}
          href={link.href}
          className={`flex flex-col items-center justify-center w-12 h-12 ${
            pathname === link.href ? 'text-blue-500' : 'text-gray-400'
          }`}>
          <FontAwesomeIcon icon={link.icon} size={link.label ===''?"2x":"lg"} />
          <span className="text-xs">{link.label}</span>
        </Link>
      ))}
    </footer>
  );
};

export default BottomShelf;
