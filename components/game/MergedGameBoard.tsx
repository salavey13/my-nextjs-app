import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient'; // Supabase for state management
import MegaAvatar from './MegaAvatar'; // Import the updated MegaAvatar component
import MegaCard from './MegaCard'; // Import MegaCard component
import { Button } from '@/components/ui/button';
import { useAppContext } from '@/context/AppContext';

const GAME_ID = 28;  // Replace with actual game ID
interface Point {
    x: number;
    y: number;
  }
interface Card {
  id: string;
  position: Point;
  flipped: boolean;
  last_trajectory?: Point[];
  trajectory: {
    position: Point,
    rotation: number,
    velocity: Point,
    rotationSpeed: number,
  };
}

interface Player {
    id: string;
    position: { x: number; y: number };
    iceCandidates?: any[]; // Optional array for iceCandidates
  }

interface GameState {
  cards: Card[];
  players: Player[];
}
const GameBoard: React.FC = () => {
    const [gameState, setGameState] = useState<GameState | null>(null);
    const [subscription, setSubscription] = useState<any>(null);
    const { user, t } = useAppContext();
  const [playerPositions, setPlayerPositions] = useState<Record<string, { x: number; y: number }>>({});
  const [targetFrame, setTargetFrame] = useState({
    x: 400,
    y: 300,
    rotation: 0,
  });
  const randomizeTargetFrame = () => {
    setTargetFrame({
      x: Math.random() * 800 + 100, // Assuming the board width is 1000px
      y: Math.random() * 400 + 100, // Assuming the board height is 600px
      rotation: Math.random() * 360,
    });
  };
  useEffect(() => {
    const fetchGameState = async () => {
      const { data } = await supabase
        .from('rents')
        .select('game_state')
        .eq('id', GAME_ID) // Replace with actual rent ID
        .single();

      if (data) {
        setGameState(data.game_state);
        const playerPos: Record<string, { x: number; y: number }> = {};
        data.game_state.players?.forEach((player: Player) => {
          playerPos[player.id] = player.position;
        });
        setPlayerPositions(playerPos);
      }
    };

    fetchGameState();
  }, []);

  useEffect(() => {
    const registerPlayer = async () => {
        if (!user) return; // Check if user is not null

        const { data, error } = await supabase
        .from('rents')
        .select('game_state')
        .eq('id', GAME_ID) // Replace with actual rent ID
        .single();

      if (data) {
        const players: Player[] = data.game_state.players || [];
        if (!players.find((player: Player) => player.id === String(user.id.toString()))) {
          players.push({ id: String(user.id.toString()), position: { x: 0.1, y: 0.1 }, iceCandidates: [] });
          await supabase
            .from('rents')
            .update({ game_state: { ...data.game_state, players } })
            .eq('id', GAME_ID);
        }
      }
    };

    registerPlayer();
  }, [user?.id]);

  const handlePositionChange = (playerId: string, newPos: { x: number; y: number }) => {
    setPlayerPositions(prev => ({ ...prev, [playerId]: newPos }));

    if (gameState) {
        supabase
          .from('rents')
          .update({
            game_state: {
              ...gameState,
              players: gameState.players.map((player) =>
                player.id === playerId ? { ...player, position: newPos } : player
              ),
            },
          })
          .eq('id', GAME_ID);
      };
  };

  const syncTrajectory = async (trajectoryData: any) => {
    // try {
    //     if (gameState) {
    //         const { data, error } = await supabase
    //         .from('rents')
    //         .update({ game_state: { 
    //             ...gameState,
    //             cards: gameState.cards.map((card:Card) =>
    //             { ...card, trajectory: trajectoryData }
    //         ),
    //     },
    // })
    //         .eq('id', GAME_ID); // Replace with actual rent ID
    //         if (error) {
    //             console.error('Error syncing card trajectory:', error);
    //         } else {
    //             console.log('Card trajectory synced:', data);
    //         }
    //     }      
    // } catch (err) {
    //   console.error('Unexpected error:', err);
    // }
  };
  const shuffleCards = async () => {
    if (!gameState) return;

    // Shuffle the cards array
    const shuffledCards = gameState.cards
      .map(card => ({ ...card, position: { x: Math.random(), y: Math.random() } })) // Randomize positions
      .sort(() => Math.random() - 0.5); // Shuffle array

    // Update the game state with the shuffled cards
    const updatedGameState = { ...gameState, cards: shuffledCards };

    // Save the updated game state to Supabase
    const { error } = await supabase
      .from('rents')
      .update({ game_state: updatedGameState })
      .eq('id', GAME_ID);

    if (error) {
      console.error('Error updating game state:', error);
    } else {
      setGameState(updatedGameState); // Update local state
    }
    randomizeTargetFrame()
  };

  return (
    <div className="game-board-container" style={{ position: "relative", width: "1000px", height: "600px", backgroundColor: "#ddd" }}>
      {/* {Object.keys(playerPositions).map(playerId => (
        <MegaAvatar
          key={playerId}
          playerId={playerId}
          initialPosition={playerPositions[playerId]}
          onPositionChange={handlePositionChange}
        />
      ))} */}

      {/* Render cards */}
      <div>
        {gameState && gameState.cards.map((card) => (
          <MegaCard key={card.id} gameState={gameState} cardId={card.id}
          syncTrajectory={syncTrajectory} />
        ))}
      </div>

      <Button className="shuffle-button" onClick={shuffleCards}>
        {t("shufle")}
      </Button>

      {/* Target frame outline */}
      <div
        style={{
          width: "200px",
          height: "300px",
          position: "absolute",
          top: targetFrame.y,
          left: targetFrame.x,
          transform: `rotate(${targetFrame.rotation}deg)`,
          border: "2px dashed black",
        }}
      />
    </div>
  );
};

export default GameBoard;
