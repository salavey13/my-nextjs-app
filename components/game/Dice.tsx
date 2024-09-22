// components/game/Dice.tsx
import React, { useState, useEffect } from 'react';
import { useSpring, animated } from 'react-spring';

interface DiceProps {
  value: number;
  rolling: boolean;
  onRollComplete: () => void;
}

const diceFaces = [
  '⚀', '⚁', '⚂', '⚃', '⚄', '⚅'
];

export const Dice: React.FC<DiceProps> = ({ value, rolling, onRollComplete }) => {
  const [randomFaces, setRandomFaces] = useState<number[]>([]);

  useEffect(() => {
    if (rolling) {
      const interval = setInterval(() => {
        setRandomFaces([
          Math.floor(Math.random() * 6),
          Math.floor(Math.random() * 6),
          Math.floor(Math.random() * 6),
        ]);
      }, 50);

      return () => clearInterval(interval);
    }
  }, [rolling]);

  const { rotation, scale } = useSpring({
    rotation: rolling ? 720 : 0,
    scale: rolling ? 1.2 : 1,
    config: { tension: 300, friction: 10 },
    onRest: () => {
      if (!rolling) {
        onRollComplete();
      }
    },
  });

  return (
    <animated.div
      style={{
        width: '64px',
        height: '64px',
        backgroundColor: '#e53e3e',
        borderRadius: '10px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: '48px',
        color: 'white',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        transform: rotation.to(r => `rotateX(${r}deg) rotateY(${r * 1.5}deg)`),
        scale: scale,
      }}
    >
      {rolling ? diceFaces[randomFaces[0]] : diceFaces[value - 1]}
    </animated.div>
  );
};
