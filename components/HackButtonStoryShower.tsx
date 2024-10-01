import React, { useState, useEffect } from 'react'
import { GameSettings, useAppContext } from '@/context/AppContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabaseClient'
import { motion, AnimatePresence } from 'framer-motion'
import { DragDropContext, Draggable, Droppable, DropResult } from 'react-beautiful-dnd'
import BottomShelf from '@/components/ui/bottomShelf'
import InfinityMirror from '@/components/game/InfinityMirror'
import { Settings } from '@/components/game/Settings'

// CSV stages for Supabase story_stages table:
/*
id,parentId,stage,storyContent,xuinityDialog,trigger,activeComponent,minigame,achievement,bottomShelfBitmask
1,,0,"Welcome to the system. You are about to dive into a world of simple games.","Greetings, human. I am Xuinity. Are you ready to begin your journey?","Start Game","None","","Welcome to the System",1
2,1,1,"System Crash: Looks like you've broken something. Was it a mistake, or is this all part of a deeper game?","Interesting. You've triggered a system crash. Perhaps there's more to you than meets the eye.","Hack Button Clicked","Hack Button","hack","First Hack",3
3,2,2,"You've made your first hack! A new world of possibilities opens up.","Well done. You're starting to see the cracks in the system. Let's see how far you can go.","Yes Chosen","Skins","","Hacker Initiate",7
4,3,3,"Congratulations on your new skin! Now, let's introduce you to the world of crypto.","Ah, crypto. The lifeblood of the digital underground. Use it wisely.","Skin Selected","Crypto Wallet","","Crypto Novice",15
5,4,4,"With crypto in your wallet, you can now participate in events and place bets!","Events and bets. A playground for those who understand risk and reward.","Crypto Introduced","Events","","Event Participant",31
6,5,5,"You've experienced events and bets. Now, let's explore the world of rents!","Rents. Another way the system tries to control you. But you're learning to play the game.","Event Participated","Rents","","Rent Explorer",63
7,6,6,"The system crashes again... but this time, Versimcel appears!","Versimcel. A glitch in the system, or something more? Time to debug and find out.","Rent Explored","Versimcel","debug","Versimcel Encounter",127
8,7,7,"Welcome to the admin level. It's time for some real GitHub source hunting!","You've reached the admin level. The source code awaits. What will you discover?","Debug Complete","GitHub","","Admin Access",255
9,4,3.1,"Side Hustle: QR Code Form","Interesting. You've discovered a way to create custom QR codes. This could be useful for... certain operations.","QR Code Form Discovered","QR Code Form","","QR Code Master",23
10,5,4.1,"Side Hustle: Dynamic Item Form","A dynamic item form? Now we're talking. This could revolutionize how we manage inventory.","Dynamic Form Created","Dynamic Item Form","","Form Wizard",47
11,6,5.1,"Side Hustle: Payment Notification","Payment notifications, eh? Keep track of the money flow. Knowledge is power, after all.","Payment System Integrated","Payment Notification","","Financial Overseer",95
12,7,6.1,"Side Hustle: Conflict Awareness","Conflict awareness? Interesting choice. Sometimes, chaos can be... beneficial.","Conflict Module Activated","Conflict Awareness","","Chaos Navigator",191
*/

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

interface MinigameState {
  type: string;
  errors?: string[];
  targetNumber?: number;
  attempts?: number;
}

