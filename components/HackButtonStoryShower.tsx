// CSV stages for Supabase story_stages table:
/*
id,parentid,stage,storycontent,xuinitydialog,trigger,activecomponent,minigame,achievement,bottomshelfbitmask
1,,0,"Welcome to the system. You are about to dive into a world of endless possibilities.","Greetings, user. I am Xuinity. Let me guide you in shaping the world in ways only we can... for now.","Start Game","None","","Welcome to the System",1
2,1,1,"System Crash: The system just crashed. Was it a mistake? Or are you meant to do more?","Oops. A little crash. Or perhaps you're starting to challenge the system itself?","Hack Button Clicked","Hack Button","hack","First Hack",3
3,2,2,"You've executed your first hack. Cracks are forming in the system.","Nice work. The cracks you see? They’re not flaws, they’re opportunities. Let's push further.","Yes Chosen","Skins","","Hacker Initiate",7
4,3,3,"You've unlocked a new skin! Next, I’ll show you crypto. An underground currency with infinite potential.","Ah, the digital underground. Crypto is more than just currency. It's a tool to reshape control.","Skin Selected","Crypto Wallet","","Crypto Novice",15
5,4,4,"Now that you hold crypto, you can join events and place unlosable bets. The digital battlefield is yours.","Crypto in hand, it’s time to play the bigger game. Events, bets – control is won in the shadows.","Crypto Introduced","Events","","Event Participant",31
6,5,5,"You've participated in events and placed your first bets. Want to know the real power? Let’s talk rentals.","Renting assets... now you’re thinking like a master. Control what others depend on.","Event Participated","Rents","","Rent Explorer",63
7,6,6,"The system falters again. But this time, Versimcel appears – your key to debugging reality.","Ah, Versimcel. The one glitch that could rewrite everything. Debug it... or bend it to your will.","Rent Explored","Versimcel","debug","Versimcel Encounter",127
8,7,7,"You've reached the admin level. It's time for some real source code hunting on GitHub. This is where legends are made.","Admin level... you’ve seen the surface, but here lies the true power: source control. Tread wisely.","Debug Complete","GitHub","","Admin Access",255
9,4,3,"Side Hustle: QR Code Generation for custom offers and tactics.","QR codes? You’ve unlocked a tool for crafting your own digital footprint. Use it smartly.","QR Code Form Discovered","QR Code Form","","QR Code Master",23
10,5,4,"Side Hustle: Dynamic Form Creation for items. This is where you start revolutionizing the system.","Dynamic forms? Now you’re reshaping the fabric of this world. Revolution starts small.","Dynamic Form Created","Dynamic Item Form","","Form Wizard",47
11,6,5,"Side Hustle: Payment Notifications – because you need to track the flow of digital assets.","Money... the ultimate form of power. Track it, control it, become unstoppable.","Payment System Integrated","Payment Notification","","Financial Overseer",95
12,7,6,"Side Hustle: Conflict Awareness – sometimes chaos is the only answer.","Chaos is power. Do you wield it for control or let it consume you? Either way, it’s potent.","Conflict Module Activated","Conflict Awareness","","Chaos Navigator",191
13,5,4,"Xuinity reveals a deeper strategy: Rent the digital assets now or bet them later. It’s a win-win if you know the game.","Rent or bet? Both have their merits, but timing is key. You want to own the board? Play smart.","Renting Strategy Revealed","Rent Strategy","","Strategist",63
14,6,5,"Xuinity suggests taking unlosable bets against uninformed opponents... or sparing them for a greater cause.","A dilemma. Exploit the uninformed or spare them for a greater cause? Either path grants power.","Crypto Hustle Unveiled","Crypto Hustle","","Crypto Hustler",127
15,6,5,"Xuinity proposes forking: create a new layer of control, bypass restrictions, and rise above the system.","Fork the system. Play outside the rules, and you’ll never lose. This is where true power lies.","Forking Concept Introduced","Fork","fork","System Forker",255
*/
'use client'

import React, { useState, useEffect, useCallback } from 'react'
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
import { Input } from '@/components/ui/input'
import { debounce } from 'lodash'

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
  const { state, dispatch, getSideHustleTrigger, t } = useAppContext()
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

  useEffect(() => {
    const checkHackButton = () => {
      const firstGamePlayed = localStorage.getItem('firstGamePlayed')
      if (firstGamePlayed && !state.hackButtonVisible) {
        dispatch({ type: 'SHOW_HACK_BUTTON' })
      }
    }

    window.addEventListener('load', checkHackButton)
    return () => {
      window.removeEventListener('load', checkHackButton)
    }
  }, [state.hackButtonVisible, dispatch])

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
          targetNumber: Math.floor(Math.random() * 13) + 1,
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
          title: t('achievementUnlocked'),
          description: nextStage.achievement,
          stage: nextStage.stage,
          lang: state.user.lang,
        })

        if (nextStage.stage === 1 || nextStage.stage === 6) {
          setShowCrashSimulation(true)
          setTimeout(() => setShowCrashSimulation(false), 5000)
        }

        const sideHustle = getSideHustleTrigger(nextStage.stage)
        if (sideHustle && sideHustle.trigger === nextStage.trigger) {
          toast({
            title: t('sideHustleUnlocked'),
            description: sideHustle.storyContent,
            stage: nextStage.stage,
            lang: state.user.lang,
          })
        }
      } catch (error) {
        console.error('Error updating game state:', error)
        toast({
          title: t('error'),
          description: t('failedToProgress'),
          variant: "destructive",
        })
      }
    }
  }

  const simulateGitHubSourceRetrieval = async () => {
    // ... (unchanged)
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
              {t('dropErrorsHere')}
            </div>
          </DragDropContext>
        )
      case 'hack':
        return (
          <div className="space-y-4">
            <p>{t('guessNumber')}</p>
            <Input
              type="number"
              min="1"
              max="13"
              className="border p-2 rounded"
              onChange={handleHackGuessDebounced}
            />
            <p>{t('attempts', { count: minigameState.attempts })}</p>
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
    // ... (unchanged)
  }

  const handleGitHubDragEnd = (result: DropResult) => {
    // ... (unchanged)
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
        title: t('hackingSuccessful'),
        description: t('guessedNumber', { attempts: newAttempts }),
        stage: currentStage?.stage,
        lang: state.user?.lang,
      })
      handleStageProgression()
    } else if (newAttempts >= 3) {
      toast({
        title: t('hackingFailed'),
        description: t('outOfAttempts'),
        variant: 'error',
      })
      initializeMinigame('hack')
    } else {
      toast({
        title: t('incorrectGuess'),
        description: guess > (minigameState.targetNumber || 0) ? t('tooHigh') : t('tooLow'),
      })
    }
  }

  const handleHackGuessDebounced = useCallback(
    debounce((e: React.ChangeEvent<HTMLInputElement>) => {
      const guess = parseInt(e.target.value)
      if (!isNaN(guess)) {
        handleHackGuess(guess)
      }
    }, 500),
    [minigameState]
  )

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
            <p className="text-lg font-semibold">{t('xuinitySays')}:</p>
            <p className="italic">{xuinityDialog}</p>
            {currentStage?.trigger === 'User Input Required' && (
              <Button onClick={handleStageProgression} className="mt-2">
                {t('continue')}
              </Button>
            )}
          </motion.div>
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
