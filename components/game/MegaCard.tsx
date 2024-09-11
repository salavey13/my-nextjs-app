// components\game\MegaCard.tsx
import { animated, useSpring } from 'react-spring';
import { useRef, useEffect, useState } from 'react';
import { useGesture } from '@use-gesture/react';
import { supabase } from '../../lib/supabaseClient';
import { cardsImages } from './CardsImgs';
import { useAppContext } from '@/context/AppContext';

const GAME_ID = 28;

interface Point {
  x: number;
  y: number;
}

interface Card {
  id: string;
  position: Point;
  flipped: boolean;
  trajectory: {
    position: Point;
    rotation: number;
    velocity: Point;
    rotationSpeed: number;
  };
}

interface Player {
  id: string;
  position: Point;
}

interface GameState {
  cards: Card[];
  players: Player[];
}

type CardId = keyof typeof cardsImages;

interface MegacardProps {
  gameState: GameState;
  cardId: string;
  syncTrajectory: (cardId: string, trajectoryData: any) => void;
}

const MegaCard: React.FC<MegacardProps> = ({ gameState, cardId, syncTrajectory }) => {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const lastPositionRef = useRef<Point | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isYeeted, setIsYeeted] = useState(false);
  const [currentFlipAngle, setCurrentFlipAngle] = useState<number>(0);
  const { user } = useAppContext();
  
  const [{ x, y, shadow }, set] = useSpring(() => ({
    x: 0,
    y: 0,
    shadow: 5,
    config: { mass: 1, tension: 200, friction: 13 },
  }));
  // Initialize card position when the component mounts or gameState changes
  useEffect(() => {
    const card = gameState.cards.find((c) => c.id === cardId);
    if (card) {
      const posX = lastPositionRef.current?.x || card.position.x * window.innerWidth;
      const posY = lastPositionRef.current?.y || card.position.y * window.innerHeight;

      lastPositionRef.current = { x: posX, y: posY };
      updateCardPosition(posX, posY, card.trajectory.rotation);
      // Assuming gameState contains the card info
      setCurrentFlipAngle(card?.flipped ? 180 : 0)
    }
  }, [gameState, cardId]);
  
  const easeOut = (t: number) => 1 - Math.pow(1 - t, 3); // Cubic easing-out

  // Animate the card with easing
  const animateMovement = (startX: number, startY: number, endX: number, endY: number, duration: number) => {
    const startTime = performance.now();
  
    const animate = (currentTime: number) => {
      const elapsed = (currentTime - startTime) / duration; // Progress from 0 to 1
      const t = Math.min(1, elapsed); // Clamp to 1 for end of animation
  
      const easedT = easeOut(t); // Apply easing
  
      const newX = startX + (endX - startX) * easedT;
      const newY = startY + (endY - startY) * easedT;
  
      updateCardPosition(newX, newY, 0);
  
      if (t < 1) {
        requestAnimationFrame(animate);
      } 
    };
  
    requestAnimationFrame(animate);
  };
  
  // Handle yeet logic with signed deltas
