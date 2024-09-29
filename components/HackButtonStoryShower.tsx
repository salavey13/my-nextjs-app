// components\HackButtonStoryShower.tsx
"use client"

import React, { useState, useEffect } from 'react'
import { useAppContext } from '@/context/AppContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from '@/hooks/use-toast'
import { Skeleton } from '@/components/ui/skeleton'
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd'
import Image from 'next/image'
import { supabase } from '@/lib/supabaseClient'
import BottomShelf from '@/components/ui/bottomShelf'
import { Home, List, Plus, Bell, User, CalendarPlus, Lightbulb, Crown, Users, Dice1, DollarSign, Zap, Globe, ShoppingCart, Car, Gamepad } from 'lucide-react'
import Rents from '@/components/Rents'
import { CryptoPayment } from '@/components/CryptoPayment'
import CreateEvent from '@/components/CreateEvent'
import { motion, AnimatePresence } from 'framer-motion'

const storyStages: StoryStage[] = [
  {
    stage: 0,
    trigger: "Start Game",
    storyContent: "Welcome to the system. You are about to dive into a world of simple games.",
    jsonState: JSON.stringify({ stage: 0, coins: 1000 }),
    activeComponent: "None",
    expectedInput: "Launch Game",
    nextStageTrigger: "Game Launched"
  },
  {
    stage: 1,
    trigger: "Hack Button Clicked",
    storyContent: "System Crash: Looks like you've broken something. Was it a mistake, or is this all part of a deeper game?",
    jsonState: JSON.stringify({ stage: 1, coins: 1000 }),
    activeComponent: "Hack Button",
    expectedInput: "Yes/No Prompt",
    nextStageTrigger: "User Input: Yes"
  },
  {
    stage: 2,
    trigger: "Yes Chosen",
    storyContent: "You've made your first hack! A new world of possibilities opens up.",
    jsonState: JSON.stringify({ stage: 2, coins: 13000 }),
    activeComponent: "Skins",
    expectedInput: "None",
    nextStageTrigger: "Skin Selected"
  },
  {
    stage: 3,
    trigger: "Skin Selected",
    storyContent: "Congratulations on your new skin! Now, let's introduce you to the world of crypto.",
    jsonState: JSON.stringify({ stage: 3, coins: 13000, crypto: 100 }),
    activeComponent: "Crypto Wallet",
    expectedInput: "None",
    nextStageTrigger: "Crypto Introduced"
  },
  {
    stage: 4,
    trigger: "Crypto Introduced",
    storyContent: "With crypto in your wallet, you can now participate in events and place bets!",
    jsonState: JSON.stringify({ stage: 4, coins: 13000, crypto: 100 }),
    activeComponent: "Events",
    expectedInput: "None",
    nextStageTrigger: "Event Participated"
  },
  {
    stage: 5,
    trigger: "Event Participated",
    storyContent: "You've experienced events and bets. Now, let's explore the world of rents!",
    jsonState: JSON.stringify({ stage: 5, coins: 15000, crypto: 150 }),
    activeComponent: "Rents",
    expectedInput: "None",
    nextStageTrigger: "Rent Explored"
  },
  {
    stage: 6,
    trigger: "Rent Explored",
    storyContent: "The system crashes again... but this time, Versimcel appears!",
    jsonState: JSON.stringify({ stage: 6, coins: 10000, crypto: 100 }),
    activeComponent: "Versimcel",
    expectedInput: "Debug",
    nextStageTrigger: "Debug Complete"
  },
  {
    stage: 7,
    trigger: "Debug Complete",
    storyContent: "Welcome to the admin level. It's time for some real GitHub source hunting!",
    jsonState: JSON.stringify({ stage: 7, coins: 20000, crypto: 200 }),
    activeComponent: "GitHub",
    expectedInput: "None",
    nextStageTrigger: "Game Complete"
  }
]

