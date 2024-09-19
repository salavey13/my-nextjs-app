import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAppContext } from '@/context/AppContext';

export interface PhysicsSettings {
  yeetCoefficient: number;
  yeetVelocityThreshold: number;
}

const defaultSettings: PhysicsSettings = {
  yeetCoefficient: 1.5,
  yeetVelocityThreshold: 0.5,
};

interface SettingsProps {
  onUpdateSettings: (settings: PhysicsSettings) => void;
  initialSettings: PhysicsSettings;
}

export const Settings: React.FC<SettingsProps> = ({ onUpdateSettings, initialSettings }) => {
  const [settings, setSettings] = useState<PhysicsSettings>(initialSettings);
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useAppContext();

  useEffect(() => {
    setSettings(initialSettings);
  }, [initialSettings]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: parseFloat(value) }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings(settings);
    setIsOpen(false);
  };

  const handleSetDefault = () => {
    setSettings(defaultSettings);
    onUpdateSettings(defaultSettings);
  };

  return (
    <div className="fixed bottom-16 left-2 z-50">
      <Button onClick={() => setIsOpen(!isOpen)} className="mb-2 ml-2">
        {isOpen ? t('Х') : t('settings.title')}
      </Button>
      {isOpen && (
        <form onSubmit={handleSubmit} className="bg-background p-4 rounded-lg shadow-lg max-h-[calc(100vh-200px)] overflow-y-auto">
          {Object.entries(settings).map(([key, value]) => (
            <div key={key} className="mb-2">
              <Label htmlFor={key} className="block mb-1">
                {t(key)}
              </Label>
              <Input
                type="number"
                id={key}
                name={key}
                value={value}
                onChange={handleChange}
                step="0.1"
                className="w-full"
              />
            </div>
          ))}
          <div className="flex justify-between mt-4">
            <Button type="submit" className="w-1/2 mr-2">
              {t('applySettings')}
            </Button>
            <Button type="button" onClick={handleSetDefault} className="w-1/2 ml-2">
              {t('setDefault')}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};
