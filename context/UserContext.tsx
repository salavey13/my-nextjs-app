"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

interface User {
  id: number;
  telegram_id: number;
  telegram_username: string;
  iq: number | null;
  social_credit: number;
  role: number;
  total_referrals: number;
  referral_bonus: number;
}

interface UserContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  // Function to fetch user data from Supabase
  const fetchUser = async (telegramId: number) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('telegram_id', telegramId)
        .single();

      if (error) throw error;
      setUser(data);
    } catch (error) {
      console.error('Fetch user error:', error);
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

              if (user.telegram_id) {
                fetchUser(user.telegram_id);
              }
            }
          }
        }
      };

      return () => {
        document.head.removeChild(script);
      };
    };

    initTelegramWebApp();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

// Custom hook to use UserContext
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser must be used within a UserProvider');
  return context;
};
