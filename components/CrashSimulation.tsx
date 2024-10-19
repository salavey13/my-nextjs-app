import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import InfinityMirror from './game/InfinityMirror';

interface CrashSimulationProps {
  onCrashComplete: () => void;
}

const CrashSimulation: React.FC<CrashSimulationProps> = ({ onCrashComplete }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [currentLayer, setCurrentLayer] = useState(0);
  const totalLayers = 13;

  useEffect(() => {
    const layerInterval = setInterval(() => {
      setCurrentLayer((prevLayer) => {
        if (prevLayer >= totalLayers - 1) {
          clearInterval(layerInterval);
          setTimeout(() => {
            setIsVisible(false);
            onCrashComplete();
          }, 1000);
          return prevLayer;
        }
        return prevLayer + 1;
      });
    }, 300);

    return () => clearInterval(layerInterval);
  }, [onCrashComplete]);

  return (
    <motion.div
      initial={{ opacity: 1, scale: 1 }}
      animate={{ opacity: isVisible ? 1 : 0, scale: isVisible ? 1 : 0 }}
      transition={{ duration: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black"
    >
      <div className="w-full h-full relative overflow-hidden">
        <InfinityMirror layers={totalLayers} baseColor="#000000" accentColor="#ff0000" />
        <AnimatePresence>
          {Array.from({ length: totalLayers }).map((_, index) => (
            <motion.div
              key={index}
              initial={{ scale: 1, opacity: 1 }}
              animate={{
                scale: index <= currentLayer ? [1, 0.8, 0.6, 0.4, 0.2, 0] : 1,
                opacity: index <= currentLayer ? [1, 0.8, 0.6, 0.4, 0.2, 0] : 1,
              }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: `url('/smartphone-iphone-android-cracked-wallpaper-05-830x1799.jpg')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                zIndex: totalLayers - index,
              }}
            />
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default CrashSimulation;