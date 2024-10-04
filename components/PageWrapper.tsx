'use client'

import { usePathname } from 'next/navigation'
import { useAppContext } from '@/context/AppContext'
import BottomShelf from './ui/bottomShelf'

interface PageWrapperProps {
  children: React.ReactNode
}

export default function PageWrapper({ children }: PageWrapperProps) {
  const pathname = usePathname()
  const { state } = useAppContext()
  const user = state.user
  const showBottomShelf = user?.game_state?.stage && user?.game_state?.stage > 2 || pathname !== '/'//profile' //pathname !== '/' 
  //&& pathname !== '/hackbutton'

  const currentStage = user?.game_state?.stage || 0
  const bottomShelfBitmask =  1 << currentStage

  return (
    <>
      {children}
      {showBottomShelf && <BottomShelf bitmask={bottomShelfBitmask} />}
    </>
  )
}
