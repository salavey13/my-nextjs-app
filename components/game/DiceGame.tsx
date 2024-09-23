"use client"

import React, { useState, useEffect, useRef } from 'react'
import { useAppContext } from '@/context/AppContext'
import { supabase } from '@/lib/supabaseClient'
import { Button } from "@/components/ui/button"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faVolumeUp, faVolumeMute, faArrowLeft } from '@fortawesome/free-solid-svg-icons'
import GameModes from './GameModes'
import Rules from './Rules'
import useTelegram from '@/hooks/useTelegram'
import { toast } from "@/hooks/use-toast"
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Box, Text, useTexture, Environment } from '@react-three/drei'
import { Physics, useBox, usePlane } from '@react-three/cannon'
import { Mesh, Vector3, Quaternion, Euler } from 'three'

interface Player {
  id: string
  username: string
  score: number
  diceValues: [number, number]
}

interface GameState {
  players: Player[]
  currentPlayer: string
  gameMode: 'single' | 'twoPlayer' | 'ai' | 'random'
  isRolling: boolean
  winner: string | null
}

// SVG textures for dice faces
const createDiceFace = (dots: [number, number][]) => {
  const svgString = `
    <svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">
      <rect width="128" height="128" fill="black" />
      ${dots.map(([cx, cy]) => `<circle cx="${cx}" cy="${cy}" r="10" fill="#e1ff01" />`).join('')}
    </svg>
  `
  const blob = new Blob([svgString], { type: 'image/svg+xml' })
  return URL.createObjectURL(blob)
}

const diceFaceUrls = [
  createDiceFace([[64, 64]]),
  createDiceFace([[32, 32], [96, 96]]),
  createDiceFace([[32, 32], [64, 64], [96, 96]]),
  createDiceFace([[32, 32], [32, 96], [96, 32], [96, 96]]),
  createDiceFace([[32, 32], [32, 96], [64, 64], [96, 32], [96, 96]]),
  createDiceFace([[32, 32], [32, 64], [32, 96], [96, 32], [96, 64], [96, 96]]),
]

interface DiceProps {
  position: [number, number, number]
  onRollComplete: (value: number) => void
  customTextures?: string[]
  gyro: { x: number; y: number; z: number }
  isRolling: boolean
  initialValue: number
}

function Dice({ position, onRollComplete, customTextures, gyro, isRolling, initialValue }: DiceProps) {
    const [ref, api] = useBox<Mesh>(() => ({ mass: 1, position }))
    const textures = useTexture(customTextures || diceFaceUrls)
    const velocityRef = useRef<Vector3>(new Vector3())
    const angularVelocityRef = useRef<Vector3>(new Vector3())

  useFrame(() => {
    api.velocity.subscribe((v) => velocityRef.current.set(v[0], v[1], v[2]))
    api.angularVelocity.subscribe((v) => angularVelocityRef.current.set(v[0], v[1], v[2]))

    // Apply gyro force
    api.applyForce([gyro.x * 5, gyro.y * 5, gyro.z * 5], [0, 0, 0])

    if (isRolling && velocityRef.current.length() < 0.1 && angularVelocityRef.current.length() < 0.1) {
      const rotation = ref.current?.rotation
      if (rotation) {
        const value = getDiceValue(rotation)
        onRollComplete(value)
      }
    }
  })

  useEffect(() => {
    if (isRolling) {
      const force = 15
      api.velocity.set(
        (Math.random() - 0.5) * force,
        Math.random() * force + 5,
        (Math.random() - 0.5) * force
      )
      api.angularVelocity.set(
        (Math.random() - 0.5) * force,
        (Math.random() - 0.5) * force,
        (Math.random() - 0.5) * force
      )
    }
  }, [isRolling, api])

  return (
    <Box
      ref={ref}
      args={[1, 1, 1]}
    >
      {textures.map((texture, index) => (
        <meshStandardMaterial
          key={index}
          map={texture}
        />
      ))}
    </Box>
  )
}

