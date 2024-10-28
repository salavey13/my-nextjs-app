import React, { useCallback } from 'react';
import { useSpring, animated, to } from 'react-spring';
import { useGesture } from '@use-gesture/react';
import { useAppContext } from '@/context/AppContext';
import ShineBorder from '@/components/ui/ShineBorder';
import { useTheme } from '@/hooks/useTheme'

interface Player {
  id: string;
  username: string;
  position: { x: number; y: number };
}

interface GameState {
  cards: any[];
  players: Player[];
}

interface MegaAvatarProps {
  gameState: GameState;
  playerId: string;
  initialPosition: { x: number; y: number };
  onPositionChange: (playerId: string, newPosition: { x: number; y: number }) => void;
}

const MegaAvatar: React.FC<MegaAvatarProps> = React.memo(({ gameState, playerId, initialPosition, onPositionChange }) => {
  const { state } = useAppContext();
  const player = gameState.players.find(p => p.id === playerId);
  const { theme } = useTheme()
  const [{ x, y }, api] = useSpring(() => ({
    x: initialPosition.x * window.innerWidth,
    y: initialPosition.y * window.innerHeight,
    config: { mass: 1, tension: 200, friction: 20 },
  }));

  const handleDrag = useCallback((mx: number, my: number, down: boolean) => {
    if (!down) {
      const newX = Math.max(0, Math.min(initialPosition.x * window.innerWidth + mx, window.innerWidth - 64));
      const newY = Math.max(0, Math.min(initialPosition.y * window.innerHeight + my, window.innerHeight - 64));
      onPositionChange(playerId, { 
        x: newX / window.innerWidth,
        y: newY / window.innerHeight
      });
    }
    api.start({ 
      x: initialPosition.x * window.innerWidth + mx,
      y: initialPosition.y * window.innerHeight + my,
      immediate: down 
    });
  }, [initialPosition, playerId, onPositionChange, api]);

  const bind = useGesture({
    onDrag: ({ movement: [mx, my], down }) => handleDrag(mx, my, down),
  });

  return (
    <animated.div
      {...bind()}
      style={{
        transform: to([x, y], (x, y) => `translate(${x}px, ${y}px)`),
        width: '128px',
        height: '128px',
        position: 'absolute',
        touchAction: 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <ShineBorder borderWidth={2} duration={10} color={theme.colors.secondary.hex}>
        <div
          style={{
            width: '128px',
            height: '128px',
            borderRadius: '50%',
            backgroundColor: player?.id === state?.user?.id?.toString() ? 'rgba(225, 255, 1, 0.2)' : 'transparent',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'hsl(var(--secondary))',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              color: '#000000',
              fontWeight: 'bold',
              fontSize: '24px',
            }}
          >
            {player?.username.charAt(0).toUpperCase()}
          </div>
        </div>
      </ShineBorder>
      {player && (
        <div
          style={{
            marginTop: '5px',
            backgroundColor: 'rgba(0, 0, 0, 0.13)',
            color: 'hsl(var(--secondary))',
            padding: '2px 6px',
            borderRadius: '10px',
            fontSize: '0.75rem',
            maxWidth: '100%',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {player.username}
        </div>
      )}
    </animated.div>
  );
});

MegaAvatar.displayName = 'MegaAvatar';

export default MegaAvatar;
