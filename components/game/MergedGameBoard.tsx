import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { MegaCard, CardId } from '@/components/game/MegaCard';
import { Button } from '@/components/ui/button';
import { useAppContext } from '@/context/AppContext';
import { Settings, PhysicsSettings } from './Settings'; // Adjust the path as needed
import { useGesture } from '@use-gesture/react';

const GAME_ID = 28;

interface Point {
  x: number;
  y: number;
}

interface Card {
  id: CardId;
  position: { x: number; y: number };
  last_position: { x: number; y: number };
  flipped: boolean;
  rotations: number;
  velocity: { x: number; y: number };
  direction: { x: number; y: number };
  zIndex: number;
}

interface Player {
  id: string;
  position: { x: number; y: number };
}

interface GameState {
  cards: Card[];
  players: Player[];
}

const GameBoard: React.FC = () => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [playerPositions, setPlayerPositions] = useState<Record<string, { x: number; y: number }>>({});
  const { user, t } = useAppContext();
  const [targetFrame, setTargetFrame] = useState({ x: 400, y: 300, rotation: 0 });
  const [settingsOpen, setSettingsOpen] = useState(false); // Settings button toggle
  const [physicsParams, setPhysicsParams] = useState<PhysicsSettings>({
    yeetCoefficient: 2,
    mass: 1,
    tension: 210,
    friction: 20,
    rotationDistance: 69,
    yeetVelocityThreshold: 3.1,
    minMovementThreshold: 20,
  });

  const randomizeTargetFrame = () => {
    setTargetFrame({
      x: Math.random() * 320 + 100,
      y: Math.random() * 320 + 100,
      rotation: 0,
    });
  };

  const onCardUpdate = (updatedCard: Card) => {
    if (!gameState) return;

    const updatedCards = gameState.cards.map((card) =>
      card.id === updatedCard.id ? updatedCard : card
    );

    // Update the state locally
    const updatedGameState = { ...gameState, cards: updatedCards };
    setGameState(updatedGameState);

    // Save updated state to Supabase
    supabase
      .from('rents')
      .update({ game_state: updatedGameState })
      .eq('id', user?.currentGameId)
      .then(() => {
        console.log('Card updated successfully in Supabase');
      });
  };

  useEffect(() => {
    const handleSubscription = async () => {
      if (!user?.currentGameId) return; // Ensure gameId is available

      const { data, error } = await supabase
        .from('rents')
        .select('game_state')
        .eq('id', user?.currentGameId)
        .single();

      if (error) {
        console.error('Error fetching game state:', error);
      } else {
        setGameState(data.game_state); // Set the initial game state
      }

      const channel = supabase
        .channel('notify_game_update')
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'rents', filter: `id=eq.${user?.currentGameId}` },
          (payload) => {
            setGameState(payload.new.game_state); // Update game state with new data
          }
        )
        .subscribe();

      setSubscription(channel);

      return () => {
        supabase.removeChannel(channel); // Clean up subscription on unmount
      };
    };

    handleSubscription();
  }, [user?.currentGameId]); // Only depend on the gameId, not the gameState


  const shuffleCards = async () => {
    if (!gameState) return;

    const shuffledCards = gameState.cards
      .map((card, idx) => ({
        ...card,
        position: { x: 13/window.innerHeight, y: 0.5 }, // Stack cards vertically
        last_position: card.position,
        zIndex: Math.floor(Math.random() * 36), // Random z-index
        flipped: idx === 0 ? true : false, // Only the top card (trump) is flipped
      }))
      .sort(() => Math.random() - 0.5);

    const updatedGameState = { ...gameState, cards: shuffledCards };

    const { error } = await supabase
      .from('rents')
      .update({ game_state: updatedGameState })
      .eq('id', user?.currentGameId);

    if (error) {
      console.error('Error updating game state:', error);
    } else {
      setGameState(updatedGameState);
    }

    randomizeTargetFrame();
  };


