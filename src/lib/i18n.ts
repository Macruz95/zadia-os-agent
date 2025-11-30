import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import language files
import es from '../locales/es.json';
import en from '../locales/en.json';
import pt from '../locales/pt.json';

const resources = {
  es: {
    translation: es
  },
  en: {
    translation: en
  },
  pt: {
    translation: pt
  }
};

const isServer = typeof window === 'undefined';

// Initialize i18n with SSR support
const initOptions = {
  resources,
  fallbackLng: 'es',
  lng: isServer ? 'es' : undefined, // Set default language for SSR
  debug: false,
  
  interpolation: {
    escapeValue: false
  },

  // Ensure SSR compatibility
  react: {
    useSuspense: false
  }
};

if (!isServer) {
  // Only use LanguageDetector on client side
  i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      ...initOptions,
      detection: {
        order: ['localStorage', 'navigator', 'htmlTag'],
        caches: ['localStorage']
      }
    });
} else {
  // Server-side initialization without language detection
  i18n
    .use(initReactI18next)
    .init(initOptions);
}

export default i18n;
