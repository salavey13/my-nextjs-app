// src/types/global.d.ts

interface TelegramThemeParams {
    [key: string]: string; // Adjust this type based on what themeParams is supposed to contain
  }
  
  // Define the BackButton interface
  interface TelegramBackButton {
    show(): void;
    hide(): void;
    onClick(callback: () => void): void;
  }
  
  // Define the TelegramWebApp interface
  interface TelegramWebApp {
    expand(): void;
    initData: string;
    themeParams?: TelegramThemeParams;
    BackButton?: TelegramBackButton; // Add this line to include BackButton
  }
  
  interface Window {
    Telegram?: {
      WebApp?: TelegramWebApp;
    };
  }
  