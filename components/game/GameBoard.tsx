import React, { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { MegaCard, CardId } from '@/components/game/MegaCard';
import { Button } from '@/components/ui/button';
import { useAppContext } from '@/context/AppContext';
import { Settings, PhysicsSettings } from './Settings';
import MegaAvatar from './MegaAvatar';
import useTelegram from '@/hooks/useTelegram';
import LoadingSpinner from "../ui/LoadingSpinner";

const CARD_PROXIMITY_THRESHOLD = 13;

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
  timestamp: number;
}

interface Player {
  id: string;
  username: string;
  position: { x: number; y: number };
}

interface GameState {
  cards: Card[];
  players: Player[];
}

const GameBoard: React.FC = () => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const { user, t } = useAppContext();
  const [targetFrame, setTargetFrame] = useState({ x: 400, y: 300, rotation: 0 });
  const [physicsParams, setPhysicsParams] = useState<PhysicsSettings>({
    yeetCoefficient: 1.5,
    yeetVelocityThreshold: 0.5,
  });
  const [isShuffling, setIsShuffling] = useState(false);
  const { showMainButton, setHeaderColor, setBottomBarColor, tg } = useTelegram();
  const lastUpdateRef = useRef<{ [key: string]: number }>({});

  const randomizeTargetFrame = useCallback(() => {
    setTargetFrame({
      x: Math.random() * (window.innerWidth - 42) + 21,
      y: Math.random() * (window.innerHeight - 191) + 128,
      rotation: Math.random() * 360,
    });
  }, []);

  const onCardUpdate = useCallback((updatedCard: Card) => {
    if (!gameState || !user?.currentGameId) return;

    const now = Date.now();
    if (now - (lastUpdateRef.current[updatedCard.id] || 0) < 100) return; // Throttle updates
    lastUpdateRef.current[updatedCard.id] = now;

    setGameState(prevState => {
      if (!prevState) return null;
      const updatedCards = prevState.cards.map(card =>
        card.id === updatedCard.id ? { ...updatedCard, timestamp: now } : card
      );
      return { ...prevState, cards: updatedCards };
    });

    supabase
      .from('rents')
      .update({ game_state: { ...gameState, cards: gameState.cards.map(card => card.id === updatedCard.id ? { ...updatedCard, timestamp: now } : card) } })
      .eq('id', user.currentGameId)
      .then(() => {
        console.log('Card updated successfully in Supabase');
      });
  }, [gameState, user?.currentGameId]);

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
                cards: payload.new.game_state.cards.map((newCard: Card) => {
                  const oldCard = prevState.cards.find(c => c.id === newCard.id);
                  if (oldCard && oldCard.timestamp > newCard.timestamp) {
                    return oldCard;
                  }
                  return newCard;
                }),
                players: payload.new.game_state.players,
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

  const shuffleCards = useCallback(async () => {
    if (!gameState || !user?.currentGameId) return;

    setIsShuffling(true);

    const shuffledCards = gameState.cards
      .map((card) => ({
        ...card,
        position: { x: 13/window.innerWidth, y: 0.5 },
        last_position: card.position,
        zIndex: Math.floor(Math.random() * 36),
        flipped: false,
        rotations: Math.floor(Math.random() * 4),
        timestamp: Date.now(),
      }))
      .sort(() => Math.random() - 0.5);

    const updatedGameState = { ...gameState, cards: shuffledCards };

    const { error } = await supabase
      .from('rents')
      .update({ game_state: updatedGameState })
      .eq('id', user.currentGameId);

    if (error) {
      console.error('Error updating game state:', error);
    } else {
      setGameState(updatedGameState);
    }

    randomizeTargetFrame();

    setTimeout(() => {
      setIsShuffling(false);
      showMainButton(t('shuffle'));
      setBottomBarColor("#282c33");
      setHeaderColor("#282c33");
    }, 1000);
  }, [gameState, user?.currentGameId, randomizeTargetFrame, showMainButton, setBottomBarColor, setHeaderColor, t]);

  useEffect(() => {
    const addPlayerIfNeeded = async () => {
      if (!gameState || !user?.currentGameId || !user?.id) return;

      const playerExists = gameState.players?.some((player) => player.id === user.id.toString());

      if (!playerExists || !gameState.players) {
        const newPlayer: Player = {
          id: user.id.toString(),
          username: user.telegram_username || 'Anonymous',
          position: { x: Math.random() * (window.innerWidth - 128) / window.innerWidth, y: Math.random() * (window.innerHeight - 256) / window.innerHeight + 128 / window.innerHeight },
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

  const handlePositionChange = useCallback(async (playerId: string, newPos: Point) => {
    if (!gameState || !user?.currentGameId) return;

    const updatedPlayers = gameState.players.map((player) =>
      player.id === playerId ? { ...player, position: newPos } : player
    );

    const updatedGameState = { ...gameState, players: updatedPlayers };

    const { error } = await supabase
      .from('rents')
      .update({ game_state: updatedGameState })
      .eq('id', user.currentGameId);

    if (error) {
      console.error('Error updating player position:', error);
    } else {
      setGameState(updatedGameState);
    }
  }, [gameState, user?.currentGameId]);

  const handleUpdateSettings = useCallback((settings: PhysicsSettings) => {
    setPhysicsParams(settings);
    localStorage.setItem('physicsSettings', JSON.stringify(settings));
  }, []);

  const isCardNearPlayer = useCallback((card: Card, player: Player) => {
    const cardCenterX = (card.position.x + 21 / window.innerWidth) * window.innerWidth;
    const cardCenterY = (card.position.y + 31.5 / window.innerHeight) * window.innerHeight;
    const playerCenterX = (player.position.x + 64 / window.innerWidth) * window.innerWidth;
    const playerCenterY = (player.position.y + 64 / window.innerHeight) * window.innerHeight;
    
    const dx = cardCenterX - playerCenterX;
    const dy = cardCenterY - playerCenterY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    const cardRadius = Math.sqrt(21*21 + 31.5*31.5);
    const playerRadius = 32;
    
    return distance <= CARD_PROXIMITY_THRESHOLD + cardRadius + playerRadius;
  }, []);

  useEffect(() => {
    showMainButton(t('shuffle'));
    tg?.MainButton?.setParams({color: "#e1ff01", text_color: "#000000"});
    setBottomBarColor("#282c33");
    setHeaderColor("#282c33");
  }, [showMainButton, t, tg?.MainButton, setBottomBarColor, setHeaderColor]);

  useEffect(() => {
    const handleMainButtonClick = () => {
      shuffleCards();
    };

    if (tg?.MainButton) {
      tg.MainButton.onClick(handleMainButtonClick);
    }

    return () => {
      if (tg?.MainButton) {
        tg.MainButton.offClick(handleMainButtonClick);
      }
    };
  }, [shuffleCards, tg]);

  useEffect(() => {
    const savedSettings = localStorage.getItem('physicsSettings');
    if (savedSettings) {
      setPhysicsParams(JSON.parse(savedSettings));
    }
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setTargetFrame({
        x: window.innerWidth * 0.5 - 21,
        y: window.innerHeight * 0.5 - 31.5,
        rotation: Math.random() * 360
      });
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <div className="game-board h-[calc(100vh-128px)] relative overflow-hidden">
        <Settings onUpdateSettings={handleUpdateSettings} initialSettings={physicsParams} />

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
          <MegaAvatar
            key={player.id}
            gameState={gameState}
            playerId={player.id}
            initialPosition={player.position}
            onPositionChange={handlePositionChange}
          />
        ))}
      </div>
    </Suspense>
  );
};

export default GameBoard;