function Wall({ position, rotation }: { position: [number, number, number], rotation: [number, number, number] }) {
    const [ref] = usePlane<Mesh>(() => ({ position, rotation }))
    return (
      <mesh ref={ref} receiveShadow>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial color="#282c23" />
      </mesh>
    )
  }
  
  function Floor() {
    const [ref] = usePlane<Mesh>(() => ({ rotation: [-Math.PI / 2, 0, 0] }))
    return (
      <mesh ref={ref} receiveShadow>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial color="#282c23" />
      </mesh>
    )
  }

function getDiceValue(rotation: { x: number; y: number; z: number }): number {
  const eps = 0.1
  const isUp = (v: number) => Math.abs(v % (Math.PI * 2)) < eps
  const isDown = (v: number) => Math.abs(v % (Math.PI * 2) - Math.PI) < eps

  if (isUp(rotation.x) && isUp(rotation.z)) return 1
  if (isDown(rotation.x) && isUp(rotation.z)) return 6
  if (isUp(rotation.y) && rotation.x < 0) return 2
  if (isUp(rotation.y) && rotation.x > 0) return 5
  if (isDown(rotation.y) && rotation.x < 0) return 3
  if (isDown(rotation.y) && rotation.x > 0) return 4

  return 1 // Default to 1 if no clear face is up
}

function Scene({ gameState, onRollComplete }: { gameState: GameState, onRollComplete: (values: [number, number]) => void }) {
  const { camera } = useThree()
  const [gyro, setGyro] = useState({ x: 0, y: 0, z: 0 })

  useEffect(() => {
    camera.position.set(5, 5, 5)
    camera.lookAt(0, 0, 0)

    if (typeof window !== 'undefined' && 'DeviceMotionEvent' in window) {
      window.addEventListener('devicemotion', handleMotion)
    }

    return () => {
      if (typeof window !== 'undefined' && 'DeviceMotionEvent' in window) {
        window.removeEventListener('devicemotion', handleMotion)
      }
    }
  }, [camera])

  const handleMotion = (event: DeviceMotionEvent) => {
    setGyro({
      x: event.accelerationIncludingGravity?.x || 0,
      y: event.accelerationIncludingGravity?.y || 0,
      z: event.accelerationIncludingGravity?.z || 0,
    })
  }

  const handleDiceRollComplete = (index: number, value: number) => {
    const newValues = [...gameState.players.find(p => p.id === gameState.currentPlayer)!.diceValues]
    newValues[index] = value
    if (newValues.every(v => v !== 0)) {
      onRollComplete(newValues as [number, number])
    }
  }

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <Physics>
        <Dice
          position={[-1, 3, 0]}
          onRollComplete={(value) => handleDiceRollComplete(0, value)}
          gyro={gyro}
          isRolling={gameState.isRolling}
          initialValue={gameState.players.find(p => p.id === gameState.currentPlayer)!.diceValues[0]}
        />
        <Dice
          position={[1, 3, 0]}
          onRollComplete={(value) => handleDiceRollComplete(1, value)}
          gyro={gyro}
          isRolling={gameState.isRolling}
          initialValue={gameState.players.find(p => p.id === gameState.currentPlayer)!.diceValues[1]}
        />
        <Floor />
        <Wall position={[0, 5, -5]} rotation={[0, 0, 0]} />
        <Wall position={[5, 5, 0]} rotation={[0, -Math.PI / 2, 0]} />
        <Wall position={[-5, 5, 0]} rotation={[0, Math.PI / 2, 0]} />
      </Physics>
      <Text
        position={[0, 4, -3]}
        fontSize={0.5}
        color="#e1ff01"
      >
        {`${gameState.players.find(p => p.id === gameState.currentPlayer)?.username}'s Turn`}
      </Text>
      <Environment preset="sunset" background />
    </>
  )
}

