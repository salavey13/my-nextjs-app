'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAppContext } from "@/context/AppContext"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Home, List, Plus, Bell, User, CalendarPlus, Lightbulb, Crown, Users, Dice1, DollarSign, Zap, Globe, ShoppingCart, Car, Gamepad } from 'lucide-react'

export interface NavigationLink {
  href: string
  icon: React.ReactNode
  label: string
}

const BottomShelf: React.FC = () => {
  const pathname = usePathname()
  const { t } = useAppContext()

  const navigationLinks: NavigationLink[] = [    
    { href: '/paymentnotification', icon: <DollarSign className="w-6 h-6" />, label: t('paymentnotification') },
    { href: '/dynamicitemform', icon: <List className="w-6 h-6" />, label: t('dynamicitemform') },
    { href: '/qrcodeform', icon: <Zap className="w-6 h-6" />, label: t('qrcodeform') },
    { href: '/cryptopayment', icon: <ShoppingCart className="w-6 h-6" />, label: t('cryptopayment') },
    { href: '/', icon: <Home className="w-6 h-6" />, label: t('home') },
    { href: '/rent', icon: <Car className="w-6 h-6" />, label: t('rent') },
    { href: '/referral', icon: <Users className="w-6 h-6" />, label: t('referral') },
    { href: '/profile', icon: <User className="w-6 h-6" />, label: t('profile') },
    { href: '/questsforcoins', icon: <Dice1 className="w-6 h-6" />, label: t('questsforcoins') },
    { href: '/hackbutton', icon: <Zap className="w-6 h-6" />, label: t('hackbutton') },
    { href: '/createEvent', icon: <CalendarPlus className="w-6 h-6" />, label: t('createEvent') },
    { href: '/conflictawareness', icon: <Globe className="w-6 h-6" />, label: t('conflictawareness') },
    { href: '/admin', icon: <Crown className="w-6 h-6" />, label: t('admin') },
    { href: '/dev', icon: <Lightbulb className="w-6 h-6" />, label: t('dev') },
  ]

  return (
    <TooltipProvider>
      <footer className="fixed bottom-0 left-0 w-full h-16 bg-gray-900/80 text-white z-10 backdrop-blur-lg shadow-lg">
        <ScrollArea className="w-full h-full">
          <div className="flex items-center h-full px-4">
            {navigationLinks.map((link, index) => (
              <Tooltip key={index}>
                <TooltipTrigger asChild>
                  <Link
                    href={link.href}
                    className={`flex flex-col items-center justify-center w-16 h-16 text-blue-500 ${
                      pathname === link.href ? 'text-blue-300' : 'text-gray-400'
                    }`}
                  >
                    {link.icon}
                    <span className="text-xs mt-1">{link.label}</span>
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{link.label}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </footer>
    </TooltipProvider>
  )
}

export default BottomShelf