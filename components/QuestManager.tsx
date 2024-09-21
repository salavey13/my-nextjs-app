'use client'

import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useAppContext } from '@/context/AppContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { toast } from '@/hooks/use-toast'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dropdown } from './ui/dropdown';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'

interface Quest {
  id: number
  title: string
  description: string
  type: 'tracking' | 'referral' | 'social'
  reward: number
  category: string
  image_url: string
  target: number
  socialLink: string
}

interface QuestState {
  user_id: number
  quest_id: number
  state: 'in_progress' | 'completed' | 'not_started'
  progress: number
  streak: number
}

interface Referral {
  id: number
  user_id: number
  referred_user_id: number
  ref_code: string
}

export function QuestManager() {
  const { t } = useAppContext()
  const [quests, setQuests] = useState<Quest[]>([])
  const [questStates, setQuestStates] = useState<QuestState[]>([])
  const [referrals, setReferrals] = useState<Referral[]>([])
  const [newQuest, setNewQuest] = useState<Partial<Quest>>({
    title: '',
    description: '',
    type: 'tracking',
    reward: 500,
    category: '',
    image_url: '',
    target: 5000,
    socialLink: '',
  })

  useEffect(() => {
    fetchQuests()
    fetchQuestStates()
    fetchReferrals()

    const questsSubscription = supabase
      .channel('quests_channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'quests' }, fetchQuests)
      .subscribe()

    const questStatesSubscription = supabase
      .channel('quest_states_channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'quest_states' }, fetchQuestStates)
      .subscribe()

    const referralsSubscription = supabase
      .channel('referrals_channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'referrals' }, fetchReferrals)
      .subscribe()

    return () => {
      supabase.removeChannel(questsSubscription)
      supabase.removeChannel(questStatesSubscription)
      supabase.removeChannel(referralsSubscription)
    }
  }, [])

  const fetchQuests = async () => {
    const { data, error } = await supabase.from('quests').select('*')
    if (error) {
      console.error('Error fetching quests:', error)
      toast({
        title: "Error",
        description: "Failed to fetch quests",
        variant: "destructive",
      })
    } else {
      setQuests(data)
    }
  }

  const fetchQuestStates = async () => {
    const { data, error } = await supabase.from('quest_states').select('*')
    if (error) {
      console.error('Error fetching quest states:', error)
      toast({
        title: "Error",
        description: "Failed to fetch quest states",
        variant: "destructive",
      })
    } else {
      setQuestStates(data)
    }
  }

  const fetchReferrals = async () => {
    const { data, error } = await supabase.from('referrals').select('*')
    if (error) {
      console.error('Error fetching referrals:', error)
      toast({
        title: "Error",
        description: "Failed to fetch referrals",
        variant: "destructive",
      })
    } else {
      setReferrals(data)
    }
  }

  const handleCreateQuest = async () => {
    const { data, error } = await supabase
      .from('quests')
      .insert([newQuest])
      .select()

    if (error) {
      console.error('Error creating quest:', error)
      toast({
        title: "Error",
        description: "Failed to create quest",
        variant: "destructive",
      })
    } else {
      toast({
        title: "Success",
        description: "Quest created successfully",
      })
      setNewQuest({
        title: '',
        description: '',
        type: 'tracking',
        reward: 500,
        category: '',
        image_url: '',
        target: 5000,
        socialLink: '',
      })
    }
  }

  const handleDeleteQuest = async (questId: number) => {
    const { error } = await supabase
      .from('quests')
      .delete()
      .eq('id', questId)

    if (error) {
      console.error('Error deleting quest:', error)
      toast({
        title: "Error",
        description: "Failed to delete quest",
        variant: "destructive",
      })
    } else {
      toast({
        title: "Success",
        description: "Quest deleted successfully",
      })
    }
  }

  const handleCheckReferrals = async (userId: number, questId: number) => {
    const referralQuest = quests.find(q => q.id === questId && q.type === 'referral')
    if (!referralQuest) {
      toast({
        title: "Error",
        description: "Invalid referral quest",
        variant: "destructive",
      })
      return
    }

    const userReferrals = referrals.filter(r => r.user_id === userId)
    const referralCount = userReferrals.length

    if (referralCount >= referralQuest.target) {
      // Update quest state
      const { error } = await supabase
        .from('quest_states')
        .upsert({
          user_id: userId,
          quest_id: questId,
          state: 'completed',
          progress: referralCount,
          streak: 1,
        })

      if (error) {
        console.error('Error updating quest state:', error)
        toast({
          title: "Error",
          description: "Failed to update quest state",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Success",
          description: `Referral quest completed! Reward: ${referralQuest.reward}`,
        })
        // Here you would typically update the user's balance or trigger a reward system
      }
    } else {
      // Update progress
      const { error } = await supabase
        .from('quest_states')
        .upsert({
          user_id: userId,
          quest_id: questId,
          state: 'in_progress',
          progress: referralCount,
          streak: 0,
        })

      if (error) {
        console.error('Error updating quest progress:', error)
        toast({
          title: "Error",
          description: "Failed to update quest progress",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Info",
          description: `Referral progress updated. Current: ${referralCount}/${referralQuest.target}`,
        })
      }
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('createQuest')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Input
              placeholder={t('questTitle')}
              value={newQuest.title}
              onChange={(e) => setNewQuest({ ...newQuest, title: e.target.value })}
            />
            <Input
              placeholder={t('questDescription')}
              value={newQuest.description}
              onChange={(e) => setNewQuest({ ...newQuest, description: e.target.value })}
            />
            <Dropdown
              className="w-full p-2 border rounded"
              value={newQuest.type}
              onChange={(e) => setNewQuest({ ...newQuest, type: e.target.value as Quest['type'] })}
            >
              <option value="tracking">{t('tracking')}</option>
              <option value="referral">{t('referral')}</option>
              <option value="social">{t('social')}</option>
            </Dropdown>
            <Input
              type="number"
              placeholder={t('questReward')}
              value={newQuest.reward}
              onChange={(e) => setNewQuest({ ...newQuest, reward: parseInt(e.target.value) })}
            />
            <Input
              placeholder={t('questCategory')}
              value={newQuest.category}
              onChange={(e) => setNewQuest({ ...newQuest, category: e.target.value })}
            />
            <Input
              placeholder={t('questImageUrl')}
              value={newQuest.image_url}
              onChange={(e) => setNewQuest({ ...newQuest, image_url: e.target.value })}
            />
            <Input
              type="number"
              placeholder={t('questTarget')}
              value={newQuest.target}
              onChange={(e) => setNewQuest({ ...newQuest, target: parseInt(e.target.value) })}
            />
            <Input
              placeholder={t('questSocialLink')}
              value={newQuest.socialLink}
              onChange={(e) => setNewQuest({ ...newQuest, socialLink: e.target.value })}
            />
            <Button onClick={handleCreateQuest}>{t('createQuest')}</Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="quests">
        
      <ScrollArea className="w-full whitespace-nowrap rounded-md border">
          <TabsList>
          <TabsTrigger value="quests">{t('quests')}</TabsTrigger>
          <TabsTrigger value="questStates">{t('questStates')}</TabsTrigger>
          <TabsTrigger value="referrals">{t('referrals')}</TabsTrigger>
        </TabsList>
        <ScrollBar orientation="horizontal" className="hidden sm:flex" />
        </ScrollArea>
          

        <TabsContent value="quests">
          <Card>
            <CardHeader>
              <CardTitle>{t('activeQuests')}</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('questTitle')}</TableHead>
                    <TableHead>{t('questType')}</TableHead>
                    <TableHead>{t('questReward')}</TableHead>
                    <TableHead>{t('questTarget')}</TableHead>
                    <TableHead>{t('actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quests.map((quest) => (
                    <TableRow key={quest.id}>
                      <TableCell>{quest.title}</TableCell>
                      <TableCell>{quest.type}</TableCell>
                      <TableCell>{quest.reward}</TableCell>
                      <TableCell>{quest.target}</TableCell>
                      <TableCell>
                        <Button onClick={() => handleDeleteQuest(quest.id)} variant="destructive">
                          {t('deleteQuest')}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="questStates">
          <Card>
            <CardHeader>
              <CardTitle>{t('questStates')}</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('userId')}</TableHead>
                    <TableHead>{t('questId')}</TableHead>
                    <TableHead>{t('state')}</TableHead>
                    <TableHead>{t('progress')}</TableHead>
                    <TableHead>{t('streak')}</TableHead>
                    <TableHead>{t('actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {questStates.map((state) => (
                    <TableRow key={`${state.user_id}-${state.quest_id}`}>
                      <TableCell>{state.user_id}</TableCell>
                      <TableCell>{state.quest_id}</TableCell>
                      <TableCell>{state.state}</TableCell>
                      <TableCell>{state.progress}</TableCell>
                      <TableCell>{state.streak}</TableCell>
                      <TableCell>
                        {quests.find(q => q.id === state.quest_id)?.type === 'referral' && (
                          <Button onClick={() => handleCheckReferrals(state.user_id, state.quest_id)}>
                            {t('checkReferrals')}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="referrals">
          <Card>
            <CardHeader>
              <CardTitle>{t('referrals')}</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('userId')}</TableHead>
                    <TableHead>{t('referredUserId')}</TableHead>
                    <TableHead>{t('refCode')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {referrals.map((referral) => (
                    <TableRow key={referral.id}>
                      <TableCell>{referral.user_id}</TableCell>
                      <TableCell>{referral.referred_user_id}</TableCell>
                      <TableCell>{referral.ref_code}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}