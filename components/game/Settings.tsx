import React, { useState, useEffect } from 'react';
import { animated, useSpring } from 'react-spring';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAppContext } from '@/context/AppContext';
import { supabase } from '../../lib/supabaseClient'; // Assuming you use Supabase to manage game_state

export interface PhysicsSettings {
  yeetCoefficient: number;
  mass: number;
  tension: number;
  friction: number;
  rotationDistance: number;
  yeetVelocityThreshold: number;
  minMovementThreshold: number;
}

interface SettingsProps {
  onUpdateSettings: (settings: PhysicsSettings) => void;
  initialSettings: PhysicsSettings;
}

export const Settings: React.FC<SettingsProps> = ({ onUpdateSettings, initialSettings }) => {
  const [settings, setSettings] = useState<PhysicsSettings>(initialSettings);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user, t } = useAppContext();

  // Spring animation for modal slide-in effect
  const slideIn = useSpring({
    transform: isModalOpen ? 'translateY(0%)' : 'translateY(-100%)',
  });

  const toggleModal = () => setIsModalOpen(!isModalOpen);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: parseFloat(value) }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings(settings);
    setIsModalOpen(false); // Close modal after submission
  };

  const restoreDefaults = async () => {
    setSettings(initialSettings);
    await supabase
      .from('game_state')
      .update({ physicsSettings: initialSettings })
      .eq('id', user?.currentGameId); 
    onUpdateSettings(initialSettings);
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
            className="absolute top-20 left-0 right-0 mx-auto w-11/12 max-w-lg bg-background p-5 rounded-lg shadow-md text-white"
            onClick={(e) => e.stopPropagation()} // Prevent modal close on inner click
          >
            <form onSubmit={handleSubmit} className="space-y-4">
              <h2 className="text-2xl font-bold mb-4">{t('physicsSettings')}</h2>
              {Object.entries(settings).map(([key, value]) => (
                <div key={key}>
                  <Label htmlFor={key}>{t(key)}</Label>
                  <Input
                    type="number"
                    id={key}
                    name={key}
                    value={value}
                    onChange={handleChange}
                    step="0.1"
                  />
                </div>
              ))}
              <div className="flex justify-between">
                <Button type="submit">{t('applySettings')}</Button>
                <Button onClick={restoreDefaults} variant="outline" className="ml-4">
                  {t('settings.restoreDefaults')}
                </Button>
              </div>
            </form>
          </animated.div>
        </div>
      )}
    </div>
  );
};
