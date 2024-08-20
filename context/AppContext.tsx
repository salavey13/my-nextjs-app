"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { supabase } from '../lib/supabaseClient';
import { languageDictionary } from '../utils/TranslationUtils';

// Default store state
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

// User type definition
interface UserData {
  id: number;
  telegram_id: number;
  telegram_username: string;
  iq: number | null;
  social_credit: number;
  role: number;
  total_referrals: number;
  referral_bonus: number;
}

// Combined context type
interface AppContextType {
  store: typeof defaultStore;
  setStore: React.Dispatch<React.SetStateAction<typeof defaultStore>>;
  user: UserData | null;
  setUser: React.Dispatch<React.SetStateAction<UserData | null>>;
  fetchPlayer: (tg_id: string, username: string, lang: string) => void;
  t: (key: string) => string;
  changeLanguage: (langCode: string) => void;
  updateUserReferral: (referrerId: string, gameId: string) => void;
  increaseReferrerX: (referrerId: string) => void;
  debugLogs: string[];
  addDebugLog: (log: string) => void;
}

// Create the combined AppContext
const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [store, setStore] = useState(defaultStore);
  const [user, setUser] = useState<UserData | null>(null);
  const [debugLogs, setDebugLogs] = useState<string[]>([]);

  const addDebugLog = (log: string) => {
    setDebugLogs((prevLogs) => [...prevLogs, log]);
  };

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
        addDebugLog(`Fetch error: ${error}`)
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
      addDebugLog(`Fetch/Insert error: ${error}`)
    }
  }, []);

  // Function to insert a new user
  const insertNewUser = async (tg_id: string, username: string, lang: string) => {
    try {
      const { data: newUser, error } = await supabase
        .from('users')
        .insert([{ telegram_id: tg_id, telegram_username: username, coins: '420', xp: '1000', lang, X: '0' }])
        .single();

      if (error) {
        addDebugLog(`Insert error: ${error}`)
        throw error;
      }

      const userData: UserData = newUser as UserData;

      setStore((prev) => ({ ...prev, ...userData }));
      setUser(userData);
    } catch (error) {
      console.error('Insert error:', error);
      addDebugLog(`caught Insert error: ${error}`)
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

  useEffect(() => {
    const initTelegramWebApp = () => {
      const script = document.createElement("script");
      script.src = "https://telegram.org/js/telegram-web-app.js";
      script.async = true;
      document.head.appendChild(script);

      script.onload = () => {
        if (window.Telegram?.WebApp) {
          const initData = window.Telegram.WebApp.initData;

          if (initData) {
            const urlParams = new URLSearchParams(initData);
            const userParam = urlParams.get("user");

            if (userParam) {
              const user = JSON.parse(decodeURIComponent(userParam));
              if (!user.id) return;

              fetchPlayer(user.id.toString(), user.username, store.lang);
            }

            setupTelegramBackButton();
          }
        }
      };

      return () => {
        document.head.removeChild(script);
      };
    };

    initTelegramWebApp();
  }, [fetchPlayer, store.lang]);

  const setupTelegramBackButton = () => {
    const backButton = window.Telegram?.WebApp?.BackButton;
    if (backButton) {
      backButton.show();
      backButton.onClick(() => window.history.back());
    }
  };

  return (
    <AppContext.Provider value={{ store, setStore, user, setUser, fetchPlayer, t, changeLanguage, updateUserReferral, increaseReferrerX, debugLogs, addDebugLog  }}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hook to use AppContext
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within an AppProvider');
  return context;
};
