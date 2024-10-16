import { DollarSign, List, Zap, ShoppingCart, Home, Car, Users, User, Dice1, ZapOff, CalendarPlus, Globe, Crown, Lightbulb, Gamepad, Star, Sun } from 'lucide-react'
import { dynamicComponents } from './dynamicComponents';

export interface NavigationLink {
  href: string
  icon: React.ReactNode
  label: string
  stageMask: number
  component?: string
}

export const getNavigationLinks = (t: (key: string) => string): NavigationLink[] => [
  { href: '/paymentnotification', icon: <DollarSign className="w-6 h-6" />, label: t('bottomShelf.paymentNotification'), stageMask: 0b11111000, component: 'paymentNotification' },
  { href: '/dynamicitemform', icon: <List className="w-6 h-6" />, label: t('bottomShelf.dynamicItemForm'), stageMask: 0b11111000, component: 'dynamicItemForm' },
  { href: '/qrcodeform', icon: <Zap className="w-6 h-6" />, label: t('bottomShelf.qrCodeForm'), stageMask: 0b11111000, component: 'qrCodeForm' },
  { href: '/cryptopayment', icon: <ShoppingCart className="w-6 h-6" />, label: t('bottomShelf.cryptoPayment'), stageMask: 0b11111000, component: 'cryptoPayment' },
  { href: '/', icon: <Home className="w-6 h-6" />, label: t('bottomShelf.home'), stageMask: 0b11111111 },
  { href: '/rent', icon: <Car className="w-6 h-6" />, label: t('bottomShelf.rent'), stageMask: 0b11111000, component: 'rent' },
  { href: '/referral', icon: <Users className="w-6 h-6" />, label: t('bottomShelf.referral'), stageMask: 0b11111000, component: 'referral' },
  { href: '/profile', icon: <User className="w-6 h-6" />, label: t('bottomShelf.profile'), stageMask: 0b11111111 },
  { href: '/questsforcoins', icon: <Dice1 className="w-6 h-6" />, label: t('bottomShelf.quests'), stageMask: 0b11111000, component: 'questsForCoins' },
  { href: '/bets', icon: <Zap className="w-6 h-6" />, label: t('bottomShelf.bets'), stageMask: 0b11111000, component: 'bets' },
  { href: '/quiz', icon: <ZapOff className="w-6 h-6" />, label: t('bottomShelf.quiz'), stageMask: 0b11111111, component: 'quiz' },
  { href: '/createEvent', icon: <CalendarPlus className="w-6 h-6" />, label: t('bottomShelf.createEvent'), stageMask: 0b11111000, component: 'createEvent' },
  { href: '/conflictawareness', icon: <Globe className="w-6 h-6" />, label: t('bottomShelf.conflictAwareness'), stageMask: 0b11111000, component: 'conflictAwareness' },
  { href: '/admin', icon: <Crown className="w-6 h-6" />, label: t('bottomShelf.admin'), stageMask: 0b10000000, component: 'admin' },
  { href: '/dev', icon: <Lightbulb className="w-6 h-6" />, label: t('bottomShelf.dev'), stageMask: 0b11000000, component: 'dev' },
  { href: '/versimcel', icon: <Gamepad className="w-6 h-6" />, label: t('bottomShelf.versimcel'), stageMask: 0b11111000, component: 'versimcel' },
  ...dynamicComponents.map(comp => ({
    ...comp,
    icon: typeof comp.icon === 'string' ? React.createElement(comp.icon === 'Star' ? Star : comp.icon === 'Zap' ? Zap : Sun, { className: "w-6 h-6" }) : comp.icon,
    label: t(`bottomShelf.${comp.component}`),
  })),
]