export default function HackButtonStoryShower() {
  const { t, user, setUser } = useAppContext()
  const [currentStage, setCurrentStage] = useState(0)
  const [gameState, setGameState] = useState<GameState>({
    stage: 0,
    coins: 1000,
    crypto: 0,
    rank: "13",
    cheersCount: 1,
    progress: "0%",
    unlockedComponents: []
  })
  const [userInput, setUserInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [debugItems, setDebugItems] = useState(['Error 1', 'Error 2', 'Error 3'])
  const [gptInput, setGptInput] = useState('')
  const [gptResponse, setGptResponse] = useState('')
  const [skinPreview, setSkinPreview] = useState('')
  const [showBottomShelf, setShowBottomShelf] = useState(false)

  const currentStoryStage = storyStages[currentStage]

  useEffect(() => {
    if (user?.id) {
      loadGameState()
    }
  }, [user?.id])

  const loadGameState = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('game_state')
        .eq('id', user?.id)
        .single()

      if (error) throw error

      if (data?.game_state) {
        setGameState(data.game_state)
        setCurrentStage(data.game_state.stage)
        setShowBottomShelf(data.game_state.stage >= 2)
      }
    } catch (error) {
      console.error('Error loading game state:', error)
      toast({
        title: t('error'),
        description: t('loadGameStateError'),
        variant: "destructive",
      })
    }
  }

  const handleStageProgression = async (newStage: number) => {
    const updatedGameState = {
      ...gameState,
      stage: newStage,
      progress: `${(newStage / (storyStages.length - 1)) * 100}%`
    }
    setGameState(updatedGameState)
    setCurrentStage(newStage)
    setShowBottomShelf(newStage >= 2)
    
    try {
      const { error } = await supabase
        .from('users')
        .update({ game_state: updatedGameState })
        .eq('id', user?.id)

      if (error) throw error

      toast({
        title: t('success'),
        description: t('stageProgressionSuccess'),
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

  const handleTrigger = (trigger: string) => {
    const nextStage = storyStages.find(stage => stage.trigger === trigger)
    if (nextStage) {
      handleStageProgression(nextStage.stage)
    }
  }

  const handleHack = async () => {
    setIsLoading(true)
    try {
      const newCoins = gameState.coins + 13000
      const updatedGameState = {
        ...gameState,
        coins: newCoins,
      }
      setGameState(updatedGameState)

      const { error } = await supabase
        .from('users')
        .update({ game_state: updatedGameState })
        .eq('id', user?.id)

      if (error) throw error

      toast({
        title: t('success'),
        description: t('congratulationsMessage'),
      })
      handleTrigger('Hack Button Clicked')
    } catch (error) {
      console.error('Error updating balance:', error)
      toast({
        title: t('error'),
        description: t('generalError'),
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDragEnd = (result: any) => {
    const { destination, source, draggableId } = result
    
    if (!destination) return

    if (destination.droppableId === 'fix-box') {
      setDebugItems((items) => items.filter((item) => item !== draggableId))
      toast({ title: "Error Fixed", description: "You've resolved an error!" })
      if (debugItems.length === 1) {
        handleTrigger('Debug Complete')
      }
    } else {
      toast({ title: "Try Again", description: "Drag the error to the correct box!" })
    }
  }

  const handleGptInteraction = () => {
    setGptResponse(`Here's a solution for "${gptInput}": ${Math.random().toString(36).substring(7)}`)
    setGptInput('')
    handleTrigger('GPT Interaction Complete')
  }

  const handleSkinChange = (skinUrl: string) => {
    setSkinPreview(skinUrl)
  }

  const handleSkinConfirm = async () => {
    try {
      const updatedUser = {
        ...user,
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
        loot: {
          ...user?.loot,
          fool: {
            ...user?.loot?.fool,
            cards: {
              ...user?.loot?.fool?.cards,
              cards_img_url: skinPreview
            }
          }
        }
      }
      setUser(updatedUser)

      const { error } = await supabase
        .from('users')
        .update({ loot: updatedUser.loot })
        .eq('id', user?.id)

      if (error) throw error

      toast({
        title: t('success'),
        description: t('skinChangeSuccess'),
      })
      handleTrigger('Skin Selected')
    } catch (error) {
      console.error('Error updating skin:', error)
      toast({
        title: t('error'),
        description: t('skinChangeError'),
        variant: "destructive",
      })
    }
  }

  const renderEvent = () => {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStoryStage.stage}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {(() => {
            switch (currentStoryStage.activeComponent) {
              case "None":
                return <p className="text-lg">{t(currentStoryStage.storyContent)}</p>
              case "Hack Button":
                return (
                  <div className="space-y-4">
                    <p>{t(currentStoryStage.storyContent)}</p>
                    <Button onClick={handleHack} disabled={isLoading} className="bg-yellow-500 hover:bg-yellow-600 text-black">
                      {isLoading ? t('hacking') : t('hackButton')}
                    </Button>
                  </div>
                )
              case "Skins":
                return (
                  <div className="space-y-4">
                    <p>{t(currentStoryStage.storyContent)}</p>
                    <div className="flex space-x-4">
                      <Button onClick={() => handleSkinChange('/skins/skin1.png')}>{t('skin1')}</Button>
                      <Button onClick={() => handleSkinChange('/skins/skin2.png')}>{t('skin2')}</Button>
                      <Button onClick={() => handleSkinChange('/skins/skin3.png')}>{t('skin3')}</Button>
                    </div>
                    {skinPreview && (
                      <div className="mt-4">
                        <Image src={skinPreview} alt="Skin Preview" width={200} height={200} />
                        <Button onClick={handleSkinConfirm} className="mt-2">{t('confirmSkin')}</Button>
                      </div>
                    )}
                  </div>
                )
              case "Crypto Wallet":
                return <CryptoPayment  creatorTelegramId={user?.telegram_id.toString() || "413553377"}/>
              case "Events":
                return <CreateEvent />
              case "Rents":
                return <Rents />
              case "Versimcel":
                return (
                  <DragDropContext onDragEnd={handleDragEnd}>
                    <div className="space-y-4">
                      <p>{t(currentStoryStage.storyContent)}</p>
                      <Droppable droppableId="errors">
                        {(provided) => (
                          <ul {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                            {debugItems.map((item, index) => (
                              <Draggable key={item} draggableId={item} index={index}>
                                {(provided) => (
                                  <li
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    className="bg-red-100 p-2 rounded"
                                  >
                                    {item}
                                  </li>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </ul>
                        )}
                      </Droppable>
                      <Droppable droppableId="fix-box">
                        {(provided) => (
                          <div
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            className="border-2 border-dashed border-gray-300 p-4 rounded"
                          >
                            {t('dropErrorsHere')}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </div>
                  </DragDropContext>
                )
              case "GitHub":
                return (
                  <div className="space-y-4">
                    <p>{t(currentStoryStage.storyContent)}</p>
                    <Input
                      placeholder={t('enterGitHubRepo')}
                      value={gptInput}
                      onChange={(e) => setGptInput(e.target.value)}
                    />
                    <Button onClick={handleGptInteraction}>{t('searchRepo')}</Button>
                    {gptResponse && (
                      <Card>
                        <CardContent className="p-4">
                          <p>{gptResponse}</p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )
              default:
                return <p>{t('unknownEventType')}</p>
            }
          })()}
        </motion.div>
      </AnimatePresence>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <Card className="w-full max-w-2xl">
        <CardContent className="p-6 space-y-6">
          {isLoading ? (
            <Skeleton className="w-full h-40" />
          ) : (
            renderEvent()
          )}
          <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
            <div
              className="bg-blue-600 h-2.5 rounded-full"
              style={{ width: gameState.progress }}
            ></div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}