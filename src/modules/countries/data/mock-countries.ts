import { Country } from '../types/countries.types';

/**
 * ⚠️ CRÍTICO: NO MODIFICAR ESTE ARCHIVO - SISTEMA DE DIRECCIONES
 * ⚠️ Si modificas cualquier parte del sistema de direcciones se rompe todo
 * ⚠️ Este sistema funciona perfecto tal como está - NO TOCAR
 * Mock countries data for development/fallback
 */
export const MOCK_COUNTRIES: Country[] = [
  {
    id: 'sv',
    name: 'El Salvador',
    isoCode: 'SV',
    phoneCode: '+503',
    flagEmoji: '🇸🇻',
    isActive: true
  },
  {
    id: 'gt',
    name: 'Guatemala',
    isoCode: 'GT',
    phoneCode: '+502',
    flagEmoji: '🇬🇹',
    isActive: true
  },
  {
    id: 'hn',
    name: 'Honduras',
    isoCode: 'HN',
    phoneCode: '+504',
    flagEmoji: '🇭🇳',
    isActive: true
  },
  {
    id: 'ni',
    name: 'Nicaragua',
    isoCode: 'NI',
    phoneCode: '+505',
    flagEmoji: '🇳🇮',
    isActive: true
  },
  {
    id: 'cr',
    name: 'Costa Rica',
    isoCode: 'CR',
    phoneCode: '+506',
    flagEmoji: '🇨🇷',
    isActive: true
  },
  {
    id: 'pa',
    name: 'Panamá',
    isoCode: 'PA',
    phoneCode: '+507',
    flagEmoji: '🇵🇦',
    isActive: true
  },
  {
    id: 'mx',
    name: 'México',
    isoCode: 'MX',
    phoneCode: '+52',
    flagEmoji: '🇲🇽',
    isActive: true
  },
  {
    id: 'us',
    name: 'Estados Unidos',
    isoCode: 'US',
    phoneCode: '+1',
    flagEmoji: '🇺🇸',
    isActive: true
  }
];