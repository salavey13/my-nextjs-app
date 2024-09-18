import React, { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { MegaCard, CardId } from '@/components/game/MegaCard';
import { Button } from '@/components/ui/button';
import { useAppContext } from '@/context/AppContext';
import { Settings, PhysicsSettings } from './Settings';
import MegaAvatar from './MegaAvatar';
import useTelegram from '@/hooks/useTelegram';

const CARD_PROXIMITY_THRESHOLD = 100; // increased from 69 to 100

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
  username: string;
  position: { x: number; y: number };
  videoEnabled: boolean;
  videoSettings: {
    width: number;
    height: number;
    frameRate: number;
  };
  webrtc: {
    offer?: RTCSessionDescriptionInit;
    answer?: RTCSessionDescriptionInit;
    iceCandidates: RTCIceCandidateInit[];
  };
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
    minMovementThreshold: 5,
  });
  const [isShuffling, setIsShuffling] = useState(false);
  const [hasWebcamAccess, setHasWebcamAccess] = useState(false);
  const [hasVoiceAccess, setHasVoiceAccess] = useState(false);
  const { showMainButton, setHeaderColor, showAlert, setBottomBarColor, tg } = useTelegram();
  const lastUpdateRef = useRef<{ [key: string]: number }>({});

  const checkMediaAccess = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setHasWebcamAccess(true);
      setHasVoiceAccess(true);
      stream.getTracks().forEach(track => track.stop());
    } catch (error) {
      console.error('Error checking media access:', error);
      setHasWebcamAccess(false);
      setHasVoiceAccess(false);
    }
  }, []);

  useEffect(() => {
    checkMediaAccess();
  }, [checkMediaAccess]);

  const randomizeTargetFrame = useCallback(() => {
    setTargetFrame({
      x: Math.random() * 320 + 100,
      y: Math.random() * 320 + 100,
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
        card.id === updatedCard.id ? updatedCard : card
      );
      return { ...prevState, cards: updatedCards };
    });

    supabase
      .from('rents')
      .update({ game_state: { ...gameState, cards: gameState.cards.map(card => card.id === updatedCard.id ? updatedCard : card) } })
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
                  if (oldCard && oldCard.position.x === newCard.position.x && oldCard.position.y === newCard.position.y) {
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
    const dx = (card.position.x - player.position.x) * window.innerWidth;
    const dy = (card.position.y - player.position.y) * window.innerHeight;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const avatarRadius = 64;
    return distance <= CARD_PROXIMITY_THRESHOLD + avatarRadius;
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

    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.onEvent('mainButtonClicked', handleMainButtonClick);
    }

    return () => {
      if (window.Telegram?.WebApp) {
        window.Telegram.WebApp.onEvent('mainButtonClicked', handleMainButtonClick);
      }
    };
  }, [shuffleCards]);

  useEffect(() => {
    const savedSettings = localStorage.getItem('physicsSettings');
    if (savedSettings) {
      setPhysicsParams(JSON.parse(savedSettings));
    }
  }, []);

  if (!hasWebcamAccess || !hasVoiceAccess) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-xl mb-4">{t("pleaseGrantAccess")}</p>
        <Button onClick={checkMediaAccess}>{t("checkPermissions")}</Button>
      </div>
    );
  }

  return (
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
  );
};

export default GameBoard;