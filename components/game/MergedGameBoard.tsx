import React, { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { MegaCard, CardId } from '@/components/game/MegaCard';
import { Button } from '@/components/ui/button';
import { useAppContext } from '@/context/AppContext';
import { Settings, PhysicsSettings } from './Settings';
import MegaAvatar from './MegaAvatar';
import useTelegram from '@/hooks/useTelegram';

// ... other interfaces remain the same

const GameBoard: React.FC = () => {
  // ... other state variables remain the same

  useEffect(() => {
    const addPlayerIfNeeded = async () => {
      if (!gameState || !user?.currentGameId || !user?.id) return;

      const playerExists = gameState.players?.some((player) => player.id === user.id.toString());

      if (!playerExists || !gameState.players) {
        const newPlayer: Player = {
          id: user.id.toString(),
          position: { x: Math.random() * 320/window.innerWidth, y: Math.random() * 320 / window.innerHeight },
          videoEnabled: false,
          videoSettings: {
            width: 320,
            height: 240,
            frameRate: 15,
          },
          webrtc: {
            iceCandidates: [],
          },
        };
        
        const updatedPlayers = [...(gameState.players || []), newPlayer];
        const updatedGameState = { ...gameState, players: updatedPlayers };

        const { error } = await supabase
          .from('rents')
          .update({ game_state: updatedGameState })
          .eq('id', user.currentGameId);

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

  // ... other functions remain the same

  return (
    <div className="game-board min-h-[calc(100vh-128px)] relative">
      <Settings onUpdateSettings={handleUpdateSettings} />

      {gameState?.cards.map((card) => (
        <MegaCard
          key={card.id}
          card={card}
          onCardUpdate={onCardUpdate}
          forceFlipped={gameState.players.some(player => 
            player.id === user?.id?.toString() && isCardNearPlayer(card, player)
          )}
          isShuffling={isShuffling}
          physicsParams={physicsParams}
        />
      ))}

      {/* ... other elements remain the same */}

      {gameState?.players?.map((player) => (
        <MegaAvatar
          key={player.id}
          gameState={gameState}
          playerId={player.id}
          initialPosition={player.position}
          onPositionChange={handlePositionChange}
        />
      ))}
    </div>
  );
};

export default GameBoard;
