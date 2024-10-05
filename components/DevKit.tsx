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
  parentid: string | null;
  stage: number;
  storycontent: string;
  xuinitydialog: string;
  trigger: string;
  activecomponent: string;
  minigame: string;
  achievement: string;
  bottomshelfbitmask: number;
}

interface StageStats {
  [key: string]: number;
}

export default function DevKit() {
  const { state, dispatch, t } = useAppContext()
  const [storyStages, setStoryStages] = useState<StoryStage[]>([])
  const [selectedStage, setSelectedStage] = useState(state.user?.game_state?.stage?.toString() || "0")
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
    setSelectedStage(value)
  }

  const handleCoinsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCoins(parseInt(e.target.value) || 0)
  }

  const handleCryptoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCrypto(parseInt(e.target.value) || 0)
  }

  const handleApplyChanges = async () => {
    if (!state.user) return

    try {
      const updatedGameState = {
        ...state.user.game_state,
        stage: parseInt(selectedStage),
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
        variant: "success",
        stage: updatedGameState.stage
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

  const renderStageTree = (stages: StoryStage[], parentId: string | null = null, depth = 0) => {
    const childStages = stages.filter(stage => stage.parentid === parentId)
    
    return childStages.map(stage => (
      <React.Fragment key={stage.id}>
        <SelectItem value={stage.stage.toString()} className="text-xs">
          <div style={{ marginLeft: `${depth * 20}px` }}>
            (ID: {stage.id}) (parentId: {stage.parentid}) {t("devKit.stage")} {stage.stage} 
            <br />
            (xuinityDialog: {stage.xuinitydialog.substring(0, 30)}...) 
            <br />
            (storyContent: {stage.storycontent.substring(0, 30)}...) 
            <br />
            (achievement: {stage.achievement}) 
            <br />
            (activeComponent: {stage.activecomponent}) 
            <br />
            (minigame: {stage.minigame}) 
            <br />
            (trigger: {stage.trigger})
          </div>
        </SelectItem>
        {renderStageTree(stages, stage.id, depth + 1)}
      </React.Fragment>
    ))
  }

  const renderStageOptions = (stages: StoryStage[]) => {
    return stages.map((stage) => (
      <SelectItem key={stage.id} value={stage.stage.toString()}>
        {/* Stage {stage.stage} - {stage.storyContent?.substring(0, 30)}... */}
        {t("devKit.stage")} {stage.stage} (ID: {stage.id}) (achievement: {stage.achievement})  (xuinitydialog: {stage.xuinitydialog?.substring(0, 30)}) (storycontent: {stage.storycontent?.substring(0, 30)})   (activecomponent: {stage.activecomponent})  (minigame: {stage.minigame}) (trigger: {stage.trigger}) (parentId: {stage.parentid}) (xuinitydialog: {stage.xuinitydialog?.substring(0, 30)}) (storycontent: {stage.storycontent?.substring(0, 30)})  

      </SelectItem>
    ))
  }

  if (state.user?.role !== 1) {
    return null
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
      <CollapsibleTrigger asChild>
        <Button variant="outline" className="w-full mb-2">
          {isOpen ? t("devKit.hideDevKit") : t("devKit.showDevKit")}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <Card className="w-full">
          <CardHeader>
            <CardTitle>{t("devKit.title")}</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="gameState">
              <TabsList className="w-full flex justify-between overflow-x-auto mb-4">
                <TabsTrigger value="gameState" className="flex-1">{t("devKit.gameState")}</TabsTrigger>
                <TabsTrigger value="storyEdit" className="flex-1">{t("devKit.storyEdit")}</TabsTrigger>
                <TabsTrigger value="stats" className="flex-1">{t("devKit.stats")}</TabsTrigger>
              </TabsList>
              <TabsContent value="gameState">
                <div className="space-y-4">
                  <Select onValueChange={handleStageChange} value={selectedStage}>
                    <SelectTrigger>
                      <SelectValue placeholder={t("devKit.selectStage")} />
                    </SelectTrigger>
                    <SelectContent>
                      {renderStageOptions(storyStages)}
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    value={coins}
                    onChange={handleCoinsChange}
                    placeholder={t("devKit.coins")}
                  />
                  <Input
                    type="number"
                    value={crypto}
                    onChange={handleCryptoChange}
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
