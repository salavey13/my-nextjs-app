import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import InfinityMirror from './game/InfinityMirror';

interface CrashSimulationProps {
  onCrashComplete: () => void;
}

const CrashSimulation: React.FC<CrashSimulationProps> = ({ onCrashComplete }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onCrashComplete();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onCrashComplete]);

  return (
    <motion.div
      initial={{ opacity: 1, scale: 1.1 }}
      animate={{ opacity: isVisible ? 1 : 0, scale: isVisible ? 1.1 : 0 }}
      transition={{ duration: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black"
    >
      <div className="w-full h-full max-w-2xl max-h-2xl">
        <InfinityMirror layers={10} baseColor="#000000" accentColor="#ff0000" />
      </div>
      <motion.div
        initial={{ y: 0 }}
        animate={{ y: '100vh' }}
        transition={{ duration: 5, ease: 'easeIn' }}
        className="absolute inset-0 bg-contain bg-center bg-no-repeat"
        style={{ backgroundImage: `url('/smartphone-iphone-android-cracked-wallpaper-05-830x1799.jpg')` }}
      />
    </motion.div>
  );
};

export default CrashSimulation;
