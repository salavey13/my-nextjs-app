// components/game/DiceGame.tsx
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useAppContext } from '@/context/AppContext';
import { supabase } from '@/lib/supabaseClient';
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faVolumeUp, faVolumeMute, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { Dice } from './Dice';
import GameModes from './GameModes';
import Rules from './Rules';
import useTelegram from '@/hooks/useTelegram';
import { toast } from "@/hooks/use-toast";

interface Player {
  id: string;
  username: string;
  score: number;
  diceValues: [number, number];
}

interface GameState {
  players: Player[];
  currentPlayer: string;
  gameMode: 'single' | 'twoPlayer' | 'ai' | 'random';
  isRolling: boolean;
  winner: string | null;
}

const DiceGame: React.FC = () => {
  const { user, t } = useAppContext();
  const { tg } = useTelegram();
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showRules, setShowRules] = useState(false);

  const toggleSound = () => setSoundEnabled(!soundEnabled);

  const startGame = async (mode: string) => {
    if (!user?.currentGameId) {
      toast({
        title: t('error'),
        description: t('noActiveGame'),
        variant: "destructive",
      });
      return;
    }

    const initialGameState: GameState = {
      players: [
        { id: String(user.id), username: user.telegram_username || 'Player 1', score: 0, diceValues: [1, 1] },
        { id: mode === 'twoPlayer' ? 'waiting' : 'ai', username: mode === 'twoPlayer' ? 'Waiting...' : 'AI', score: 0, diceValues: [1, 1] },
      ],
      currentPlayer: String(user.id),
      gameMode: mode as GameState['gameMode'],
      isRolling: false,
      winner: null,
    };

    await updateGameState(initialGameState);
  };

  const updateGameState = async (newState: GameState) => {
    if (!user?.currentGameId) return;

    try {
      const { error } = await supabase
        .from('rents')
        .update({ game_state: newState })
        .eq('id', user.currentGameId);

      if (error) throw error;

      setGameState(newState);
    } catch (error) {
      console.error('Error updating game state:', error);
      toast({
        title: t('updateError'),
        description: t('updateErrorDescription'),
        variant: "destructive",
      });
    }
  };

  const rollDice = async () => {
    if (!gameState || gameState.isRolling || gameState.currentPlayer !== String(user?.id)) return;

    const updatedGameState = { ...gameState, isRolling: true };
    await updateGameState(updatedGameState);

    setTimeout(async () => {
      const newDiceValues: [number, number] = [
        Math.floor(Math.random() * 6) + 1,
        Math.floor(Math.random() * 6) + 1,
      ];

      const currentPlayerIndex = gameState.players.findIndex(p => p.id === gameState.currentPlayer);
      const updatedPlayers = gameState.players.map((player, index) => 
        index === currentPlayerIndex 
          ? { ...player, score: player.score + newDiceValues[0] + newDiceValues[1], diceValues: newDiceValues } 
          : player
      );

      const nextPlayerIndex = (currentPlayerIndex + 1) % gameState.players.length;
      const isGameOver = updatedPlayers.some(player => player.score >= 100);

      let winner = null;
      if (isGameOver) {
        winner = updatedPlayers.reduce((maxPlayer, player) => 
          player.score > maxPlayer.score ? player : maxPlayer
        ).id;
      }

      const updatedGameState: GameState = {
        ...gameState,
        players: updatedPlayers,
        currentPlayer: isGameOver ? gameState.currentPlayer : gameState.players[nextPlayerIndex].id,
        isRolling: false,
        winner,
      };

      await updateGameState(updatedGameState);

      if (soundEnabled) {
        playDiceSound();
      }

      if (updatedGameState.gameMode === 'ai' && updatedGameState.currentPlayer === 'ai') {
        setTimeout(() => rollDice(), 1000);
      }
    }, 1000);
  };

  const playDiceSound = () => {
    // Implement sound playing logic here
    console.log("Playing dice sound");
  };

  const goBack = () => {
    setGameState(null);
    setShowRules(false);
  };

  useEffect(() => {
    tg?.MainButton?.hide();
    tg?.BackButton?.show();
    tg?.BackButton?.onClick(goBack);

    return () => {
      tg?.BackButton?.onClick(goBack);
    };
  }, [tg]);

  useEffect(() => {
    const handleSubscription = async () => {
      if (!user?.currentGameId) return;

      const { data, error } = await supabase
        .from('rents')
        .select('game_state')
        .eq('id', user.currentGameId)
        .single();

      if (error) {
        console.error('Error fetching initial game state:', error);
      } else {
        setGameState(data.game_state);
      }

      const channel = supabase
        .channel(`game_state_updates_${user.currentGameId}`)
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'rents', filter: `id=eq.${user.currentGameId}` },
          (payload) => {
            setGameState(payload.new.game_state);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    };

    handleSubscription();
  }, [user?.currentGameId]);

  if (showRules) {
    return <Rules onClose={() => setShowRules(false)} />;
  }

  return (
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

      {!gameState ? (
        <GameModes onSelectMode={startGame} onShowRules={() => setShowRules(true)} />
      ) : (
        <div className="flex flex-col items-center">
          {gameState.players.map((player, index) => (
            <div key={player.id} className="text-2xl mb-4">
              {player.username}: {player.score}
              {gameState.currentPlayer === player.id && " (Current Turn)"}
            </div>
          ))}

          <div className="flex space-x-4 mb-6">
            <Dice
              value={gameState.players.find(p => p.id === gameState.currentPlayer)?.diceValues?.[0] ?? 1}
              rolling={gameState.isRolling}
              onRollComplete={() => {}}
            />
            <Dice
              value={gameState.players.find(p => p.id === gameState.currentPlayer)?.diceValues?.[1] ?? 1}
              rolling={gameState.isRolling}
              onRollComplete={() => {}}
            />
          </div>

          {gameState.winner ? (
            <div className="text-3xl font-bold mt-6">
              {`${t('winner')}: ${gameState.players.find(p => p.id === gameState.winner)?.username}`}
            </div>
          ) : (
            <Button
              onClick={rollDice}
              disabled={gameState.isRolling || gameState.currentPlayer !== String(user?.id)}
              className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-4 rounded-full"
            >
              {gameState.isRolling ? t('rolling') : t('rollDice')}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default DiceGame;