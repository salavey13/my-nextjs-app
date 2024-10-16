'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAppContext } from "@/context/AppContext"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { motion, AnimatePresence } from 'framer-motion'
import { getNavigationLinks, NavigationLink } from '@/lib/navigationLinks'

interface BottomShelfProps {
  bitmask: number
}

const BottomShelf: React.FC<BottomShelfProps> = ({ bitmask }) => {
  const pathname = usePathname()
  const { state, t } = useAppContext()
  const user = state.user

  const navigationLinks = getNavigationLinks(t)

  return (
    <TooltipProvider>
      <footer className="fixed bottom-0 left-0 w-full h-16 bg-gray-900/80 text-white z-50 backdrop-blur-lg shadow-lg">
        <ScrollArea className="w-full h-full">
          <div className="flex items-center h-full px-4">
            <AnimatePresence>
              {navigationLinks
                .filter(link => (link.stageMask & bitmask) !== 0 && (!link.component || user?.game_state?.unlockedComponents?.includes(link.component)))
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
