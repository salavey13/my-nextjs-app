'use client'

import React, { useState } from 'react'
import { useAppContext } from '@/context/AppContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { toast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabaseClient'
import { useDebugStore, debugLog } from '@/lib/debugUtils'
import { PerformanceMonitor } from '@/components/PerformanceMonitor'
import { ScenarioRunner } from '@/components/ScenarioRunner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@radix-ui/react-tabs'
import { ScrollArea } from './ui/scroll-area'
export default function DevKit() {
  const { user, setUser, t } = useAppContext()
  const [selectedStage, setSelectedStage] = useState(user?.game_state?.stage || 0)
  const [coins, setCoins] = useState(user?.game_state?.coins || 0)
  const [crypto, setCrypto] = useState(user?.game_state?.crypto || 0)
  const [debugMode, setDebugMode] = useState(false)
  
  const { isDebugMode, toggleDebugMode, logs, clearLogs } = useDebugStore()
  
  const handleTriggerEvent = (event: string) => {
    debugLog(`Triggered event: ${event}`)
    // Implement event triggering logic here
  }
  const handleStageChange = (value: string) => {
    setSelectedStage(parseInt(value))
  }

  const handleCoinsChange = (value: number[]) => {
    setCoins(value[0])
  }

  const handleCryptoChange = (value: number[]) => {
    setCrypto(value[0])
  }

  const handleDebugModeToggle = (checked: boolean) => {
    setDebugMode(checked)
  }

  const handleApplyChanges = async () => {
    try {
      const updatedGameState = {
        ...user?.game_state,
        stage: selectedStage,
        coins: coins,
        crypto: crypto,
      }

      const { data, error } = await supabase
        .from('users')
        .update({ game_state: updatedGameState })
        .eq('id', user?.id)
        .single()

      if (error) throw error

      setUser({ ...user,
        id: user?.id || 43,  // ensure `id` is not undefined
        telegram_id: user?.telegram_id || 413553377,
        telegram_username: user?.telegram_username || "SALAVEY13",
        lang: user?.lang || "ru",
        avatar_url: user?.avatar_url || "",
        rp: user?.rp || 69,
        X: user?.X || 69,
        ref_code: user?.ref_code || "salavey13",
        rank: user?.rank || "13",
        social_credit: user?.social_credit || 0,
        role: user?.role || 1,
        cheers_count: user?.cheers_count || 1,
        dark_theme: user?.dark_theme || true,
        coins: user?.coins || 169000,
        crypto: user?.crypto || 420, game_state: updatedGameState })

      toast({
        title: t('success'),
        description: t('gameStateUpdated'),
      })
    } catch (error) {
      console.error('Error updating game state:', error)
      toast({
        title: t('error'),
        description: t('updateGameStateError'),
        variant: "destructive",
      })
    }
  }

  const handleResetProgress = async () => {
    try {
      const initialGameState = {
        stage: 0,
        coins: 1000,
        crypto: 0,
        rank: "13",
        cheersCount: 1,
        progress: "0%",
        unlockedComponents: []
      }

      const { data, error } = await supabase
        .from('users')
        .update({ game_state: initialGameState })
        .eq('id', user?.id)
        .single()

      if (error) throw error

      setUser({ ...user,
        id: user?.id || 43,  // ensure `id` is not undefined
        telegram_id: user?.telegram_id || 413553377,
        telegram_username: user?.telegram_username || "SALAVEY13",
        lang: user?.lang || "ru",
        avatar_url: user?.avatar_url || "",
        rp: user?.rp || 69,
        X: user?.X || 69,
        ref_code: user?.ref_code || "salavey13",
        rank: user?.rank || "13",
        social_credit: user?.social_credit || 0,
        role: user?.role || 1,
        cheers_count: user?.cheers_count || 1,
        dark_theme: user?.dark_theme || true,
        coins: user?.coins || 169000,
        crypto: user?.crypto || 420,
        game_state: initialGameState })
      setSelectedStage(0)
      setCoins(1000)
      setCrypto(0)

      toast({
        title: t('success'),
        description: t('gameStateReset'),
      })
    } catch (error) {
      console.error('Error resetting game state:', error)
      toast({
        title: t('error'),
        description: t('resetGameStateError'),
        variant: "destructive",
      })
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{t('devKit')}</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="gameState">
          <TabsList>
            <TabsTrigger value="gameState">Game State</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="logs">Logs</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="scenarios">Scenarios</TabsTrigger>
          </TabsList>
          <TabsContent value="gameState">
            <CardContent className="space-y-4">
                <div className="space-y-2">
                <label htmlFor="stage-select">{t('selectStage')}</label>
                <Select onValueChange={handleStageChange} value={selectedStage.toString()}>
                    <SelectTrigger id="stage-select">
                    <SelectValue placeholder={t('selectStage')} />
                    </SelectTrigger>
                    <SelectContent>
                    {[0, 1, 2, 3, 4, 5, 6, 7].map((stage) => (
                        <SelectItem key={stage} value={stage.toString()}>
                        {t('stage')} {stage}
                        </SelectItem>
                    ))}
                    </SelectContent>
                </Select>
                </div>

                <div className="space-y-2">
                <label htmlFor="coins-slider">{t('coins')}: {coins}</label>
                <Slider
                    id="coins-slider"
                    min={0}
                    max={100000}
                    step={100}
                    value={[coins]}
                    onValueChange={handleCoinsChange}
                />
                </div>

                <div className="space-y-2">
                <label htmlFor="crypto-slider">{t('crypto')}: {crypto}</label>
                <Slider
                    id="crypto-slider"
                    min={0}
                    max={1000}
                    step={10}
                    value={[crypto]}
                    onValueChange={handleCryptoChange}
                />
                </div>

                <div className="flex items-center space-x-2">
                <Switch
                    id="debug-mode"
                    checked={debugMode}
                    onCheckedChange={handleDebugModeToggle}
                />
                <label htmlFor="debug-mode">{t('debugMode')}</label>
                </div>

                <Button onClick={handleApplyChanges} className="w-full">
                {t('applyChanges')}
                </Button>

                <Button onClick={handleResetProgress} variant="destructive" className="w-full">
                {t('resetProgress')}
                </Button>
            </CardContent>
          </TabsContent>
          <TabsContent value="events">
            <div className="space-y-4">
              <Button onClick={() => handleTriggerEvent('levelUp')}>Trigger Level Up</Button>
              <Button onClick={() => handleTriggerEvent('earnReward')}>Trigger Earn Reward</Button>
              {/* Add more event trigger buttons as needed */}
            </div>
          </TabsContent>
          <TabsContent value="logs">
            <ScrollArea className="h-[300px] w-full">
              {logs.map((log, index) => (
                <div key={index} className="text-sm">{log}</div>
              ))}
            </ScrollArea>
            <Button onClick={clearLogs} className="mt-4">Clear Logs</Button>
          </TabsContent>
          <TabsContent value="performance">
            <PerformanceMonitor />
          </TabsContent>
          <TabsContent value="scenarios">
            <ScenarioRunner />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}