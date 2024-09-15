import React, { useState, useEffect } from 'react';
import { animated, useSpring } from 'react-spring';
import { useAppContext } from '@/context/AppContext'; // For translations and app context
import { Button } from '../ui/button';
import { supabase } from '../../lib/supabaseClient'; // Assuming you use Supabase to manage game_state

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
  const { user, t } = useAppContext(); // Translation function
  const [isModalOpen, setIsModalOpen] = useState(false);

  // State for all physics settings
  const [settings, setSettings] = useState<PhysicsSettings>(defaultSettings);

  // Spring animation for sliding the settings panel
  const slideIn = useSpring({
    transform: isModalOpen ? 'translateX(0%)' : 'translateX(-100%)',
  });

  const toggleModal = () => setIsModalOpen(!isModalOpen);

  const restoreDefaults = async () => {
    setSettings(defaultSettings);
    await supabase
      .from('game_state')
      .update({ physicsSettings: defaultSettings })
      .eq('id', user?.currentGameId); 
    onUpdateSettings(defaultSettings);
  };

  // Fetch the settings from game_state on component mount
  useEffect(() => {
    const fetchSettings = async () => {
      const { data, error } = await supabase
        .from('game_state')
        .select('physicsSettings')
        .eq('id', user?.currentGameId) 
        .single();

      if (data && !error) {
        setSettings(data.physicsSettings || defaultSettings);
      }
    };

    fetchSettings();
  }, [supabase]);

  // Update game_state whenever settings change
  useEffect(() => {
    const saveSettings = async () => {
      await supabase
        .from('game_state')
        .update({ physicsSettings: settings })
        .eq('id', user?.currentGameId); // Replace with actual game state id
    };

    saveSettings();
    onUpdateSettings(settings);
  }, [settings, supabase, onUpdateSettings]);

  const handleChange = (key: keyof PhysicsSettings, value: number) => {
    setSettings((prevSettings) => ({
      ...prevSettings,
      [key]: value,
    }));
  };

  return (
    <div>
      {/* Gear Button to open modal */}
      <button
        onClick={toggleModal}
        className="bg-gray-800 text-white rounded-full p-2 w-10 h-10 flex items-center justify-center"
        aria-label={t('settings.gear')}
      >
        ⛭
      </button>

      {/* Modal with sliding settings panel */}
      {isModalOpen && (
        <div
          id="modal-background"
          onClick={() => setIsModalOpen(false)}
          className="fixed w-full h-full bg-black bg-opacity-50 z-50 overflow-x-scroll"
        >
          <animated.div
            style={slideIn}
            className="absolute top-13 left-0 h-1/2 bg-black p-5 rounded-lg text-white"
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
              boxShadow: '0 0 10px rgba(0,0,0,0.5)',
            }}>
              <div/><h2 className="text-xl mb-4 bg-black">{t('settings.title')}</h2>
              <Button onClick={restoreDefaults} variant="outline" className="bg-white text-black p-2 rounded-lg mb-4">
                😭
              </Button>

              <label className="text-xs">{t('settings.yeetCoefficient')}:</label>
              <input type="range" min="0.1" max="10" step="0.1" value={settings.yeetCoefficient} onChange={(e) => handleChange('yeetCoefficient', Number(e.target.value))} />
              {settings.yeetCoefficient}

              <label className="text-xs">{t('settings.mass')}:</label>
              <input type="range" min="0.1" max="5" step="0.1" value={settings.mass} onChange={(e) => handleChange('mass', Number(e.target.value))} />
              {settings.mass}

              <label className="text-xs">{t('settings.tension')}:</label>
              <input type="range" min="50" max="500" step="10" value={settings.tension} onChange={(e) => handleChange('tension', Number(e.target.value))} />
              {settings.tension}

              <label className="text-xs">{t('settings.friction')}:</label>
              <input type="range" min="1" max="100" step="1" value={settings.friction} onChange={(e) => handleChange('friction', Number(e.target.value))} />
              {settings.friction}

              <label className="text-xs">{t('settings.rotationDistance')}:</label>
              <input type="range" min="10" max="100" step="1" value={settings.rotationDistance} onChange={(e) => handleChange('rotationDistance', Number(e.target.value))} />
              {settings.rotationDistance}

              <label className="text-xs">{t('settings.yeetVelocityThreshold')}:</label>
              <input type="range" min="0.1" max="10" step="0.1" value={settings.yeetVelocityThreshold} onChange={(e) => handleChange('yeetVelocityThreshold', Number(e.target.value))} />
              {settings.yeetVelocityThreshold}

              <label className="text-xs">{t('settings.minMovementThreshold')}:</label>
              <input type="range" min="1" max="100" step="1" value={settings.minMovementThreshold} onChange={(e) => handleChange('minMovementThreshold', Number(e.target.value))} />
              {settings.minMovementThreshold}
            </div>
          </animated.div>
        </div>
      )}
    </div>
  );
};
