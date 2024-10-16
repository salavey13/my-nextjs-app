'use client'

import React, { useState, useEffect } from 'react'
import { useAppContext } from '@/context/AppContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabaseClient'
import { StoryEdit } from './StoryEdit'
import { useGameProgression } from '@/hooks/useGameProgression'
import { NavigationLink } from '@/components/ui/bottomShelf'
import { DollarSign, List, Zap, ShoppingCart, Home, Car, Users, User, Dice1, ZapOff, CalendarPlus, Globe, Crown, Lightbulb, Gamepad } from 'lucide-react'

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
  const [bottomShelfComponents, setBottomShelfComponents] = useState<{ [key: string]: boolean }>({})
  const { progressStage, simulateCrash } = useGameProgression()

  useEffect(() => {
    fetchStoryStages()
    fetchStageStats()
    initializeBottomShelfComponents()
  }, [])

  const navigationLinks: NavigationLink[] = [
    { href: '/paymentnotification', icon: <DollarSign className="w-6 h-6" />, label: t('bottomShelf.paymentNotification'), stageMask: 0b11111000, component: 'paymentNotification' },
    { href: '/dynamicitemform', icon: <List className="w-6 h-6" />, label: t('bottomShelf.dynamicItemForm'), stageMask: 0b11111000, component: 'dynamicItemForm' },
    { href: '/qrcodeform', icon: <Zap className="w-6 h-6" />, label: t('bottomShelf.qrCodeForm'), stageMask: 0b11111000, component: 'qrCodeForm' },
    { href: '/cryptopayment', icon: <ShoppingCart className="w-6 h-6" />, label: t('bottomShelf.cryptoPayment'), stageMask: 0b11111000, component: 'cryptoPayment' },
    { href: '/', icon: <Home className="w-6 h-6" />, label: t('bottomShelf.home'), stageMask: 0b11111111 },
    { href: '/rent', icon: <Car className="w-6 h-6" />, label: t('bottomShelf.rent'), stageMask: 0b11111000, component: 'rent' },
    { href: '/referral', icon: <Users className="w-6 h-6" />, label: t('bottomShelf.referral'), stageMask: 0b11111000, component: 'referral' },
    { href: '/profile', icon: <User className="w-6 h-6" />, label: t('bottomShelf.profile'), stageMask: 0b11111111 },
    { href: '/questsforcoins', icon: <Dice1 className="w-6 h-6" />, label: t('bottomShelf.quests'), stageMask: 0b11111000, component: 'questsForCoins' },
    { href: '/bets', icon: <Zap className="w-6 h-6" />, label: t('bottomShelf.bets'), stageMask: 0b11111000, component: 'bets' },
    { href: '/quiz', icon: <ZapOff className="w-6 h-6" />, label: t('bottomShelf.quiz'), stageMask: 0b11111111, component: 'quiz' },
    { href: '/createEvent', icon: <CalendarPlus className="w-6 h-6" />, label: t('bottomShelf.createEvent'), stageMask: 0b11111000, component: 'createEvent' },
    { href: '/conflictawareness', icon: <Globe className="w-6 h-6" />, label: t('bottomShelf.conflictAwareness'), stageMask: 0b11111000, component: 'conflictAwareness' },
    { href: '/admin', icon: <Crown className="w-6 h-6" />, label: t('bottomShelf.admin'), stageMask: 0b10000000, component: 'admin' },
    { href: '/dev', icon: <Lightbulb className="w-6 h-6" />, label: t('bottomShelf.dev'), stageMask: 0b11000000, component: 'dev' },
    { href: '/versimcel', icon: <Gamepad className="w-6 h-6" />, label: t('bottomShelf.versimcel'), stageMask: 0b11111000, component: 'versimcel' },
  ]

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

  const initializeBottomShelfComponents = () => {
    const components: { [key: string]: boolean } = {}
    navigationLinks.forEach(link => {
      if (link.component) {
        components[link.component] = state.user?.game_state?.unlockedComponents?.includes(link.component) || false
      }
    })
    setBottomShelfComponents(components)
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

  const handleBottomShelfComponentChange = (component: string, checked: boolean) => {
    setBottomShelfComponents(prev => ({ ...prev, [component]: checked }))
  }

  const isComponentUnlockable = (component: string, stage: number) => {
    const link = navigationLinks.find(link => link.component === component)
    if (!link) return false
    return (link.stageMask & (1 << (stage - 1))) !== 0
  }

  const handleApplyChanges = async () => {
    if (!state.user) return

    try {
      const newStage = parseInt(selectedStage)
      let unlockedComponents = Object.entries(bottomShelfComponents)
        .filter(([component, isChecked]) => isChecked && isComponentUnlockable(component, newStage))
        .map(([component]) => component)

      // Ensure crypto, dev, and admin are unlocked at appropriate stages
      if (newStage >= 3 && !unlockedComponents.includes('cryptoPayment')) {
        unlockedComponents.push('cryptoPayment')
      }
      if (newStage >= 6 && !unlockedComponents.includes('dev')) {
        unlockedComponents.push('dev')
      }
      if (newStage >= 7 && !unlockedComponents.includes('admin')) {
        unlockedComponents.push('admin')
      }

      const updatedGameState = {
        ...state.user.game_state,
        stage: newStage,
        coins: coins,
        crypto: crypto,
        unlockedComponents: unlockedComponents,
      }

      // Update local state first
      dispatch({ type: 'UPDATE_GAME_STATE', payload: updatedGameState })

      // Then update the database
      await progressStage(newStage, undefined, true)

      // Update the bottom shelf components state
      setBottomShelfComponents(prev => {
        const updated = { ...prev }
        Object.keys(updated).forEach(component => {
          updated[component] = unlockedComponents.includes(component)
        })
        return updated
      })

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

  const handleSimulateCrash = async () => {
    try {
      await simulateCrash()
      toast({
        title: t("devKit.success"),
        description: t("devKit.crashSimulated"),
        variant: "success",
      })
    } catch (error) {
      console.error('Error simulating crash:', error)
      toast({
        title: t("devKit.error"),
        description: t("devKit.failedToSimulateCrash"),
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
            <br />
            (bottomShelfBitmask: {stage.bottomshelfbitmask})
          </div>
        </SelectItem>
        {renderStageTree(stages, stage.id, depth + 1)}
      </React.Fragment>
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
                      {renderStageTree(storyStages)}
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
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">{t("devKit.bottomShelfComponents")}</h3>
                    {Object.entries(bottomShelfComponents).map(([component, isChecked]) => (
                      <div key={component} className="flex items-center">
                        <Checkbox
                          id={component}
                          checked={isChecked}
                          onCheckedChange={(checked) => handleBottomShelfComponentChange(component, checked as boolean)}
                        />
                        <label htmlFor={component} className="ml-2">
                          {component}
                        </label>
                      </div>
                    ))}
                  </div>
                  <Button onClick={handleApplyChanges} className="w-full">
                    {t("devKit.applyChanges")}
                  </Button>
                  <Button  onClick={handleSimulateCrash} className="w-full">
                    {t("devKit.simulateCrash")}
                  </Button>
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
