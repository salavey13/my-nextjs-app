import { useCallback, useEffect, useState } from 'react';

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
  const [webAppVersion, setWebAppVersion] = useState<number>(0);

  const handleBackButton = useCallback(() => {
    if (onBackButtonPressed) {
      onBackButtonPressed();
    } else if (tg && webAppVersion >= 6.1) {
      tg.close();
    }
  }, [onBackButtonPressed, tg, webAppVersion]);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const telegram = window.Telegram.WebApp;
      setTg(telegram);
      const version = parseFloat(telegram.version);
      setWebAppVersion(version);

      if (version >= 6.1) {
        telegram?.BackButton?.onClick(handleBackButton);
      }

      // Clean up when unmounted
      return () => {
        if (version >= 6.1) {
          telegram?.BackButton?.hide();
        }
      };
    }
  }, [handleBackButton]);
  
  useEffect(() => {
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
            setWebAppVersion(parseFloat(tgWebApp.version));

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
    }
  }, []);

  const openLink = (url: string, options?: { [key: string]: any }) => {
    if (tg) tg.openLink(url, options);
  };

  const showMainButton = (text: string) => {
    if (tg?.MainButton) {
      tg.MainButton.setText(text);
      tg.MainButton.show();
    }
  };

  const hideMainButton = () => {
    if (tg?.MainButton) {
      tg.MainButton.hide();
    }
  };

  const showBackButton = useCallback(() => {
    if (tg?.BackButton && webAppVersion >= 6.1) {
      tg.BackButton.show();
    }
  }, [tg, webAppVersion]);

  const hideBackButton = useCallback(() => {
    if (tg?.BackButton && webAppVersion >= 6.1) {
      tg.BackButton.hide();
    }
  }, [tg, webAppVersion]);

  const closeWebApp = () => {
    if (tg && webAppVersion >= 6.1) {
      tg.close();
    }
  };
  const showCloseButton = () => {
    if (tg && webAppVersion >= 6.1) {
      tg.close();
    }
  };

  const showPopup = (params: PopupParams, callback?: (buttonId: string) => void) => {
    if (tg && webAppVersion >= 6.1) {
      tg.showPopup(params, callback);
    }
  };

  const showAlert = (message: string, callback?: () => void) => {
    if (tg && webAppVersion >= 6.1) {
      tg.showAlert(message, callback);
    }
  };

  const showConfirm = (message: string, callback?: (confirmed: boolean) => void) => {
    if (tg && webAppVersion >= 6.1) {
      tg.showConfirm(message, callback);
    }
  };

  const showScanQrPopup = (params: ScanQrPopupParams, callback?: (text: string) => void) => {
    if (tg && webAppVersion >= 6.1) {
      tg.showScanQrPopup(params, callback);
    }
  };

  const closeScanQrPopup = () => {
    if (tg && webAppVersion >= 6.1) {
      tg.closeScanQrPopup();
    }
  };

  const readTextFromClipboard = (callback?: (text: string) => void) => {
    if (tg && webAppVersion >= 6.1) {
      tg.readTextFromClipboard(callback);
    }
  };

  const enableVerticalSwipes = () => {
    if (tg && webAppVersion >= 6.1) {
      tg.enableVerticalSwipes();
    }
  };

  const disableVerticalSwipes = () => {
    if (tg && webAppVersion >= 6.1) {
      tg.disableVerticalSwipes();
    }
  };

  const setHeaderColor = (color: string) => {
    if (tg && webAppVersion >= 7.0) {
      tg.setHeaderColor(color);
    }
  };

  const setBottomBarColor = (color: string) => {
    if (tg && webAppVersion >= 6.1) {
      tg.setBottomBarColor(color);
    }
  };

  const setBackgroundColor = (color: string) => {
    if (tg && webAppVersion >= 6.1) {
      tg.setBackgroundColor(color);
    }
  };

  const showProgress = (leaveActive: boolean) => {
    if (tg?.MainButton) {
      tg.MainButton.showProgress(leaveActive);
    }
  };

  const toggleThemeSettings = (callback: () => void) => {
    if (tg?.SettingsButton) {
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
    webAppVersion,
    setTheme,
    openLink,
    showMainButton,
    hideMainButton,
    showBackButton,
    hideBackButton,
    showCloseButton,
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
