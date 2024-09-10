import { animated } from 'react-spring';
import { useRef, useEffect, useState, ComponentType } from 'react';
import { useGesture } from '@use-gesture/react';
import { supabase } from '../../lib/supabaseClient';
import { cardsImages } from './CardsImgs';
import { CardPhysics } from './CardPhysics';
import PhysicsControls from './PhysicsControls'; // Import the new physics control component
//import { animated } from 'react-spring';                                                           

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
    position: Point,
    rotation: number,
    velocity: Point,
    rotationSpeed: number,
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
  syncTrajectory: (trajectoryData: any) => void;
}

interface PhysicsParams {
  gravity: number;
  airFriction: number;
  surfaceFriction: number;
  mass: number;
  liftCoefficient: number;
  minRotationSpeedForLift: number;
}

const MegaCard: React.FC<MegacardProps> = ({ gameState, cardId, syncTrajectory }) => {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const cloneRef = useRef<HTMLDivElement | null>(null);
  const physicsRef = useRef<CardPhysics | null>(null);
  const lastPositionRef = useRef<Point | null>(null); // Keep track of the last position
  const [isDragging, setIsDragging] = useState(false);
  const [isLongPress, setIsLongPress] = useState(false);
  const [longPressStart, setLongPressStart] = useState<number | null>(null);
  const [physicsParams, setPhysicsParams] = useState<PhysicsParams>({
    gravity: 9.81,
    airFriction: 0.98,
    surfaceFriction: 0.92,
    mass: 5,
    liftCoefficient: 0.03,
    minRotationSpeedForLift: 3,
  });


  useEffect(() => {
    if (gameState) {
      const card = gameState.cards.find((c) => c.id === cardId);
      if (card) {
        const posX = lastPositionRef.current?.x || card.position.x * window.innerWidth;
        const posY = lastPositionRef.current?.y || card.position.y * window.innerHeight;
  
        if (!lastPositionRef.current) {
          lastPositionRef.current = { x: posX, y: posY };
        }
  
        // Initialize physics for the card
        physicsRef.current = new CardPhysics({ x: posX, y: posY }, physicsParams);
      }
    }
  }, [gameState, cardId]);
  
  useEffect(() => {
    if (physicsRef.current) {
      physicsRef.current.params = { ...physicsParams };
    }
  }, [physicsParams]);
  
  // Handle release and update card physics position
  const handleRelease = async (deltaX: number, deltaY: number, velocityX: number, velocityY: number) => {
    setIsDragging(false);
  
    if (physicsRef.current) {
      physicsRef.current.step();
    
  
    const speed = Math.sqrt(velocityX ** 2 + velocityY ** 2); // Calculate total speed
  
    if (speed > 1/*minSpeedForYeet*/) {
      // If velocity is enough, continue yeet movement
      physicsRef.current.velocity = { x: velocityX * 100, y: velocityY * 100 };
      physicsRef.current.rotation.speed = calculateRotationSpeed(deltaX, deltaY, velocityX, velocityY);
    } else {
      // Otherwise, just gently slide into position
      physicsRef.current.velocity = { x: velocityX, y: velocityX };
      physicsRef.current.rotation.speed = 0;
    }
}
if (lastPositionRef.current) {
    lastPositionRef.current = {
      x: lastPositionRef.current.x + deltaX,
      y: lastPositionRef.current.y + deltaY
    };
  
    const updatedGameState = {
      ...gameState,
      cards: gameState.cards.map((card) =>
        card.id === cardId
          ? { ...card, position: { x: (lastPositionRef.current as Point).x / window.innerWidth, y: (lastPositionRef.current as Point).y / window.innerHeight } }
          : card
      ),
    };
  
    const { error } = await supabase
      .from('rents')
      .update({ game_state: updatedGameState })
      .eq('id', GAME_ID);
  
    if (error) {
      console.error('Error updating game state:', error);
    }
  
    syncTrajectory({
      position: lastPositionRef.current,
      velocity: physicsRef.current?.velocity,
      rotation: physicsRef.current?.rotation.angle,
      rotationSpeed: physicsRef.current?.rotation.speed,
    });
}
  };

  

  // Gesture handling for dragging and updating position
  const bind = useGesture({
    onDrag: ({ down, movement: [mx, my], velocity: [velocityX, velocityY], memo = { x: 0, y: 0 } }) => {
      const card = gameState.cards.find((c) => c.id === cardId);
      if (!card) return;
  
      if (down && !isDragging && lastPositionRef.current) {
        memo = { x: lastPositionRef.current.x, y: lastPositionRef.current.y }; // Use saved position to prevent jumping
        setIsDragging(true);
      }
  
      const newX = memo.x + mx;
      const newY = memo.y + my;
  
      // Update physics for card movement and rotation
      if (physicsRef.current) {
        physicsRef.current.velocity = { x: velocityX * 100, y: velocityY * 100 };
        physicsRef.current.calculateRotationSpeed(mx, my, velocityX, velocityY); // Use movement delta for direction
        physicsRef.current.step(); // Update the card's physics state
      }
  
      if (cardRef.current && cloneRef.current) {
        // Update card position
        cardRef.current.style.transform = `translate(${newX}px, ${newY}px) rotate(${physicsRef.current?.rotation.angle}deg)`;
      
        // Shadow and parallax effects during drag
        cardRef.current.style.boxShadow = `0px 0px ${Math.min(30, Math.abs(mx + my) / 10)}px rgba(0,0,0,0.2)`;
        // Clone card for parallax effect without shadow
        cloneRef.current.style.transform = `translate(${newX}px, ${newY}px) rotate(${physicsRef.current?.rotation.angle}deg)`;
      }
  
      if (!down) {
        handleRelease(mx, my, velocityX, velocityY); // Pass delta and velocity to handle release
        setIsDragging(false);
      }
  
      return memo;
    },
  });
  
  return (
    <>
      {/* Main Card */}
      <div
        ref={cardRef}
        {...bind()}
        style={{
          width: '100px',
          height: '150px',
          backgroundImage: `url(${cardsImages[cardId as CardId]})`,
          backgroundColor: '#131313',
          borderRadius: '8px',
          backgroundSize: 'cover',
          position: 'absolute',
          cursor: 'grab',
          zIndex: 1,
          touchAction: 'none',
        }}
      >
        <div>{/* Additional card content */}</div>
      </div>
  
      {/* Clone of the card without shadow, for parallax effect */}
      <div
        ref={cloneRef}
        style={{
          width: '100px',
          height: '150px',
          backgroundImage: `url(${cardsImages[cardId as CardId]})`,
          borderRadius: '8px',
          backgroundSize: 'cover',
          position: 'absolute',
          zIndex: 0, // Make sure it's below the main card
        }}
      />
  
      {/* Physics Controls to adjust parameters dynamically */}
      <PhysicsControls physicsParams={physicsParams} setPhysicsParams={setPhysicsParams} />
    </>
  );
};

