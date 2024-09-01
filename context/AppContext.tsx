"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, Suspense } from 'react';
import { supabase } from '../lib/supabaseClient';
import { LanguageDictionary, translations } from "../utils/TranslationUtils";
import { usePathname, useSearchParams } from 'next/navigation';
import { updateUserReferral, increaseReferrerX, addReferralEntry } from '../services/ReferralService';

// Default store state
const defaultStore = {
  tg_id: 413553377,
  username: 'salavey13',
  coins: '2000000',
  rp: '420',
  lang: 'ru',
  X: '69'
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
  site?: string | null;
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

  formState: any; // Add this line
  saveFormState: () => void; // Add this line
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [store, setStore] = useState(defaultStore);
  const [user, setUser] = useState<UserData | null>(null);
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  const [formState, setFormState] = useState<any>({}); // Initialize formState
  const saveFormState = () => {
    // Implement the logic to save formState, maybe to Supabase or local storage
    console.log("Saving form state:", formState);
    // Example: Save to local storage
    localStorage.setItem('formState', JSON.stringify(formState));
  };
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const updateUserReferrals = (newReferralCode: string) => {
    setUser((prevUser: any) => ({ ...prevUser, ref_code: newReferralCode }));
  };

  const addDebugLog = (log: string) => {
    setDebugLogs((prevLogs) => [...prevLogs, log]);
  };

  let isUserBeingInserted = false;

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
        }));
        setUser(data);
      } else {
        // Only call insertNewUser if no other insert is in progress
        if (!isUserBeingInserted) {
          isUserBeingInserted = true;
          await insertNewUser(tg_id, username, lang);
          isUserBeingInserted = false;
        }
      }
    } catch (error) {
      console.error('Fetch/Insert error:', error);
      addDebugLog(`Fetch/Insert error: ${error}`);
    }
  }

  const insertNewUser = async (tg_id: number, username: string, lang: string) => {
    console.error("INSIDE INSERT");
    try {

        // if (existingUser) {
        //     console.error('User already exists, skipping insert.');
        //     return;
        // }

        const { data: newUser, error } = await supabase
            .from('users')
            .insert([{ telegram_id: tg_id, telegram_username: username, lang: lang }])
            .single();

        if (error) {
            console.error("INSIDE INSERT error1 ", error.message);
            throw error;
        }
        const { data: existingUser, error: fetchError } = await supabase
            .from('users')
            .select('*')
            .eq('telegram_id', tg_id)
            .single();

        if (fetchError && fetchError.code !== 'PGRST116') {
            console.error('Fetch before insert error:', fetchError);
            return;
        }

        console.error("INSIDE INSERT 2", newUser); // Log the result of the insert operation
        console.error("INSIDE INSERT 3", existingUser); // Log the result of the insert operation

        if (!newUser) {
          console.error("Insert operation returned null or undefined.");
          if (!existingUser) {
            console.error("Fetch after Insert operation returned null or undefined too.");
            return;
          }
        }

        const userData: UserData = existingUser as UserData;
        if (userData) {
            console.error("INSIDE INSERT userData", userData); // Log userData

            setStore((prev) => ({
                ...prev,
                tg_id: userData.telegram_id,
                username: userData.telegram_username || '',
                coins: userData.coins?.toString() || '0',
                rp: userData.rp?.toString() || '0',
                lang: userData.lang,
                X: userData.X?.toString() || '0',
                tasksTodo: userData.tasksTodo ? JSON.parse(userData.tasksTodo) : [],
                currentGameId: userData.currentgameId || '',
            }));
            setUser(userData);

            if (searchParams) {
                console.error("INSIDE INSERT searchParams");
                // Immediately trigger referral check after user creation
                const refCode = searchParams.get('ref');
                if (refCode) {
                    console.error("INSIDE INSERT refCode", refCode);
                    await handleReferral(refCode, userData);
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
          } else {
            fetchPlayer(defaultStore.tg_id, defaultStore.username, defaultStore.lang);
          }
        }
      };

      return () => {
        document.head.removeChild(script);
      };
    };

    initTelegramWebApp();
  }, [user?.id]);

  useEffect(() => {
    if (searchParams) {
      const refItemId = searchParams.get('ref_item');
      if (refItemId) {
        //router.push(`/rents?item=${refItemId}`);
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

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AppContext.Provider value={{ store, setStore, user, setUser, fetchPlayer, t, changeLanguage, debugLogs, addDebugLog, updateUserReferrals,formState, saveFormState }}>
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
