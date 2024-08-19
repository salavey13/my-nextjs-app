// src/types/global.d.ts
interface TelegramWebApp {
    expand(): void;
    initData: string;
  }
  
  interface Window {
    Telegram?: {
      WebApp?: TelegramWebApp;
    };
  }
  