export default function HackButtonStoryShower() {
  const { state, dispatch } = useAppContext()
  const [currentStage, setCurrentStage] = useState<StoryStage | null>(null)
  const [storyStages, setStoryStages] = useState<StoryStage[]>([])
  const [xuinityDialog, setXuinityDialog] = useState('')
  const [minigameState, setMinigameState] = useState<MinigameState | null>(null)
  const [showBottomShelf, setShowBottomShelf] = useState(false)
  const [showCrashSimulation, setShowCrashSimulation] = useState(false)

  useEffect(() => {
    fetchStoryStages()
  }, [])

  useEffect(() => {
    if (storyStages.length > 0 && state.user?.game_state?.stage !== undefined) {
      const stage = storyStages.find(s => s.stage === state.user?.game_state.stage)
      if (stage) {
        setCurrentStage(stage)
        setXuinityDialog(stage.xuinityDialog)
        initializeMinigame(stage.minigame)
        setShowBottomShelf(stage.bottomShelfBitmask > 1)
      }
    }
  }, [storyStages, state.user?.game_state?.stage])

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

  const handleStageProgression = async () => {
    if (!currentStage || !state.user) return

    const nextStage = storyStages.find(s => s.parentId === currentStage.id)
    if (nextStage) {
      const updatedGameState = {
        ...state.user.game_state,
        stage: nextStage.stage,
      }

      try {
        const { error } = await supabase
          .from('users')
          .update({ game_state: updatedGameState })
          .eq('id', state.user.id)

        if (error) throw error

        dispatch({ type: 'UPDATE_GAME_STATE', payload: updatedGameState })
        setCurrentStage(nextStage)
        setXuinityDialog(nextStage.xuinityDialog)
        initializeMinigame(nextStage.minigame)
        setShowBottomShelf(nextStage.bottomShelfBitmask > 1)

        toast({
          title: 'Achievement Unlocked!',
          description: nextStage.achievement,
        })

        if (nextStage.stage === 1 || nextStage.stage === 6) {
          setShowCrashSimulation(true)
          setTimeout(() => setShowCrashSimulation(false), 5000)
        }
      } catch (error) {
        console.error('Error updating game state:', error)
        toast({
          title: 'Error',
          description: 'Failed to progress to the next stage',
          variant: "destructive",
        })
      }
    }
  }

  const initializeMinigame = (minigame: string) => {
    switch (minigame) {
      case 'debug':
        setMinigameState({
          type: 'debug',
          errors: ['Error 1', 'Error 2', 'Error 3'],
        })
        break
      case 'hack':
        setMinigameState({
          type: 'hack',
          targetNumber: Math.floor(Math.random() * 100) + 1,
          attempts: 0,
        })
        break
      default:
        setMinigameState(null)
    }
  }

  const renderMinigame = () => {
    if (!minigameState) return null

    switch (minigameState.type) {
      case 'debug':
        return (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="errors">
              {(provided) => (
                <ul {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                  {minigameState.errors?.map((error, index) => (
                    <Draggable key={error} draggableId={error} index={index}>
                      {(provided) => (
                        <li
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="bg-red-100 p-2 rounded"
                        >
                          {error}
                        </li>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </ul>
              )}
            </Droppable>
            <div className="mt-4 border-2 border-dashed border-gray-300 p-4 rounded">
              Drop errors here to fix
            </div>
          </DragDropContext>
        )
      case 'hack':
        return (
          <div className="space-y-4">
            <p>Guess the number between 1 and 100:</p>
            <input
              type="number"
              className="border p-2 rounded"
              onChange={(e) => handleHackGuess(parseInt(e.target.value))}
            />
            <p>Attempts: {minigameState.attempts}</p>
          </div>
        )
      default:
        return null
    }
  }

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination || !minigameState || !minigameState.errors) return

    const newErrors = Array.from(minigameState.errors)
    const [reorderedItem] = newErrors.splice(result.source.index, 1)
    newErrors.splice(result.destination.index, 0, reorderedItem)

    setMinigameState({
      ...minigameState,
      errors: newErrors,
    })

    if (newErrors.length === 0) {
      toast({
        title: 'Debugging Complete',
        description: 'You\'ve fixed all the errors!',
      })
      handleStageProgression()
    }
  }

  const handleHackGuess = (guess: number) => {
    if (!minigameState || minigameState.type !== 'hack') return

    const newAttempts = (minigameState.attempts || 0) + 1
    setMinigameState({
      ...minigameState,
      attempts: newAttempts,
    })

    if (guess === minigameState.targetNumber) {
      toast({
        title: 'Hacking Successful',
        description: `You guessed the number in ${newAttempts} attempts!`,
      })
      handleStageProgression()
    } else if (newAttempts >= 10) {
      toast({
        title: 'Hacking Failed',
        description: 'You\'ve run out of attempts. Try again!',
      })
      initializeMinigame('hack')
    } else {
      toast({
        title: 'Incorrect Guess',
        description: guess > (minigameState.targetNumber || 0) ? 'Too high!' : 'Too low!',
      })
    }
  }

  return (
    <div className="space-y-6 relative">
      {showCrashSimulation && (
        <div className="fixed inset-0 z-50">
          <InfinityMirror layers={10} baseColor="#000000" accentColor="#ff0000" />
        </div>
      )}
      <Card>
        <CardHeader>
          <CardTitle>Stage {currentStage?.stage}: {currentStage?.storyContent}</CardTitle>
        </CardHeader>
        <CardContent>
          {renderMinigame()}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="fixed top-4 right-4 bg-background p-4 rounded-lg shadow-lg z-40"
          >
            <p className="text-lg font-semibold">Xuinity says:</p>
            <p className="italic">{xuinityDialog}</p>
            {currentStage?.trigger === 'User Input Required' && (
              <Button onClick={handleStageProgression} className="mt-2">
                Continue
              </Button>
            )}
          </motion.div>
          <Button onClick={handleStageProgression} className="mt-4">
            Continue
          </Button>
        </CardContent>
      </Card>
      {showBottomShelf && <BottomShelf bitmask={currentStage?.bottomShelfBitmask || 0} />}
      <Settings
        onUpdateSettings={(settings: GameSettings) => {
          // Update user's game state with new settings
          if (state.user) {
            const updatedGameState = {
              ...state.user.game_state,
              settings: settings,
            }
            dispatch({ type: 'UPDATE_GAME_STATE', payload: updatedGameState })
          }
        }}
        initialSettings={state.user?.game_state?.settings}
      />
    </div>
  )
}