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
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'

interface Task {
  id: number
  server_id: string
  server_name: string
  invite_link: string
  members_needed: number
}

interface UserPoints {
  user_id: string
  server_id: string
  points: number
}

interface Subscription {
  user_id: string
  task_id: number
}

export function AdminTaskManager() {
  const { t, user } = useAppContext()
  const [tasks, setTasks] = useState<Task[]>([])
  const [userPoints, setUserPoints] = useState<UserPoints[]>([])
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [newTask, setNewTask] = useState({
    server_name: '',
    invite_link: '',
    members_needed: 0
  })
  const [messages, setMessages] = useState<string[]>([])

  useEffect(() => {
    fetchTasks()
    fetchUserPoints()
    fetchSubscriptions()

    const tasksSubscription = supabase
      .channel('tasks_channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, fetchTasks)
      .subscribe()

    const userPointsSubscription = supabase
      .channel('user_points_channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_points' }, fetchUserPoints)
      .subscribe()

    const subscriptionsSubscription = supabase
      .channel('subscriptions_channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'subscriptions' }, fetchSubscriptions)
      .subscribe()

    // Simulating bot messages
    const messageInterval = setInterval(() => {
      setMessages(prev => [...prev, `New activity at ${new Date().toLocaleTimeString()}`])
    }, 5000)

    return () => {
      supabase.removeChannel(tasksSubscription)
      supabase.removeChannel(userPointsSubscription)
      supabase.removeChannel(subscriptionsSubscription)
      clearInterval(messageInterval)
    }
  }, [])

  const fetchTasks = async () => {
    const { data, error } = await supabase.from('tasks').select('*')
    if (error) {
      console.error('Error fetching tasks:', error)
      toast({
        title: "Error",
        description: "Failed to fetch tasks",
        variant: "destructive",
      })
    } else {
      setTasks(data)
    }
  }

  const fetchUserPoints = async () => {
    const { data, error } = await supabase.from('user_points').select('*')
    if (error) {
      console.error('Error fetching user points:', error)
      toast({
        title: "Error",
        description: "Failed to fetch user points",
        variant: "destructive",
      })
    } else {
      setUserPoints(data)
    }
  }

  const fetchSubscriptions = async () => {
    const { data, error } = await supabase.from('subscriptions').select('*')
    if (error) {
      console.error('Error fetching subscriptions:', error)
      toast({
        title: "Error",
        description: "Failed to fetch subscriptions",
        variant: "destructive",
      })
    } else {
      setSubscriptions(data)
    }
  }

  const handleCreateTask = async () => {
    const { data, error } = await supabase
      .from('tasks')
      .insert([
        {
          server_id: Date.now().toString(), // Using timestamp as a placeholder for server_id
          ...newTask
        }
      ])
      .select()

    if (error) {
      console.error('Error creating task:', error)
      toast({
        title: "Error",
        description: "Failed to create task",
        variant: "destructive",
      })
    } else {
      toast({
        title: "Success",
        description: "Task created successfully",
      })
      setNewTask({ server_name: '', invite_link: '', members_needed: 0 })
    }
  }

  const handleDeleteTask = async (taskId: number) => {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId)

    if (error) {
      console.error('Error deleting task:', error)
      toast({
        title: "Error",
        description: "Failed to delete task",
        variant: "destructive",
      })
    } else {
      toast({
        title: "Success",
        description: "Task deleted successfully",
      })
    }
  }

  const handleRewardPoints = async (userId: string, serverId: string, points: number) => {
    const { data, error } = await supabase
      .from('user_points')
      .upsert({ user_id: userId, server_id: serverId, points: points }, { onConflict: 'user_id,server_id' })

    if (error) {
      console.error('Error rewarding points:', error)
      toast({
        title: "Error",
        description: "Failed to reward points",
        variant: "destructive",
      })
    } else {
      toast({
        title: "Success",
        description: "Points rewarded successfully",
      })
    }
  }

  const handleCheckSubscription = async (userId: string, taskId: number) => {
    // This function would typically involve checking if the user is actually subscribed to the server
    // For demonstration purposes, we'll just add a subscription entry
    const { data, error } = await supabase
      .from('subscriptions')
      .insert({ user_id: userId, task_id: taskId })

    if (error) {
      console.error('Error checking subscription:', error)
      toast({
        title: "Error",
        description: "Failed to check subscription",
        variant: "destructive",
      })
    } else {
      toast({
        title: "Success",
        description: "Subscription checked successfully",
      })
      // Reward points for the subscription
      const task = tasks.find(t => t.id === taskId)
      if (task) {
        handleRewardPoints(userId, task.server_id, 2) // Reward 2 points as in the Python script
      }
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('createTask')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Input
              placeholder={t('serverName')}
              value={newTask.server_name}
              onChange={(e) => setNewTask({ ...newTask, server_name: e.target.value })}
            />
            <Input
              placeholder={t('inviteLink')}
              value={newTask.invite_link}
              onChange={(e) => setNewTask({ ...newTask, invite_link: e.target.value })}
            />
            <Input
              type="number"
              placeholder={t('membersNeeded')}
              value={newTask.members_needed}
              onChange={(e) => setNewTask({ ...newTask, members_needed: parseInt(e.target.value) })}
            />
            <Button onClick={handleCreateTask}>{t('createTask')}</Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="tasks">
      <ScrollArea className="w-full whitespace-nowrap rounded-md border">
        <TabsList>
          <TabsTrigger value="tasks">{t('activeTasks')}</TabsTrigger>
          <TabsTrigger value="points">{t('userPoints')}</TabsTrigger>
          <TabsTrigger value="subscriptions">{t('subscriptions')}</TabsTrigger>
          <TabsTrigger value="messages">{t('botMessages')}</TabsTrigger>
        </TabsList>
        <ScrollBar orientation="horizontal" className="hidden sm:flex" />
        </ScrollArea>

        <TabsContent value="tasks">
          <Card>
            <CardHeader>
              <CardTitle>{t('activeTasks')}</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('serverName')}</TableHead>
                    <TableHead>{t('inviteLink')}</TableHead>
                    <TableHead>{t('membersNeeded')}</TableHead>
                    <TableHead>{t('actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tasks.map((task) => (
                    <TableRow key={task.id}>
                      <TableCell>{task.server_name}</TableCell>
                      <TableCell>{task.invite_link}</TableCell>
                      <TableCell>{task.members_needed}</TableCell>
                      <TableCell>
                        <Button onClick={() => handleDeleteTask(task.id)} variant="destructive">
                          {t('deleteTask')}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="points">
          <Card>
            <CardHeader>
              <CardTitle>{t('userPoints')}</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('userId')}</TableHead>
                    <TableHead>{t('serverId')}</TableHead>
                    <TableHead>{t('points')}</TableHead>
                    <TableHead>{t('actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userPoints.map((userPoint) => (
                    <TableRow key={`${userPoint.user_id}-${userPoint.server_id}`}>
                      <TableCell>{userPoint.user_id}</TableCell>
                      <TableCell>{userPoint.server_id}</TableCell>
                      <TableCell>{userPoint.points}</TableCell>
                      <TableCell>
                        <Button onClick={() => handleRewardPoints(userPoint.user_id, userPoint.server_id, userPoint.points + 1)}>
                          {t('rewardPoint')}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscriptions">
          <Card>
            <CardHeader>
              <CardTitle>{t('subscriptions')}</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('userId')}</TableHead>
                    <TableHead>{t('taskId')}</TableHead>
                    <TableHead>{t('actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subscriptions.map((subscription) => (
                    <TableRow key={`${subscription.user_id}-${subscription.task_id}`}>
                      <TableCell>{subscription.user_id}</TableCell>
                      <TableCell>{subscription.task_id}</TableCell>
                      <TableCell>
                        <Button onClick={() => handleCheckSubscription(subscription.user_id, subscription.task_id)}>
                          {t('checkSubscription')}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="messages">
          <Card>
            <CardHeader>
              <CardTitle>{t('botMessages')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 overflow-y-auto border p-4 rounded-md">
                {messages.map((message, index) => (
                  <div key={index} className="mb-2">
                    {message}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}