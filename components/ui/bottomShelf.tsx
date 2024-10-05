'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAppContext } from "@/context/AppContext"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Home, List, Plus, Bell, User, CalendarPlus, Lightbulb, Crown, Users, Dice1, DollarSign, Zap, Globe, ShoppingCart, Car, Gamepad, ZapOff } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export interface NavigationLink {
  href: string
  icon: React.ReactNode
  label: string
  stageMask: number
}

interface BottomShelfProps {
  bitmask: number
}

const BottomShelf: React.FC<BottomShelfProps> = ({ bitmask }) => {
  const pathname = usePathname()
  const { state } = useAppContext()
  const user = state.user

  const navigationLinks: NavigationLink[] = [    
    { href: '/paymentnotification', icon: <DollarSign className="w-6 h-6" />, label: 'Payment Notification', stageMask: 0b11111000 },
    { href: '/dynamicitemform', icon: <List className="w-6 h-6" />, label: 'Dynamic Item Form', stageMask: 0b11111000 },
    { href: '/qrcodeform', icon: <Zap className="w-6 h-6" />, label: 'QR Code Form', stageMask: 0b11111000 },
    { href: '/cryptopayment', icon: <ShoppingCart className="w-6 h-6" />, label: 'Crypto Payment', stageMask: 0b11111000 },
    { href: '/', icon: <Home className="w-6 h-6" />, label: 'Home', stageMask: 0b11111111 },
    { href: '/rent', icon: <Car className="w-6 h-6" />, label: 'Rent', stageMask: 0b11111000 },
    { href: '/referral', icon: <Users className="w-6 h-6" />, label: 'Referral', stageMask: 0b11111000 },
    { href: '/profile', icon: <User className="w-6 h-6" />, label: 'Profile', stageMask: 0b11111111 },
    { href: '/questsforcoins', icon: <Dice1 className="w-6 h-6" />, label: '!', stageMask: 0b11111000 },
    { href: '/hackbutton', icon: <Zap className="w-6 h-6" />, label: 'IQ', stageMask: 0b11111000 },
    { href: '/quiz', icon: <ZapOff className="w-6 h-6" />, label: 'Quiz', stageMask: 0b11111111 },
    { href: '/createEvent', icon: <CalendarPlus className="w-6 h-6" />, label: 'Create Event', stageMask: 0b11111000 },
    { href: '/conflictawareness', icon: <Globe className="w-6 h-6" />, label: 'Conflict Awareness', stageMask: 0b11111000 },
    { href: '/admin', icon: <Crown className="w-6 h-6" />, label: 'Admin', stageMask: 0b10000000 },
    { href: '/dev', icon: <Lightbulb className="w-6 h-6" />, label: 'Dev', stageMask: 0b11000000 },
  ]

  return (
    <TooltipProvider>
      <footer className="fixed bottom-0 left-0 w-full h-16 bg-gray-900/80 text-white z-10 backdrop-blur-lg shadow-lg">
        <ScrollArea className="w-full h-full">
          <div className="flex items-center h-full px-4">
            <AnimatePresence>
              {navigationLinks
                .filter(link => (link.stageMask & bitmask) !== 0)
                .map((link, index) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link
                          href={link.href}
                          className={`flex flex-col items-center justify-center w-16 h-16 ${
                            pathname === link.href
                              ? 'text-blue-300 bg-blue-500/20 rounded-lg'
                              : 'text-gray-400 hover:text-blue-500 transition-colors'
                          }`}
                        >
                          {link.icon}
                          <span className="text-xs mt-1 text-center">{link.label}</span>
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{link.label}</p>
                      </TooltipContent>
                    </Tooltip>
                  </motion.div>
                ))}
            </AnimatePresence>
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </footer>
    </TooltipProvider>
  )
}

export default BottomShelf