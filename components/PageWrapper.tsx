'use client'

import { usePathname } from 'next/navigation'
import { useAppContext } from '@/context/AppContext'
import BottomShelf from './ui/bottomShelf'
import UnlockChoice from './UnlockChoice'

interface PageWrapperProps {
  children: React.ReactNode
}

export default function PageWrapper({ children }: PageWrapperProps) {
  const pathname = usePathname()
  const { state } = useAppContext()
  const user = state.user
  const showBottomShelf = user?.game_state?.stage && user?.game_state?.stage > 2 || null

  const currentStage = user?.game_state?.stage || 1
  const bottomShelfBitmask = 1 << currentStage

  return (
    <div className="min-h-full w-full">
      {currentStage === 4 ? <UnlockChoice /> : children}
      {showBottomShelf && <BottomShelf bitmask={bottomShelfBitmask} />}
    </div>
  )
}