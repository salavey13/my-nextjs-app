// app/page.tsx
'use client'

import { useEffect, useState } from 'react'
import HackButton from "../components/HackButton"
import HackButtonStoryShower from "../components/HackButtonStoryShower"
import DevKit from '@/components/DevKit'
import { useAppContext } from '@/context/AppContext'

export default function HackButtonPage() {
  const { state } = useAppContext()
  const [showStoryShower, setShowStoryShower] = useState(false)

  useEffect(() => {
    if (state?.user?.game_state && state?.user?.game_state?.stage >= 2) {
      setShowStoryShower(true)
    }
  }, [state?.user?.game_state, state.user?.game_state?.stage])

  return (
    <div className="game-board h-screen relative overflow-y-scroll">
      {showStoryShower ? <HackButtonStoryShower /> : <HackButton />}
      {state.user?.role === 1 && (
        <>
          {/* <h1 className="text-2xl font-bold mb-4">Developer Tools</h1> */}
          <DevKit />
        </>
      )}
    </div>
  )
}
