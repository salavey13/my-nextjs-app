import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import ru from './locales/ru.json';

i18n.use(initReactI18next).init({
  resources: {
    en: {
      translation: en,
    },
    ru: {
      translation: ru,
    },
  },
  lng: 'en', // Default language
  fallbackLng: 'en', // Fallback language if the current language doesn't have translations
  interpolation: {
    escapeValue: false, // React already safes from XSS
  },
});

export default i18n;