// Add player automatically if not present
useEffect(() => {
  const addPlayerIfNeeded = async () => {
    if (!gameState || !user) return;

    const playerExists = gameState.players?.some((player) => player.id === user.id.toString());

    if (!playerExists || !gameState.players) {
      const newPlayer = {
        id: user.id.toString(),
        username: user.telegram_username,
        position: { x: Math.random() * 320/window.innerWidth, y: Math.random() * 320 / window.innerHeight },
      };
      
      const updatedPlayers = [...gameState.players?gameState.players:[], newPlayer];
      const updatedGameState = { ...gameState, players: updatedPlayers };

      const { error } = await supabase
        .from('rents')
        .update({ game_state: updatedGameState })
        .eq('id', user?.currentGameId);

      if (error) {
        console.error('Error adding player:', error);
      } else {
        setGameState(updatedGameState);
      }
    }
  };

  if (gameState) {
    addPlayerIfNeeded();
  }
}, [gameState, user]);


  const handlePositionChange = (playerId: number, newPos: Point) => {
    setPlayerPositions((prev) => ({ ...prev, [playerId]: newPos }));

    if (gameState) {
      supabase
        .from('rents')
        .update({
          game_state: {
            ...gameState,
            players: gameState.players.map((player) =>
              player.id === String(playerId) ? { ...player, position: newPos } : player
            ),
          },
        })
        .eq('id', user?.currentGameId);
    }
  };
  
  const handleUpdateSettings = (settings: PhysicsSettings) => {
    setPhysicsParams(settings);
  };

  const addPlayer = async (newPlayerId:string) => {
    if (!gameState) return;
  
    const newPlayer = { id: newPlayerId, position: { x: 200, y: 300 } }; // Initial position
  
    const updatedGameState = { ...gameState, players: [...gameState.players, newPlayer] };
  
    const { error } = await supabase
      .from('rents')
      .update({ game_state: updatedGameState })
      .eq('id', user?.currentGameId);
  
    if (error) {
      console.error('Error adding player:', error);
    } else {
      setGameState(updatedGameState);
    }
  };

  const kickPlayer = async (playerId:string) => {
    if (!gameState) return;
  
    const updatedPlayers = gameState.players.filter(player => player.id !== playerId);
  
    const updatedGameState = { ...gameState, players: updatedPlayers };
  
    const { error } = await supabase
      .from('rents')
      .update({ game_state: updatedGameState })
      .eq('id', user?.currentGameId);
  
    if (error) {
      console.error('Error kicking player:', error);
    } else {
      setGameState(updatedGameState);
    }
  };

  return (
    <div className="game-board min-h-[calc(100vh-128px)]">
      {/* Settings Button */}
      <Settings onUpdateSettings={handleUpdateSettings} />

      {/* Game Cards */}
      {gameState?.cards.map((card) => (
        <MegaCard  key={card.id} card={card} onCardUpdate={onCardUpdate} />
      ))}

      {/* Shuffle Cards Button */}
      <button
        onClick={shuffleCards}
        className="bg-gray-800 text-white rounded-full p-2 w-10 h-10 flex items-center justify-center"
        aria-label={t('shuffle')}
      >
        ↺
      </button>

      {/* Target frame outline */}
      <div
        style={{
          width: '42px',
          height: '63px',
          position: 'absolute',
          borderColor: "#E1FF01",
          top: targetFrame.y,
          left: targetFrame.x,
          transform: `rotate(${targetFrame.rotation}deg)`,
          border: '2px dashed #E1FF01',
          borderRadius: '5px',
        }}
      />
      {gameState?.players?.map((player) => (
        <div
          key={player.id}
          style={{
            width: '13px',
            height: '13px',
            borderRadius: '50%',
            backgroundColor: '#e1ff01',
            border: '2',
            borderColor: 'white',
            position: 'absolute',
            left: `${player.position.x * window.innerWidth}px`,
            top: `${player.position.y * window.innerHeight}px`,
          }}
        />
      ))}
    </div>
  );
};

export default GameBoard;
