// components/ui/bottomShelf.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faKeyboard, faStar, faGlobe, faHome, faList, faPlus, faBell, faUser, faCalendarPlus, faLightbulb, faCrown, faPeopleRobbery, faFaceDizzy, faGamepad, faRestroom, faCarOn, faCartShopping, faShoppingCart, faCar, faHandHoldingHand, faDiceD20, faRepublican, faExternalLinkAlt, faUpRightFromSquare, faTh, faCommentDollar } from '@fortawesome/free-solid-svg-icons';
import { useAppContext } from "@/context/AppContext";

export interface NavigationLink {
  href: string;
  icon: any;
  label: string;
}

const BottomShelf: React.FC = () => {
  const pathname = usePathname();
  const { t } = useAppContext();

  const navigationLinks: NavigationLink[] = [    //{ href: '/paymentnotification', icon: faLightbulb, label: t('paymentnotification') },
    //{ href: '/dynamicitemform', icon: faList, label: t('') },
    //{ href: '/qrcodeform', icon: faLightbulb, label: t('qrcodeform') },
    //{ href: '/cryptopayment', icon: faLightbulb, label: t('cryptopayment') },
    
    { href: '/', icon: faGamepad, label: t('') },
    { href: '/rent', icon: faDiceD20, label: t('') },
    { href: '/referral', icon: faPeopleRobbery, label: t('') },
    
    //{ href: '/notifications', icon: faBell, label: t('notifications') },
    //{ href: '/profile', icon: faUser, label: t('profile') },
    
    { href: '/questsforcoins', icon: faCommentDollar, label: '' },
    { href: '/hackbutton', icon: faFaceDizzy, label: '' },
    { href: '/createEvent', icon: faCalendarPlus, label: '' },
    //{ href: '/conflictawareness', icon: faGlobe, label: '' },
    //{ href: '/emotionmirror', icon: faLightbulb, label: t('emotionmirror') },
    { href: '/admin', icon: faCrown, label: t('') },
    { href: '/dev', icon: faLightbulb, label: t('dev') },
];

  return (
    <footer className="fixed bottom-0 left-0 w-full h-16 bg-gray-900 text-white flex justify-around items-center z-1 backdrop-blur-lg shadow-lg">
      {navigationLinks.map((link, index) => (
        <Link
          key={index}
          href={link.href}
          className="flex flex-col items-center justify-center w-12 h-12 text-blue-500">
          <FontAwesomeIcon icon={link.icon} size={link.label ===''?"2x":"lg"} />
          <span className="text-xs">{link.label}</span>
        </Link>
      ))}
    </footer>
  );
};

export default BottomShelf;