'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
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
//import { StoryEdit } from './StoryEdit'
import { useGameProgression } from '@/hooks/useGameProgression'
import { getNavigationLinks, NavigationLink } from '@/lib/navigationLinks'
import { dynamicComponents, DynamicComponent } from '@/lib/dynamicComponents'
import storiRealStages  from '@/lib/storyStages'
import UnlockChoice from './UnlockChoice'
import { Textarea } from './ui/textarea'

interface StoryStage {
  id: number;
  parentid: number | null;
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

//const storiRealStages:StoryStage[] = storyStages

export default function DevKit() {
  const { state, dispatch, t, storyStages } = useAppContext()
  //const [storyStages, setStoryStages] = useState<StoryStage[]>([])
  const [selectedStage, setSelectedStage] = useState(state.user?.game_state?.stage?.toString() || "0")
  const [coins, setCoins] = useState(state.user?.game_state?.coins || 0)
  const [crypto, setCrypto] = useState(state.user?.game_state?.crypto || 0)
  const [stageStats, setStageStats] = useState<StageStats>({})
  const [isOpen, setIsOpen] = useState(false)
  const [bottomShelfComponents, setBottomShelfComponents] = useState<{ [key: string]: boolean }>({})
  const { progressStage, simulateCrash } = useGameProgression()
  const [newComponentName, setNewComponentName] = useState('')
  const [newComponentIcon, setNewComponentIcon] = useState('')
  const [newComponentStageMask, setNewComponentStageMask] = useState('0b11111000')
  const [showUnlockChoice, setShowUnlockChoice] = useState(false)
  const navigationLinks = useMemo(() => getNavigationLinks(t), [t])

  // const fetchStoryStages = useCallback(async () => {
  //   try {
  //     const { data, error } = await supabase
  //       .from('story_stages')
  //       .select('*')
  //       .order('stage', { ascending: true })

  //     if (error) throw error
  //     setStoryStages(data || [])
  //   } catch (error) {
  //     console.error('Error fetching story stages:', error)
  //     toast({
  //       title: t("devKit.error"),
  //       description: t("devKit.failedToFetchStoryStages"),
  //       variant: "destructive",
  //     })
  //   }
  // }, [t])
  
  // const fetchStoryStages = useCallback(() => {
  //   setStoryStages(storiRealStages)
  // }, [t])
  
  // useEffect(() => {
  //   fetchStoryStages()
  // }, [fetchStoryStages])

  const fetchStageStats = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('game_state')

      if (error) throw error
      const stats: StageStats = data.reduce((acc: StageStats, user) => {
        const stage = user.game_state?.stage
        if (stage !== undefined) {
          acc[stage] = (acc[stage] || 0) + 1
        }
        return acc
      }, {})
      setStageStats(stats)
    } catch (error) {
      console.error('Error fetching stage stats:', error)
      toast({
        title: t("devKit.error"),
        description: t("devKit.failedToFetchStageStats"),
        variant: "destructive",
      })
    }
  }, [t])

  const initializeBottomShelfComponents = useCallback(() => {
    const components: { [key: string]: boolean } = {}
    navigationLinks.forEach(link => {
      if (link.component) {
        components[link.component] = state.user?.game_state?.unlockedComponents?.includes(link.component) || false
      }
    })
    setBottomShelfComponents(components)
  }, [navigationLinks, state.user?.game_state?.unlockedComponents])

  useEffect(() => {
    //etchStoryStages()
    fetchStageStats()
    initializeBottomShelfComponents()
  }, [ fetchStageStats, initializeBottomShelfComponents])

  const handleAddNewComponent = useCallback(() => {
    if (!newComponentName || !newComponentIcon) {
      toast({
        title: t("devKit.error"),
        description: t("devKit.newComponentFieldsRequired"),
        variant: "destructive",
      })
      return
    }

    const newComponent: DynamicComponent = {
      href: `/${newComponentName.toLowerCase()}`,
      icon: newComponentIcon,
      label: newComponentName,
      stageMask: parseInt(newComponentStageMask),
      component: newComponentName.toLowerCase(),
      componentPath: `components/${newComponentName}`,
    }

    // Add the new component to dynamicComponents
    dynamicComponents.push(newComponent)

    // Reset input fields
    setNewComponentName('')
    setNewComponentIcon('')
    setNewComponentStageMask('0b11111000')

    // Refresh navigation links
    initializeBottomShelfComponents()

    toast({
      title: t("devKit.success"),
      description: t("devKit.newComponentAdded"),
      variant: "success",
    })
  }, [newComponentName, newComponentIcon, newComponentStageMask, t, initializeBottomShelfComponents])

  const handleStageChange = useCallback((value: string) => {
    setSelectedStage(value)
  }, [])

  useEffect(() => {
    if (state.user?.game_state?.stage !== undefined) {
      setSelectedStage(state.user.game_state.stage.toString());
    }
  }, [state.user?.game_state?.stage]);

  const handleCoinsChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setCoins(parseInt(e.target.value) || 0)
  }, [])

  const handleCryptoChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setCrypto(parseInt(e.target.value) || 0)
  }, [])


  const handleBottomShelfComponentChange = useCallback((component: string, checked: boolean) => {
    setBottomShelfComponents(prev => ({ ...prev, [component]: checked }));
  }, []);

  const handleApplyChanges = useCallback(async () => {
    if (!state.user) return;

    try {
      const newStage = parseInt(selectedStage);
      
      // Determine which components should be unlocked based on the checkboxes
      let unlockedComponents = Object.entries(bottomShelfComponents)
        .filter(([component, isChecked]) => isChecked)
        .map(([component]) => component);

      const updatedGameState = {
        ...state.user.game_state,
        stage: newStage,
        coins: coins,
        crypto: crypto,
        unlockedComponents: unlockedComponents,
      };

      // Update local state first
      dispatch({ type: 'UPDATE_GAME_STATE', payload: updatedGameState });

      // Update the Supabase database
      const { error } = await supabase
        .from('users')
        .update({ game_state: updatedGameState })
        .eq('id', state.user.id);

      if (error) throw error;

      toast({
        title: t("devKit.success"),
        description: t("devKit.gameStateUpdated"),
        variant: "success",
        stage: updatedGameState.stage,
      });

    } catch (error) {
      console.error('Error updating game state:', error);
      toast({
        title: t("devKit.error"),
        description: t("devKit.failedToUpdateGameState"),
        variant: "destructive",
      });
    }
  }, [state.user, selectedStage, bottomShelfComponents, coins, crypto, dispatch, t]);

  const isComponentUnlockable = useCallback((component: string, stage: number) => {
    const link = navigationLinks.find(link => link.component === component);
    if (!link) return false;
    if (component === 'admin') {
      return stage >= 7;
    }
    return (link.stageMask & (1 << (stage - 1))) !== 0;
  }, [navigationLinks]);


                                            
  const handleSimulateCrash = useCallback(async () => {
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
  }, [simulateCrash, t])

  const handleShowUnlockChoice = useCallback(() => {
    setShowUnlockChoice(true)
  }, [])

  const renderStageTree = useCallback((stages: StoryStage[], parentId: string | null = null, depth = 0) => {
    const childStages = stages.filter(stage => stage.parentid === parentId)
    
    return childStages.map(stage => (
      <React.Fragment key={stage.id}>
        <SelectItem value={stage.stage.toString()} className="text-xs">
          <div style={{ marginLeft: `${depth * 20}px` }}>
            (ID: {stage.id}) (parentId: {stage.parentid}) {t("devKit.stage")} {stage.stage} 
            <br />
            (xuinityDialog: {stage.xuinitydialog?.substring(0, 30) || 'N/A'}...) 
            <br />
            (storyContent: {stage.storycontent?.substring(0, 30) || 'N/A'}...) 
            <br />
            (achievement: {stage.achievement || 'N/A'}) 
            <br />
            (activeComponent: {stage.activecomponent || 'N/A'}) 
            <br />
            (minigame: {stage.minigame || 'N/A'}) 
            <br />
            (trigger: {stage.trigger || 'N/A'})
            <br />
            (bottomShelfBitmask: {stage.bottomshelfbitmask || 'N/A'})
          </div>
        </SelectItem>
        {renderStageTree(stages, stage.id.toString(), depth + 1)}
      </React.Fragment>
    ))
  }, [t])

  const renderStageMask = useCallback((stageMask: number) => {
    const bits = stageMask.toString(2).padStart(8, '0').split('').reverse()
    return (
      <div className="grid grid-cols-8 gap-1 mt-2">
        {bits.map((bit, index) => (
          <div
            key={index}
            className={`w-6 h-6 flex items-center justify-center text-xs font-mono ${
              bit === '1' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            {bit}
          </div>
        ))}
      </div>
    )
  }, [])

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
                <TabsTrigger value="addComponent" className="flex-1">{t("devKit.addComponent")}</TabsTrigger>
              </TabsList>
              <TabsContent value="gameState">
                <div className="space-y-4">
                  <Button onClick={handleShowUnlockChoice} className="w-full">
                    {t("devKit.showUnlockChoice")}
                  </Button>
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
                          {t(`bottomShelf.${component}`)}
                        </label>
                      </div>
                    ))}
                  </div>
                  <Button onClick={handleApplyChanges} className="w-full">
                    {t("devKit.applyChanges")}
                  </Button>
                  <Button onClick={handleSimulateCrash} className="w-full">
                    {t("devKit.simulateCrash")}
                  </Button>
                </div>
              </TabsContent>
              <TabsContent value="storyEdit">
                <StoryEdit storyStages={storyStages} />
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
              <TabsContent value="addComponent">
                <div className="space-y-4">
                  <Input
                    type="text"
                    value={newComponentName}
                    onChange={(e) => setNewComponentName(e.target.value)}
                    placeholder={t("devKit.newComponentName")}
                  />
                  <Input
                    type="text"
                    value={newComponentIcon}
                    onChange={(e) => setNewComponentIcon(e.target.value)}
                    placeholder={t("devKit.newComponentIcon")}
                  />
                  <Input
                    type="text"
                    value={newComponentStageMask}
                    onChange={(e) => 
                      setNewComponentStageMask(e.target.value.startsWith('0b') ? e.target.value : `0b${e.target.value}`)
                    }
                    placeholder={t("devKit.newComponentStageMask")}
                  />
                  <Button onClick={handleAddNewComponent} className="w-full">
                    {t("devKit.addNewComponent")}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </CollapsibleContent>
      {showUnlockChoice && (
        <UnlockChoice
          onClose={() => setShowUnlockChoice(false)}
          currentStage={state.user?.game_state?.stage || 0}
          isDevMode={true}
        />
      )}
    </Collapsible>
  )
}

function StoryEdit({ storyStages }: { storyStages: any[] }) {
  const { t } = useAppContext()
  const [editingStage, setEditingStage] = useState<any | null>(null)

  const handleEditStage = (stage: any) => {
    setEditingStage(stage)
  }

  const handleSaveStage = async (updatedStage: any) => {
    try {
      const { error } = await supabase
        .from('story_stages')
        .update(updatedStage)
        .eq('id', updatedStage.id)

      if (error) throw error

      toast({
        title: t("devKit.success"),
        description: t("devKit.stageUpdated"),
        variant: "success",
      })

      setEditingStage(null)
    } catch (error) {
      console.error('Error updating stage:', error)
      toast({
        title: t("devKit.error"),
        description: t("devKit.failedToUpdateStage"),
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-4">
      {storyStages.map((stage) => (
        <Card key={stage.id}>
          <CardHeader>
            <CardTitle>{t("devKit.stage")} {stage.stage}</CardTitle>
          </CardHeader>
          <CardContent>
            {editingStage?.id === stage.id ? (
              <form onSubmit={(e) => {
                e.preventDefault()
                handleSaveStage(editingStage)
              }}>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="stage" className="block text-sm font-medium text-gray-700">
                      {t("devKit.stageNumber")}
                    </label>
                    <Input
                      id="stage"
                      type="number"
                      value={editingStage.stage}
                      onChange={(e) => setEditingStage({ ...editingStage, stage: parseInt(e.target.value) })}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="storycontent" className="block text-sm font-medium text-gray-700">
                      {t("devKit.storyContent")}
                    </label>
                    <Textarea
                      id="storycontent"
                      value={editingStage.storycontent}
                      onChange={(e) => setEditingStage({ ...editingStage, storycontent: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="xuinitydialog" className="block text-sm font-medium text-gray-700">
                      {t("devKit.xuinityDialog")}
                    </label>
                    <Textarea
                      id="xuinitydialog"
                      value={editingStage.xuinitydialog}
                      onChange={(e) => setEditingStage({ ...editingStage, xuinitydialog: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="trigger" className="block text-sm font-medium text-gray-700">
                      {t("devKit.trigger")}
                    </label>
                    <Input
                      id="trigger"
                      value={editingStage.trigger || ''}
                      onChange={(e) => setEditingStage({ ...editingStage, trigger: e.target.value })}
                    />
                  </div>
                  <div>
                    <label htmlFor="activecomponent" className="block text-sm font-medium text-gray-700">
                      {t("devKit.activeComponent")}
                    </label>
                    <Input
                      id="activecomponent"
                      value={editingStage.activecomponent || ''}
                      onChange={(e) => setEditingStage({ ...editingStage, activecomponent: e.target.value })}
                    />
                  </div>
                  <div>
                    <label htmlFor="minigame" className="block text-sm font-medium text-gray-700">
                      {t("devKit.minigame")}
                    </label>
                    <Input
                      id="minigame"
                      value={editingStage.minigame || ''}
                      onChange={(e) => setEditingStage({ ...editingStage, minigame: e.target.value })}
                    />
                  </div>
                  <div>
                    <label htmlFor="achievement" className="block text-sm font-medium text-gray-700">
                      {t("devKit.achievement")}
                    </label>
                    <Input
                      id="achievement"
                      value={editingStage.achievement || ''}
                      onChange={(e) => setEditingStage({ ...editingStage, achievement: e.target.value })}
                    />
                  </div>
                  <div>
                    <label htmlFor="bottomshelfbitmask" className="block text-sm font-medium text-gray-700">
                      {t("devKit.bottomShelfBitmask")}
                    </label>
                    <Input
                      id="bottomshelfbitmask"
                      type="number"
                      value={editingStage.bottomshelfbitmask || 0}
                      onChange={(e) => setEditingStage({ ...editingStage, bottomshelfbitmask: parseInt(e.target.value) })}
                    />
                  </div>
                  <div>
                    <label htmlFor="parentid" className="block text-sm font-medium text-gray-700">
                      {t("devKit.parentStage")}
                    </label>
                    <Select
                      value={editingStage.parentid?.toString() || ''}
                      onValueChange={(value) => setEditingStage({ ...editingStage, parentid: value ? parseInt(value) : null })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t("devKit.selectParentStage")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">
                          {t("devKit.noParentStage")}
                        </SelectItem>
                        {storyStages
                          .filter(s => s.id !== editingStage.id)
                          .map(s => (
                            <SelectItem key={s.id} value={s.id.toString()}>
                              {t("devKit.stage")} {s.stage}
                            </SelectItem>
                          ))
                        }
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit">{t("devKit.saveChanges")}</Button>
                </div>
              </form>
            ) : (
              <div className="space-y-2">
                <p><strong>{t("devKit.stageNumber")}:</strong> {stage.stage}</p>
                <p><strong>{t("devKit.storyContent")}:</strong> {stage.storycontent}</p>
                <p><strong>{t("devKit.xuinityDialog")}:</strong> {stage.xuinitydialog}</p>
                <p><strong>{t("devKit.trigger")}:</strong> {stage.trigger || t("devKit.notSet")}</p>
                <p><strong>{t("devKit.activeComponent")}:</strong> {stage.activecomponent || t("devKit.notSet")}</p>
                <p><strong>{t("devKit.minigame")}:</strong> {stage.minigame || t("devKit.notSet")}</p>
                <p><strong>{t("devKit.achievement")}:</strong> {stage.achievement || t("devKit.notSet")}</p>
                <p><strong>{t("devKit.bottomShelfBitmask")}:</strong> {stage.bottomshelfbitmask || 0}</p>
                <p><strong>{t("devKit.parentStage")}:</strong> {stage.parentid ? t("devKit.stage") + ' ' + storyStages.find(s => s.id === stage.parentid)?.stage : t("devKit.noParentStage")}</p>
                <Button onClick={() => handleEditStage(stage)}>{t("devKit.editStage")}</Button>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}