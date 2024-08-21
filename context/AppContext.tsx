"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, Suspense } from 'react';
import { supabase } from '../lib/supabaseClient';
import { languageDictionary } from "../utils/TranslationUtils";
import { usePathname, useSearchParams } from 'next/navigation';

// Default store state
const defaultStore = {
  tg_id: '',
  username: '',
  coins: '0',
  rp: '0',
  lang: 'ru',
  X: '0',
  tasksTodo: [],
  currentGameId: '',
};

                       
interface UserData {
  id: number;
  telegram_id: number;
  telegram_username: string;
  lang: 'ru' | 'en' | 'ukr';
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
  currentgameId?: string | null;
  game_state?: string | null;
  ton_wallet?: string | null;
  initial_readings?: Record<string, any> | null;
  monthly_prices?: Record<string, any> | null;
}

// Combined context type
interface AppContextType {
  store: typeof defaultStore;
  setStore: React.Dispatch<React.SetStateAction<typeof defaultStore>>;
  user: UserData | null;
  setUser: React.Dispatch<React.SetStateAction<UserData | null>>;
  fetchPlayer: (tg_id: number, username: string, lang: string) => void;
  t: (key: string) => string;
  changeLanguage: (langCode: string) => void;
  updateUserReferral: (referrerId: string, gameId: string) => void;
  increaseReferrerX: (referrerId: string) => void;
  debugLogs: string[];
  addDebugLog: (log: string) => void;
  updateUserReferrals: (newReferralCode: string) => void;
}

// Create the combined AppContext
const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [store, setStore] = useState(defaultStore);
  const [user, setUser] = useState<UserData | null>(null);
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // useEffect(() => {
  //   console.log(`URL Updated: ${pathname}?${searchParams}`);
  // }, [pathname, searchParams]);

  useEffect(() => {
    const handleRef = async () => {
      if (pathname && searchParams && user) {
        const refCode = searchParams.get('ref');

        if (refCode && user.ref_code !== refCode) {
          // Check if the user is already referred by this ref_code
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
            // Add the referral
            const { error: referralError } = await supabase.from('referrals').insert([
              { ref_code: refCode, referred_user_id: user.telegram_id },
            ]);

            if (referralError) {
              console.error('Error adding referral:', referralError);
            }
          }
        }
      }
    };

    if (user) {
      handleRef();
    }
  }, [pathname, searchParams, user?.id]);

  const updateUserReferrals = (newReferralCode: string) => {
    setUser((prevUser: any) => ({ ...prevUser, ref_code: newReferralCode }));
  };

  const addDebugLog = (log: string) => {
    setDebugLogs((prevLogs) => [...prevLogs, log]);
  };

  // Function to fetch or insert player data
  const fetchPlayer = useCallback(async (tg_id: number, username: string, lang: string) => {
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
        // Ensure only the fields that exist in defaultStore are updated
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
        }));
        setUser(data);
      } else {
        await insertNewUser(tg_id, username, lang);
      }
    } catch (error) {
      console.error('Fetch/Insert error:', error);
      addDebugLog(`Fetch/Insert error: ${error}`);
    }
  }, []);

  const insertNewUser = async (tg_id: number, username: string, lang: string) => {
    addDebugLog("INSIDE INSERT");
    try {
      const { data: newUser, error } = await supabase
        .from('users')
        .insert([{ telegram_id: tg_id, telegram_username: username, lang: lang }])
        .single();

      if (error) {
        addDebugLog(`Insert error: ${error}`);
        throw error;
      }

      const userData: UserData = newUser as UserData;

      // Ensure only the fields that exist in defaultStore are updated
      setStore((prev) => ({
        ...prev,
        tg_id: userData.telegram_id.toString(),
        username: userData.telegram_username || '',
        coins: userData.coins.toString(),
        xp: userData.rp.toString(),
        lang: userData.lang,
        X: userData.X.toString(),
        tasksTodo: userData.tasksTodo ? JSON.parse(userData.tasksTodo) : [],
        currentGameId: userData.currentgameId || '',
      }));
      setUser(userData);
    } catch (error) {
      console.error('Insert error:', error);
      addDebugLog(`Insert error: ${error}`);
    }
  };

  // Function to change the language
  const changeLanguage = (langCode: string) => {
    setStore((prev) => ({ ...prev, lang: langCode }));
    sessionStorage.setItem('lang', langCode);
  };

  // deprecated Translation function
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
  
              fetchPlayer(user.id, user.username, user.language_code);
            }
  
            setupTelegramBackButton();
            //applyTelegramTheme();
          }
        }
      };
  
      return () => {
        document.head.removeChild(script);
      };
    };
  
    initTelegramWebApp();
  }, [user?.id]);

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

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AppContext.Provider value={{ store, setStore, user, setUser, fetchPlayer, t, changeLanguage, updateUserReferral, increaseReferrerX, debugLogs, addDebugLog, updateUserReferrals }}>
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
