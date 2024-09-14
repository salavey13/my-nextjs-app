import React, { useState, useEffect } from 'react';
import { animated, useSpring } from 'react-spring';
import { useAppContext } from '@/context/AppContext'; // For translations and app context
import { Button } from '../ui/button';

interface SettingsProps {
  onUpdateSettings: (settings: PhysicsSettings) => void;
}

export interface PhysicsSettings {
  yeetCoefficient: number;
  mass: number;
  tension: number;
  friction: number;
  rotationDistance: number;
  yeetVelocityThreshold: number;
  minMovementThreshold: number;
}

const defaultSettings: PhysicsSettings = {
  yeetCoefficient: 2,
  mass: 1,
  tension: 210,
  friction: 20,
  rotationDistance: 69,
  yeetVelocityThreshold: 3.1,
  minMovementThreshold: 20,
};

export const Settings: React.FC<SettingsProps> = ({ onUpdateSettings }) => {
  const { t } = useAppContext(); // Translation function
  const [isModalOpen, setIsModalOpen] = useState(false);

  // State for all physics settings
  const [yeetCoefficient, setYeetCoefficient] = useState(() => Number(localStorage.getItem('yeetCoefficient')) || defaultSettings.yeetCoefficient);
  const [mass, setMass] = useState(() => Number(localStorage.getItem('mass')) || defaultSettings.mass);
  const [tension, setTension] = useState(() => Number(localStorage.getItem('tension')) || defaultSettings.tension);
  const [friction, setFriction] = useState(() => Number(localStorage.getItem('friction')) || defaultSettings.friction);
  const [rotationDistance, setRotationDistance] = useState(() => Number(localStorage.getItem('rotationDistance')) || defaultSettings.rotationDistance);
  const [yeetVelocityThreshold, setYeetVelocityThreshold] = useState(() => Number(localStorage.getItem('yeetVelocityThreshold')) || defaultSettings.yeetVelocityThreshold);
  const [minMovementThreshold, setMinMovementThreshold] = useState(() => Number(localStorage.getItem('minMovementThreshold')) || defaultSettings.minMovementThreshold);

  // Spring animation for sliding the settings panel
  const slideIn = useSpring({
    transform: isModalOpen ? 'translateX(0%)' : 'translateX(-100%)',
  });

  const toggleModal = () => setIsModalOpen(!isModalOpen);

  const restoreDefaults = () => {
    Object.keys(defaultSettings).forEach((key) => {
      localStorage.setItem(key, String(defaultSettings[key as keyof PhysicsSettings]));
    });
    window.location.reload(); // Reload to apply default settings
  };

  // Save settings to localStorage and update parent component
  useEffect(() => {
    const settings: PhysicsSettings = {
      yeetCoefficient,
      mass,
      tension,
      friction,
      rotationDistance,
      yeetVelocityThreshold,
      minMovementThreshold,
    };

    localStorage.setItem('yeetCoefficient', String(yeetCoefficient));
    localStorage.setItem('mass', String(mass));
    localStorage.setItem('tension', String(tension));
    localStorage.setItem('friction', String(friction));
    localStorage.setItem('rotationDistance', String(rotationDistance));
    localStorage.setItem('yeetVelocityThreshold', String(yeetVelocityThreshold));
    localStorage.setItem('minMovementThreshold', String(minMovementThreshold));

    onUpdateSettings(settings);
  }, [yeetCoefficient, mass, tension, friction, rotationDistance, yeetVelocityThreshold, minMovementThreshold, onUpdateSettings]);

  return (
    <div>
      {/* Gear Button to open modal */}
      <button
        onClick={toggleModal}
        className="bg-gray-800 text-white rounded-full p-2 w-10 h-10 flex items-center justify-center"
        aria-label={t('settings.gear')}
      >
        ⚙️
      </button>

      {/* Modal with sliding settings panel */}
      {isModalOpen && (
        <div
          id="modal-background"
          onClick={() => setIsModalOpen(false)}
          
          className="fixed top-13 left-10 h-full bg-black bg-opacity-50 z-50"
        >
          <animated.div
            style={slideIn}

            className="absolute top-13 left-10 bg-black p-5 rounded-lg text-white"
            onClick={(e) => e.stopPropagation()} // Prevent modal close on inner click
          >
            
            

            <div style={{
      position: 'fixed',
  
      padding: '13px 13px',
      display: 'grid',
      gridTemplateColumns: '2fr 1fr 0.5fr', // Adjust grid to accommodate labels and sliders neatly
      gap: '10px',
      justifyContent: 'space-between',
      backgroundColor: "#131313",
      borderRadius: '13px',
      boxShadow: '0 0 10px rgba(0,0,0,0.5)'
    }}>
              {/* Physics Settings */}
              <div/><h2 className="text-xl mb-4 bg-black">{t('settings.title')}</h2>
<Button onClick={restoreDefaults} variant="outline" className="bg-white text-black p-2 rounded-lg mb-4">
                OK
              {/* {t('settings.restoreDefaults')} */}
            </Button>
              <label>
                {t('settings.yeetCoefficient')}: 
              </label>
              <input type="range" min="0.1" max="10" step="0.1" value={yeetCoefficient} onChange={(e) => setYeetCoefficient(Number(e.target.value))} />
{yeetCoefficient}
              <label>
                {t('settings.mass')}: 
                </label>
                <input type="range" min="0.1" max="5" step="0.1" value={mass} onChange={(e) => setMass(Number(e.target.value))} />
              {mass}

              <label>
                {t('settings.tension')}: 
                </label>
                <input type="range" min="50" max="500" step="10" value={tension} onChange={(e) => setTension(Number(e.target.value))} />
              {tension}

              <label>
                {t('settings.friction')}: 
                </label>
                <input type="range" min="1" max="100" step="1" value={friction} onChange={(e) => setFriction(Number(e.target.value))} />
              {friction}

              <label>
                {t('settings.rotationDistance')}: 
                </label>
                <input type="range" min="10" max="100" step="1" value={rotationDistance} onChange={(e) => setRotationDistance(Number(e.target.value))} />
              {rotationDistance}

              <label>
                {t('settings.yeetVelocityThreshold')}: 
                </label>
                <input type="range" min="0.1" max="10" step="0.1" value={yeetVelocityThreshold} onChange={(e) => setYeetVelocityThreshold(Number(e.target.value))} />
              {yeetVelocityThreshold}

              <label>
                {t('settings.minMovementThreshold')}: 
                </label>
                <input type="range" min="1" max="100" step="1" value={minMovementThreshold} onChange={(e) => setMinMovementThreshold(Number(e.target.value))} />
              {minMovementThreshold}
            </div>

            <a
              href="https://github.com/salavey13/my-nextjs-app"
              target="_blank"
              rel="noopener noreferrer"
              className="block mt-2 p-2 bg-white text-black text-center rounded"
            >
              {t('settings.github')}
            </a>

            <p className="text-gray-500 text-center text-sm mt-6">
              {t('settings.version')}
            </p>
          </animated.div>
        </div>
      )}
    </div>
  );
};