const handleYeet = (velocityX: number, velocityY: number, deltaX: number, deltaY: number) => {
    if (!lastPositionRef.current || !cardRef.current) return;
  
    setIsYeeted(true);
  
    // Set flip angle to 180 for the yeet
    setCurrentFlipAngle(180);
  
    const startX = lastPositionRef.current.x + deltaX;
    const startY = lastPositionRef.current.y + deltaY;
  
    // Get distance with sign applied based on delta direction
    const signedDistanceX = deltaX > 0 ? Math.abs(velocityX) : -Math.abs(velocityX);
    const signedDistanceY = deltaY > 0 ? Math.abs(velocityY) : -Math.abs(velocityY);
  
    const finalX = startX + signedDistanceX * 69; // Distance for yeet
    const finalY = startY + signedDistanceY * 69;
  
    // Yeet with ease-out animation
    animateMovement(startX, startY, finalX, finalY, 500);
  
    setTimeout(() => setIsYeeted(false), 500);

    updateGameState({
        x: finalX / window.innerWidth,
        y: finalY / window.innerHeight,
        flipped: true,
      });
  };
  
  // Handle gentle movement when swipe velocity is low
  const glideGently = (avgVelocity: number, deltaX: number, deltaY: number) => {
    if (!lastPositionRef.current) return;
  
    const startX = lastPositionRef.current.x + deltaX;
    const startY = lastPositionRef.current.y + deltaX;
  
    // Get gentle glide distance with sign
    const signedDistanceX = deltaX > 0 ? Math.abs(avgVelocity) : -Math.abs(avgVelocity);
    const signedDistanceY = deltaY > 0 ? Math.abs(avgVelocity) : -Math.abs(avgVelocity);
  
    const finalX = startX + signedDistanceX * 13;
    const finalY = startY + signedDistanceY * 13;
  
    // Glide with ease-out animation
    animateMovement(startX, startY, finalX, finalY, 300);

    updateGameState({
        x: finalX / window.innerWidth,
        y: finalY / window.innerHeight,
        flipped: false,
      });
      // const updatedGameState = {
    //     ...gameState,
    //     cards: gameState.cards.map((card) =>
    //       card.id === cardId
    //         ? {
    //             ...card,
    //             position: { x: x, y: y },
    //             flipped: flipAngle === 180,
    //           }
    //         : card
    //     ),
    //   };
    // syncTrajectory(cardId, updatedGameState )
  };
  

  // Update game state in Supabase
  const updateGameState = async (position: Point & { flipped: boolean }) => {
    const updatedGameState = {
      ...gameState,
      cards: gameState.cards.map((card) =>
        card.id === cardId
          ? {
              ...card,
              position: { x: position.x, y: position.y },
              flipped: position.flipped,
            }
          : card
      ),
    };

    const { error } = await supabase
      .from('rents')
      .update({ game_state: updatedGameState })
      .eq('id', user?.currentGameId);

    if (error) {
      console.error('Error updating game state:', error);
    }
  };

  // Update card position and rotation on screen
  const updateCardPosition = (x: number, y: number, flipAngle: number) => {
    if (!cardRef.current) return;

    // Save the position into the ref after dragging ends
    lastPositionRef.current = { x: x, y: y };
  
    cardRef.current.style.transform = `translate(${x}px, ${y}px) rotate(${flipAngle}deg)`;
  
    // // Apply flip class if needed
    // if (flipAngle === 180) {
    //   cardRef.current.classList.add('flipped');
    // } else {
    //   cardRef.current.classList.remove('flipped');
    // }
    
  };
  

  const handleDragEnd = () => {
    if (!cardRef.current || !lastPositionRef.current) return;

        const finalX = lastPositionRef.current.x;
        const finalY = lastPositionRef.current.y;

        // Save card's final position and flipped state to the game state
        updateCardPosition(finalX, finalY, currentFlipAngle); // Use currentFlipAngle

        // Save the position into the ref after dragging ends
        lastPositionRef.current = { x: finalX, y: finalY };
        updateGameState({
            x: finalX / window.innerWidth,
            y: finalY / window.innerHeight,
            flipped: false,
          });
  
  };
  
  

  // Gesture handling for drag and swipe (yeet)
  const bind = useGesture({
    onDrag: ({ down, movement: [mx, my], velocity: [vx, vy], memo = { x: 0, y: 0 } }) => {
      const card = gameState.cards.find((c) => c.id === cardId);
      if (!card || !lastPositionRef.current) return;

      if (down && !isDragging) {
        memo = { x: lastPositionRef.current.x + mx, y: lastPositionRef.current.y + my };
        setIsDragging(true);
      }

      const avgVelocity = (Math.abs(vx) + Math.abs(vy)) / 2;

      // If the swipe velocity is high enough, yeet the card
      if (!down && avgVelocity > 1.5) {
        handleYeet(vx, vy, mx, my);
      } else if (!down && avgVelocity < 1.5) {
        // Otherwise, glide gently
        glideGently(avgVelocity, mx, my);
      } else {
        // Otherwise, it's just a normal drag
        const newX = memo.x + mx//lastPositionRef.current.x;
        const newY = memo.y + my//lastPositionRef.current.y;
        updateCardPosition(newX, newY, 0);
        
      }

      if (!down) {
        setIsDragging(false);
        handleDragEnd();
      }

      return memo;
    },
  });

  return (
    <animated.div
      ref={cardRef}
      {...bind()}
      style={{
        width: '69px',
        height: '100px',
        backgroundImage: `url(${cardsImages[cardId as CardId]})`,
        backgroundColor: '#131313',
        borderRadius: '8px',
        backgroundSize: 'cover',
        position: 'absolute',
        cursor: 'grab',
        zIndex: 1,
        touchAction: 'none',
        //transform:  `translate(${x}px, ${y.get()}px)`,
      }}
    />
  );
};

export default MegaCard;
