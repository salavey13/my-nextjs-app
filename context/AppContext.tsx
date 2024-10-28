"use client";

import React, { createContext, useContext, useReducer, useState, useEffect, ReactNode, Suspense, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { LanguageDictionary, translations } from "../utils/TranslationUtils";
import { usePathname, useSearchParams } from 'next/navigation';
import { updateUserReferral, increaseReferrerX, addReferralEntry } from '../services/ReferralService';
import useTelegram from '../hooks/useTelegram';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { ThemeProvider } from '@/context/ThemeContext'
import { useTheme } from '@/hooks/useTheme'
import storiRealStages  from '@/lib/storyStages'
interface GameState {
  stage: number;
  coins: number;
  crypto: number;
  rank: string;
  cheersCount: number;
  progress: string;
  unlockedComponents: string[];
  settings: GameSettings;
}

export interface PhysicsSettings {
  yeetCoefficient: number;
  yeetVelocityThreshold: number;
}

export interface SkinSettings {
  shirtImgUrl: string;
  cardsImgUrl: string;
}

export interface GameSettings extends PhysicsSettings, SkinSettings {}

export interface UserData {
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
  storyStages: any[]
  debugLogs: string[];
  formState: any;
}

export interface StoryStage {
  id: number
  parentid: number | null
  stage: number
  storycontent: string
  xuinitydialog: string
  trigger: string
  activecomponent: string
  minigame: string
  achievement: string
  bottomshelfbitmask: number
}

type Action =
  | { type: 'SET_USER'; payload: UserData }
  | { type: 'UPDATE_USER'; payload: Partial<UserData> }
  | { type: 'UPDATE_GAME_STATE'; payload: Partial<GameState> }
  | { type: 'SET_STORY_STAGES'; payload: any[] }
  | { type: 'ADD_DEBUG_LOG'; payload: string }
  | { type: 'SET_FORM_STATE'; payload: any }
  | { type: 'RESET_USER' };

interface StageTrigger {
  unlockCustomization: boolean;
  unlockCrypto: boolean;
  showOtherSkins: boolean;
  unlockHackButton: boolean;
  unlockEvents: boolean;
  unlockRents: boolean;
  unlockVersimcel: boolean;
  unlockGitHub: boolean;
}

interface SideHustle {
  storyContent: string;
  trigger: string;
  activeComponent: string;
  minigame: string;
  achievement: string;
}

const STAGE_TRIGGERS: { [key: number]: StageTrigger } = {
  0: { unlockCustomization: false, unlockCrypto: false, showOtherSkins: true, unlockHackButton: false, unlockEvents: false, unlockRents: false, unlockVersimcel: false, unlockGitHub: false },
  1: { unlockCustomization: false, unlockCrypto: false, showOtherSkins: true, unlockHackButton: true, unlockEvents: false, unlockRents: false, unlockVersimcel: false, unlockGitHub: false },
  2: { unlockCustomization: true, unlockCrypto: true, showOtherSkins: true, unlockHackButton: true, unlockEvents: false, unlockRents: false, unlockVersimcel: false, unlockGitHub: false },
  3: { unlockCustomization: true, unlockCrypto: true, showOtherSkins: true, unlockHackButton: true, unlockEvents: true, unlockRents: false, unlockVersimcel: false, unlockGitHub: false },
  4: { unlockCustomization: true, unlockCrypto: true, showOtherSkins: true, unlockHackButton: true, unlockEvents: true, unlockRents: true, unlockVersimcel: false, unlockGitHub: false },
  5: { unlockCustomization: true, unlockCrypto: true, showOtherSkins: true, unlockHackButton: true, unlockEvents: true, unlockRents: true, unlockVersimcel: true, unlockGitHub: false },
  6: { unlockCustomization: true, unlockCrypto: true, showOtherSkins: true, unlockHackButton: true, unlockEvents: true, unlockRents: true, unlockVersimcel: true, unlockGitHub: true },
};

const SIDE_HUSTLES: { [key: number]: SideHustle } = {
  0: { storyContent: "Welcome to the system...", trigger: "Start Game", activeComponent: "", minigame: "", achievement: "Welcome to the System" },
  1: { storyContent: "System Crash...", trigger: "Hack Button Clicked", activeComponent: "hack", minigame: "hack", achievement: "First Hack" },
  2: { storyContent: "You've executed your first hack...", trigger: "Yes Chosen", activeComponent: "Skins", minigame: "", achievement: "Hacker Initiate" },
  3: { storyContent: "Congratulations on your new skin! Now, let's introduce you to the world of crypto.", trigger: "Skin Selected", activeComponent: "Crypto Wallet", minigame: "", achievement: "Crypto Novice" },
  4: { storyContent: "With crypto in your wallet, you can now participate in events and place bets!", trigger: "Crypto Introduced", activeComponent: "Events", minigame: "", achievement: "Event Participant" },
  5: { storyContent: "You've experienced events and bets. Now, let's explore the world of rents!", trigger: "Event Participated", activeComponent: "Rents", minigame: "", achievement: "Rent Explorer" },
  6: { storyContent: "The system crashes again... but this time, Versimcel appears!", trigger: "Rent Explored", activeComponent: "Versimcel", minigame: "debug", achievement: "Versimcel Encounter" },
  7: { storyContent: "Welcome to the admin level. It's time for some real GitHub source hunting!", trigger: "Debug Complete", activeComponent: "GitHub", minigame: "", achievement: "Admin Access" },
};

const checkStage = (playerStage: number): StageTrigger => {
  return STAGE_TRIGGERS[playerStage] || STAGE_TRIGGERS[0];
};

const isCustomizationUnlocked = (playerStage: number): boolean => {
  return checkStage(playerStage).unlockCustomization;
};

const isCryptoUnlocked = (playerStage: number): boolean => {
  return checkStage(playerStage).unlockCrypto;
};

const canShowOtherSkins = (playerStage: number): boolean => {
  return checkStage(playerStage).showOtherSkins;
};

const isHackButtonUnlocked = (playerStage: number): boolean => {
  return checkStage(playerStage).unlockHackButton;
};

const areEventsUnlocked = (playerStage: number): boolean => {
  return checkStage(playerStage).unlockEvents;
};

const areRentsUnlocked = (playerStage: number): boolean => {
  return checkStage(playerStage).unlockRents;
};

const isVersimcelUnlocked = (playerStage: number): boolean => {
  return checkStage(playerStage).unlockVersimcel;
};

const isGitHubUnlocked = (playerStage: number): boolean => {
  return checkStage(playerStage).unlockGitHub;
};

const getSideHustleTrigger = (hustleId: number): SideHustle => {
  return SIDE_HUSTLES[hustleId] || SIDE_HUSTLES[0];
};

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  fetchPlayer: (tg_id: number, username: string, lang: string) => Promise<void>;
  t: (key: string, variables?: Record<string, string>) => string;
  changeLanguage: (langCode: string) => void;
  updateUserReferrals: (newReferralCode: string) => void;
  toggleTheme: () => Promise<void>;
  saveFormState: () => void;
  isCustomizationUnlocked: (playerStage: number) => boolean;
  isCryptoUnlocked: (playerStage: number) => boolean;
  canShowOtherSkins: (playerStage: number) => boolean;
  isHackButtonUnlocked: (playerStage: number) => boolean;
  areEventsUnlocked: (playerStage: number) => boolean;
  areRentsUnlocked: (playerStage: number) => boolean;
  isVersimcelUnlocked: (playerStage: number) => boolean;
  isGitHubUnlocked: (playerStage: number) => boolean;
  getSideHustleTrigger: (hustleId: number) => SideHustle;
  storyStages: StoryStage[];
  fetchStoryStages: () => Promise<void>;
  updateStoryStage: (updatedStage: any) => Promise<void>;
}

