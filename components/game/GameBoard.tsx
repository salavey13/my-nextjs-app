"use client"

import React, { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { MegaCard, CardId } from '@/components/game/MegaCard';
import { Button } from '@/components/ui/button';
import { useAppContext } from '@/context/AppContext';
import { Settings, GameSettings } from './Settings';
import EnhancedMegaAvatar from './EnhancedMegaAvatar';
import useTelegram from '@/hooks/useTelegram';
import LoadingSpinner from "../ui/LoadingSpinner";
import InfinityMirror from './InfinityMirror';
import { toast } from "@/hooks/use-toast";
import { useTheme } from '@/hooks/useTheme'

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

interface Message {
  text: string;
  timestamp: number;
}

interface Player {
  id: string;
  username: string;
  position: { x: number; y: number };
  messages: Message[];
}

interface GameState {
  cards: Card[];
  players: Player[];
}

const GameBoard: React.FC<{ goBack: () => void }> = ({ goBack }) => {
  
  const [gameState, setGameState] = useState<GameState | null>(null);
  const { state, dispatch, t } = useAppContext()
  const user = state.user
  const [targetFrame, setTargetFrame] = useState({ x: 400, y: 300, rotation: 0 });
  const [gameSettings, setGameSettings] = useState<GameSettings>({
    yeetCoefficient: 1.5,
    yeetVelocityThreshold: 0.5,
    shirtImgUrl: '',
    cardsImgUrl: '',
  });
  const [isShuffling, setIsShuffling] = useState(false);
  const { showMainButton, setHeaderColor, setBottomBarColor, tg } = useTelegram();
  const lastUpdateRef = useRef<{ [key: string]: number }>({});

  const { theme } = useTheme()

  const { showBackButton } = useTelegram({
    onBackButtonPressed: () => {
      goBack(); // Call goBack when the back button is pressed
    },
  });

  useEffect(() => {
    showBackButton();
  }, [showBackButton]);

  
  const randomizeTargetFrame = useCallback(() => {
    setTargetFrame({
      x: Math.random() * (window.innerWidth - 42) + 21,
      y: Math.random() * (window.innerHeight - 191) + 128,
      rotation: Math.random() * 360,
    });
  }, []);

  const updateSupabase = useCallback(async (updatedGameState: GameState): Promise<void> => {
    if (!user?.currentFoolGameId) return;

    try {
      const { error } = await supabase
        .from('rents')
        .update({ 
          game_state: {
            ...updatedGameState,
            gameType: 'GameBoard',
            availableGames: ['GameBoard', 'DiceGame']
          } 
        })
        .eq('id', user.currentFoolGameId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating game state:', error);
      toast({
        title: t('updateError'),
        description: t('updateErrorDescription'),
        variant: "destructive",
      });
    }
  }, [user?.currentFoolGameId, t]);

  const onCardUpdate = useCallback((updatedCard: Card) => {
    if (!gameState || !user?.currentFoolGameId) return;

    const now = Date.now();
    if (now - (lastUpdateRef.current[updatedCard.id] || 0) < 100) return; // Throttle updates
    lastUpdateRef.current[updatedCard.id] = now;

    setGameState(prevState => {
      if (!prevState) return null;
      const updatedCards = prevState.cards.map(card =>
        card.id === updatedCard.id ? { ...updatedCard, timestamp: now } : card
      );
      const updatedGameState = { ...prevState, cards: updatedCards };
      updateSupabase(updatedGameState);
      return updatedGameState;
    });
  }, [updateSupabase, gameState, user?.currentFoolGameId]);

  useEffect(() => {
    const handleSubscription = async () => {
      if (!user?.currentFoolGameId) {
        console.log('No current game ID, skipping subscription');
        return;
      }

      console.log('Setting up subscription for game ID:', user.currentFoolGameId);

      const { data, error } = await supabase
        .from('rents')
        .select('game_state')
        .eq('id', user.currentFoolGameId)
        .single();

      if (error) {
        console.error('Error fetching initial game state:', error);
      } else {
        console.log('Initial game state fetched:', data.game_state);
        setGameState(data.game_state);
      }

      const channel = supabase
        .channel(`game_state_updates_${user.currentFoolGameId}`)
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'rents', filter: `id=eq.${user.currentFoolGameId}` },
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
  }, [user?.currentFoolGameId]);

  const shuffleCards = useCallback(async () => {
    if (!gameState || !user?.currentFoolGameId) return;

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

    setGameState(updatedGameState);
    await updateSupabase(updatedGameState);

    randomizeTargetFrame();

    setTimeout(() => {
      setIsShuffling(false);
      showMainButton(t('shuffle'));
      setBottomBarColor("#020728");
      setHeaderColor("#020728");
    }, 1000);
  }, [ updateSupabase, gameState, user?.currentFoolGameId, randomizeTargetFrame, showMainButton, setBottomBarColor, setHeaderColor, t]);

  useEffect(() => {
    const addPlayerIfNeeded = async () => {
      if (!gameState || !user?.currentFoolGameId || !user?.id) return;

      const playerExists = gameState.players?.some((player) => player.id === user.id.toString());

      if (!playerExists || !gameState.players) {
        const newPlayer: Player = {
          id: user.id.toString(),
          username: user.telegram_username || 'Anonymous',
          position: { x: Math.random() * (window.innerWidth - 128) / window.innerWidth, y: Math.random() * (window.innerHeight - 256) / window.innerHeight + 128 / window.innerHeight },
          messages: [],
        };
        
        const updatedPlayers = [...(gameState.players || []), newPlayer];
        const updatedGameState = { ...gameState, players: updatedPlayers };

        setGameState(updatedGameState);
        await updateSupabase(updatedGameState);
      }
    };

    if (gameState) {
      addPlayerIfNeeded();
    }
  }, [updateSupabase, gameState, user]);

  const handlePositionChange = useCallback(async (playerId: string, newPos: Point) => {
    if (!gameState || !user?.currentFoolGameId) return;

    const updatedPlayers = gameState.players.map((player) =>
      player.id === playerId ? { ...player, position: newPos } : player
    );

    const updatedGameState = { ...gameState, players: updatedPlayers };

    setGameState(updatedGameState);
    await updateSupabase(updatedGameState);
  }, [updateSupabase, gameState, user?.currentFoolGameId]);

  const handleMessageUpdate = useCallback(async (playerId: string, messages: Message[]) => {
    if (!gameState || !user?.currentFoolGameId) return;

    const updatedPlayers = gameState.players.map((player) =>
      player.id === playerId ? { ...player, messages } : player
    );

    const updatedGameState = { ...gameState, players: updatedPlayers };

    setGameState(updatedGameState);
    await updateSupabase(updatedGameState);
  }, [updateSupabase, gameState, user?.currentFoolGameId]);

  const handleUpdateSettings = useCallback(async (settings: GameSettings) => {
    setGameSettings(settings);
    if (user) {
      try {
        const { error } = await supabase
          .from('users')
          .update({ 'game_state.settings': settings })
          .eq('id', user.id);

        if (error) throw error;

        dispatch({
          type: 'UPDATE_USER',
          payload: {
            ...user,
            game_state: { ...user.game_state, settings },
          },
        });
      } catch (error) {
        console.error('Error updating user settings:', error);
        toast({
          title: t('updateError'),
          description: t('updateErrorDescription'),
          variant: "destructive",
        });
      }
    }
  }, [user, dispatch, t]);

  useEffect(() => {
    if (user?.game_state?.settings) {
      setGameSettings(user.game_state.settings);
    }
  }, [user?.game_state?.settings]);

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

  // Show main button and set colors
  useEffect(() => {
    showMainButton(t('shuffle'));
    tg?.MainButton?.setParams({ color: "#11E6D0", text_color: "#000000" });
    setBottomBarColor("#020728");
    setHeaderColor("#020728");
  }, [ showMainButton, t, tg, setBottomBarColor, setHeaderColor]);

  // Handle main button click
  useEffect(() => {
    const handleMainButtonClick = () => {
      shuffleCards(); // Function to shuffle cards
    };

    tg?.MainButton?.onClick(handleMainButtonClick);
  }, [tg, shuffleCards]);

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
      <div className="game-board h-[calc(100vh)] relative overflow-hidden">
        {/* <div className="absolute inset-0 z-0">
          <InfinityMirror layers={15} baseColor=hsl(var(--background)) accentColor={theme.colors.secondary} />
        </div> */}

        <div className="relative z-10">
        <Settings
            onUpdateSettings={(settings: GameSettings) => {
              if (state.user) {
                const updatedGameState = {
                  ...state.user.game_state,
                  settings: settings,
                }
                dispatch({ type: 'UPDATE_GAME_STATE', payload: updatedGameState })
              }
            }}
            initialSettings={state.user?.game_state?.settings}
          />
          {gameState?.cards.map((card) => (
            <MegaCard
              key={card.id}
              card={card}
              onCardUpdate={onCardUpdate}
              forceFlipped={gameState.players?.some(player => 
                player.id === user?.id?.toString() && isCardNearPlayer(card, player)
              )}
              isShuffling={isShuffling}
              physicsParams={gameSettings}
            />
          ))}

          <div
            style={{
              width: '42px',
              height: '63px',
              position: 'absolute',
              borderColor: theme.colors.secondary,
              top: targetFrame.y,
              left: targetFrame.x,
              transform: `rotate(${targetFrame.rotation}deg)`,
              border: '2px dashed hsl(var(--secondary))',
              borderRadius: '5px',
            }}
          />

          {gameState?.players?.map((player) => (
            <EnhancedMegaAvatar
              key={player.id}
              gameState={gameState}
              playerId={player.id}
              initialPosition={player.position}
              onPositionChange={handlePositionChange}
              onMessageUpdate={handleMessageUpdate}
            />
          ))}
        </div>
      </div>  
    </Suspense>
  );
};

export default GameBoard;
