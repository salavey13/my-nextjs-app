"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, Suspense } from 'react';
import { supabase } from '../lib/supabaseClient';
import { LanguageDictionary, translations } from "../utils/TranslationUtils";
import { usePathname, useSearchParams } from 'next/navigation';
import { updateUserReferral, increaseReferrerX, addReferralEntry } from '../services/ReferralService';
import useTelegram from '../hooks/useTelegram';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

// Default store state
const defaultStore = {
  tg_id: 413553377,
  username: 'salavey13',
  coins: '2000000',
  rp: '420',
  lang: 'ru',
  X: '69',
  dark_theme: true,
  currentGameId: 28,
  role: 0
};

interface UserData {
  id: number;
  telegram_id: number;
  telegram_username: string;
  lang: 'ru' | 'en' | 'ukr';
  avatar_url: string;
  coins: number;
  rp: number;
  X: number;
  ref_code: string;
  rank: string;
  social_credit: number;
  role: number;
  cheers_count: number;
  referer?: number | null;
  tasksTodo?: string | null;
  currentGameId?: number | null;
  game_state?: string | null;
  ton_wallet?: string | null;
  initial_readings?: Record<string, any> | null;
  monthly_prices?: Record<string, any> | null;
  site?: string | null;
  dark_theme: boolean,
  loot?: {
    fool?: {
      cards?: {
        cards_img_url?: string;
        shirt_img_url?: string;
      }
    }
  }
}

interface AppContextType {
  store: typeof defaultStore;
  setStore: React.Dispatch<React.SetStateAction<typeof defaultStore>>;
  user: UserData | null;
  setUser: React.Dispatch<React.SetStateAction<UserData | null>>;
  fetchPlayer: (tg_id: number, username: string, lang: string) => void;
  t: (key: string) => string;
  changeLanguage: (langCode: string) => void;
  debugLogs: string[];
  addDebugLog: (log: string) => void;
  updateUserReferrals: (newReferralCode: string) => void;
  toggleTheme: () => void,
  formState: any;
  saveFormState: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [store, setStore] = useState(defaultStore);
  const [user, setUser] = useState<UserData | null>(null);
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  const [formState, setFormState] = useState<any>({});
  const {
    tg,
    setTheme,
    setHeaderColor,
    setBackgroundColor,
    setBottomBarColor,
    disableVerticalSwipes,
  } = useTelegram();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const saveFormState = () => {
    console.log("Saving form state:", formState);
    localStorage.setItem('formState', JSON.stringify(formState));
  };

  const updateUserReferrals = (newReferralCode: string) => {
    setUser((prevUser: any) => ({ ...prevUser, ref_code: newReferralCode }));
  };

  const addDebugLog = (log: string) => {
    setDebugLogs((prevLogs) => [...prevLogs, log]);
  };

