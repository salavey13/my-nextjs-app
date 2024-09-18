// components\game\MegaCard.tsx
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
  const [isFlipped, setIsFlipped] = useState(card.flipped);
  const { t } = useAppContext();
  const [isAnimating, setIsAnimating] = useState(false);
  const lastClickTime = useRef(0);
  const isDragging = useRef(false);

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
    setIsFlipped(card.flipped || forceFlipped);
    api.start({ rotY: (card.flipped || forceFlipped) ? 180 : 0 });
  }, [card.flipped, forceFlipped, api]);



  const handleDrag = useCallback((mx: number, my: number, vx: number, vy: number, down: boolean) => {
    if (down) {
      isDragging.current = true;
      api.start({
        x: card.position.x * window.innerWidth + mx,
        y: card.position.y * window.innerHeight + my,
        scale: 1.1,
        immediate: true,
      });
    } else {
      if (!isDragging.current) return;
      isDragging.current = false;

      const yeetCoefficient = physicsParams.yeetCoefficient;
      const newX = (card.position.x * window.innerWidth + mx * yeetCoefficient + window.innerWidth) % window.innerWidth;
      const newY = (card.position.y * window.innerHeight + my * yeetCoefficient + window.innerHeight) % window.innerHeight;
      
      const velocity = Math.sqrt(vx * vx + vy * vy);
      const isYeeted = velocity > physicsParams.yeetVelocityThreshold;
      
      setIsAnimating(true);
      api.start({
        x: newX,
        y: newY,
        rotZ: card.rotations * 360 + (isYeeted ? Math.sign(vx + vy) * Math.min(velocity * 360, 720) : 0),
        scale: 1,
        config: { velocity: isYeeted ? [vx * yeetCoefficient, vy * yeetCoefficient] : [0, 0] },
        onRest: () => {
          setIsAnimating(false);
          onCardUpdate({
            ...card,
            position: { 
              x: Math.max(0, Math.min(newX / window.innerWidth, 1 - 30 / window.innerWidth)),
              y: Math.max(0, Math.min(newY / window.innerHeight, 1 - 45 / window.innerHeight))
            },
            last_position: card.position,
            rotations: Math.floor(Math.abs(rotZ.get() / 360)) % 4,
            flipped: isYeeted ? !card.flipped : card.flipped,
          });
        },
      });
    }
  }, [card, api, onCardUpdate, rotZ, physicsParams]);

  const handleDoubleClick = useCallback(() => {
    const currentTime = new Date().getTime();
    const timeSinceLastClick = currentTime - lastClickTime.current;

    if (timeSinceLastClick < 300) {
      setIsFlipped(!isFlipped);
      onCardUpdate({ ...card, flipped: !isFlipped });
    }

    lastClickTime.current = currentTime;
  }, [card, isFlipped, onCardUpdate]);

  const bind = useGesture({
    onDrag: ({ movement: [mx, my], velocity: [vx, vy], down }) => handleDrag(mx, my, vx, vy, down),
    onClick: handleDoubleClick,
  });

  return (
    <animated.div
      ref={cardRef}
      {...bind()}
      style={{
        width: '30px',
        height: '45px',
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
          borderRadius: '2px',
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
          borderRadius: '2px',
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