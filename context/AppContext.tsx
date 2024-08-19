"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { supabase } from '../lib/supabaseClient'; // Import from lib/supabaseClient.ts
import { languageDictionary } from '../utils/TranslationUtils';

// Define the default store state
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

interface UserData {
  telegram_id: number;
  telegram_username: string;
  coins: string;
  xp: string;
  lang: string;
  X: string;
  // Add other fields as needed
}

// Define the AppContext type
interface AppContextType {
  store: typeof defaultStore;
  setStore: React.Dispatch<React.SetStateAction<typeof defaultStore>>;
  fetchPlayer: (tg_id: string, username: string, lang: string) => void;
  t: (key: string) => string;
  user: any;
  setUser: React.Dispatch<React.SetStateAction<any>>;
  changeLanguage: (langCode: string) => void;
  updateUserReferral: (referrerId: string, gameId: string) => void;
  increaseReferrerX: (referrerId: string) => void;
}

// Create the AppContext
const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [store, setStore] = useState(defaultStore);
  const [user, setUser] = useState<UserData | null>(null);

  // Function to fetch or insert player data
  const fetchPlayer = useCallback(async (tg_id: string, username: string, lang: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('telegram_id', tg_id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Fetch error:', error);
        return;
      }

      if (data) {
        setStore((prev) => ({ ...prev, ...data }));
        setUser(data);
      } else {
        await insertNewUser(tg_id, username, lang);
      }
    } catch (error) {
      console.error('Fetch/Insert error:', error);
    }
  }, []);

  // Function to insert a new user
  const insertNewUser = async (tg_id: string, username: string, lang: string) => {
    try {
      const { data: newUser, error } = await supabase
        .from('users')
        .insert([{ telegram_id: tg_id, telegram_username: username, coins: '420', xp: '1000', lang, X: '0' }])
        .single();

      if (error) throw error;

      // Ensure `newUser` is properly typed
      const userData: UserData = newUser as UserData;

      setStore((prev) => ({ ...prev, ...userData }));
      setUser(userData);
    } catch (error) {
      console.error('Insert error:', error);
    }
  };

  // Function to change the language
  const changeLanguage = (langCode: string) => {
    setStore((prev) => ({ ...prev, lang: langCode }));
    sessionStorage.setItem('lang', langCode);
  };

  // Translation function
  const t = (key: string) => languageDictionary[store.lang]?.[key] || key;

  // Update user referral
  const updateUserReferral = async (referrerId: string, gameId: string) => {
    try {
      await supabase.from('users').update({ referer: referrerId }).eq('telegram_id', store.tg_id);
      await supabase.from('game_participants').insert([{ game_id: gameId, user_id: store.tg_id }]);
    } catch (error) {
      console.error('Update referral error:', error);
    }
  };

  // Increase referrer X
  const increaseReferrerX = async (referrerId: string) => {
    try {
      const { data: referrer, error } = await supabase.from('users').select('*').eq('telegram_id', referrerId).single();
      if (error) throw error;
      if (referrer) {
        const newXValue = parseInt(referrer.X, 10) + 1;
        await supabase.from('users').update({ X: newXValue.toString() }).eq('telegram_id', referrerId);
      }
    } catch (error) {
      console.error('Increase referrer X error:', error);
    }
  };

  return (
    <AppContext.Provider value={{ store, setStore, fetchPlayer, t, user, setUser, changeLanguage, updateUserReferral, increaseReferrerX }}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hook to use AppContext
export const useGame = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useGame must be used within an AppProvider');
  return context;
};
