// components/game/DiceGame.tsx
"use client";

import React, { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useAppContext } from '../../context/AppContext';
import useTelegram from '../../hooks/useTelegram';
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDice, faVolumeUp, faVolumeMute, faArrowLeft, faCrown } from '@fortawesome/free-solid-svg-icons';
import LoadingSpinner from "../ui/LoadingSpinner";
import { toast } from "@/hooks/use-toast";
import EnhancedMegaAvatar from './EnhancedMegaAvatar';

interface DiceValues {
  value1: number;
  value2: number;
}

interface Player {
  id: string;
  username: string;
  position: { x: number; y: number };
  score: number;
  diceValues: DiceValues;
  messages: Message[];
}

interface Message {
  text: string;
  timestamp: number;
}

interface Card {
  id: string;
  position: { x: number; y: number };
  // Add other card properties as needed
}

interface GameState {
  players: Player[];
  currentPlayer: string;
  gameMode: 'single' | 'twoPlayer' | 'ai' | 'random';
  isRolling: boolean;
  winner: string | null;
  cards: Card[]; // Add this to make it compatible with GameBoard
}

const DiceGame: React.FC = () => {
  const { user, t } = useAppContext();
  const { tg, showMainButton, setHeaderColor, setBottomBarColor } = useTelegram();
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const lastUpdateRef = useRef<number>(0);

  const updateSupabase = useCallback(async (updatedGameState: GameState): Promise<void> => {
    if (!user?.currentGameId) return;

    try {
      const { error } = await supabase
        .from('rents')
        .update({ 
          game_state: {
            ...updatedGameState,
            gameType: 'DiceGame',
            availableGames: ['GameBoard', 'DiceGame']
          } 
        })
        .eq('id', user.currentGameId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating game state:', error);
      toast({
        title: t('updateError'),
        description: t('updateErrorDescription'),
        variant: "destructive",
      });
    }
  }, [user?.currentGameId, t]);

  const rollDice = useCallback(async () => {
    if (!gameState || gameState.isRolling || !user?.id) return;

    const updatedGameState = { ...gameState, isRolling: true };
    setGameState(updatedGameState);
    await updateSupabase(updatedGameState);

    // Simulate dice rolling animation
    const rollInterval = setInterval(() => {
      setGameState(prevState => {
        if (!prevState) return null;
        const currentPlayerIndex = prevState.players.findIndex(p => p.id === prevState.currentPlayer);
        return {
          ...prevState,
          players: prevState.players.map((player, index) => 
            index === currentPlayerIndex 
              ? { 
                  ...player, 
                  diceValues: {
                    value1: Math.floor(Math.random() * 6) + 1,
                    value2: Math.floor(Math.random() * 6) + 1
                  }
                }
              : player
          )
        };
      });
    }, 100);

    // Stop rolling after 1 second
    setTimeout(async () => {
      clearInterval(rollInterval);
      const newDiceValues: DiceValues = {
        value1: Math.floor(Math.random() * 6) + 1,
        value2: Math.floor(Math.random() * 6) + 1
      };
      const newScore = newDiceValues.value1 + newDiceValues.value2;

      setGameState(prevState => {
        if (!prevState || !user?.id) return null;
        const currentPlayerIndex = prevState.players.findIndex(p => p.id === prevState.currentPlayer);
        const updatedPlayers = prevState.players.map((player, index) => 
          index === currentPlayerIndex 
            ? { ...player, score: player.score + newScore, diceValues: newDiceValues } 
            : player
        );
        const nextPlayerIndex = (currentPlayerIndex + 1) % prevState.players.length;
        const isGameOver = prevState.gameMode === 'single' || 
          (nextPlayerIndex === 0 && updatedPlayers[0].score !== updatedPlayers[1].score);
        
        let winner = null;
        if (isGameOver) {
          winner = updatedPlayers[0].score > updatedPlayers[1].score ? updatedPlayers[0].id : 
                   updatedPlayers[0].score < updatedPlayers[1].score ? updatedPlayers[1].id : 'tie';
        }

        return {
          ...prevState,
          players: updatedPlayers,
          currentPlayer: isGameOver ? prevState.currentPlayer : prevState.players[nextPlayerIndex].id,
          isRolling: false,
          winner,
        };
      });

      if (soundEnabled) {
        playDiceSound();
      }

      const updatedState = await new Promise<GameState | null>(resolve => {
        setGameState(prevState => {
          if (!prevState) return null;
          resolve(prevState);
          return prevState;
        });
      });

      if (updatedState) {
        await updateSupabase(updatedState);

        if (updatedState.gameMode === 'ai' && updatedState.currentPlayer !== user.id.toString()) {
          setTimeout(() => rollDice(), 1000);
        }
      }
    }, 1000);
  }, [gameState, user?.id, soundEnabled, updateSupabase]);

  const playDiceSound = () => {
    // Implement sound playing logic here
    console.log("Playing dice sound");
  };

  const toggleSound = () => {
    setSoundEnabled(prev => !prev);
  };

  const goBack = () => {
    // Implement navigation logic here
    console.log("Going back to main menu");
  };

  const startNewGame = useCallback(async (mode: GameState['gameMode']) => {
    if (!user?.id) return;

    const initialGameState: GameState = {
      players: [
        { 
          id: user.id.toString(), 
          username: user.telegram_username || 'Player 1', 
          position: { x: 0.25, y: 0.5 }, 
          score: 0,
          diceValues: { value1: 1, value2: 1 },
          messages: []
        },
        { 
          id: mode === 'single' ? 'ai' : 'player2', 
          username: mode === 'single' ? 'AI' : 'Player 2', 
          position: { x: 0.75, y: 0.5 }, 
          score: 0,
          diceValues: { value1: 1, value2: 1 },
          messages: []
        },
      ],
      currentPlayer: user.id.toString(),
      gameMode: mode,
      isRolling: false,
      winner: null,
      cards: [], // Initialize with an empty array to maintain compatibility
    };

    setGameState(initialGameState);
    await updateSupabase(initialGameState);

    if (mode === 'twoPlayer') {
      // Generate and display invite link logic here
      console.log("Generate and display invite link for two-player mode");
    } else if (mode === 'random') {
      // Implement matchmaking logic here
      console.log("Implement matchmaking for random opponent mode");
    }
  }, [user?.id, user?.telegram_username, updateSupabase]);

  useEffect(() => {
    const handleSubscription = async () => {
      if (!user?.currentGameId) {
        console.log('No current game ID, skipping subscription');
        return;
      }

      console.log('Setting up subscription for game ID:', user.currentGameId);

      const { data, error } = await supabase
        .from('rents')
        .select('game_state')
        .eq('id', user.currentGameId)
        .single();

      if (error) {
        console.error('Error fetching initial game state:', error);
      } else {
        console.log('Initial game state fetched:', data.game_state);
        setGameState(data.game_state);
      }

      const channel = supabase
        .channel(`game_state_updates_${user.currentGameId}`)
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'rents', filter: `id=eq.${user.currentGameId}` },
          (payload) => {
            console.log('Received game state update:', payload.new.game_state);
            setGameState(prevState => {
              if (!prevState) return payload.new.game_state;
              return {
                ...prevState,
                ...payload.new.game_state,
                players: payload.new.game_state.players.map((newPlayer: Player) => {
                  const oldPlayer = prevState.players.find(p => p.id === newPlayer.id);
                  if (oldPlayer && oldPlayer.score > newPlayer.score) {
                    return oldPlayer;
                  }
                  return newPlayer;
                }),
                cards: payload.new.game_state.cards || prevState.cards, // Preserve cards if they exist
              };
            });
          }
        )
        .subscribe((status) => {
          console.log('Subscription status:', status);
        });

      return () => {
        console.log('Cleaning up subscription');
        supabase.removeChannel(channel);
      };
    };

    handleSubscription();
  }, [user?.currentGameId]);

  useEffect(() => {
    showMainButton(t('rollDice'));
    tg?.MainButton?.setParams({color: "#e1ff01", text_color: "#000000"});
    setBottomBarColor("#282c33");
    setHeaderColor("#282c33");
  }, [showMainButton, t, tg?.MainButton, setBottomBarColor, setHeaderColor]);

  useEffect(() => {
    const handleMainButtonClick = () => {
      rollDice();
    };

    if (tg?.MainButton) {
      tg.MainButton.onClick(handleMainButtonClick);
    }

    return () => {
      if (tg?.MainButton) {
        tg.MainButton.offClick(handleMainButtonClick);
      }
    };
  }, [rollDice, tg]);

  const handlePositionChange = useCallback(async (playerId: string, newPos: { x: number; y: number }) => {
    if (!gameState || !user?.currentGameId) return;

    const updatedPlayers = gameState.players.map((player) =>
      player.id === playerId ? { ...player, position: newPos } : player
    );

    const updatedGameState = { ...gameState, players: updatedPlayers };

    setGameState(updatedGameState);
    await updateSupabase(updatedGameState);
  }, [gameState, user?.currentGameId, updateSupabase]);

  const handleMessageUpdate = useCallback(async (playerId: string, messages: Message[]) => {
    if (!gameState || !user?.currentGameId) return;

    const updatedPlayers = gameState.players.map((player) =>
      player.id === playerId ? { ...player, messages } : player
    );

    const updatedGameState = { ...gameState, players: updatedPlayers };

    setGameState(updatedGameState);
    await updateSupabase(updatedGameState);
  }, [gameState, user?.currentGameId, updateSupabase]);

  const renderDiceFace = (value: number) => {
    return (
      <div className="w-16 h-16 bg-white rounded-lg shadow-lg flex items-center justify-center text-4xl font-bold text-black">
        {value}
      </div>
    );
  };

  if (!gameState) {
    return <LoadingSpinner />;
  }

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
        <div className="flex justify-between w-full mb-4">
          <Button onClick={goBack} variant="ghost" size="icon">
            <FontAwesomeIcon icon={faArrowLeft} />
          </Button>
          <Button onClick={toggleSound} variant="ghost" size="icon">
            <FontAwesomeIcon icon={soundEnabled ? faVolumeUp : faVolumeMute} />
          </Button>
        </div>

        <h1 className="text-3xl font-bold mb-6">{t('diceGame')}</h1>

        <div className="flex justify-between w-full mb-4">
          {gameState.players.map((player, index) => (
            <div key={player.id} className="text-2xl">
              {player.username}: {player.score}
              {gameState.currentPlayer === player.id && <FontAwesomeIcon icon={faCrown} className="ml-2 text-yellow-400" />}
            </div>
          ))}
        </div>

        <div className="flex space-x-4 mb-6">
          {renderDiceFace(gameState.players.find(p => p.id === gameState.currentPlayer)?.diceValues.value1 || 1)}
          {renderDiceFace(gameState.players.find(p => p.id === gameState.currentPlayer)?.diceValues.value2 || 1)}
        </div>

        {gameState.players.map((player) => (
          <EnhancedMegaAvatar
            key={player.id}
            gameState={gameState}
            playerId={player.id}
            initialPosition={player.position}
            onPositionChange={handlePositionChange}
            onMessageUpdate={handleMessageUpdate}
          />
        ))}

        {gameState.winner && (
          <div className="text-3xl font-bold mt-6">
            {gameState.winner === 'tie' ? t('gameTied') : `${t('winner')}: ${gameState.players.find(p => p.id === gameState.winner)?.username}`}
          </div>
        )}

        {!gameState.winner && (
          <Button
            onClick={rollDice}
            disabled={gameState.isRolling || (gameState.gameMode !== 'single' && gameState.currentPlayer !== user?.id?.toString())}
            className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-4 rounded-full mb-4"
          >
            <FontAwesomeIcon icon={faDice} className="mr-2" />
            {t('rollDice')}
          </Button>
        )}

        {(gameState.winner || gameState.gameMode === 'single') && (
          <div className="grid grid-cols-2 gap-2 mt-4">
            <Button onClick={() => startNewGame('single')} variant="outline">
              {t('singlePlayerMode')}
            </Button>
            <Button onClick={() => startNewGame('twoPlayer')} variant="outline">
              {t('twoPlayerMode')}
            </Button>
            <Button onClick={() => startNewGame('ai')} variant="outline">
              {t('aiMode')}
            </Button>
            <Button onClick={() => startNewGame('random')} variant="outline">
              {t('randomOpponentMode')}
            </Button>
          </div>
        )}

        <div className="mt-6">
          <Button variant="link" onClick={() => tg?.showAlert(t('rulesText'))}>
            {t('rules')}
          </Button>
        </div>
      </div>
    </Suspense>
  );
};

export default DiceGame;