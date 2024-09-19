import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
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
  const { t, user } = useAppContext();
  const [isAnimating, setIsAnimating] = useState(false);
  const isDragging = useRef(false);
  const dragStartTime = useRef(0);
  const velocityHistory = useRef<{ x: number; y: number }[]>([]);

  const [{ x, y, rotateY, rotateZ, scale }, api] = useSpring(() => ({
    x: card.position.x * window.innerWidth,
    y: card.position.y * window.innerHeight,
    rotateY: card.flipped || forceFlipped ? 180 : 0,
    rotateZ: card.rotations * 360,
    scale: 1,
    config: { mass: 1, tension: 170, friction: 26 },
  }));

  useEffect(() => {
    if (!isAnimating) {
      api.start({
        x: card.position.x * window.innerWidth,
        y: card.position.y * window.innerHeight,
        rotateZ: card.rotations * 360,
        immediate: isShuffling,
      });
    }
  }, [card.position, card.rotations, isShuffling, api, isAnimating]);

  useEffect(() => {
    api.start({ rotateY: (card.flipped || forceFlipped) ? 180 : 0 });
  }, [card.flipped, forceFlipped, api]);

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
        newY = Math.max(topShelfHeight, Math.min(newY, window.innerHeight - bottomShelfHeight - 169));
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
        rotateZ: card.rotations * 360 + (isYeeted ? Math.sign(mx + my) * 360 : 0),
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
            rotations: Math.floor(Math.abs(rotateZ.get() / 360)) % 13,
            flipped: isYeeted ? (isCurved ? !card.flipped : card.flipped) : card.flipped,
            timestamp: Date.now(),
          });
        },
      });
    }
  }, [card, api, onCardUpdate, rotateZ, physicsParams]);

  const bind = useGesture({
    onDrag: ({ movement: [mx, my], velocity: [vx, vy], down }) => handleDrag(mx, my, vx, vy, down),
  });

  const { cardFaceUrl, shirtUrl } = useMemo(() => {
    const defaultCardFaceUrl = cardsImages[card.id];
    const defaultShirtUrl = cardsImages["shirt"];

    if (user?.loot?.fool?.cards) {
      return {
        cardFaceUrl: user.loot.fool.cards.cards_img_url || defaultCardFaceUrl,
        shirtUrl: user.loot.fool.cards.shirt_img_url || defaultShirtUrl,
      };
    }

    return { cardFaceUrl: defaultCardFaceUrl, shirtUrl: defaultShirtUrl };
  }, [card.id, user?.loot?.fool?.cards]);

  const cardFaceStyle = useMemo(() => {
    if (cardFaceUrl.includes('sprite')) {
      const row = Math.floor(parseInt(card.id) / 9);
      const col = parseInt(card.id) % 9;
      return {
        backgroundImage: `url(${cardFaceUrl})`,
        backgroundPosition: `${col * -100}% ${row * -100}%`,
        backgroundSize: '900% 400%',
      };
    }
    return {
      backgroundImage: `url(${cardFaceUrl})`,
      backgroundSize: 'cover',
    };
  }, [cardFaceUrl, card.id]);

  return (
    <><animated.div
      ref={cardRef}
      {...bind()}
      style={{
        width: '42px',
        height: '63px',
        ...cardFaceStyle,
        position: 'absolute',
        backfaceVisibility: 'hidden',
        touchAction: 'none',
        zIndex: card.zIndex,
        transform: to([x, y, rotateY, rotateZ, scale], (x, y, rotateY, rZ, s) =>
          `translate3d(${x}px,${y}px,0) rotateY(${rotateY + 180}deg) rotateZ(${rZ}deg) scale(${s})`
        ),
      }}
    >
      <animated.div
        style={{
          ...cardFaceStyle,
          width: '100%',
          height: '100%',
          borderRadius: '3px',
          position: 'absolute',
          top: 0,
          left: 0,
          // transform: to([rotateY], (rotateY) =>
          //   `translate3d(rotateY(180deg))`
          // ),
          //transform: 'rotateY(180deg)',
        }}
      />
    </animated.div>
    <animated.div
      ref={cardRef}
      {...bind()}
      style={{
        width: '42px',
        height: '63px',
        position: 'absolute',
        touchAction: 'none',
        backfaceVisibility: 'hidden',
        zIndex: card.zIndex,
        transform: to([x, y, rotateY, rotateZ, scale], (x, y, rotateY, rZ, s) =>
          `translate3d(${x}px,${y}px,0) rotateY(${rotateY}deg) rotateZ(${rZ}deg) scale(${s})`
        ),
      }}
    >
      <animated.div
        style={{
          width: '100%',
          height: '100%',
          backgroundImage: `url(${shirtUrl})`,
          backgroundSize: 'cover',
          borderRadius: '3px',
          backfaceVisibility: 'hidden',
          position: 'absolute',
          top: 0,
          left: 0,
          // transform: to([rotateY], (rotateY) =>
          //   `translate3d(rotateY(${rotateY + 180}deg))`
          // ),
          //transform: 'rotateY(180deg)',
        }}
      />
      
      
    </animated.div>
    </>
  );
});

MegaCard.displayName = 'MegaCard';