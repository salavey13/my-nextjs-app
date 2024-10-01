'use client'

import React, { useState, useEffect } from 'react'
import { useAppContext } from '@/context/AppContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { toast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabaseClient'
import { StoryEdit } from './StoryEdit'

interface StoryStage {
  id: string;
  parentId: string | null;
  stage: number;
  storyContent: string;
  xuinityDialog: string;
  trigger: string;
  activeComponent: string;
  minigame: string;
  achievement: string;
  bottomShelfBitmask: number;
}

interface StageStats {
  [key: string]: number;
}

export default function DevKit() {
  const { state, dispatch, t } = useAppContext()
  const [storyStages, setStoryStages] = useState<StoryStage[]>([])
  const [selectedStage, setSelectedStage] = useState(state.user?.game_state?.stage || 0)
  const [coins, setCoins] = useState(state.user?.game_state?.coins || 0)
  const [crypto, setCrypto] = useState(state.user?.game_state?.crypto || 0)
  const [stageStats, setStageStats] = useState<StageStats>({})
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    fetchStoryStages()
    fetchStageStats()
  }, [])

  const fetchStoryStages = async () => {
    const { data, error } = await supabase
      .from('story_stages')
      .select('*')
      .order('stage', { ascending: true })

    if (error) {
      console.error('Error fetching story stages:', error)
    } else {
      setStoryStages(data || [])
    }
  }

  const fetchStageStats = async () => {
    const { data, error } = await supabase
      .from('users')
      .select('game_state')

    if (error) {
      console.error('Error fetching stage stats:', error)
    } else {
      const stats: StageStats = data.reduce((acc: StageStats, user) => {
        const stage = user.game_state?.stage
        if (stage !== undefined) {
          acc[stage] = (acc[stage] || 0) + 1
        }
        return acc
      }, {})
      setStageStats(stats)
    }
  }

  const handleStageChange = (value: string) => {
    setSelectedStage(parseInt(value))
  }

  const handleCoinsChange = (value: number) => {
    setCoins(value)
  }

  const handleCryptoChange = (value: number) => {
    setCrypto(value)
  }

  const handleApplyChanges = async () => {
    if (!state.user) return

    try {
      const updatedGameState = {
        ...state.user.game_state,
        stage: selectedStage,
        coins: coins,
        crypto: crypto,
      }

      const { data, error } = await supabase
        .from('users')
        .update({ game_state: updatedGameState })
        .eq('id', state.user.id)
        .single()

      if (error) throw error

      dispatch({ type: 'UPDATE_GAME_STATE', payload: updatedGameState })

      toast({
        title: t("devKit.success"),
        description: t("devKit.gameStateUpdated"),
      })
    } catch (error) {
      console.error('Error updating game state:', error)
      toast({
        title: t("devKit.error"),
        description: t("devKit.failedToUpdateGameState"),
        variant: "destructive",
      })
    }
  }

  if (state.user?.role !== 1) {
    return null
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
      <CollapsibleTrigger asChild>
        <Button variant="outline" className="w-full mb-2">
          {isOpen ? "Hide DevKit" : "Show DevKit"}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <Card className="w-full">
          <CardHeader>
            <CardTitle>{t("devKit.title")}</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="gameState">
              <TabsList className="w-full flex justify-between mb-4">
                <TabsTrigger value="gameState" className="flex-1">{t("devKit.gameState")}</TabsTrigger>
                <TabsTrigger value="storyEdit" className="flex-1">{t("devKit.storyEdit")}</TabsTrigger>
                <TabsTrigger value="stats" className="flex-1">{t("devKit.stats")}</TabsTrigger>
              </TabsList>
              <TabsContent value="gameState">
                <div className="space-y-4">
                  <Select onValueChange={handleStageChange} value={selectedStage.toString()}>
                    <SelectTrigger>
                      <SelectValue placeholder={t("devKit.selectStage")} />
                    </SelectTrigger>
                    <SelectContent>
                      {storyStages.map((stage) => (
                        <SelectItem key={stage.id} value={stage.stage.toString()}>
                          {t("devKit.stage")} {stage.stage} (ID: {stage.id})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    value={coins}
                    onChange={(e) => handleCoinsChange(parseInt(e.target.value))}
                    placeholder={t("devKit.coins")}
                  />
                  <Input
                    type="number"
                    value={crypto}
                    onChange={(e) => handleCryptoChange(parseInt(e.target.value))}
                    placeholder={t("devKit.crypto")}
                  />
                  <Button onClick={handleApplyChanges}>{t("devKit.applyChanges")}</Button>
                </div>
              </TabsContent>
              <TabsContent value="storyEdit">
                <StoryEdit />
              </TabsContent>
              <TabsContent value="stats">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">{t("devKit.playersPerStage")}</h3>
                  {Object.entries(stageStats).map(([stage, count]) => (
                    <div key={stage} className="flex justify-between">
                      <span>{t("devKit.stage")} {stage}:</span>
                      <span>{count} {t("devKit.players")}</span>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </CollapsibleContent>
    </Collapsible>
  )
}