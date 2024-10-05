'use client'

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAppContext } from '@/context/AppContext';
import { supabase } from '@/lib/supabaseClient';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SkinShop from './SkinShop';

export interface GameSettings {
  yeetCoefficient: number;
  yeetVelocityThreshold: number;
  shirtImgUrl: string;
  cardsImgUrl: string;
}

const defaultSettings: GameSettings = {
  yeetCoefficient: 1.5,
  yeetVelocityThreshold: 0.5,
  shirtImgUrl: '',
  cardsImgUrl: '',
};

interface SettingsProps {
  onUpdateSettings: (settings: GameSettings) => void;
  initialSettings?: GameSettings;
}

export const Settings: React.FC<SettingsProps> = ({ onUpdateSettings, initialSettings }) => {
  const [settings, setSettings] = useState<GameSettings>(initialSettings || defaultSettings);
  const [isOpen, setIsOpen] = useState(false);
  const { state, dispatch, t } = useAppContext();
  const [stage, setStage] = useState<number | null>(null);

  useEffect(() => {
    if (initialSettings) {
      setSettings(initialSettings);
    }
  }, [initialSettings]);

  useEffect(() => {
    const fetchStage = async () => {
      if (state.user) {
        const { data, error } = await supabase
          .from('users')
          .select('game_state->stage')
          .eq('id', state.user.id)
          .single();

        if (error) console.error('Error fetching stage:', error);
        else setStage(Number(data.stage));
      }
    };

    fetchStage();
  }, [state.user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: name.includes('Url') ? value : parseFloat(value) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings(settings);
    setIsOpen(false);

    if (state.user) {
      try {
        const newGameState = {
          ...state.user.game_state,
          settings: state.user.game_state.settings,
        };
        const { error } = await supabase
          .from('users')
          .update({
            'game_state': newGameState,
          })
          .eq('id', state.user.id);

        if (error) throw error;

        dispatch({
          type: 'UPDATE_USER',
          payload: {
            ...state.user,
            game_state: { ...state.user.game_state, settings },
          },
        });
      } catch (error) {
        console.error('Error updating user settings:', error);
      }
    }
  };

  const handleSetDefault = () => {
    setSettings(defaultSettings);
    onUpdateSettings(defaultSettings);
  };

  return (
    <div className="fixed bottom-13 left-2 z-50">
      <Button onClick={() => setIsOpen(!isOpen)} className="mb-2 ml-2" variant="outline">
        {isOpen ? 'X' : "⚙"}
      </Button>
      {isOpen && (
        <div className="bg-background p-4 rounded-lg shadow-lg max-h-[calc(100vh-200px)] overflow-y-auto w-80">
          <Tabs defaultValue="settings">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="settings">{t("settings.title")}</TabsTrigger>
              {stage !== null && stage >= 1 && <TabsTrigger value="skins">{t("skinShop")}</TabsTrigger>}
            </TabsList>
            <TabsContent value="settings">
              <form onSubmit={handleSubmit}>
                {Object.entries(settings).map(([key, value]) => {
                  if (stage !== null && stage < 2 && !key.includes('yeet')) {
                    return null;
                  }
                  return (
                    <div key={key} className="mb-2">
                      <Label htmlFor={key} className="block mb-1">
                        {t(key)}
                      </Label>
                      <Input
                        type={key.includes('Url') ? 'text' : 'number'}
                        id={key}
                        name={key}
                        value={value}
                        onChange={handleChange}
                        step={key.includes('Url') ? undefined : '0.1'}
                        className="w-full"
                      />
                    </div>
                  );
                })}
                <div className="flex justify-between mt-4">
                  <Button type="submit" className="w-1/2 mr-2" variant="outline">
                    {t("applySettings")}
                  </Button>
                  <Button type="button" onClick={handleSetDefault} variant="outline" className="w-1/2 ml-2">
                    {t("setDefault")}
                  </Button>
                </div>
              </form>
            </TabsContent>
            {stage !== null && stage >= 1 && (
              <TabsContent value="skins">
                <SkinShop />
              </TabsContent>
            )}
          </Tabs>
        </div>
      )}
    </div>
  );
};
