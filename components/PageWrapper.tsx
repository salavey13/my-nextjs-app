'use client'

import { usePathname } from 'next/navigation'
import { useAppContext } from '@/context/AppContext'
import BottomShelf from './ui/bottomShelf'
import UnlockChoice from './UnlockChoice'
import { useState, useEffect } from 'react'
import ClientLayout from '@/app/ClientLayout'
import TarotContent from '@/components//TarotContent'

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

  const [showUnlockChoice, setShowUnlockChoice] = useState(false)
  const [currentTenant, setCurrentTenant] = useState('salavey13')

  useEffect(() => {
    // Show UnlockChoice for stages 2, 4, and 6
    if (currentStage === 2 || currentStage === 4 || currentStage === 6) {
      setShowUnlockChoice(true)
    } else {
      setShowUnlockChoice(false)
    }
  }, [currentStage])

  const handleTenantChange = (tenantId: string) => {
    setCurrentTenant(tenantId);
  };

  const handleTenantReset = () => {
    setCurrentTenant('salavey13');
  };

  return (
    <div className="min-h-full w-full">
      <ClientLayout
        currentTenant={currentTenant}
        onTenantChange={handleTenantChange}
        onTenantReset={handleTenantReset}
      >
        {currentTenant === 'salavey13' ? (
          <>
            {children}
            {showBottomShelf && <BottomShelf bitmask={bottomShelfBitmask} />}
            {showUnlockChoice && (
              <UnlockChoice
                onClose={() => setShowUnlockChoice(false)}
                currentStage={currentStage}
              />
            )}
          </>
        ) : (
          <TarotContent />
        )}
      </ClientLayout>
    </div>
  )
}