import React, { useState, useEffect } from 'react'
import { useAppContext } from '@/context/AppContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabaseClient'

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

export function StoryEdit() {
  const { state, dispatch } = useAppContext()
  const [storyStages, setStoryStages] = useState<StoryStage[]>([])
  const [selectedStage, setSelectedStage] = useState<string | null>(null)
  const [editedStage, setEditedStage] = useState<StoryStage | null>(null)

  useEffect(() => {
    fetchStoryStages()
  }, [])

  const fetchStoryStages = async () => {
    const { data, error } = await supabase
      .from('story_stages')
      .select('*')
      .order('stage', { ascending: true })

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch story stages',
        variant: 'destructive',
      })
    } else {
      setStoryStages(data || [])
    }
  }

  const handleStageSelect = (stageId: string) => {
    setSelectedStage(stageId)
    setEditedStage(storyStages.find(s => s.id === stageId) || null)
  }

  const handleStageEdit = (field: keyof StoryStage, value: string | number) => {
    if (editedStage) {
      setEditedStage({ ...editedStage, [field]: value })
    }
  }

  const handleSaveStage = async () => {
    if (!editedStage) return

    const { data, error } = await supabase
      .from('story_stages')
      .upsert(editedStage)
      .select()

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to save story stage',
        variant: 'destructive',
      })
    } else {
      toast({
        title: 'Success',
        description: 'Story stage saved successfully',
      })
      fetchStoryStages()
    }
  }

  const handleAddStage = async () => {
    const newStage: StoryStage = {
      id: Date.now().toString(),
      parentId: null,
      stage: storyStages.length,
      storyContent: '',
      xuinityDialog: '',
      trigger: '',
      activeComponent: 'None',
      minigame: '',
      achievement: '',
      bottomShelfBitmask: 1, // Default to showing only Home
    }

    const { data, error } = await supabase
      .from('story_stages')
      .insert(newStage)
      .select()

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to add new story stage',
        variant: 'destructive',
      })
    } else {
      toast({
        title: 'Success',
        description: 'New story stage added successfully',
      })
      fetchStoryStages()
      setSelectedStage(newStage.id)
      setEditedStage(newStage)
    }
  }

  const handleRemoveStage = async () => {
    if (!selectedStage) return

    const { error } = await supabase
      .from('story_stages')
      .delete()
      .eq('id', selectedStage)

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to remove story stage',
        variant: 'destructive',
      })
    } else {
      toast({
        title: 'Success',
        description: 'Story stage removed successfully',
      })
      fetchStoryStages()
      setSelectedStage(null)
      setEditedStage(null)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Story Editor</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Select onValueChange={handleStageSelect} value={selectedStage || undefined}>
            <SelectTrigger>
              <SelectValue placeholder="Select a stage" />
            </SelectTrigger>
            <SelectContent>
              {storyStages.map((stage) => (
                <SelectItem key={stage.id} value={stage.id}>
                  Stage {stage.stage}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {editedStage && (
            <div className="space-y-4">
              <Input
                placeholder="Stage number"
                value={editedStage.stage}
                onChange={(e) => handleStageEdit('stage', Number(e.target.value))}
              />
              <Select
                value={editedStage.parentId || ''}
                onValueChange={(value) => handleStageEdit('parentId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select parent stage" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No parent</SelectItem>
                  {storyStages.map((stage) => (
                    <SelectItem key={stage.id} value={stage.id}>
                      Stage {stage.stage}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Textarea
                placeholder="Story content"
                value={editedStage.storyContent}
                onChange={(e) => handleStageEdit('storyContent', e.target.value)}
              />
              <Textarea
                placeholder="Xuinity dialog"
                value={editedStage.xuinityDialog}
                onChange={(e) => handleStageEdit('xuinityDialog', e.target.value)}
              />
              <Input
                placeholder="Trigger"
                value={editedStage.trigger}
                onChange={(e) => handleStageEdit('trigger', e.target.value)}
              />
              <Select
                value={editedStage.activeComponent}
                onValueChange={(value) => handleStageEdit('activeComponent', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select active component" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="None">None</SelectItem>
                  <SelectItem value="Hack Button">Hack Button</SelectItem>
                  <SelectItem value="Skins">Skins</SelectItem>
                  <SelectItem value="Crypto Wallet">Crypto Wallet</SelectItem>
                  <SelectItem value="Events">Events</SelectItem>
                  <SelectItem value="Rents">Rents</SelectItem>
                  <SelectItem value="Versimcel">Versimcel</SelectItem>
                  <SelectItem value="GitHub">GitHub</SelectItem>
                </SelectContent>
              </Select>
              <Input
                placeholder="Minigame"
                value={editedStage.minigame}
                onChange={(e) => handleStageEdit('minigame', e.target.value)}
              />
              <Input
                placeholder="Achievement"
                value={editedStage.achievement}
                onChange={(e) => handleStageEdit('achievement', e.target.value)}
              />
              <Input
                placeholder="Bottom Shelf Bitmask"
                type="number"
                value={editedStage.bottomShelfBitmask}
                onChange={(e) => handleStageEdit('bottomShelfBitmask', Number(e.target.value))}
              />
              <div className="flex space-x-2">
                <Button onClick={handleSaveStage}>Save Stage</Button>
                <Button onClick={handleRemoveStage} variant="destructive">Remove Stage</Button>
              </div>
            </div>
          )}

          <Button onClick={handleAddStage}>Add New Stage</Button>
        </div>
      </CardContent>
    </Card>
  )
}