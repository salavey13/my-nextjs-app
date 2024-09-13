import { animated, useSpring } from 'react-spring';
import { useRef, useEffect, useState } from 'react';
import { useGesture } from '@use-gesture/react';
import { cardsImages } from './CardsImgs';
import { useAppContext } from '@/context/AppContext';
import { supabase } from '../../lib/supabaseClient';

interface Card {
  id: CardId;
  position: { x: number; y: number };
  last_position: { x: number; y: number };
  flipped: boolean;
  rotations: number;
  velocity: { x: number; y: number };
  direction: { x: number; y: number };
}

export type CardId = keyof typeof cardsImages;

interface MegaCardProps {
  card: Card;
  onCardUpdate: (card: Card) => void;
}

export const MegaCard: React.FC<MegaCardProps> = ({ card, onCardUpdate }) => {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const preDragPositionRef = useRef({ x: card.position.x, y: card.position.y });
  const yeetLocked = useRef(false); // Yeet locked state
  const [isDragging, setIsDragging] = useState(false);
  const [isYeeted, setIsYeeted] = useState(false);
  const { user } = useAppContext();
  const [rotations, setRotations] = useState(card.rotations);

  // Physics parameters (session-persistent via local storage)
  const [yeetCoefficient, setYeetCoefficient] = useState(() => Number(localStorage.getItem('yeetCoefficient')) || 2);
  const [mass, setMass] = useState(() => Number(localStorage.getItem('mass')) || 1);
  const [tension, setTension] = useState(() => Number(localStorage.getItem('tension')) || 210);
  const [rotationDistance, setRotationDistance] = useState(() => Number(localStorage.getItem('rotationDistance')) || 69);
  const [friction, setFriction] = useState(() => Number(localStorage.getItem('friction')) || 20);

  const YEET_VELOCITY_THRESHOLD = 3.1;
  const MIN_MOVEMENT_THRESHOLD = 20;

  const [{ x, y, rotX, rotZ }, setSpring] = useSpring(() => ({
    x: card.position.x * window.innerWidth,
    y: card.position.y * window.innerHeight,
    rotX: 0,
    rotZ: card.rotations * 180,
    config: { mass, tension, friction },
  }));

  // Subscribe to real-time updates for card position and rotation
  useEffect(() => {
    const channel = supabase
      .channel('realtime-cards')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'cards', filter: `id=eq.${card.id}` }, (payload) => {
        const updatedCard = payload.new as Card;
        if (updatedCard.id === card.id) {
          onCardUpdate(updatedCard);
          setSpring.start({
            x: updatedCard.position.x * window.innerWidth,
            y: updatedCard.position.y * window.innerHeight,
            rotZ: updatedCard.rotations * 180,
          });
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [card.id, onCardUpdate, setSpring]);

  useEffect(() => {
    setSpring.start({
      x: card.position.x * window.innerWidth,
      y: card.position.y * window.innerHeight,
    });
    setRotations(card.rotations);
  }, [card, setSpring, mass, tension, friction]);

  const normalizePosition = (x: number, y: number) => ({
    x: x / window.innerWidth,
    y: y / window.innerHeight,
  });

  const flipCard = () => {
    const newFlipAngle = rotX.get() % 180 === 0 ? 180 : 0;
    setRotations(rotX.get() / 180);
    onCardUpdate({ ...card, flipped: newFlipAngle === 180 });
  };

  const bind = useGesture({
    onDragStart: () => {
      setIsDragging(true);
      preDragPositionRef.current = { x: card.position.x, y: card.position.y };
      yeetLocked.current = false;
    },
    onDrag: ({ movement: [mx, my], velocity: [vx, vy] }) => {
      const currentX = preDragPositionRef.current.x * window.innerWidth + mx;
      const currentY = preDragPositionRef.current.y * window.innerHeight + my;

      const isYeetPrep = Math.abs(vx) > YEET_VELOCITY_THRESHOLD && Math.abs(my) > MIN_MOVEMENT_THRESHOLD;

      if (isYeetPrep && !yeetLocked.current) {
        setIsYeeted(true);
        yeetLocked.current = true;
      }

      if (isDragging && !isYeeted && cardRef.current) {
        setSpring.start({ x: currentX, y: currentY });
      } else if (isYeeted && cardRef.current) {
        cardRef.current.style.border = "3px solid #e1ff01";
      }
    },
    onDragEnd: ({ movement: [mx, my], velocity: [vx, vy] }) => {
      setIsDragging(false);
      if (cardRef.current) cardRef.current.style.border = "none";

      if (!isYeeted) {
        onCardUpdate({
          ...card,
          position: normalizePosition(preDragPositionRef.current.x * window.innerWidth + mx, preDragPositionRef.current.y * window.innerHeight + my),
          last_position: preDragPositionRef.current,
        });
      } else {
        const yeetDistanceX = mx * yeetCoefficient;
        const yeetDistanceY = my * yeetCoefficient;
        const newRotations = Math.floor(Math.sqrt(yeetDistanceX ** 2 + yeetDistanceY ** 2) / rotationDistance);

        setSpring.start({
          x: preDragPositionRef.current.x * window.innerWidth + yeetDistanceX,
          y: preDragPositionRef.current.y * window.innerHeight + yeetDistanceY,
          rotZ: newRotations * 180,
        });

        onCardUpdate({
          ...card,
          position: normalizePosition(preDragPositionRef.current.x * window.innerWidth + yeetDistanceX, preDragPositionRef.current.y * window.innerHeight + yeetDistanceY),
          rotations: newRotations,
          velocity: { x: vx, y: vy },
          last_position: preDragPositionRef.current,
        });
        setIsYeeted(false);
      }

      // Update flip status based on rotationX modulo 180
      const flippedStatus = rotX.get() % 180 === 0;
      onCardUpdate({ ...card, flipped: flippedStatus });
    },
    onDoubleClick: flipCard,
  });

  // Visual controls for yeet coefficient, mass, tension, rotation distance, and friction
  const handleSliderChange = (param: string, value: number) => {
    switch (param) {
      case 'yeetCoefficient':
        setYeetCoefficient(value);
        localStorage.setItem('yeetCoefficient', value.toString());
        break;
      case 'mass':
        setMass(value);
        localStorage.setItem('mass', value.toString());
        break;
      case 'tension':
        setTension(value);
        localStorage.setItem('tension', value.toString());
        break;
      case 'rotationDistance':
        setRotationDistance(value);
        localStorage.setItem('rotationDistance', value.toString());
        break;
      case 'friction':
        setFriction(value);
        localStorage.setItem('friction', value.toString());
        break;
      default:
        break;
    }

    // Immediately apply changes to spring with updated config
    setSpring.start({
      config: { mass, tension, friction }
    });
  };

  return (
    <>
      <animated.div
        ref={cardRef}
        {...bind()}
        style={{
          width: '69px',
          height: '102px',
          backgroundImage: `url(${cardsImages[card.flipped ? card.id : "shirt"]})`,
          borderRadius: '10px',
          backgroundSize: 'cover',
          transform: `rotateX(${rotX.get()}deg) rotateZ(${rotZ.get()}deg)`,
          x,
          y,
        }}
      />
      <div className="controls">
        <label>Yeet Coefficient</label>
        <input
          type="range"
          min={1}
          max={10}
          value={yeetCoefficient}
          onChange={(e) => handleSliderChange('yeetCoefficient', Number(e.target.value))}
        />
        <label>Mass</label>
        <input
          type="range"
          min={1}
          max={10}
          value={mass}
          onChange={(e) => handleSliderChange('mass', Number(e.target.value))}
        />
        <label>Tension</label>
        <input
          type="range"
          min={1}
          max={300}
          value={tension}
          onChange={(e) => handleSliderChange('tension', Number(e.target.value))}
        />
        <label>Rotation Distance</label>
        <input
          type="range"
          min={1}
          max={100}
          value={rotationDistance}
          onChange={(e) => handleSliderChange('rotationDistance', Number(e.target.value))}
        />
        <label>Friction</label>
        <input
          type="range"
          min={1}
          max={50}
          value={friction}
          onChange={(e) => handleSliderChange('friction', Number(e.target.value))}
        />
      </div>
    </>
  );
};
