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