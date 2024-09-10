// components\game\MegaCard.tsx
import { animated } from 'react-spring';
import { useRef, useEffect, useState } from 'react';
import { useGesture } from '@use-gesture/react';
import { supabase } from '../../lib/supabaseClient';
import { cardsImages } from './CardsImgs';
import { CardPhysics } from './CardPhysics';
import PhysicsControls from './PhysicsControls'; // Import the new physics control component
import {
  calculateVelocity,
  calculateDirection,
  calculateFlightDuration,
  calculateFinalPosition,
  applyAirFriction,
  applySurfaceFriction,
  applyShadowAndParallax,
  calculateRotationSpeed as calcRotationSpeed
} from './physics';

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
  const lastPositionRef = useRef<Point | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [crosshairPosition, setCrosshairPosition] = useState<Point | null>(null);
  const [physicsParams, setPhysicsParams] = useState<PhysicsParams>({
    gravity: 9.81,
    airFriction: 0.98,
    surfaceFriction: 0.92,
    mass: 5,
    liftCoefficient: 0.03,
    minRotationSpeedForLift: 3,
  });

  // Initialize the physics for the card when the component mounts or gameState changes
  useEffect(() => {
    const card = gameState.cards.find((c) => c.id === cardId);
    if (card && cardRef.current) {
      const posX = lastPositionRef.current?.x || card.position.x * window.innerWidth;
      const posY = lastPositionRef.current?.y || card.position.y * window.innerHeight;

      lastPositionRef.current = { x: posX, y: posY };
      physicsRef.current = new CardPhysics({ x: posX, y: posY }, physicsParams);
    }
  }, [gameState, cardId]);

  // Sync the physics params to the physics engine whenever they change
  useEffect(() => {
    if (physicsRef.current) {
      physicsRef.current.params = { ...physicsParams };
    }
  }, [physicsParams]);

  // Handle card release and update the game state
  const handleRelease = async (deltaX: number, deltaY: number, velocityX: number, velocityY: number) => {
    setIsDragging(false);

    if (!lastPositionRef.current || !physicsRef.current) return;

    const velocity = calculateVelocity(deltaX, deltaY, velocityX, velocityY);
    const flightDuration = calculateFlightDuration(velocity, 100, 3); // Adjust maxVelocity and maxTime as needed
    const finalPosition = calculateFinalPosition(
      lastPositionRef.current.x,
      lastPositionRef.current.y,
      velocityX,
      velocityY,
      flightDuration
    );

    physicsRef.current.velocity = { x: velocityX * 100, y: velocityY * 100 };
    physicsRef.current.rotation.speed = calcRotationSpeed(deltaX, deltaY, velocityX, velocityY, physicsParams.minRotationSpeedForLift);

    const airborneTime = (2 / 3) * flightDuration;
    const dragTime = (1 / 3) * flightDuration;

    const animateFlight = () => {
      let currentTime = 0;
      const animation = setInterval(() => {
        currentTime += 1 / 60;

        if (currentTime < airborneTime) {
          physicsRef.current!.velocity = applyAirFriction(physicsRef.current!.velocity, physicsParams.airFriction);
          physicsRef.current!.rotation.angle += physicsRef.current!.rotation.speed;
          applyShadowAndParallax(currentTime, flightDuration, cardRef, cloneRef);
          if (currentTime > airborneTime / 2) {
            physicsRef.current!.rotation.angle += 180;
            gameState.cards.find((c) => c.id === cardId)!.flipped = !gameState.cards.find((c) => c.id === cardId)!.flipped;
          }
        } else if (currentTime >= airborneTime && currentTime < flightDuration) {
          physicsRef.current!.velocity = applySurfaceFriction(physicsRef.current!.velocity, physicsParams.surfaceFriction);
          physicsRef.current!.rotation.angle += physicsRef.current!.rotation.speed;
        }

        if (currentTime >= flightDuration) {
          clearInterval(animation);
          lastPositionRef.current = finalPosition;
          updateGameState(finalPosition, physicsRef.current!.velocity, physicsRef.current!.rotation);
        }

        updateCardPosition(finalPosition, physicsRef.current!.rotation.angle);
      }, 1000 / 60);
    };

    animateFlight();
  };

  const updateGameState = async (position: Point, velocity: Point, rotation: any) => {
    const updatedGameState = {
      ...gameState,
      cards: gameState.cards.map((card) =>
        card.id === cardId
          ? { ...card, position: { x: position.x / window.innerWidth, y: position.y / window.innerHeight } }
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
  };

  const updateCardPosition = (position: Point, rotation: number) => {
    if (cardRef.current && cloneRef.current) {
      cardRef.current.style.transform = `translate(${position.x}px, ${position.y}px) rotate(${rotation}deg)`;
      cloneRef.current.style.transform = `translate(${position.x}px, ${position.y}px) rotate(${rotation}deg)`;
    }
  };

  const handleDrag = (deltaX: number, deltaY: number, velocityX: number, velocityY: number) => {
    const velocity = calculateVelocity(deltaX, deltaY, velocityX, velocityY);
    const flightDuration = calculateFlightDuration(velocity, 100, 3); // Adjust maxVelocity and maxTime as needed
    const predictedPosition = calculateFinalPosition(
      lastPositionRef.current?.x || 0,
      lastPositionRef.current?.y || 0,
      velocityX,
      velocityY,
      flightDuration
    );

    setCrosshairPosition(predictedPosition);
  };

  const bind = useGesture({
    onDrag: ({ down, movement: [mx, my], velocity: [velocityX, velocityY], memo = { x: 0, y: 0 } }) => {
      const card = gameState.cards.find((c) => c.id === cardId);
      if (!card || !lastPositionRef.current) return;

      if (down && !isDragging) {
        memo = { x: lastPositionRef.current.x, y: lastPositionRef.current.y };
        setIsDragging(true);
      }

      const newX = memo.x + mx;
      const newY = memo.y + my;

      if (physicsRef.current) {
        physicsRef.current.velocity = { x: velocityX * 100, y: velocityY * 100 };
        physicsRef.current.rotation.speed = calcRotationSpeed(mx, my, velocityX, velocityY, physicsParams.minRotationSpeedForLift);
        physicsRef.current.step();
      }

      updateCardPosition({ x: newX, y: newY }, physicsRef.current!.rotation.angle);

      if (!down) {
        handleRelease(mx, my, velocityX, velocityY);
        setIsDragging(false);
      }

      return memo;
    },
  });
  const Crosshair = ({ position }: { position: { x: number; y: number } }) => {
    return (
      <div
        style={{
          position: 'absolute',
          top: `${position.y}px`,
          left: `${position.x}px`,
          width: '10px',
          height: '10px',
          backgroundColor: 'red',
          borderRadius: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 10
        }}
      />
    );
  };
  return (
    <>
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
      />
      {isDragging && crosshairPosition && <Crosshair position={crosshairPosition} />
}
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
  
  