"use client";

import React, { createContext, useContext, useReducer, useEffect, ReactNode, Suspense } from 'react';
import { supabase } from '../lib/supabaseClient';
import { LanguageDictionary, translations } from "../utils/TranslationUtils";
import { usePathname, useSearchParams } from 'next/navigation';
import { updateUserReferral, increaseReferrerX, addReferralEntry } from '../services/ReferralService';
import useTelegram from '../hooks/useTelegram';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface GameState {
  stage: number;
  coins: number;
  crypto: number;
  rank: string;
  cheersCount: number;
  progress: string;
  unlockedComponents: string[];
}

interface UserData {
  id: number;
  telegram_id: number;
  telegram_username: string;
  lang: 'ru' | 'en' | 'ukr';
  avatar_url: string;
  coins: number;
  crypto: number;
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
  currentFoolGameId?: number | null;
  game_state: GameState;
  ton_wallet?: string | null;
  initial_readings?: Record<string, any> | null;
  monthly_prices?: Record<string, any> | null;
  site?: string | null;
  dark_theme: boolean;
  loot?: {
    fool?: {
      cards?: {
        cards_img_url?: string;
        shirt_img_url?: string;
      }
    }
  };
}

interface AppState {
  user: UserData | null;
  debugLogs: string[];
  formState: any;
}

type Action =
  | { type: 'SET_USER'; payload: UserData }
  | { type: 'UPDATE_USER'; payload: Partial<UserData> }
  | { type: 'UPDATE_GAME_STATE'; payload: Partial<GameState> }
  | { type: 'ADD_DEBUG_LOG'; payload: string }
  | { type: 'SET_FORM_STATE'; payload: any }
  | { type: 'RESET_USER' };

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  fetchPlayer: (tg_id: number, username: string, lang: string) => Promise<void>;
  t: (key: string, variables?: Record<string, string>) => string;
  changeLanguage: (langCode: string) => void;
  updateUserReferrals: (newReferralCode: string) => void;
  toggleTheme: () => Promise<void>;
  saveFormState: () => void;
}

const initialState: AppState = {
  user: null,
  debugLogs: [],
  formState: {},
};

function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'UPDATE_USER':
      return state.user ? { ...state, user: { ...state.user, ...action.payload } } : state;
    case 'UPDATE_GAME_STATE':
      return state.user ? {
        ...state,
        user: {
          ...state.user,
          game_state: { ...state.user.game_state, ...action.payload }
        }
      } : state;
    case 'ADD_DEBUG_LOG':
      return { ...state, debugLogs: [...state.debugLogs, action.payload] };
    case 'SET_FORM_STATE':
      return { ...state, formState: action.payload };
    case 'RESET_USER':
      return { ...state, user: null };
    default:
      return state;
  }
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
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

  const fetchPlayer = async (tg_id: number, username: string, lang: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('telegram_id', tg_id)
        .single();

      if (error) {
        console.error('Fetch error:', error);
        dispatch({ type: 'ADD_DEBUG_LOG', payload: `Fetch error: ${error.message}` });
        return;
      }

      if (data) {
        dispatch({ type: 'SET_USER', payload: data });
      } else {
        await insertNewUser(tg_id, username, lang);
      }
    } catch (error) {
      console.error('Fetch error:', error);
      dispatch({ type: 'ADD_DEBUG_LOG', payload: `Fetch error: ${error}` });
    }
  };

  const insertNewUser = async (tg_id: number, username: string, lang: string) => {
    try {
      const { data: newUser, error } = await supabase
        .from('users')
        .insert([{
          telegram_id: tg_id,
          telegram_username: username,
          lang: lang,
          game_state: {
            stage: 0,
            coins: 1000,
            crypto: 0,
            rank: "13",
            cheersCount: 1,
            progress: "0%",
            unlockedComponents: []
          }
        }])
        .single();

      if (error) {
        console.error("Insert error: ", error.message);
        throw error;
      }

      dispatch({ type: 'SET_USER', payload: newUser });

      if (searchParams) {
        const refCode = searchParams.get('ref');
        if (refCode) {
          await handleReferral(refCode, newUser);
        }
      }
    } catch (error) {
      console.error('Insert error:', error);
      dispatch({ type: 'ADD_DEBUG_LOG', payload: `Insert error: ${error}` });
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
            dispatch({ type: 'UPDATE_USER', payload: { referer: referrer.id } });
          }
        }
      }
    } catch (error) {
      console.error('Referral error:', error);
      dispatch({ type: 'ADD_DEBUG_LOG', payload: `Referral error: ${error}` });
    }
  };

  const changeLanguage = (langCode: string) => {
    dispatch({ type: 'UPDATE_USER', payload: { lang: langCode as 'ru' | 'en' | 'ukr' } });
    sessionStorage.setItem('lang', langCode);
  };

  const t = (key: string, variables?: Record<string, string>): string => {
    const keys = key.split('.');
    let translation: string | LanguageDictionary = translations[state.user?.lang || 'en'];

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
    if (tg) {
      tg.ready();
      setTheme(state.user?.dark_theme ? "dark" : "light");
      if (state.user && !state.user.dark_theme) {
        setHeaderColor("#FFFFFF");
        setBackgroundColor("#FFFFFF");
        setBottomBarColor("#FFFFFF");
      } else {
        setHeaderColor("#282c33");
        setBackgroundColor("#282c33");
        setBottomBarColor("#282c33");
      }
      disableVerticalSwipes();

      const tgUser = tg.initDataUnsafe?.user;
      if (tgUser) {
        fetchPlayer(tgUser.id, tgUser.username, tgUser.language_code);
      }
    }
  }, [tg]);

  useEffect(() => {
    const channel = supabase
      .channel(`user_updates_${state.user?.telegram_id}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'users', filter: `telegram_id=eq.${state.user?.telegram_id}` },
        (payload) => {
          dispatch({ type: 'UPDATE_USER', payload: payload.new });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [state.user?.telegram_id]);

  const updateUserReferrals = (newReferralCode: string) => {
    dispatch({ type: 'UPDATE_USER', payload: { ref_code: newReferralCode } });
  };

  const toggleTheme = async () => {
    if (state.user) {
      const newTheme = !state.user.dark_theme;
      dispatch({ type: 'UPDATE_USER', payload: { dark_theme: newTheme } });
      
      const { error } = await supabase
        .from('users')
        .update({ dark_theme: newTheme })
        .eq('telegram_id', state.user.telegram_id);
      
      if (error) {
        console.error('Error updating theme in Supabase:', error);
        dispatch({ type: 'ADD_DEBUG_LOG', payload: `Error updating theme in Supabase: ${error.message}` });
      }
    }
  };

  const saveFormState = () => {
    console.log("Saving form state:", state.formState);
    localStorage.setItem('formState', JSON.stringify(state.formState));
  };

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <AppContext.Provider value={{
        state,
        dispatch,
        fetchPlayer,
        t,
        changeLanguage,
        updateUserReferrals,
        toggleTheme,
        saveFormState
      }}>
        {children}
      </AppContext.Provider>
    </Suspense>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within an AppProvider');
  return context;
};
