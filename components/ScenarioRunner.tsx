'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAppContext } from '@/context/AppContext'
import { debugLog } from '@/lib/debugUtils'

const scenarios = [
  {
    name: 'New Player',
    setup: { stage: 0, coins: 1000, crypto: 0 },
  },
  {
    name: 'Mid-Game Player',
    setup: { stage: 3, coins: 5000, crypto: 50 },
  },
  {
    name: 'End-Game Player',
    setup: { stage: 6, coins: 20000, crypto: 200 },
  },
]

export const ScenarioRunner: React.FC = () => {
    const { state, dispatch, t } = useAppContext()
    const user = state.user
  const [selectedScenario, setSelectedScenario] = useState('')

  const runScenario = () => {
    const scenario = scenarios.find(s => s.name === selectedScenario)
    if (scenario) {
      const updatedGameState = {
        ...user?.game_state,
        ...scenario.setup,
      }
    //   setUser({ ...user,
    //     id: user?.id || 43,  // ensure `id` is not undefined
    //     telegram_id: user?.telegram_id || 413553377,
    //     telegram_username: user?.telegram_username || "SALAVEY13",
    //     lang: user?.lang || "ru",
    //     avatar_url: user?.avatar_url || "",
    //     rp: user?.rp || 69,
    //     X: user?.X || 69,
    //     ref_code: user?.ref_code || "salavey13",
    //     rank: user?.rank || "13",
    //     social_credit: user?.social_credit || 0,
    //     role: user?.role || 1,
    //     cheers_count: user?.cheers_count || 1,
    //     dark_theme: user?.dark_theme || true,
    //     coins: user?.coins || 169000,
    //     crypto: user?.crypto || 420,
    //     game_state: updatedGameState })
      debugLog(`Running scenario: ${selectedScenario}`)
    }
  }

  return (
    <div className="space-y-4">
      <Select onValueChange={setSelectedScenario} value={selectedScenario}>
        <SelectTrigger>
          <SelectValue placeholder="Select a scenario" />
        </SelectTrigger>
        <SelectContent>
          {scenarios.map((scenario) => (
            <SelectItem key={scenario.name} value={scenario.name}>
              {scenario.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button onClick={runScenario} disabled={!selectedScenario}>Run Scenario</Button>
    </div>
  )
}