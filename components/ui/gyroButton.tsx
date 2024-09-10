import { useMotionValue, useSpring } from 'framer-motion';
import React, { useEffect, useRef } from 'react';
import { Button } from './button';

const GyroButton: React.FC<{ shuffleCards: () => void}> = ({ shuffleCards }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { damping: 100, stiffness: 400 });
  const springY = useSpring(y, { damping: 100, stiffness: 400 });
  const ref = useRef(null);

  useEffect(() => {
    const handleOrientation = (event: DeviceOrientationEvent) => {
      const { gamma, beta } = event; // Gyroscope angles
      if (ref.current) {
        const tiltX = (gamma || 0) * 0.1; // You can adjust intensity here
        const tiltY = (beta || 0) * 0.1;

        x.set(tiltX);
        y.set(tiltY);
      }
    };

    window.addEventListener('deviceorientation', handleOrientation, true);

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, [x, y]);

  return (
    <Button
      className="shuffle-button"
      onClick={shuffleCards}
      ref={ref}
      style={{
        transform: `translate(${springX.get()}px, ${springY.get()}px)`,
      }}
    >
      Shuffle
    </Button>
  );
};
