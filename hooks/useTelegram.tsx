// hooks/useTelegram.tsx
import { useEffect, useState } from 'react';

// Define types for new functionalities
interface User {
  id: number;
  first_name: string;
  last_name?: string;
  username: string;
  language_code: string;
  photo_url?: string;
}



const useTelegram = () => {
  const [tg, setTg] = useState<TelegramWebApp | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const initTelegramWebApp = () => {
      const script = document.createElement('script');
      script.src = 'https://telegram.org/js/telegram-web-app.js';
      script.async = true;
      document.head.appendChild(script);

      script.onload = () => {
        if (window.Telegram?.WebApp) {
          const tgWebApp = window.Telegram.WebApp as TelegramWebApp;
          tgWebApp.ready();
          setTg(tgWebApp);

          const user = tgWebApp.initDataUnsafe?.user;
          if (user) setUser(user);

          setTheme(tgWebApp.colorScheme);
        }
      };

      return () => {
        document.head.removeChild(script);
      };
    };

    initTelegramWebApp();
  }, []);

  const openLink = (url: string, options?: { [key: string]: any }) => {
    tg?.openLink(url, options);
  };

  const showMainButton = (text: string) => {
    tg?.MainButton?.setText(text);
    tg?.MainButton?.show();
  };

  const hideMainButton = () => {
    tg?.MainButton?.hide();
  };

  const showBackButton = () => {
    tg?.BackButton?.show();
  };

  const closeWebApp = () => {
    tg?.close();
  };

  const showPopup = (params: PopupParams, callback?: (buttonId: string) => void) => {
    tg?.showPopup(params, callback);
  };

  const showAlert = (message: string, callback?: () => void) => {
    tg?.showAlert(message, callback);
  };

  const showConfirm = (message: string, callback?: (confirmed: boolean) => void) => {
    tg?.showConfirm(message, callback);
  };

  const showScanQrPopup = (params: ScanQrPopupParams, callback?: (text: string) => void) => {
    tg?.showScanQrPopup(params, callback);
  };

  const closeScanQrPopup = () => {
    tg?.closeScanQrPopup();
  };

  const readTextFromClipboard = (callback?: (text: string) => void) => {
    tg?.readTextFromClipboard(callback);
  };

  const enableVerticalSwipes = () => {
    tg?.enableVerticalSwipes();
  };

  const disableVerticalSwipes = () => {
    tg?.disableVerticalSwipes();
  };

  const setHeaderColor = (color: string) => {
    tg?.setHeaderColor(color);
  };

  const setBackgroundColor = (color: string) => {
    tg?.setBackgroundColor(color);
  };

  const showProgress = (leaveActive: boolean) => {
    tg?.showProgress(leaveActive);
  };

  return {
    tg,
    user,
    theme,
    setTheme,
    openLink,
    showMainButton,
    hideMainButton,
    showBackButton,
    closeWebApp,
    showPopup,
    showAlert,
    showConfirm,
    showScanQrPopup,
    closeScanQrPopup,
    readTextFromClipboard,
    enableVerticalSwipes,
    disableVerticalSwipes,
    setHeaderColor,
    setBackgroundColor,
    showProgress,
  };
};

export default useTelegram;