const DiceGame: React.FC = () => {
    const { user, t } = useAppContext()
    const { tg } = useTelegram()
    const [gameState, setGameState] = useState<GameState | null>(null)
    const [soundEnabled, setSoundEnabled] = useState(true)
    const [showRules, setShowRules] = useState(false)
    const [diceRollAudio] = useState(typeof Audio !== 'undefined' ? new Audio('/dice-roll.mp3') : null)
    const [screamAudio] = useState(typeof Audio !== 'undefined' ? new Audio('/mixkit-falling-male-scream-391.mp3') : null)
    const [giggleAudio] = useState(typeof Audio !== 'undefined' ? new Audio('/mixkit-funny-giggling-2885.mp3') : null)
    const [popAudio] = useState(typeof Audio !== 'undefined' ? new Audio('/mixkit-long-pop-2358.mp3') : null)
  
    const toggleSound = () => {
      setSoundEnabled(!soundEnabled)
      if (diceRollAudio) diceRollAudio.muted = soundEnabled
      if (screamAudio) screamAudio.muted = soundEnabled
      if (giggleAudio) giggleAudio.muted = soundEnabled
      if (popAudio) popAudio.muted = soundEnabled
    }
  
    const playSound = (audio: HTMLAudioElement | null) => {
      if (soundEnabled && audio) {
        audio.play()
      }
    }
  
    const startGame = async (mode: string) => {
      if (!user?.currentGameId) {
        toast({
          title: t('error'),
          description: "No active game? What a shocker! Did you forget to turn on your brain today?",
          variant: "destructive",
        })
        playSound(popAudio)
        return
      }
  
      const initialGameState: GameState = {
        players: [
          { id: String(user.id), username: user.telegram_username || 'Player 1', score: 0, diceValues: [1, 1] },
          { id: mode === 'twoPlayer' ? 'waiting' : 'ai', username: mode === 'twoPlayer' ? 'Waiting...' : 'AI (probably smarter than you)', score: 0, diceValues: [1, 1] },
        ],
        currentPlayer: String(user.id),
        gameMode: mode as GameState['gameMode'],
        isRolling: false,
        winner: null,
      }
  
      await updateGameState(initialGameState)
      playSound(giggleAudio)
    }
  
    const rollDice = async () => {
      if (!gameState || gameState.isRolling || gameState.currentPlayer !== String(user?.id)) return
  
      const updatedGameState = { ...gameState, isRolling: true }
      await updateGameState(updatedGameState)
      playSound(diceRollAudio)
  
      setTimeout(async () => {
        const newDiceValues: [number, number] = [
          Math.floor(Math.random() * 6) + 1,
          Math.floor(Math.random() * 6) + 1,
        ]
  
        const currentPlayerIndex = gameState.players.findIndex(p => p.id === gameState.currentPlayer)
        const updatedPlayers = gameState.players.map((player, index) => 
          index === currentPlayerIndex 
            ? { ...player, score: player.score + newDiceValues[0] + newDiceValues[1], diceValues: newDiceValues } 
            : player
        )
  
        const nextPlayerIndex = (currentPlayerIndex + 1) % gameState.players.length
        const isGameOver = updatedPlayers.some(player => player.score >= 100)
  
        let winner = null
        if (isGameOver) {
          winner = updatedPlayers.reduce((maxPlayer, player) => 
            player.score > maxPlayer.score ? player : maxPlayer
          ).id
          playSound(winner === String(user?.id) ? giggleAudio : screamAudio)
        }
  
        const updatedGameState: GameState = {
          ...gameState,
          players: updatedPlayers,
          currentPlayer: isGameOver ? gameState.currentPlayer : gameState.players[nextPlayerIndex].id,
          isRolling: false,
          winner,
        }
  
        await updateGameState(updatedGameState)
  
        if (updatedGameState.gameMode === 'ai' && updatedGameState.currentPlayer === 'ai') {
          setTimeout(() => rollDice(), 1000)
        }
      }, 1000)
    }

  const updateGameState = async (newState: GameState) => {
    if (!user?.currentGameId) return

    try {
      const { error } = await supabase
        .from('rents')
        .update({ game_state: newState })
        .eq('id', user.currentGameId)

      if (error) throw error

      setGameState(newState)
    } catch (error) {
      console.error('Error updating game state:', error)
      toast({
        title: t('updateError'),
        description: t('updateErrorDescription'),
        variant: "destructive",
      })
    }
  }

  const handleRollComplete = async (newDiceValues: [number, number]) => {
    if (!gameState) return

    const currentPlayerIndex = gameState.players.findIndex(p => p.id === gameState.currentPlayer)
    const updatedPlayers = gameState.players.map((player, index) => 
      index === currentPlayerIndex 
        ? { ...player, score: player.score + newDiceValues[0] + newDiceValues[1], diceValues: newDiceValues } 
        : player
    )

    const nextPlayerIndex = (currentPlayerIndex + 1) % gameState.players.length
    const isGameOver = updatedPlayers.some(player => player.score >= 100)

    let winner = null
    if (isGameOver) {
      winner = updatedPlayers.reduce((maxPlayer, player) => 
        player.score > maxPlayer.score ? player : maxPlayer
      ).id
    }

    const updatedGameState: GameState = {
      ...gameState,
      players: updatedPlayers,
      currentPlayer: isGameOver ? gameState.currentPlayer : gameState.players[nextPlayerIndex].id,
      isRolling: false,
      winner,
    }

    await updateGameState(updatedGameState)

    if (soundEnabled) {
        playSound(winner === String(user?.id) ? giggleAudio : screamAudio)
    }

    if (updatedGameState.gameMode === 'ai' && updatedGameState.currentPlayer === 'ai') {
      setTimeout(() => rollDice(), 1000)
    }
  }

  const goBack = () => {
    setGameState(null)
    setShowRules(false)
  }

  useEffect(() => {
    tg?.MainButton?.hide()
    tg?.BackButton?.show()
    tg?.BackButton?.onClick(goBack)

    return () => {
      tg?.BackButton?.onClick(goBack)
    }
  }, [tg])

  useEffect(() => {
    const handleSubscription = async () => {
      if (!user?.currentGameId) return

      const { data, error } = await supabase
        .from('rents')
        .select('game_state')
        .eq('id', user.currentGameId)
        .single()

      if (error) {
        console.error('Error fetching initial game state:', error)
      } else {
        setGameState(data.game_state)
      }

      const channel = supabase
        .channel(`game_state_updates_${user.currentGameId}`)
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'rents', filter: `id=eq.${user.currentGameId}` },
          (payload) => {
            setGameState(payload.new.game_state)
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }

    handleSubscription()
  }, [user?.currentGameId])

  if (showRules) {
    return <Rules onClose={() => setShowRules(false)} />
  }

  return (
    <div className="flex flex-col items-stretch justify-between min-h-screen bg-gray-900 text-white p-4">
      <div className="flex justify-end mb-4">
        <Button onClick={toggleSound} variant="ghost" size="icon" className="fixed top-4 right-4 z-10">
          <FontAwesomeIcon icon={soundEnabled ? faVolumeUp : faVolumeMute} />
        </Button>
      </div>

      <h1 className="text-3xl font-bold mb-6 text-center">{t('diceGame')} (Now with 100% more sarcasm!)</h1>

      {!gameState ? (
        <GameModes onSelectMode={startGame} onShowRules={() => setShowRules(true)} />
      ) : (
        <div className="flex flex-col items-center flex-grow">
          {gameState.players.map((player, index) => (
            <div key={player.id} className="text-2xl mb-4">
              {player.username}: {player.score}
              {gameState.currentPlayer === player.id && " (Current Turn - Try not to mess it up)"}
            </div>
          ))}

          <div className="w-full h-64 mb-6 flex-grow">
            <Canvas shadows>
              <Scene gameState={gameState} onRollComplete={handleRollComplete} />
            </Canvas>
          </div>

          {gameState.winner ? (
            <div className="text-3xl font-bold mt-6">
              {gameState.winner === String(user?.id) 
                ? "Congratulations! You've won. Want a cookie?" 
                : "You lost. Shocking, I know."}
            </div>
          ) : (
            <Button
              onClick={rollDice}
              disabled={gameState.isRolling || gameState.currentPlayer !== String(user?.id)}
              className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-4 rounded-full"
            >
              {gameState.isRolling ? "Rolling (pray for luck)" : "Roll Dice (if you dare)"}
            </Button>
          )}
        </div>
      )}

      {showRules && <Rules onClose={() => setShowRules(false)} />}
    </div>
  )
}

export default DiceGame
