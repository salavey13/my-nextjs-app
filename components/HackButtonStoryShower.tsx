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

const storyStages = [
  // ... (keep the existing storyStages array)
]

export default function HackButtonStoryShower() {
  const { state, dispatch } = useAppContext()
  const user = state.user
  const [currentStage, setCurrentStage] = useState(0)
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
        dispatch({ type: 'UPDATE_GAME_STATE', payload: data.game_state })
        setCurrentStage(data.game_state.stage)
        setShowBottomShelf(data.game_state.stage >= 2)
      }
    } catch (error) {
      console.error('Error loading game state:', error)
      toast({
        title: 'Error',
        description: 'Failed to load game state',
        variant: "destructive",
      })
    }
  }

  const handleStageProgression = async (newStage: number) => {
    if (!user) return

    const updatedGameState = {
      ...user.game_state,
      stage: newStage,
      progress: `${(newStage / (storyStages.length - 1)) * 100}%`
    }
    
    try {
      const { error } = await supabase
        .from('users')
        .update({ game_state: updatedGameState })
        .eq('id', user.id)

      if (error) throw error

      dispatch({ type: 'UPDATE_GAME_STATE', payload: updatedGameState })
      setCurrentStage(newStage)
      setShowBottomShelf(newStage >= 2)

      toast({
        title: 'Success',
        description: 'Stage progression successful',
      })
    } catch (error) {
      console.error('Error updating game state:', error)
      toast({
        title: 'Error',
        description: 'Failed to update game state',
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
    if (!user) return

    setIsLoading(true)
    try {
      const newCoins = user.game_state.coins + 13000
      const updatedGameState = {
        ...user.game_state,
        coins: newCoins,
      }

      const { error } = await supabase
        .from('users')
        .update({ game_state: updatedGameState })
        .eq('id', user.id)

      if (error) throw error

      dispatch({ type: 'UPDATE_GAME_STATE', payload: updatedGameState })

      toast({
        title: 'Success',
        description: 'Congratulations! You\'ve earned coins!',
      })
      handleTrigger('Hack Button Clicked')
    } catch (error) {
      console.error('Error updating balance:', error)
      toast({
        title: 'Error',
        description: 'Failed to update balance',
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
    if (!user) return

    try {
      const updatedUser = {
        ...user,
        loot: {
          ...user.loot,
          fool: {
            ...user.loot?.fool,
            cards: {
              ...user.loot?.fool?.cards,
              cards_img_url: skinPreview
            }
          }
        }
      }

      const { error } = await supabase
        .from('users')
        .update({ loot: updatedUser.loot })
        .eq('id', user.id)

      if (error) throw error

      dispatch({ type: 'SET_USER', payload: updatedUser })

      toast({
        title: 'Success',
        description: 'Skin changed successfully',
      })
      handleTrigger('Skin Selected')
    } catch (error) {
      console.error('Error updating skin:', error)
      toast({
        title: 'Error',
        description: 'Failed to change skin',
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
                return <p className="text-lg">{currentStoryStage.storyContent}</p>
              case "Hack Button":
                return (
                  <div className="space-y-4">
                    <p>{currentStoryStage.storyContent}</p>
                    <Button onClick={handleHack} disabled={isLoading} className="bg-yellow-500 hover:bg-yellow-600 text-black">
                      {isLoading ? 'Hacking...' : 'Hack'}
                    </Button>
                  </div>
                )
              case "Skins":
                return (
                  <div className="space-y-4">
                    <p>{currentStoryStage.storyContent}</p>
                    <div className="flex space-x-4">
                      <Button onClick={() => handleSkinChange('/skins/skin1.png')}>Skin 1</Button>
                      <Button onClick={() => handleSkinChange('/skins/skin2.png')}>Skin 2</Button>
                      <Button onClick={() => handleSkinChange('/skins/skin3.png')}>Skin 3</Button>
                    </div>
                    {skinPreview && (
                      <div className="mt-4">
                        <Image src={skinPreview} alt="Skin Preview" width={200} height={200} />
                        <Button onClick={handleSkinConfirm} className="mt-2">Confirm Skin</Button>
                      </div>
                    )}
                  </div>
                )
              case "Crypto Wallet":
                return <CryptoPayment creatorTelegramId={user?.telegram_id.toString() || "413553377"}/>
              case "Events":
                return <CreateEvent />
              case "Rents":
                return <Rents />
              case "Versimcel":
                return (
                  <DragDropContext onDragEnd={handleDragEnd}>
                    <div className="space-y-4">
                      <p>{currentStoryStage.storyContent}</p>
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
                            Drop errors here
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
                    <p>{currentStoryStage.storyContent}</p>
                    <Input
                      placeholder="Enter GitHub repo"
                      value={gptInput}
                      onChange={(e) => setGptInput(e.target.value)}
                    />
                    <Button onClick={handleGptInteraction}>Search Repo</Button>
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
                return <p>Unknown event type</p>
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
              style={{ width: user?.game_state.progress }}
            ></div>
          </div>
        </CardContent>
      </Card>
      {showBottomShelf && <BottomShelf />}
    </div>
  )
}
