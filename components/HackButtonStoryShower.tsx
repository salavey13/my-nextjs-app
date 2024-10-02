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
  githubSteps?: string[];
  githubBlocks?: string[];
}

export default function HackButtonStoryShower() {
  const { state, dispatch, getSideHustleTrigger } = useAppContext()
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

        const sideHustle = getSideHustleTrigger(nextStage.stage)
        if (sideHustle && sideHustle.trigger === nextStage.trigger) {
          toast({
            title: 'Side Hustle Unlocked!',
            description: sideHustle.storyContent,
          })
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
      case 'github':
        simulateGitHubSourceRetrieval()
        break
      default:
        setMinigameState(null)
    }
  }

  const simulateGitHubSourceRetrieval = async () => {
    const steps = [
      'Getting author ID: salavey13',
      'Getting project name: my-nextjs-app',
      'Getting latest commit ID: e66a103bed7ae7d308fe3e4e4237da48ed45387c',
      'Fetching latest component file content...',
    ]

    setMinigameState({
      type: 'github',
      githubSteps: [],
      githubBlocks: [],
    })

    for (const step of steps) {
      await new Promise(resolve => setTimeout(resolve, 1000))
      setMinigameState(prevState => ({
        ...prevState!,
        githubSteps: [...(prevState?.githubSteps || []), step],
      }))
    }

    try {
      const response = await fetch('https://github.com/salavey13/my-nextjs-app/raw/e66a103bed7ae7d308fe3e4e4237da48ed45387c/components/HackButtoStoryShower.tsx')
      const content = await response.text()
      const blocks = content.split('\n\n').filter(block => block.trim() !== '')

      setMinigameState(prevState => ({
        ...prevState!,
        githubSteps: [...(prevState?.githubSteps || []), 'File content retrieved successfully'],
        githubBlocks: blocks,
      }))
    } catch (error) {
      console.error('Error fetching file content:', error)
      setMinigameState(prevState => ({
        ...prevState!,
        githubSteps: [...(prevState?.githubSteps || []), 'Error fetching file content'],
      }))
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
      case 'github':
        return (
          <div className="space-y-4">
            <div className="bg-gray-100 p-4 rounded">
              {minigameState.githubSteps?.map((step, index) => (
                <p key={index}>{step}</p>
              ))}
            </div>
            {minigameState.githubBlocks && (
              <DragDropContext onDragEnd={handleGitHubDragEnd}>
                <Droppable droppableId="githubBlocks">
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                      {minigameState.githubBlocks?.map((block, index) => (
                        <Draggable key={index} draggableId={`block-${index}`} index={index}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="bg-white p-2 rounded border"
                            >
                              <pre className="whitespace-pre-wrap">{block}</pre>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            )}
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

  const handleGitHubDragEnd = (result: DropResult) => {
    if (!result.destination || !minigameState || !minigameState.githubBlocks) return

    const newBlocks = Array.from(minigameState.githubBlocks)
    const [reorderedItem] = newBlocks.splice(result.source.index, 1)
    newBlocks.splice(result.destination.index, 0, reorderedItem)

    setMinigameState({
      ...minigameState,
      githubBlocks: newBlocks,
    })

    if (isCorrectBlockOrder(newBlocks)) {
      toast({
        title: 'GitHub Source Retrieval Complete',
        description: 'You\'ve successfully reconstructed the component!',
      })
      handleStageProgression()
    }
  }

  const isCorrectBlockOrder = (blocks: string[]) => {
    // Implement logic to check if the blocks are in the correct order
    // This is a placeholder implementation
    return true
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