// components\game\MergedGameBoard.tsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient'; // Supabase for state management
import MegaAvatar from './MegaAvatar'; // Import the updated MegaAvatar component
import { MegaCard, CardId } from "@/components/game/MegaCard"; // Import MegaCard component
import { Button } from '@/components/ui/button';
import { useAppContext } from '@/context/AppContext';
import PhysicsControls from './PhysicsControls';
import { useGesture } from '@use-gesture/react'; // Ensure you import this for gesture handling

// {
//     "cards": [
//       {
//         "id": "ace_of_spades",
//         "position": {
//           "x": 0.13347488956238615,
//           "y": 0.596567085140635
//         },
//         "flipped": false,
//         "trajectory": {
//           "position": {
//             "x": 0.1,
//             "y": 0.1
//           },
//           "rotation": 15,
//           "velocity": {
//             "x": 0.5,
//             "y": 0.5
//           },
//           "rotationSpeed": 0.02
//         },
//         "target_position": {
//           "x": 0.6,
//           "y": 0.5
//         },
//         "target_rotation": 90
//       }
//     ],
//     "players": [
//       {
//         "id": "43",
//         "position": {
//           "x": 184.60638548158315,
//           "y": 64.82521728032322
//         }
//       }
//     ]
//   }
const GAME_ID = 28;  // Replace with actual game ID

interface Point {
    x: number;
    y: number;
}



interface Card {
    id: CardId;
  position: { x: number; y: number };
  trajectory: { rotation: number };
  flipped: boolean;
}
interface MegaAvatarProps {
    playerId: number;
    initialPosition: Point;
    onPositionChange: (playerId: number, position: Point) => void;
  }
interface Player {
    id: string;
    position: { x: number; y: number };
}


  interface Point {
    x: number;
    y: number;
  }
interface GameState {
    cards: Card[];
    players: Player[];
}

