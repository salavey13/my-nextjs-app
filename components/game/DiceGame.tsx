"use client"

import React, { useState, useEffect, useRef, Suspense } from 'react'
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
import { Box, Text, useTexture } from '@react-three/drei'
import { Physics, useBox, usePlane } from '@react-three/cannon'
import { Mesh, Vector3, Quaternion, Euler } from 'three'
import LoadingSpinner from '../ui/LoadingSpinner'
import * as THREE from 'three';
import { useTheme } from '@/hooks/useTheme'

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

interface DiceProps {
  position: [number, number, number]
  onRollComplete: (value: number) => void
  customTextures?: string[]
  gyro: { x: number; y: number; z: number }
  isRolling: boolean
  initialValue: number
}

// Define an interface for the face
interface Face {
    normal: THREE.Vector3;
    value: number;
  }

function Dice({ position, onRollComplete, customTextures, gyro, isRolling, initialValue }: DiceProps) {
  const [ref, api] = useBox<Mesh>(() => ({ mass: 1, position }))
  const textures = useTexture(customTextures || [
    '/dice/face_1.png',
    '/dice/face_2.png',
    '/dice/face_3.png',
    '/dice/face_4.png',
    '/dice/face_5.png',
    '/dice/face_6.png',
  ])
  const velocityRef = useRef<Vector3>(new Vector3())
  const angularVelocityRef = useRef<Vector3>(new Vector3())
  const stableFrames = useRef(0)
  const { theme } = useTheme()

  useFrame(() => {
    // Update velocity and angular velocity references
    api.velocity.subscribe((v) => velocityRef.current.set(v[0], v[1], v[2]));
    api.angularVelocity.subscribe((v) => angularVelocityRef.current.set(v[0], v[1], v[2]));
  
    // Apply gyro-based force
    api.applyForce([gyro.x * 5, gyro.y * 5, gyro.z * 5], [0, 0, 0]);
  
    // Check for stability and rolling state
    if (isRolling) {
      if (velocityRef.current.length() < 0.1 && angularVelocityRef.current.length() < 0.1) {
        stableFrames.current += 1;
        if (stableFrames.current > 13) { // Wait for 13 frames of stability
          const rotation = ref.current?.rotation;
          if (rotation) {
            // Create a new Matrix4 from Euler rotation
            const rotationMatrix = new THREE.Matrix4();
            rotationMatrix.makeRotationFromEuler(rotation); // Convert Euler to Matrix4
  
            // Get the dice value based on rotation matrix
            const value = getDiceValue(rotationMatrix);
            onRollComplete(value);
          }
        }
      } else {
        stableFrames.current = 0;
      }
    }
  });
  

  // Dice face normals based on their texture index
const faceNormals = [
    { normal: { x: 0, y: 1, z: 0 }, value: 1 }, // Top face (face 1)
    { normal: { x: 0, y: -1, z: 0 }, value: 6 }, // Bottom face (face 6)
    { normal: { x: 0, y: 0, z: 1 }, value: 2 }, // Front face (face 2)
    { normal: { x: 0, y: 0, z: -1 }, value: 5 }, // Back face (face 5)
    { normal: { x: -1, y: 0, z: 0 }, value: 4 }, // Left face (face 4)
    { normal: { x: 1, y: 0, z: 0 }, value: 3 }, // Right face (face 3)
  ];
  
  // Function to calculate dot product between two vectors
  function dotProduct(v1: { x: number; y: number; z: number }, v2: { x: number; y: number; z: number }): number {
    return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
  }
  
// Function to get the dice value based on its current orientation
function getDiceValue(rotationMatrix: THREE.Matrix4): number {
    // Define face normals corresponding to each face of the dice
    const faceNormals: Face[] = [
      { normal: new THREE.Vector3(0, 1, 0), value: 1 }, // Top face (value = 1)
      { normal: new THREE.Vector3(0, -1, 0), value: 6 }, // Bottom face (value = 6)
      { normal: new THREE.Vector3(1, 0, 0), value: 3 }, // Right face (value = 3)
      { normal: new THREE.Vector3(-1, 0, 0), value: 4 }, // Left face (value = 4)
      { normal: new THREE.Vector3(0, 0, 1), value: 5 }, // Front face (value = 5)
      { normal: new THREE.Vector3(0, 0, -1), value: 2 }, // Back face (value = 2)
    ];
  
    // World up vector
    const worldUp = new THREE.Vector3(0, 1, 0);
  
    // Apply the dice's rotation matrix to the face normals
    const transformedNormals: Face[] = faceNormals.map(face => {
      const transformedNormal = face.normal.clone().applyMatrix4(rotationMatrix);
      return { normal: transformedNormal, value: face.value };
    });
  
    // Debug: log transformed normals
    console.log("Transformed Normals:");
    transformedNormals.forEach((face, idx) => {
      console.log(`Face ${idx + 1}:`, face);
    });
  
    // Find the face whose normal is most aligned with the world up vector
    let closestFace = transformedNormals[0];
    let closestDotProduct = -Infinity;
  
    transformedNormals.forEach(face => {
      const dotProduct = face.normal.dot(worldUp); // Dot product between transformed normal and world up
      console.log(`Dot product for face value ${face.value}: ${dotProduct}`);
      if (dotProduct > closestDotProduct) {
        closestDotProduct = dotProduct;
        closestFace = face;
      }
    });
  
    // Debug: log closest face and dot product
    console.log("Closest face value:", closestFace.value);
    console.log("Closest dot product:", closestDotProduct);
  
    return closestFace.value; // Return the dice face value that is most upward
  }
  
  
  
  

  useEffect(() => {
    if (isRolling) {
      const force = 10
      api.velocity.set(
        (Math.random() - 0.5) * force,
        Math.random() * force + 5,
        (Math.random() - 0.5) * force
      )
      api.angularVelocity.set(
        (Math.random() - 0.5) * force * 2,
        (Math.random() - 0.5) * force * 2,
        (Math.random() - 0.5) * force * 2
      )
      stableFrames.current = 0
    }
  }, [isRolling, api])

  return (
    <Box ref={ref} args={[1, 1, 1]}>
      {textures.map((texture, index) => (
        <meshStandardMaterial key={index} map={texture} attach={`material-${index}`} />
      ))}
    </Box>
  );
}

