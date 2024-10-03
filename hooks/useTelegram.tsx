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

interface UseTelegramProps {
  onBackButtonPressed?: () => void; // Optional callback when the back button is pressed
}

export const useTelegram = (props: UseTelegramProps = {}) => {
  const { onBackButtonPressed } = props;

  const [tg, setTg] = useState<TelegramWebApp | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    // Check if window is defined (i.e., we are on the client)
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const telegram = window.Telegram.WebApp;

      // Show the back button in the Telegram Web App
      telegram.BackButton?.show();

      // Handle the back button press
      if (onBackButtonPressed) {
        telegram.BackButton?.onClick(onBackButtonPressed);
      }

      // Cleanup when the component is unmounted
      return () => {
        telegram.BackButton?.hide();
        if (onBackButtonPressed) {
          telegram.BackButton?.offClick(onBackButtonPressed); // Ensure proper cleanup
        }
      };
    }
  }, [onBackButtonPressed]);

  useEffect(() => {
    // Ensure we're on the client side before interacting with the DOM
    if (typeof window !== 'undefined') {
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

        // Cleanup the script tag on unmount
        return () => {
          document.head.removeChild(script);
        };
      };

      initTelegramWebApp();
    }
  }, []);

  const openLink = (url: string, options?: { [key: string]: any }) => {
    if (tg) tg.openLink(url, options);
  };

  const showMainButton = (text: string) => {
    if (tg) {
      tg.MainButton?.setText(text);
      tg.MainButton?.show();
    }
  };

  const hideMainButton = () => {
    if (tg) tg.MainButton.hide();
  };

  const showBackButton = () => {
    if (tg) tg.BackButton.show();
  };

  const closeWebApp = () => {
    if (tg) tg.close();
  };

  const showPopup = (params: PopupParams, callback?: (buttonId: string) => void) => {
    if (tg) tg.showPopup(params, callback);
  };

  const showAlert = (message: string, callback?: () => void) => {
    if (tg) tg.showAlert(message, callback);
  };

  const showConfirm = (message: string, callback?: (confirmed: boolean) => void) => {
    if (tg) tg.showConfirm(message, callback);
  };

  const showScanQrPopup = (params: ScanQrPopupParams, callback?: (text: string) => void) => {
    if (tg) tg.showScanQrPopup(params, callback);
  };

  const closeScanQrPopup = () => {
    if (tg) tg.closeScanQrPopup();
  };

  const readTextFromClipboard = (callback?: (text: string) => void) => {
    if (tg) tg.readTextFromClipboard(callback);
  };

  const enableVerticalSwipes = () => {
    if (tg) tg.enableVerticalSwipes();
  };

  const disableVerticalSwipes = () => {
    if (tg) tg.disableVerticalSwipes();
  };

  const setHeaderColor = (color: string) => {
    if (tg) tg.setHeaderColor(color);
  };

  const setBottomBarColor = (color: string) => {
    if (tg) tg.setBottomBarColor(color);
  };

  const setBackgroundColor = (color: string) => {
    if (tg) tg.setBackgroundColor(color);
  };

  const showProgress = (leaveActive: boolean) => {
    if (tg) tg.MainButton.showProgress(leaveActive);
  };

  // Integration with Telegram's SettingsButton
  const toggleThemeSettings = (callback: () => void) => {
    if (tg) {
      tg.SettingsButton.onClick(() => {
        callback();
        console.log('Settings button clicked');
      });
    }
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
    setBottomBarColor,
    showProgress,
    toggleThemeSettings,
    telegram: typeof window !== 'undefined' ? window.Telegram?.WebApp : null,
  };
};

export default useTelegram;