const GameBoard: React.FC = () => {
    const [gameState, setGameState] = useState<GameState | null>(null);
    const [subscription, setSubscription] = useState<any>(null);
    const [playerPositions, setPlayerPositions] = useState<Record<string, { x: number; y: number }>>({});
    const [isLongPress, setIsLongPress] = useState(false);
    const [longPressStart, setLongPressStart] = useState(0);
    const { user, t } = useAppContext();

    const [targetFrame, setTargetFrame] = useState({
        x: 400,
        y: 300,
        rotation: 0,
    });

    const randomizeTargetFrame = () => {
        setTargetFrame({
            x: Math.random() * 320 + 100, // Assuming the board width is 1000px
            y: Math.random() * 320 + 100, // Assuming the board height is 600px
            rotation: 0//Math.random() * 360,
        });
    };

    // Parallax state for the shuffle button
    const [buttonParallax, setButtonParallax] = useState({ x: 0, y: 0 });

    useEffect(() => {
        // Subscribe to changes in the `rents` table for the current game
        const handleSubscription = async () => {
          // Initial fetch for game state
          const { data, error } = await supabase
            .from('rents')
            .select('game_state')
            .eq('id', user?.currentGameId) // Assuming user has currentGameId
            .single();
    
          if (error) {
            console.error('Error fetching game state:', error);
          } else {
            setGameState(data.game_state);
          }
    
          // Set up the real-time subscription using a Supabase Channel
          const channel = supabase
            .channel('notify_game_updates')
            .on(
              'postgres_changes',
              { event: 'UPDATE', schema: 'public', table: 'rents', filter: `id=eq.${GAME_ID}` },
              (payload) => {
                setGameState(payload.new.game_state); // Update game state when change occurs
              }
            )
            .subscribe();
    
          // Clean up the subscription on unmount
          setSubscription(channel);
    
          return () => {
            supabase.removeChannel(channel);
          };
        };
    
        handleSubscription();
      }, [user]);
    
      
    
    // Gesture handling for drag and swipe (yeet)
    const bind = useGesture({
    // onPress: (event) => {
    //     setLongPressStart(Date.now());
    //     setIsLongPress(true);

    //     const { clientX, clientY } = event;
    //     setTimeout(() => {
    //         if (isLongPress) {
    //             handleLongPressAttraction(clientX, clientY);
    //         }
    //     }, 500); // Trigger long press attraction after 500ms
    // },
    // onPressEnd: () => {
    //     setIsLongPress(false);
    // },
    });

    // Handle long press attraction
    // const handleLongPressAttraction = (clientX: number, clientY: number) => {
    //     gameState?.cards.forEach((card) => {
    //         const rect = document.getElementById(card.id)?.getBoundingClientRect();
    //         if (rect) {
    //             const cardCenter = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    //             const distance = Math.sqrt(Math.pow(clientX - cardCenter.x, 2) + Math.pow(clientY - cardCenter.y, 2));
    //             const pressDuration = Date.now() - longPressStart;
    //             const attractionStrength = Math.min(500, pressDuration);

    //             const newX = card.position.x + (clientX - cardCenter.x) * attractionStrength / 1000;
    //             const newY = card.position.y + (clientY - cardCenter.y) * attractionStrength / 1000;

    //             setGameState((prev) => ({
    //                 ...prev!,
    //                 cards: prev!.cards.map((c) =>
    //                     c.id === card.id ? { ...c, position: { x: newX, y: newY } } : c
    //                 ),
    //             }));

    //             // Apply inertia (optional)
    //             if (!isLongPress) {
    //                 // Apply some inertia logic here, possibly using a physics library
    //             }
    //         }
    //     });
    // };

//     useEffect(() => {
//     const registerPlayer = async () => {
//         if (!user) return; // Check if user is not null

//         const { data, error } = await supabase
//         .from('rents')
//         .select('game_state')
//         .eq('id', user?.currentGameId) // Replace with actual rent ID
//         .single();

//       if (data) {
//         const players: Player[] = data.game_state.players || [];
//         if (!players.find((player: Player) => player.id === String(user.id.toString()))) {
//           players.push({ id: String(user.id.toString()), position: { x: 0.1, y: 0.1 }, iceCandidates: [] });
//           await supabase
//             .from('rents')
//             .update({ game_state: { ...data.game_state, players } })
//             .eq('id', user?.currentGameId);
//         }
//       }
//     };

//     registerPlayer();
//   }, [user?.id]);

  const handlePositionChange = (playerId: number, newPos: Point) => {
    setPlayerPositions(prev => ({ ...prev, [playerId]: newPos }));

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
      };
  };

  const syncTrajectory = async (cardId: CardId, trajectory: { x: number; y: number; rotation: number }) => {
    if (!gameState) return;

    const updatedCards = gameState.cards.map(card =>
      card.id === cardId ? { ...card, trajectory: trajectory } : card
    );

    // Save updated game state 
    setGameState({ ...gameState, cards: updatedCards }) 
    }      



    const shuffleCards = async () => {
        if (!gameState) return;

        // Shuffle the cards array
        const shuffledCards = gameState.cards
            .map((card) => ({ ...card, position: { x: Math.random(), y: Math.random() } })) // Randomize positions
            .sort(() => Math.random() - 0.5); // Shuffle array

        // Update the game state with the shuffled cards
        const updatedGameState = { ...gameState, cards: shuffledCards };

        // Save the updated game state to Supabase
        const { error } = await supabase
            .from('rents')
            .update({ game_state: updatedGameState })
            .eq('id', user?.currentGameId);

        if (error) {
            console.error('Error updating game state:', error);
        } else {
            setGameState(updatedGameState); // Update local state
        }

        randomizeTargetFrame();
    };

    // Apply parallax to the shuffle button based on mouse movement
    const handleMouseMove = (event: React.MouseEvent) => {
        const { clientX, clientY } = event;
        const parallaxX = (clientX / window.innerWidth - 0.5) * 20; // Adjust strength
        const parallaxY = (clientY / window.innerHeight - 0.5) * 20;
        setButtonParallax({ x: parallaxX, y: parallaxY });
    };

    return (
        <div
            className="game-board-container min-h-[calc(100vh-128px)] overflow-y-auto overflow-x-auto"
            style={{ position: 'relative', width: '100vw', height: '600px' }}
            onMouseMove={handleMouseMove}
            {...bind()} // Attach gesture handlers
        >
            {/* {gameState && Object.keys(playerPositions).map(playerId => (
        <MegaAvatar
          gameState={gameState}
          key={playerId}
          playerId={Number(playerId)}
          initialPosition={playerPositions[playerId]}
          onPositionChange={handlePositionChange}
        />
      ))} */}
            {/* Render cards */}
            <div>
                {gameState &&
                    gameState.cards.map((card) => (
                        <MegaCard key={card.id} gameState={gameState} cardId={card.id} syncTrajectory={syncTrajectory} />
                    ))}
            </div>

            <Button
                className="shuffle-button"
                onClick={shuffleCards}
                style={{
                    transform: `translate(${buttonParallax.x}px, ${buttonParallax.y}px)`,
                }}
            >
                {t('shufle')}
            </Button>

            {/* Target frame outline */}
            <div
                style={{
                    width: '100px',
                    height: '150px',
                    position: 'absolute',
                    borderColor: "#E1FF01",
                    top: targetFrame.y,
                    left: targetFrame.x,
                    transform: `rotate(${targetFrame.rotation}deg)`,
                    border: '2px dashed #E1FF01',
                    borderRadius: '8px',
                }}
            />
        </div>
    );
};

export default GameBoard;