function Wall({ position, rotation, texture }: { position: [number, number, number], rotation: [number, number, number], texture: string }) {
  const [ref] = usePlane<Mesh>(() => ({ position, rotation }))
  const wallTexture = useTexture(texture)
  
  return (
    <mesh ref={ref} receiveShadow>
      <planeGeometry args={[10, 10]} />
      <meshStandardMaterial map={wallTexture} />
    </mesh>
  )
}

function Floor() {
  const [ref] = usePlane<Mesh>(() => ({ rotation: [-Math.PI / 2, 0, 0] }))
  
  const { theme } = useTheme()
  return (
    <mesh ref={ref} receiveShadow>
      <planeGeometry args={[10, 10]} />
      <meshStandardMaterial color={theme.colors.background.hex} />
    </mesh>
  )
}

function Scene({ gameState, onRollComplete, wallTexture }: { gameState: GameState, onRollComplete: (values: [number, number]) => void, wallTexture: string }) {
  const { camera } = useThree()
  const { t } = useAppContext()
  const [gyro, setGyro] = useState({ x: 0, y: 0, z: 0 })
  const dicePositions = useRef<[Vector3, Vector3]>([new Vector3(-1, 3, 0), new Vector3(1, 3, 0)])
  const initialCameraPosition = useRef(new Vector3(10, 10, 10))
  const finalCameraPosition = useRef(new Vector3(5, 5, 5))

  const { theme } = useTheme()
  useFrame((state) => {
    const midPoint = new Vector3().addVectors(dicePositions.current[0], dicePositions.current[1]).multiplyScalar(0.5)
    
    if (state.clock.elapsedTime < 2) {
      const t = Math.min(1, state.clock.elapsedTime / 2)
      const position = new Vector3().lerpVectors(initialCameraPosition.current, finalCameraPosition.current, t)
      camera.position.copy(position)
    } else {
      camera.position.copy(finalCameraPosition.current)
    }
    
    camera.lookAt(midPoint)
  })

  useEffect(() => {
    if (typeof window !== 'undefined' && 'DeviceMotionEvent' in window) {
      window.addEventListener('devicemotion', handleMotion)
    }

    return () => {
      if (typeof window !== 'undefined' && 'DeviceMotionEvent' in window) {
        window.removeEventListener('devicemotion', handleMotion)
      }
    }
  }, [])

  const handleMotion = (event: DeviceMotionEvent) => {
    const orientation = window.screen.orientation?.angle || 0;
    let { x, y, z } = event.accelerationIncludingGravity || { x: 0, y: 0, z: 0 };

    switch (orientation) {
      case 90:
        setGyro({ x: y as number, y: -(x as number), z: z as number });
        break;
      case -90:
        setGyro({ x: -(y as number), y: x as number, z: z as number});
        break;
      case 180:
        setGyro({ x: -(x as number), y: -(y as number), z: z as number });
        break;
      default:
        setGyro({ x: y as number, y: -(z as number), z: x as number });
        break;
    }
  };

  const handleDiceRollComplete = (index: number, value: number) => {
    const newValues = [...gameState.players.find(p => p.id === gameState.currentPlayer)!.diceValues]
    newValues[index] = value
    if (newValues.every(v => v !== 0)) {
      onRollComplete(newValues as [number, number])
    }
  }

  return (
    <>
      <ambientLight intensity={1.99} />
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
        <Wall position={[0, 5, -5]} rotation={[0, 0, 0]} texture={wallTexture} />
        <Wall position={[5, 5, 0]} rotation={[0, -Math.PI / 2, 0]} texture={wallTexture} />
        <Wall position={[-5, 5, 0]} rotation={[0, Math.PI / 2, 0]} texture={wallTexture} />
        <Wall position={[0, 5, 5]} rotation={[0, Math.PI, 0]} texture={wallTexture} />
      </Physics>
      <Text
        position={[0, 6, 0]}
        fontSize={0.5}
        color={theme.colors.background.hex}
        anchorX="center"
        anchorY="middle"
        rotation={[0, Math.PI / 4, 0]} 
      >
        {`${gameState.players.find(p => p.id === gameState.currentPlayer)?.username}'s ${t('turn')}`}
      </Text>
    </>
  )
}