const initialState: AppState = {
  user: {
    id: 43,
    telegram_id: 413553377,
    telegram_username: "SALAVEY13",
    lang: "en",
    avatar_url: "https://octodex.github.com/images/mona-the-rivetertocat.png",
    coins: 1000,
    crypto: 50,
    rp: 100,
    X: 5,
    ref_code: "salavey13",
    rank: "Novice Hacker",
    social_credit: 75,
    role: 1,
    cheers_count: 10,
    referer: null,
    tasksTodo: null,
    currentGameId: 28,
    currentFoolGameId: 13,
    game_state: {
      stage: 0,
      coins: 1000,
      crypto: 50,
      rank: "Novice Hacker",
      cheersCount: 10,
      progress: "0%",
      unlockedComponents: [],
      settings: {
        yeetCoefficient: 1,
        yeetVelocityThreshold: 10,
        shirtImgUrl: "https://thumbs4.imagebam.com/76/dd/61/MEWDIXW_t.png",
        cardsImgUrl: "https://example.com/cards.jpg"
      }
    },
    ton_wallet: null,
    initial_readings: null,
    monthly_prices: null,
    site: null,
    dark_theme: true,
    loot: {
      fool: {
        cards: {
          cards_img_url: "https://example.com/cards.jpg",
          shirt_img_url: "https://thumbs4.imagebam.com/76/dd/61/MEWDIXW_t.png"
        }
      }
    }
  },
  storyStages: [],
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
    case 'SET_STORY_STAGES':
      return { ...state, storyStages: action.payload }
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
  const [storyStages, setStoryStages] = useState<StoryStage[]>([])
  
  const { theme } = useTheme()

  // useEffect(() => {
  //   setStoryStages(storiRealStages)
  // }, [])




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
          role: 1,
          game_state: {
            stage: 0,
            coins: 1000,
            crypto: 0,
            rank: "13",
            cheersCount: 1,
            progress: "13%",
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
        setHeaderColor(theme.colors.secondary);
        setBackgroundColor(theme.colors.secondary);
        setBottomBarColor(theme.colors.secondary);
      } else {
        setHeaderColor(theme.colors.secondary);
        setBackgroundColor(theme.colors.secondary);
        setBottomBarColor(theme.colors.secondary);
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

  // const progressStage = useCallback(async (newStage: number, unlockedComponents: string[] = [], skipToast: boolean = false) => {
  //   if (!state.user?.id) return
  //   try {
  //     const { data: latestUserData, error: fetchError } = await supabase
  //       .from('users')
  //       .select('game_state')
  //       .eq('id', state.user.id)
  //       .single()

  //     if (fetchError) throw fetchError

  //     const latestGameState = latestUserData.game_state

  //     const updatedGameState = {
  //       ...latestGameState,
  //       stage: Math.max(latestGameState.stage, newStage),
  //       unlockedComponents: Array.from(new Set([
  //         ...(latestGameState.unlockedComponents || []),
  //         ...unlockedComponents
  //       ])),
  //     }

  //     const { error: updateError } = await supabase
  //       .from('users')
  //       .update({ game_state: updatedGameState })
  //       .eq('id', state.user.id)

  //     if (updateError) throw updateError

  //     dispatch({
  //       type: 'UPDATE_GAME_STATE',
  //       payload: updatedGameState,
  //     })

  //     if (!skipToast) {
  //       if (updatedGameState.stage > latestGameState.stage) {
  //         toast({
  //           title: t('stageProgression'),
  //           description: t(`stage${updatedGameState.stage}Unlocked`),
  //         })
  //       }

  //       unlockedComponents.forEach(component => {
  //         if (!latestGameState.unlockedComponents?.includes(component)) {
  //           toast({
  //             title: t('componentUnlocked'),
  //             description: t(`${component}Unlocked`),
  //           })
  //         }
  //       })
  //     }
  //   } catch (error) {
  //     console.error('Error updating game stage:', error)
  //     toast({
  //       title: t('error'),
  //       description: t('errorUpdatingGameState'),
  //       variant: 'destructive',
  //     })
  //   }
  // }, [state.user, t])

  // const simulateCrash = useCallback(async () => {
  //   const CrashSimulation = (await import('@/components/CrashSimulation')).default
  //   const root = document.createElement('div')
  //   document.body.appendChild(root)

  //   const onCrashComplete = () => {
  //     document.body.removeChild(root)
  //     progressStage(5, ['versimcel'])
  //   }

  //   ReactDOM.render(<CrashSimulation onCrashComplete={onCrashComplete} />, root)
  // }, [progressStage])

  const fetchStoryStages = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('story_stages')
        .select('*')
        .order('stage', { ascending: true })

      if (error) throw error
      dispatch({ type: 'SET_STORY_STAGES', payload: data || [] })
    } catch (error) {
      console.error('Error fetching story stages:', error)
    }
  }, [t])

  const updateStoryStage = useCallback(async (updatedStage: any) => {
    try {
      const { error } = await supabase
        .from('story_stages')
        .update(updatedStage)
        .eq('id', updatedStage.id)

      if (error) throw error


      fetchStoryStages()
    } catch (error) {
      console.error('Error updating story stage:', error)
    }
  }, [fetchStoryStages, t])

  useEffect(() => {
    fetchStoryStages()
  }, [fetchStoryStages])

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <ThemeProvider>
        <AppContext.Provider value={{
        state,
        dispatch,
        fetchPlayer,
        t,
        changeLanguage,
        updateUserReferrals,
        toggleTheme,
        saveFormState,
        isCustomizationUnlocked,
        isCryptoUnlocked,
        canShowOtherSkins,
        isHackButtonUnlocked,
        areEventsUnlocked,
        areRentsUnlocked,
        isVersimcelUnlocked,
        isGitHubUnlocked,
        getSideHustleTrigger,
        storyStages,
        fetchStoryStages,
        updateStoryStage,
      }}>
        
        {children}
        
      </AppContext.Provider>
      </ThemeProvider>
    </Suspense>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within an AppProvider');
  return context;
};
