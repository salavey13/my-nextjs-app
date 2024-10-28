'use client'

import React, { useState, useEffect, useCallback } from 'react';
import { useAppContext } from '@/context/AppContext';
import { useGameProgression } from '@/hooks/useGameProgression';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Zap, Car, Users, Dice1, Coins, CreditCard, Shield, GitBranch } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import storiRealStages  from '@/lib/storyStages'
import { motion } from 'framer-motion'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

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
  const { state, dispatch, t, storyStages } = useAppContext();
  const { progressStage, simulateCrash } = useGameProgression();
  const [showSideHustleModal, setShowSideHustleModal] = useState(false);
  //const [storyStages, setStoryStages] = useState<StoryStage[]>([]);
  // const [currentUnlockOptions, setCurrentUnlockOptions] = useState<StoryStage[]>([]);
  // const [sideHustles, setSideHustles] = useState<StoryStage[]>([]);
  // const [showAutomationPipeline, setShowAutomationPipeline] = useState(false);
  // const [currentComponent, setCurrentComponent] = useState('');
  const [unlockOptions, setUnlockOptions] = useState<any[]>([])
  const [skills, setSkills] = useState<Skill[]>([])


//   useEffect(() => {
//     const fetchStoryStages = async () => {
//       const { data, error } = await supabase
//         .from('story_stages')
//         .select('*')
//         .order('stage', { ascending: true });

//       if (error) {
//         console.error('Error fetching story stages:', error);
//       } else {
//         setStoryStages(data || []);
//       }
//     };

//     fetchStoryStages();
//   }, []);
// const fetchStoryStages = useCallback(async () => {
//     setStoryStages(storiRealStages)
//   }, [])
  
//   useEffect(() => {
//     fetchStoryStages()
//   }, [fetchStoryStages])

  // useEffect(() => {
  //   const options = storyStages.filter(stage => stage.stage === currentStage && stage.parentid === null)
  //   setUnlockOptions(options)
  // }, [currentStage])

  useEffect(() => {
    const enhancedSkills = storyStages.map(stage => ({
      ...stage,
      level: Math.floor(Math.random() * 5) + 1, // Random level between 1 and 5
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

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[80vw] h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('chooseUnlock')}</DialogTitle>
        </DialogHeader>
        <div className="relative">
          {skills.map((skill, index) => {
            const IconComponent = getIconComponent(skill.activecomponent)
            const xPos = (index % 3) * 33 + 10
            const yPos = Math.floor(index / 3) * 200 + 50

            return (
              <motion.div
                key={skill.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                style={{ position: 'absolute', left: `${xPos}%`, top: `${yPos}px` }}
              >
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Card className={`w-64 bg-card hover:bg-card/90 transition-colors duration-200 ${isSkillUnlockable(skill) ? 'border-primary' : 'border-muted'}`}>
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
                              {t(`unlock${skill.activecomponent.charAt(0).toUpperCase() + skill.activecomponent.slice(1)}`)}
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
          {skills.map(skill => 
            skill.prerequisites.map(prereqId => {
              const prereq = skills.find(s => s.id === prereqId)
              if (prereq) {
                const startX = (skills.indexOf(prereq) % 3) * 33 + 22
                const startY = Math.floor(skills.indexOf(prereq) / 3) * 200 + 150
                const endX = (skills.indexOf(skill) % 3) * 33 + 22
                const endY = Math.floor(skills.indexOf(skill) / 3) * 200 + 50
                return (
                  <svg key={`${skill.id}-${prereqId}`} className="absolute top-0 left-0 w-full h-full pointer-events-none">
                    <line 
                      x1={`${startX}%`} 
                      y1={startY} 
                      x2={`${endX}%`} 
                      y2={endY} 
                      stroke="currentColor" 
                      strokeWidth="2"
                      strokeDasharray="5,5"
                    />
                  </svg>
                )
              }
              return null
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
};

export default UnlockChoice;