  const fetchPlayer = async (tg_id: number, username: string, lang: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('telegram_id', tg_id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Fetch error:', error);
        addDebugLog(`Fetch error: ${error}`);
        return;
      }

      if (data) {
        setStore((prev) => ({
          ...prev,
          tg_id: data.telegram_id.toString(),
          username: data.telegram_username || '',
          coins: data.coins.toString(),
          rp: data.rp.toString(),
          lang: data.lang,
          X: data.X.toString(),
          tasksTodo: data.tasksTodo ? JSON.parse(data.tasksTodo) : [],
          currentGameId: data.currentgameId || '',
          dark_theme: data.dark_theme,
          role: data.role || 0,
        }));
        setUser(data);
      } else {
        // Handle new user insertion
        await insertNewUser(tg_id, username, lang);
      }
    } catch (error) {
      console.error('Fetch/Insert error:', error);
      addDebugLog(`Fetch/Insert error: ${error}`);
    }
  };

  const insertNewUser = async (tg_id: number, username: string, lang: string) => {
    try {
      const { data: newUser, error } = await supabase
        .from('users')
        .insert([{ telegram_id: tg_id, telegram_username: username, lang: lang }])
        .single();

      if (error) {
        console.error("Insert error: ", error.message);
        throw error;
      }

      const { data: existingUser, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('telegram_id', tg_id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Fetch after insert error:', fetchError);
        return;
      }

      if (existingUser) {
        setStore((prev) => ({
          ...prev,
          tg_id: existingUser.telegram_id,
          username: existingUser.telegram_username || '',
          coins: existingUser.coins?.toString() || '0',
          rp: existingUser.rp?.toString() || '0',
          lang: existingUser.lang,
          X: existingUser.X?.toString() || '0',
          tasksTodo: existingUser.tasksTodo ? JSON.parse(existingUser.tasksTodo) : [],
          currentGameId: existingUser.currentgameId || '',
          role: existingUser.role || 0,
        }));
        setUser(existingUser);

        if (searchParams) {
          const refCode = searchParams.get('ref');
          if (refCode) {
            await handleReferral(refCode, existingUser);
          }
        }
      }
    } catch (error) {
      console.error('Insert error:', error);
      addDebugLog(`Insert error: ${error}`);
    }
  };

  const handleReferral = async (refCode: string, user: UserData) => {
    try {
      if (refCode && user.ref_code !== refCode) {
        const { data: existingReferral, error: checkReferralError } = await supabase
          .from('referrals')
          .select('*')
          .eq('ref_code', refCode)
          .eq('referred_user_id', user.telegram_id)
          .single();

        if (checkReferralError && checkReferralError.code !== 'PGRST116') {
          console.error(checkReferralError);
          return;
        }

        if (!existingReferral) {
          const { data: referrer } = await supabase
            .from('users')
            .select('id, telegram_id')
            .eq('ref_code', refCode)
            .single();

          if (referrer) {
            await addReferralEntry(referrer.telegram_id, user.telegram_id, refCode);
            await updateUserReferral(user.id, referrer.id);
            await increaseReferrerX(referrer.id);
            setUser({ ...user, referer: referrer.id });
          }
        }
      }
    } catch (error) {
      console.error('Referral error:', error);
      addDebugLog(`Referral error: ${error}`);
    }
  };

  const changeLanguage = (langCode: string) => {
    setStore((prev) => ({ ...prev, lang: langCode }));
    sessionStorage.setItem('lang', langCode);
  };

  const t = (key: string, variables?: Record<string, string>): string => {
    const keys = key.split('.');
    let translation: string | LanguageDictionary = translations[store.lang];

    for (const k of keys) {
      if (typeof translation === 'string') {
        return key; // Return the key if translation is not found
      }
      translation = translation[k];
      if (translation === undefined) {
        return key; // Return the key if translation is not found
      }
    }

    if (typeof translation === 'string' && variables) {
      return Object.keys(variables).reduce((str, variable) => {
        return str.replace(`{${variable}}`, variables[variable]);
      }, translation);
    }

    return typeof translation === 'string' ? translation : key;
  };

  useEffect(() => {
    // Initialize Telegram WebApp and fetch user data
    if (tg) {
      tg.ready();
      //tg.toggleThemeSettings(toggleTheme)
      setTheme("dark"); // Set the dark theme immediately

      const tgUser = tg.initDataUnsafe?.user;
      if (tgUser) {
        fetchPlayer(tgUser.id, tgUser.username, tgUser.language_code);
      } else {
        fetchPlayer(defaultStore.tg_id, defaultStore.username, defaultStore.lang);
      }
      setTheme(user? user.dark_theme ? "dark" :"light" :"dark"); // Set the dark theme immediately
      if (user && !user.dark_theme) {
        setHeaderColor("#FFFFFF"); // Set the header color to black
        setBackgroundColor("#FFFFFF"); // Set the background color to black
        setBottomBarColor("#FFFFFF");
      }
      else {
        setHeaderColor("#282c33"); // Set the header color to black
        setBackgroundColor("#282c33"); // Set the background color to black
        setBottomBarColor("#282c33");
      }
      disableVerticalSwipes(); // Disable vertical swipes in the Telegram WebApp
    }
  }, [tg]);

  useEffect(() => {
    if (searchParams) {
      const refItemId = searchParams.get('ref_item');
      if (refItemId) {
        // Store item ID in context or any other way to open the modal with preloaded data
      }
    }
  }, [searchParams]);

  const setupTelegramBackButton = () => {
    const backButton = window.Telegram?.WebApp?.BackButton;
    if (backButton) {
      backButton.show();
      backButton.onClick(() => window.history.back());
    }
  }; 

  const applyTelegramTheme = () => {
    const themeParams = window.Telegram?.WebApp?.themeParams
    if (themeParams) {
        Object.entries(themeParams).forEach(([key, value]) => {
            document.documentElement.style.setProperty(
                `--tg-theme-${key.replace(/_/g, "-")}`,
                String(value)
            )
        })
    }
  }

  // Function to toggle theme and save to Supabase
  const toggleTheme = async () => {
    if (user) {
      const newTheme = !user.dark_theme;
      setUser({ ...user, dark_theme: newTheme });
      setStore((prev) => ({ ...prev, dark_theme: newTheme }));
      
      const { error } = await supabase
        .from('users')
        .update({ dark_theme: newTheme })
        .eq('telegram_id', user.telegram_id);
      
      if (error) {
        console.error('Error updating theme in Supabase:', error);
        addDebugLog(`Error updating theme in Supabase: ${error.message}`);
      }
    }
  };

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <AppContext.Provider value={{ store, setStore, user, setUser, fetchPlayer, t, changeLanguage, debugLogs, addDebugLog, updateUserReferrals,formState, saveFormState, toggleTheme }}>
        {children}
      </AppContext.Provider>
    </Suspense>
  );
};

// Custom hook to use AppContext
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within an AppProvider');
  return context;
};
