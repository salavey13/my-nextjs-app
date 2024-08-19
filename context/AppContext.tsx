"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient'; // Import from lib/supabaseClient.ts
import { languageDictionary } from '../utils/TranslationUtils';

const defaultStore = {
  tg_id: '',
  username: '',
  coins: '0',
  xp: '0',
  lang: 'en',
  X: '0',
  tasksTodo: [],
  currentGameId: '',
};

interface AppContextType {
  store: typeof defaultStore;
  setStore: React.Dispatch<React.SetStateAction<typeof defaultStore>>;
  fetchPlayer: (tg_id: string, username: string) => void;
  t: (key: string) => string;
  user: any;
  setUser: React.Dispatch<React.SetStateAction<any>>;
  changeLanguage: (langCode: string) => void;
  updateUserReferral: (referrerId: string, gameId: string) => void;
  increaseReferrerX: (referrerId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [store, setStore] = useState(defaultStore);
  const [user, setUser] = useState<any>(null);

  const fetchPlayer = useCallback(async (tg_id: string, username: string) => {
    if (!tg_id) return;
    const { data, error } = await supabase.from('users').select('*').eq('tg_id', tg_id).single();
    if (error) {
      if (error.code === 'PGRST116') {
        await insertNewUser(tg_id, username);
      } else {
        console.error('Fetch error:', error);
      }
    } else {
      updateStoreWithUserData(data);
    }
  }, []);

  const insertNewUser = async (tg_id: string, username: string) => {
    const { data: newUser, error } = await supabase.from('users').insert([{ tg_id, username, coins: '0', xp: '0', lang: store.lang, X: store.X, tasksTodo: [] }]).single();
    if (error) {
      console.error('Insert error:', error);
    } else {
      updateStoreWithUserData(newUser);
    }
  };

  const updateStoreWithUserData = (data: any) => {
    setStore((prev) => ({ ...prev, ...data }));
  };

  const changeLanguage = (langCode: string) => {
    setStore((prev) => ({ ...prev, lang: langCode }));
    sessionStorage.setItem('lang', langCode);
  };

  const t = (key: string) => languageDictionary[store.lang]?.[key] || key;

  const updateUserReferral = async (referrerId: string, gameId: string) => {
    await supabase.from('users').update({ referrer_id: referrerId }).eq('tg_id', store.tg_id);
    await supabase.from('game_participants').insert([{ game_id: gameId, user_id: store.tg_id }]);
  };

  const increaseReferrerX = async (referrerId: string) => {
    const { data: referrer, error } = await supabase.from('users').select('*').eq('tg_id', referrerId).single();
    if (referrer) {
      const newXValue = parseInt(referrer.X || '0', 10) + 1;
      await supabase.from('users').update({ X: newXValue.toString() }).eq('tg_id', referrerId);
    }
  };

  return (
    <AppContext.Provider value={{ store, setStore, fetchPlayer, t, user, setUser, changeLanguage, updateUserReferral, increaseReferrerX }}>
      {children}
    </AppContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useGame must be used within an AppProvider');
  return context;
};
