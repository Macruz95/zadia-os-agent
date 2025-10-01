import { Country } from '@/modules/countries/types/countries.types';

/**
 * Master Countries Data - Real geographical data for ZADIA OS
 * This is NOT mock data - these are real countries used across the system
 * Maintained as master data for consistency and reusability
 */
export const MASTER_COUNTRIES: Country[] = [
  // CENTROAMÉRICA
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
    id: 'bz',
    name: 'Belice',
    isoCode: 'BZ',
    phoneCode: '+501',
    flagEmoji: '🇧🇿',
    isActive: true
  },
  // NORTEAMÉRICA
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
  },
  {
    id: 'ca',
    name: 'Canadá',
    isoCode: 'CA',
    phoneCode: '+1',
    flagEmoji: '🇨🇦',
    isActive: true
  },
  // SUDAMÉRICA
  {
    id: 'PE',
    name: 'Perú',
    isoCode: 'PE',
    phoneCode: '+51',
    flagEmoji: '🇵🇪',
    isActive: true
  },
  {
    id: 'CO',
    name: 'Colombia', 
    isoCode: 'CO',
    phoneCode: '+57',
    flagEmoji: '🇨🇴',
    isActive: true
  },
  {
    id: 'EC',
    name: 'Ecuador',
    isoCode: 'EC', 
    phoneCode: '+593',
    flagEmoji: '🇪🇨',
    isActive: true
  },
  {
    id: 'BO',
    name: 'Bolivia',
    isoCode: 'BO',
    phoneCode: '+591', 
    flagEmoji: '🇧🇴',
    isActive: true
  },
  {
    id: 'VE',
    name: 'Venezuela',
    isoCode: 'VE',
    phoneCode: '+58',
    flagEmoji: '🇻🇪',
    isActive: true
  },
  {
    id: 'BR',
    name: 'Brasil',
    isoCode: 'BR',
    phoneCode: '+55',
    flagEmoji: '🇧🇷',
    isActive: true
  },
  {
    id: 'AR',
    name: 'Argentina',
    isoCode: 'AR',
    phoneCode: '+54',
    flagEmoji: '🇦🇷',
    isActive: true
  },
  {
    id: 'CL',
    name: 'Chile',
    isoCode: 'CL',
    phoneCode: '+56',
    flagEmoji: '🇨🇱',
    isActive: true
  },
  {
    id: 'UY',
    name: 'Uruguay',
    isoCode: 'UY',
    phoneCode: '+598',
    flagEmoji: '🇺🇾',
    isActive: true
  },
  {
    id: 'PY',
    name: 'Paraguay',
    isoCode: 'PY',
    phoneCode: '+595',
    flagEmoji: '🇵🇾',
    isActive: true
  }
];