// src/context/UserContext.tsx
"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface User {
  id: number;
  telegram_id: number;
  telegram_username: string;
  iq: number | null;
  social_credit: number;
  role: number; // 0: Regular User, 1: Admin, -1: Unpaid Bets
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

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser must be used within a UserProvider');
  return context;
};
