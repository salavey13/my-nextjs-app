// src/types/global.d.ts

// Define the interface for theme parameters that Telegram might provide
interface TelegramThemeParams {
    [key: string]: string; // Adjust this type based on the specific structure of themeParams
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
  
  interface Item {
    id: number;
    item_type: string;
    details: ItemDetails;
    creator_ref_code: string;
  }
  
  interface DynamicItemDetailsProps {
    item: Item;
  }