export default MegaCard;


function calculateRotationSpeed(deltaX: number, deltaY: number, velocityX: number, velocityY: number): number {
    const speed = Math.sqrt(velocityX ** 2 + velocityY ** 2); // Calculate total velocity magnitude
    const direction = Math.atan2(deltaY, deltaX); // Get movement direction angle

    if (speed > 1) {
        // If the speed is high enough, force rotation based on the velocity and movement delta
        return direction * (speed * 0.2); // Factor velocity and direction for rotation speed
    } else {
        return 0; // Otherwise, no significant rotation
    }
}
// type GyroProps = {
//     shadow: number; // Define the shadow prop as a number
//     [key: string]: any; // For any other props that might be passed
//   };
// // Dynamic gyro based on shadow strength
// export const withCustomGyroIntensity = (
//     Component: ComponentType<any>,
//     getIntensity: (shadow: number) => number
//   ): ComponentType<any> => {
//     const SPRING_CONFIG = { damping: 100, stiffness: 400 };
  
//     return (props: any) => {
//       const x = useMotionValue(0);
//       const y = useMotionValue(0);
//       const ref = useRef(null);
  
//       // Ensure that useSpring returns just a MotionValue<number>
//       const springX = useSpring(x.get(), SPRING_CONFIG);
//       const springY = useSpring(y.get(), SPRING_CONFIG);
  
//       const { shadow } = props; // Extract shadow for intensity control
  
//       useEffect(() => {
//         const handleOrientation = (event: DeviceOrientationEvent) => {
//           const { gamma, beta } = event; // Gyroscope angles
//           if (ref.current) {
//             const tiltX = (gamma || 0) * (getIntensity(shadow) / 90); // Tilt proportional to intensity
//             const tiltY = (beta || 0) * (getIntensity(shadow) / 180);
  
//             x.set(tiltX);
//             y.set(tiltY);
//           }
//         };
  
//         window.addEventListener('deviceorientation', handleOrientation, true);
  
//         return () => {
//           window.removeEventListener('deviceorientation', handleOrientation);
//         };
//       }, [x, y, shadow]);
  
//       return (
//         <motion.div
//           ref={ref}
//           style={{
//             // Pass MotionValue objects directly
//             x: springX,
//             y: springY,
//           }}
//         >
//           <Component {...props} />
//         </motion.div>
//       );
//     };
//   };
  
  