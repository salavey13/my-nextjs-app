import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import MegaAvatar from './MegaAvatar';
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

    supabase
      .from('rents')
      .update({ game_state: { cards: updatedCards } })
      .eq('id', user?.currentGameId)
      .then(() => {
        console.log('Card updated successfully in Supabase');
      });
  };

  useEffect(() => {
    const handleSubscription = async () => {
      const { data, error } = await supabase
        .from('rents')
        .select('game_state')
        .eq('id', user?.currentGameId)
        .single();

      if (error) {
        console.error('Error fetching game state:', error);
      } else {
        setGameState(data.game_state);
      }

      const channel = supabase
        .channel('notify_game_update')
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'rents', filter: `id=eq.${user?.currentGameId}` },
          (payload) => {
            setGameState(payload.new.game_state);
          }
        )
        .subscribe();

      setSubscription(channel);

      return () => {
        supabase.removeChannel(channel);
      };
    };

    handleSubscription();
  }, [user]);

  const shuffleCards = async () => {
    if (!gameState) return;

    const shuffledCards = gameState.cards
      .map((card) => ({ ...card, position: { x: Math.random(), y: Math.random() } }))
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
// Handler to update settings
  const handleUpdateSettings = (settings: PhysicsSettings) => {
    setPhysicsParams(settings);
  };
  return (
    <div className="game-board">
      {/* Settings Button */}
      <Settings onUpdateSettings={handleUpdateSettings}/>

      {/* Game Cards */}
      {gameState?.cards.map((card) => (
        <MegaCard key={card.id} card={card} onCardUpdate={onCardUpdate} />
      ))}

      {/* Game Avatars */}
      {gameState?.players.map((player) => (
        <MegaAvatar
          key={player.id}
          playerId={parseInt(player.id)}
          initialPosition={player.position}
          onPositionChange={handlePositionChange}
        />
      ))}

      {/* Shuffle Cards Button */}
      <Button onClick={shuffleCards}>Shuffle Cards</Button>
    </div>
  );
};

export default GameBoard;
