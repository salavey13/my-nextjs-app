'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useAppContext } from '@/context/AppContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabaseClient'
import { Loader2 } from 'lucide-react'

import storiRealStages  from '@/lib/storyStages'
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

//const storiRealStages:StoryStage[] = storyStages

export function StoryEdit() {
  const { state, dispatch, t } = useAppContext()
  const [storyStages, setStoryStages] = useState<StoryStage[]>([])
  const [selectedStage, setSelectedStage] = useState<string | null>(null)
  const [editedStage, setEditedStage] = useState<StoryStage | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // const fetchStoryStages = useCallback(async () => {
  //   setIsLoading(true);
  //   const { data, error } = await supabase
  //     .from('story_stages')
  //     .select('*')
  //     .order('stage', { ascending: true });

  //   if (error) {
  //     toast({
  //       title: t('error'),
  //       description: t('failedToFetchStoryStages'),
  //       variant: 'destructive',
  //     });
  //   } else {
  //     setStoryStages(data || []);
  //   }
  //   setIsLoading(false);
  // }, [t]);
  
  const fetchStoryStages = useCallback(() => {
    setStoryStages(storiRealStages)
  }, [])

  useEffect(() => {
    fetchStoryStages()
  }, [fetchStoryStages])

  const handleStageSelect = (stageId: string) => {
    setSelectedStage(stageId)
    setEditedStage(storyStages.find(s => s.id.toString() === stageId ) || null)
  }

  const handleStageEdit = (field: keyof StoryStage, value: string | number) => {
    if (editedStage) {
      setEditedStage({ ...editedStage, [field]: value })
    }
  }

  const handleSaveStage = async () => {
    if (!editedStage) return
    setIsLoading(true)

    const { data, error } = await supabase
      .from('story_stages')
      .upsert(editedStage)
      .select()

    if (error) {
      toast({
        title: t('error'),
        description: t('failedToSaveStoryStage'),
        variant: 'destructive',
      })
    } else {
      toast({
        title: t('success'),
        description: t('storyStageUpdated'),
      })
      fetchStoryStages()
    }
    setIsLoading(false)
  }

  const handleAddStage = async () => {
    setIsLoading(true)
    const newStage: StoryStage = {
      id: Date.now(),
      parentid: null,
      stage: storyStages.length,
      storycontent: '',
      xuinitydialog: '',
      trigger: '',
      activecomponent: 'None',
      minigame: '',
      achievement: '',
      bottomshelfbitmask: 1,
    }

    const { data, error } = await supabase
      .from('story_stages')
      .insert(newStage)
      .select()

    if (error) {
      toast({
        title: t('error'),
        description: t('failedToAddNewStoryStage'),
        variant: 'destructive',
      })
    } else {
      toast({
        title: t('success'),
        description: t('newStoryStageAdded'),
      })
      fetchStoryStages()
      setSelectedStage(newStage.id.toString())
      setEditedStage(newStage)
    }
    setIsLoading(false)
  }

  const handleRemoveStage = async () => {
    if (!selectedStage) return
    setIsLoading(true)

    const { error } = await supabase
      .from('story_stages')
      .delete()
      .eq('id', selectedStage)

    if (error) {
      toast({
        title: t('error'),
        description: t('failedToRemoveStoryStage'),
        variant: 'destructive',
      })
    } else {
      toast({
        title: t('success'),
        description: t('storyStageRemoved'),
      })
      fetchStoryStages()
      setSelectedStage(null)
      setEditedStage(null)
    }
    setIsLoading(false)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{t('storyEditor')}</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="edit">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="edit">{t('editStage')}</TabsTrigger>
            <TabsTrigger value="add">{t('addNewStage')}</TabsTrigger>
          </TabsList>
          <TabsContent value="edit">
            <div className="space-y-4">
              <Select onValueChange={handleStageSelect} value={selectedStage?.toString() || undefined}>
                <SelectTrigger>
                  <SelectValue placeholder={t('selectAStage')} />
                </SelectTrigger>
                <SelectContent>
                  {storyStages.map((stage) => (
                    <SelectItem key={stage.id} value={stage.id.toString()}>
                      {t('stage')} {stage.stage} (ID: {stage.id})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {editedStage && (
                <div className="space-y-4">
                  <Input
                    placeholder={t('stageNumber')}
                    type="number"
                    value={editedStage.stage}
                    onChange={(e) => handleStageEdit('stage', Number(e.target.value))}
                  />
                  <Select
                    value={editedStage.parentid?.toString()}
                    onValueChange={(value) => handleStageEdit('parentid', value === 'none' ? 0 : value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('selectParentStage')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">{t('noParent')}</SelectItem>
                      {storyStages.map((stage) => (
                        <SelectItem key={stage.id} value={stage.id.toString()}>
                          {t('stage')} {stage.stage} (ID: {stage.id})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Textarea
                    placeholder={t('storyContent')}
                    value={editedStage.storycontent}
                    onChange={(e) => handleStageEdit('storycontent', e.target.value)}
                  />
                  <Textarea
                    placeholder={t('xuinityDialog')}
                    value={editedStage.xuinitydialog}
                    onChange={(e) => handleStageEdit('xuinitydialog', e.target.value)}
                  />
                  <Input
                    placeholder={t('trigger')}
                    value={editedStage.trigger}
                    onChange={(e) => handleStageEdit('trigger', e.target.value)}
                  />
                  <Select
                    value={editedStage.activecomponent}
                    onValueChange={(value) => handleStageEdit('activecomponent', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('selectActiveComponent')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="None">{t('none')}</SelectItem>
                      <SelectItem value="Hack Button">{t('hackButton')}</SelectItem>
                      <SelectItem value="Skins">{t('skins')}</SelectItem>
                      <SelectItem value="Crypto Wallet">{t('cryptoWallet')}</SelectItem>
                      <SelectItem value="Events">{t('events')}</SelectItem>
                      <SelectItem value="Rents">{t('rents')}</SelectItem>
                      <SelectItem value="Versimcel">{t('versimcel')}</SelectItem>
                      <SelectItem value="GitHub">{t('github')}</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder={t('minigame')}
                    value={editedStage.minigame}
                    onChange={(e) => handleStageEdit('minigame', e.target.value)}
                  />
                  <Input
                    placeholder={t('achievement')}
                    value={editedStage.achievement}
                    onChange={(e) => handleStageEdit('achievement', e.target.value)}
                  />
                  <Input
                    placeholder={t('bottomShelfBitmask')}
                    type="number"
                    value={editedStage.bottomshelfbitmask}
                    onChange={(e) => handleStageEdit('bottomshelfbitmask', Number(e.target.value))}
                  />
                  <div className="flex space-x-2">
                    <Button onClick={handleSaveStage} disabled={isLoading}>
                      {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      {t('saveStage')}
                    </Button>
                    <Button onClick={handleRemoveStage} variant="destructive" disabled={isLoading}>
                      {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      {t('removeStage')}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
          <TabsContent value="add">
            <Button onClick={handleAddStage} disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {t('addNewStage')}
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}