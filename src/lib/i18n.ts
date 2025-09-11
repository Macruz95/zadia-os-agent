'use client';

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import language files
import es from '../locales/es.json';
import en from '../locales/en.json';

const resources = {
  es: {
    translation: es
  },
  en: {
    translation: en
  }
};

// Only initialize on client side
if (typeof window !== 'undefined') {
  i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources,
      fallbackLng: 'es',
      debug: process.env.NODE_ENV === 'development',
      
      detection: {
        order: ['localStorage', 'navigator', 'htmlTag'],
        caches: ['localStorage']
      },
      
      interpolation: {
        escapeValue: false
      }
    });
}

export default i18n;
