'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useAppContext } from '@/context/AppContext'
import { useGameProgression } from '@/hooks/useGameProgression'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Zap, Car, Users, Dice1, Coins, CreditCard, Shield, GitBranch } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useTheme } from '@/hooks/useTheme'

interface UnlockChoiceProps {
  onClose: () => void
  currentStage: number
  isDevMode?: boolean
}

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

interface Skill {
  id: number
  parentid: number | null
  stage: number
  storycontent: string
  xuinitydialog: string
  trigger: string
  activecomponent: string
  minigame: string
  achievement: string
  bottomshelfbitmask: number
  level: number
  prerequisites: number[]
}

const UnlockChoice: React.FC<UnlockChoiceProps> = ({ onClose, currentStage, isDevMode }) => {
  const { state, dispatch, t, storyStages } = useAppContext()
  const { progressStage } = useGameProgression()
  const [skills, setSkills] = useState<Skill[]>([])
  const [columns, setColumns] = useState(3)
  const { theme } = useTheme()

  useEffect(() => {
    const handleResize = () => {
      setColumns(window.innerWidth < 640 ? 1 : window.innerWidth < 1024 ? 2 : 3)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    const enhancedSkills = storyStages.map(stage => ({
      ...stage,
      level: stage.parentid ? stage.parentid : (Math.floor(Math.random() * 5) + 1), // Random level between 1 and 5
      prerequisites: stage.parentid ? [stage.parentid] : []
    }))
    setSkills(enhancedSkills)
  }, [storyStages])

  const handleUnlock = async (component: string, nextStage: number) => {
    await progressStage(nextStage, [component])
    dispatch({
      type: 'UPDATE_GAME_STATE',
      payload: { 
        stage: nextStage, 
        unlockedComponents: [...(state.user?.game_state?.unlockedComponents || []), component] 
      }
    })
    onClose()
  }

  const getIconComponent = (activeComponent: string) => {
    switch (activeComponent.toLowerCase()) {
      case 'crypto wallet': return CreditCard
      case 'events': return Zap
      case 'rents': return Car
      case 'versimcel': return Shield
      case 'github': return GitBranch
      default: return Dice1
    }
  }

  const isSkillUnlockable = (skill: Skill) => {
    return skill.prerequisites.every(prereq => 
      state.user?.game_state?.unlockedComponents?.includes(
        skills.find(s => s.id === prereq)?.activecomponent || ''
      )
    )
  }

  const getRandomGlitchEffect = () => {
    const effects = [
      'animate-glitch-1',
      'animate-glitch-2',
      'animate-glitch-3',
      'animate-flicker',
      'animate-distort',
    ]
    return effects[Math.floor(Math.random() * effects.length)]
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[90vw] h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('chooseUnlock')}</DialogTitle>
        </DialogHeader>
        <div className="relative grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          <AnimatePresence>
            {skills.map((skill, index) => {
              const IconComponent = getIconComponent(skill.activecomponent)
              const glitchEffect = getRandomGlitchEffect()

              return (
                <motion.div
                  key={skill.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.3, delay: Math.random() * 0.5 }}
                  className={glitchEffect}
                >
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Card className={`w-full bg-card hover:bg-card/90 transition-colors duration-200 ${isSkillUnlockable(skill) ? 'border-primary' : 'border-muted'}`}>
                          <CardHeader>
                            <CardTitle className="flex items-center">
                              <IconComponent className="mr-2" />
                              {t(skill.activecomponent)}
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="mb-2">{skill.storycontent.substring(0, 50)}...</p>
                            <div className="flex justify-between items-center">
                              <div className="flex items-center">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Zap key={i} className={`w-4 h-4 ${i < skill.level ? 'text-yellow-400' : 'text-gray-300'}`} />
                                ))}
                              </div>
                              <Button 
                                onClick={() => handleUnlock(skill.activecomponent, skill.stage + 1)}
                                disabled={!isSkillUnlockable(skill)}
                                size="sm"
                              >
                                {t(`unlock`)}
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{skill.xuinitydialog}</p>
                        <p>Achievement: {skill.achievement}</p>
                        {skill.prerequisites.length > 0 && (
                          <p>Prerequisites: {skill.prerequisites.map(prereq => 
                            skills.find(s => s.id === prereq)?.activecomponent
                          ).join(', ')}</p>
                        )}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </motion.div>
              )
            })}
            {/* Prerequisite arrows */}
          {/* <svg className="absolute top-0 left-0 w-full h-full pointer-events-none">
            <defs>
              <marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="7"
                refX="0"
                refY="3.5"
                orient="auto"
              >
                <polygon points="0 0, 10 3.5, 0 7" fill={theme.colors.primary.hex} />
              </marker>
            </defs>
            {skills.map(skill => 
              skill.prerequisites.map(prereqId => {
                const prereq = skills.find(s => s.id === prereqId)
                if (prereq) {
                  const startX = (skills.indexOf(prereq) % columns) * (100 / columns) + (100 / columns / 2)
                  const startY = Math.floor(skills.indexOf(prereq) / columns) * 200 + 150
                  const endX = (skills.indexOf(skill) % columns) * (100 / columns) + (100 / columns / 2)
                  const endY = Math.floor(skills.indexOf(skill) / columns) * 200 + 50
                  return (
                    <line 
                      key={`${skill.id}-${prereqId}`}
                      x1={`${startX}%`} 
                      y1={startY} 
                      x2={`${endX}%`} 
                      y2={endY} 
                      stroke={theme.colors.primary.hex}
                      strokeWidth="2"
                      strokeDasharray="5,5"
                      opacity="0.42"
                      markerEnd="url(#arrowhead)"
                    />
                  )
                }
                return null
              })
            )}
          </svg> */}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default UnlockChoice