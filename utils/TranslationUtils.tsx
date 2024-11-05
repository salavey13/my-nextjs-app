// utils/TranslationUtils.tsx
"use client";
import React, { createContext, useContext, ReactNode, FC } from "react";
import { useAppContext } from "../context/AppContext";
import { en } from "./en"
import { ru } from "./ru"
import { ukr } from "./ukr"


export type LanguageDictionary = {
    [key: string]: string | LanguageDictionary;
  };
  
  
  const TranslationContext = createContext<
  { t: (key: string, variables?: Record<string, string>) => string } | undefined
>(undefined);

interface TranslationProviderProps {
  children: ReactNode;
}

export const TranslationProvider: FC<TranslationProviderProps> = ({ children }) => {
  const { state } = useAppContext(); // Assuming useAppContext() provides current language
  const currentLanguage = state?.user?.lang || "en";

  const t = (key: string, variables?: Record<string, string>): string => {
    const keys = key.split('.');
    let translation: string | LanguageDictionary = translations[currentLanguage];

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

  return (
    <TranslationContext.Provider value={{ t }}>
      {children}
    </TranslationContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
};
  
  export const supportedLanguages = ["en", "ru", "ukr"];
  
  export const translations: LanguageDictionary = {
    en,  
    ru,
    ukr
};
