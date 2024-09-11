import { animated, useSpring } from 'react-spring';
import { useRef, useEffect, useState } from 'react';
import { useGesture } from '@use-gesture/react';
import { supabase } from '../../lib/supabaseClient';
import { cardsImages } from './CardsImgs';
import { useAppContext } from '@/context/AppContext';

const GAME_ID = 28;

const MegaCard = ({ gameState, cardId, syncTrajectory }) => {
  const cardRef = useRef(null);
  const lastPositionRef = useRef({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isYeeted, setIsYeeted] = useState(false);
  const [currentFlipAngle, setCurrentFlipAngle] = useState(0);
  const { user } = useAppContext();

  const [{ x, y, shadow }, setSpring] = useSpring(() => ({
    x: 0,
    y: 0,
    shadow: 5,
    config: { mass: 1, tension: 200, friction: 13 },
  }));

  useEffect(() => {
    const card = gameState.cards.find(c => c.id === cardId);
    if (card) {
      const posX = card.position.x * window.innerWidth;
      const posY = card.position.y * window.innerHeight;
      lastPositionRef.current = { x: posX, y: posY };
      updateCardPosition(posX, posY, card.trajectory.rotation);
      setCurrentFlipAngle(card.flipped ? 180 : 0);
    }
  }, [gameState, cardId]);

  const handleYeet = (velocityX, velocityY, deltaX, deltaY) => {
    if (!lastPositionRef.current || !cardRef.current) return;

    setIsYeeted(true);
    setCurrentFlipAngle(180); // Flip the card when yeeted

    const signedDistanceX = deltaX > 0 ? Math.abs(velocityX) : -Math.abs(velocityX);
    const signedDistanceY = deltaY > 0 ? Math.abs(velocityY) : -Math.abs(velocityY);

    // Yeet with increased velocity by applying tension to the spring
    setSpring({
      x: lastPositionRef.current.x + signedDistanceX * 100,
      y: lastPositionRef.current.y + signedDistanceY * 100,
      shadow: 15, // Increase shadow during yeet
      config: { tension: 400, friction: 10 }, // Stronger tension, lower friction
    });

    // Simulate card position update after the yeet
    setTimeout(() => setIsYeeted(false), 500);

    updateGameState({
      x: (lastPositionRef.current.x + signedDistanceX * 100) / window.innerWidth,
      y: (lastPositionRef.current.y + signedDistanceY * 100) / window.innerHeight,
      flipped: true,
    });
  };

  const glideGently = (avgVelocity, deltaX, deltaY) => {
    if (!lastPositionRef.current) return;

    setSpring({
      x: lastPositionRef.current.x + deltaX * 10,
      y: lastPositionRef.current.y + deltaY * 10,
      shadow: 5, // Lower shadow for gentle glide
      config: { tension: 120, friction: 26 }, // Smooth, gentle glide
    });

    updateGameState({
      x: (lastPositionRef.current.x + deltaX * 10) / window.innerWidth,
      y: (lastPositionRef.current.y + deltaY * 10) / window.innerHeight,
      flipped: false,
    });
  };

  const bind = useGesture({
    onDrag: ({ down, movement: [mx, my], velocity: [vx, vy] }) => {
      const avgVelocity = (Math.abs(vx) + Math.abs(vy)) / 2;

      if (down) {
        setIsDragging(true);
        setSpring({
          x: lastPositionRef.current.x + mx,
          y: lastPositionRef.current.y + my,
          shadow: 10,
          config: { tension: 300, friction: 20 }, // Simulate tension during drag
        });
      } else {
        setIsDragging(false);

        if (avgVelocity > 1.5) {
          handleYeet(vx, vy, mx, my); // Yeet with increased velocity
        } else {
          glideGently(avgVelocity, mx, my); // Glide gently if velocity is low
        }
      }
    },
  });

  return (
    <animated.div
      ref={cardRef}
      {...bind()}
      style={{
        width: '69px',
        height: '100px',
        backgroundImage: `url(${cardsImages[cardId]})`,
        borderRadius: '8px',
        backgroundSize: 'cover',
        position: 'absolute',
        cursor: 'grab',
        zIndex: 1,
        touchAction: 'none',
        transform: x.to((x) => `translate(${x}px, ${y.get()}px)`),
        boxShadow: shadow.to((s) => `0px ${s}px ${s * 2}px rgba(0, 0, 0, 0.3)`),
      }}
    />
  );
};

export default MegaCard;
