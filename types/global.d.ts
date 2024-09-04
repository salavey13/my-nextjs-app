// types/global.d.ts

interface TelegramThemeParams {
    [key: string]: string;
  }
  
  interface PopupButton {
    type: string;
    text?: string;
  }
  
  interface PopupParams {
    title?: string;
    message: string;
    buttons: PopupButton[];
  }
  
  interface ScanQrPopupParams {
    text?: string;
  }
  
  interface TelegramWebApp {
    expand(): void;
    initData: string;
    initDataUnsafe: {
        user?: {
            id: number;
            first_name: string;
            last_name?: string;
            username: string;
            language_code: string;
            photo_url?: string;
        };
        [key: string]: any; // Additional fields Telegram might provide
    };
    themeParams?: TelegramThemeParams;
    MainButton?: {
      text: string; // Current button text
    color: string; // Current button color
    textColor: string; // Current button text color
    isVisible: boolean; // Shows whether the button is visible
    isActive: boolean; // Shows whether the button is active
    isProgressVisible: boolean; // Readonly. Shows whether the button is displaying a loading indicator
    setText(text: string): void; // Set the button text
    onClick(callback: () => void): void; // Set the button press event handler
    offClick(callback: () => void): void; // Remove the button press event handler
    show(): void; // Make the button visible
    hide(): void; // Hide the button
    enable(): void; // Enable the button
    disable(): void; // Disable the button
    showProgress(leaveActive?: boolean): void; // Show a loading indicator on the button
    hideProgress(): void; // Hide the loading indicator
    setParams(params: {
      text?: string;
      color?: string;
      text_color?: string;
      is_active?: boolean;
      is_visible?: boolean;
    }): void; // Set multiple button parameters at once
    };
    BackButton?: {
      show(): void;
      hide(): void;
      onClick(callback: () => void): void; // Set the button press event handler
    };
    openLink(url: string, options?: { [key: string]: any }): void;
    close(): void;
    ready(): void;
    colorScheme: 'light' | 'dark';
    showPopup(params: PopupParams, callback?: (buttonId: string) => void): void;
    showAlert(message: string, callback?: () => void): void;
    showConfirm(message: string, callback?: (confirmed: boolean) => void): void;
    showScanQrPopup(params: ScanQrPopupParams, callback?: (text: string) => void): void;
    closeScanQrPopup(): void;
    readTextFromClipboard(callback?: (text: string) => void): void;
    enableVerticalSwipes(): void;
    disableVerticalSwipes(): void;
    setHeaderColor(color: string): void;
    setBackgroundColor(color: string): void;
    onEvent(eventType: TelegramWebAppEventType, callback: (event: any) => void): void; // Add onEvent method
    showProgress(lweaveActive: boolean): void;
}

// Define the MainButton interface with the possible actions
interface TelegramMainButton {
    setText(text: string): void;
    show(): void;
    hide(): void;
    onClick(callback: () => void): void;
    setParams(params: { [key: string]: any }): void; // Optional, adjust based on your use case
}

// Define the BackButton interface for the Telegram WebApp
interface TelegramBackButton {
    show(): void;
    hide(): void;
    onClick(callback: () => void): void;
}

// Define the available event types for Telegram WebApp
type TelegramWebAppEventType = 
    'themeChanged' | 
    'viewportChanged' | 
    'mainButtonClicked' | 
    'backButtonClicked' | 
    'settingsButtonClicked' | 
    'invoiceClosed' | 
    'popupClosed' | 
    'qrTextReceived' | 
    'scanQrPopupClosed' | 
    'clipboardTextReceived';

// Define the interface for opening a link within the Telegram WebApp
interface TelegramWebApp {
    expand(): void;
    initData: string;
    initDataUnsafe: {
        user?: {
            id: number;
            first_name: string;
            last_name?: string;
            username: string;
            language_code: string;
            photo_url?: string;
        };
        [key: string]: any; // Additional fields Telegram might provide
    };
    themeParams?: TelegramThemeParams;
    MainButton?: TelegramMainButton; // Include MainButton functionalities
    BackButton?: TelegramBackButton; // Include BackButton functionalities
    openLink(url: string): void;
    onEvent(eventType: TelegramWebAppEventType, callback: (event: any) => void): void; // Add onEvent method
    close(): void;
    ready(): void;
    colorScheme: 'light' | 'dark'; // Define the color scheme that can be light or dark
}

// Extend the global Window interface to include the Telegram WebApp
interface Window {
    Telegram?: {
        WebApp?: TelegramWebApp;
    };
}


  interface AdInfo {
    title: string;
    description: string;
  }
  
  interface GeneralInfo {
    make: string;
    year: string;
    color: string;
    model: string;
    price: number;
  }
  
  interface PhotoUpload {
    photo?: string; // Photo is optional
  }
  
  interface ItemDetails {
    ad_info: AdInfo;
    lesson_info: AdInfo;
    agreement: any; // Not used in this example
    general_info: GeneralInfo;
    photo_upload: PhotoUpload;
  }

  
  interface DynamicItemDetailsProps {
    item: Item;
  }

  interface Rent {
    id: number;
    user_id: number;
    item_id: number;
    rent_start: string;
    rent_end: string;
    status: string;
  }
  
    interface Item {
        id: number;
        details: {
          general_info?: {
              [key: string]: string;
              price: string;
          };
          pricing?: {
            [key: string]: string; // Changed to handle the object structure
          };
          [key: string]: any;
        };
        title: string;
        creator_ref_code: string;
        item_type: string;
      }
  
  interface User {
    id: number;
    telegram_id: string;
    ref_code: string;
    site: string;
  }
  
  interface ItemType {
    id: string;
    type: string;
    fields: any;
  }