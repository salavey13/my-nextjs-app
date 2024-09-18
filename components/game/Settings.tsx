import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAppContext } from '@/context/AppContext';

export interface PhysicsSettings {
  yeetCoefficient: number;
  yeetVelocityThreshold: number;
  minMovementThreshold: number;
}

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

  return (
    <div className="fixed bottom-16 right-4 z-50">
      <Button onClick={() => setIsOpen(!isOpen)} className="mb-2">
        {isOpen ? t('closeSettings') : t('openSettings')}
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
          <Button type="submit" className="mt-4 w-full">
            {t('applySettings')}
          </Button>
        </form>
      )}
    </div>
  );
};