const DiceGame: React.FC<{ goBack: () => void }> = ({ goBack }) => {
  const { showBackButton } = useTelegram({
    onBackButtonPressed: () => {
      goBack(); // Call goBack when the back button is pressed
    },
  });

  useEffect(() => {
    showBackButton();
  }, [showBackButton]);
  const { state, t } = useAppContext()
  const { tg } = useTelegram()
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [showRules, setShowRules] = useState(false)
  const [diceRollAudio] = useState(typeof Audio !== 'undefined' ? new Audio('/dice-roll.mp3') : null)
  const [screamAudio] = useState(typeof Audio !== 'undefined' ? new Audio('/mixkit-falling-male-scream-391.mp3') : null)
  const [giggleAudio] = useState(typeof Audio !== 'undefined' ? new Audio('/mixkit-funny-giggling-2885.mp3') : null)
  const [popAudio] = useState(typeof Audio !== 'undefined' ? new Audio('/mixkit-long-pop-2358.mp3') : null)
  const [wallTexture, setWallTexture] = useState('/default-wall-texture.jpg')
  const [diceTextures, setDiceTextures] = useState<string[]>([])

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
    if (!state?.user?.currentGameId) {
      toast({
        title: t('error'),
        description: t('noActiveGame'),
        variant: "destructive",
      })
      playSound(popAudio)
      return
    }

    try {
      const { data, error } = await supabase
        .from('rents')
        .select('game_state')
        .eq('id', state?.user.currentGameId)
        .single()

      if (error) throw error

      let existingSecondPlayer: Player | null = null
      if (data.game_state && data.game_state.players && data.game_state.players.length > 1) {
        existingSecondPlayer = data.game_state.players[1]
      }

      const initialGameState: GameState = {
        players: [
          { id: String(state?.user.id), username: state?.user.telegram_username || t('player1'), score: 0, diceValues: [1, 1] },
          ...(mode !== 'single' 
            ? [existingSecondPlayer && existingSecondPlayer.id !== 'waiting'
                ? existingSecondPlayer
                : { 
                    id: mode === 'twoPlayer' ? 'waiting' : 'ai', 
                    username: mode === 'twoPlayer' ? t('waiting') : t('ai'), 
                    score: 0, 
                    diceValues: [1, 1] as [number, number]
                  }
              ] 
            : []
          ),
        ],
        currentPlayer: String(state?.user.id),
        gameMode: mode as GameState['gameMode'],
        isRolling: false,
        winner: null,
      }

      await updateGameState(initialGameState)
      playSound(giggleAudio)
    } catch (error) {
      console.error('Error starting game:', error)
      toast({
        title: t('error'),
        description: t('startGameError'),
        variant: "destructive",
      })
    }
  }

  const rollDice = async () => {
    if (!gameState || gameState.isRolling || (gameState.currentPlayer !== String(state?.user?.id) && gameState.currentPlayer !== 'ai')) return

    const updatedGameState = { ...gameState, isRolling: true }
    await updateGameState(updatedGameState)
    playSound(diceRollAudio)
  }

  const updateGameState = async (newState: GameState) => {
    if (!state?.user?.currentGameId) return

    try {
      const { error } = await supabase
        .from('rents')
        .update({ game_state: newState })
        .eq('id', state?.user.currentGameId)

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
        ? { ...player, score: player.score + 4, diceValues: newDiceValues } 
        : player
    )

    const nextPlayerIndex = (currentPlayerIndex + 1) % gameState.players.length
    const isGameOver = updatedPlayers.some(player => player.score >= 69)

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
      playSound(winner === String(state?.user?.id) ? giggleAudio : screamAudio)
    }

    if (updatedGameState.gameMode === 'ai' && updatedGameState.currentPlayer === 'ai' && !isGameOver) {
      setTimeout(() => rollDice(), 1000)
    }
  }

  

  useEffect(() => {
    const handleSubscription = async () => {
      if (!state?.user?.currentGameId) return

      const { data, error } = await supabase
        .from('rents')
        .select('game_state, loot')
        .eq('id', state?.user.currentGameId)
        .single()

      if (error) {
        console.error('Error fetching initial game state:', error)
      } else {
        setGameState(data.game_state)
        if (data.loot?.dice?.walls) {
          setWallTexture(data.loot.dice.walls)
        }
        if (data.loot?.dice?.faces) {
          setDiceTextures([
            data.loot.dice.faces.face_1,
            data.loot.dice.faces.face_2,
            data.loot.dice.faces.face_3,
            data.loot.dice.faces.face_4,
            data.loot.dice.faces.face_5,
            data.loot.dice.faces.face_6,
          ])
        }
      }

      const channel = supabase
        .channel(`game_state_updates_${state?.user.currentGameId}`)
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'rents', filter: `id=eq.${state?.user.currentGameId}` },
          (payload) => {
            setGameState(payload.new.game_state)
            if (payload.new.loot?.dice?.walls) {
              setWallTexture(payload.new.loot.dice.walls)
            }
            if (payload.new.loot?.dice?.faces) {
              setDiceTextures([
                payload.new.loot.dice.faces.face_1,
                payload.new.loot.dice.faces.face_2,
                payload.new.loot.dice.faces.face_3,
                payload.new.loot.dice.faces.face_4,
                payload.new.loot.dice.faces.face_5,
                payload.new.loot.dice.faces.face_6,
              ])
            }
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }

    handleSubscription()
  }, [state?.user?.currentGameId])

  if (showRules) {
    return <Rules onClose={() => setShowRules(false)} />
  }

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <div className="game-board h-[calc(100vh-64px)] relative overflow-hidden">
        {!gameState ? (
          <div className="flex flex-col justify-center items-center min-h-[calc(100vh-64px)] flex-grow">
            <GameModes onSelectMode={startGame} onShowRules={() => setShowRules(true)} />
          </div>
        ) : (
          <div className="game-board absolute inset-0 min-h-[calc(100vh-64px)] w-full overflow-hidden">
            <Canvas shadows className="w-full h-full">
              <Scene gameState={gameState} onRollComplete={handleRollComplete} wallTexture={wallTexture} />
            </Canvas>

            <div className="absolute top-0 left-0 right-0 z-10 flex flex-col items-center space-y-6 p-4">
              <div className="flex justify-between w-full">
                {gameState.players.map((player) => (
                  <div key={player.id} className="flex flex-col items-center">
                    <div className="text-lg font-bold">{player.username}</div>
                    <div className="w-32 h-4 bg-gray-300 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-yellow-500"
                        style={{ width: `${(player.score / 69) * 100}%` }}
                      ></div>
                    </div>
                    <div className="text-sm mt-1">{player.score} / 69</div>
                    {gameState.currentPlayer === player.id && (
                      <div className="text-sm text-yellow-500">{t('currentTurn')}</div>
                    )}
                  </div>
                ))}
              </div>

              {gameState.winner && (
                <div className="text-3xl font-bold">
                  {gameState.winner === String(state?.user?.id) ? t('youWon') : t('youLost')}
                </div>
              )}

              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                <Button
                  onClick={rollDice}
                  variant="outline"
                  disabled={gameState.isRolling || (gameState.currentPlayer !== String(state?.user?.id) && gameState.currentPlayer !== 'ai')}
                  className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-4 px-8 rounded-lg"
                >
                  {gameState.isRolling ? t('rolling') : t('rollDice')}
                </Button>
              </div>
            </div>
          </div>
        )}
        <div className="absolute bottom-4 left-4 z-99">
          <Button onClick={toggleSound} variant="ghost" size="icon" >
            <FontAwesomeIcon icon={soundEnabled ? faVolumeUp : faVolumeMute} />
          </Button>
        </div>
      </div>
    </Suspense>
  )
}

export default DiceGame
