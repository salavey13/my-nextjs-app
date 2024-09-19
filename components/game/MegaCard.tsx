import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useSpring, animated, to } from 'react-spring';
import { useGesture } from '@use-gesture/react';
import { cardsImages } from './CardsImgs';
import { useAppContext } from '@/context/AppContext';
import { PhysicsSettings } from './Settings';

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

export type CardId = keyof typeof cardsImages;

interface MegaCardProps {
  card: Card;
  onCardUpdate: (card: Card) => void;
  forceFlipped: boolean;
  isShuffling: boolean;
  physicsParams: PhysicsSettings;
}

export const MegaCard: React.FC<MegaCardProps> = React.memo(({ card, onCardUpdate, forceFlipped, isShuffling, physicsParams }) => {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const { t } = useAppContext();
  const [isAnimating, setIsAnimating] = useState(false);
  const isDragging = useRef(false);
  const dragStartTime = useRef(0);
  const velocityHistory = useRef<{ x: number; y: number }[]>([]);

  const [{ x, y, rotY, rotZ, scale }, api] = useSpring(() => ({
    x: card.position.x * window.innerWidth,
    y: card.position.y * window.innerHeight,
    rotY: card.flipped ? 180 : 0,
    rotZ: card.rotations * 360,
    scale: 1,
    config: { mass: 1, tension: 170, friction: 26 },
  }));

  useEffect(() => {
    if (!isAnimating) {
      api.start({
        x: card.position.x * window.innerWidth,
        y: card.position.y * window.innerHeight,
        rotZ: card.rotations * 360,
        immediate: isShuffling,
      });
    }
  }, [card.position, card.rotations, isShuffling, api, isAnimating]);

  useEffect(() => {
    api.start({ rotY: card.flipped ? 180 : 0 });
  }, [card.flipped, api]);

  const handleDrag = useCallback((mx: number, my: number, vx: number, vy: number, down: boolean) => {
    if (down) {
      if (!isDragging.current) {
        dragStartTime.current = Date.now();
        velocityHistory.current = [];
      }
      isDragging.current = true;
      velocityHistory.current.push({ x: vx, y: vy });
      if (velocityHistory.current.length > 5) {
        velocityHistory.current.shift();
      }
      api.start({
        x: card.position.x * window.innerWidth + mx,
        y: card.position.y * window.innerHeight + my,
        scale: 1.1,
        immediate: true,
      });
    } else {
      if (!isDragging.current || Math.abs(mx) < 13) return;
      isDragging.current = false;

      const yeetCoefficient = physicsParams.yeetCoefficient;
      
      let newX = card.position.x * window.innerWidth + mx * yeetCoefficient;
      let newY = card.position.y * window.innerHeight + my * yeetCoefficient;
      
      // Bounce off walls
      const topShelfHeight = 64;
      const bottomShelfHeight = 64;
      if (newX < 0 || newX > window.innerWidth - 42) {
        mx *= -0.5;
        newX = Math.max(0, Math.min(newX, window.innerWidth - 42));
      }
      if (newY < topShelfHeight || newY > window.innerHeight - bottomShelfHeight - 63) {
        my *= -0.5;
        newY = Math.max(topShelfHeight, Math.min(newY, window.innerHeight - bottomShelfHeight - 63));
      }
      
      const avgVelocity = velocityHistory.current.reduce((acc, v) => ({ x: acc.x + v.x, y: acc.y + v.y }), { x: 0, y: 0 });
      avgVelocity.x /= velocityHistory.current.length;
      avgVelocity.y /= velocityHistory.current.length;
      
      const velocity = Math.sqrt(avgVelocity.x * avgVelocity.x + avgVelocity.y * avgVelocity.y);
      const isYeeted = velocity > physicsParams.yeetVelocityThreshold;
      
      const isCurved = velocityHistory.current.reduce((count, v, i) => {
        if (i > 1 && (Math.sign(v.x) !== Math.sign(velocityHistory.current[i-1].x) || Math.sign(v.y) !== Math.sign(velocityHistory.current[i-1].y))) {
          return count + 1;
        }
        return count;
      }, 0) >= 2;
      
      setIsAnimating(true);
      api.start({
        x: newX,
        y: newY,
        rotZ: card.rotations * 360 + (isYeeted ? Math.sign(mx + my) * 360 : 0),
        scale: 1,
        config: { duration: 300 },
        onRest: () => {
          setIsAnimating(false);
          onCardUpdate({
            ...card,
            position: { 
              x: newX / window.innerWidth,
              y: newY / window.innerHeight
            },
            last_position: card.position,
            rotations: Math.floor(Math.abs(rotZ.get() / 360)) % 13,
            flipped: isYeeted ? (isCurved ? !card.flipped : card.flipped) : card.flipped,
            timestamp: Date.now(),
          });
        },
      });
    }
  }, [card, api, onCardUpdate, rotZ, physicsParams]);

  const bind = useGesture({
    onDrag: ({ movement: [mx, my], velocity: [vx, vy], down }) => handleDrag(mx, my, vx, vy, down),
  });

  const isFlipped = card.flipped || forceFlipped;

  return (
    <animated.div
      ref={cardRef}
      {...bind()}
      style={{
        width: '42px',
        height: '63px',
        position: 'absolute',
        touchAction: 'none',
        zIndex: card.zIndex,
        transform: to([x, y, rotY, rotZ, scale], (x, y, rY, rZ, s) =>
          `translate3d(${x}px,${y}px,0) rotateY(${rY}deg) rotateZ(${rZ}deg) scale(${s})`
        ),
      }}
    >
      <animated.div
        style={{
          width: '100%',
          height: '100%',
          backgroundImage: `url(${cardsImages[card.id]})`,
          backgroundSize: 'cover',
          borderRadius: '3px',
          backfaceVisibility: 'hidden',
          transform: to([rotY], (r) => `rotateY(${r}deg)`),
          
        }}
      />
      <animated.div
        style={{
          width: '100%',
          height: '100%',
          backgroundImage: `url(${cardsImages["shirt"]})`,
          backgroundSize: 'cover',
          borderRadius: '3px',
          backfaceVisibility: 'hidden',
          position: 'absolute',
          top: 0,
          left: 0,
          transform: to([rotY], (r) => `rotateY(${r + 180}deg)`),
          
        }}
      />
    </animated.div>
  );
});

MegaCard.displayName = 'MegaCard';
