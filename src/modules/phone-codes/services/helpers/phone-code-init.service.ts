/**
 * ZADIA OS - Phone Codes Initialization Service
 * Handles auto-initialization of phone codes collection
 * Rule #1: No mocks, only real data
 */

import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { logger } from '@/lib/logger';
import { PhoneCode } from '../../types/phone-codes.types';

// Real phone codes data for initialization
const INITIAL_PHONE_CODES_DATA: Omit<PhoneCode, 'id'>[] = [
  {
    countryId: 'SV',
    code: '+503',
    dialCode: '503',
    priority: 100,
    isActive: true,
    example: '70123456'
  },
  {
    countryId: 'PE',
    code: '+51',
    dialCode: '51',
    priority: 90,
    isActive: true,
    example: '987654321'
  },
  {
    countryId: 'US',
    code: '+1',
    dialCode: '1',
    priority: 80,
    isActive: true,
    example: '5551234567'
  },
  {
    countryId: 'CO',
    code: '+57',
    dialCode: '57',
    priority: 70,
    isActive: true,
    example: '3001234567'
  }
];

/**
 * Initialize phone codes collection with real data
 * Runs only once when Firestore collection is empty
 */
export async function initializePhoneCodes(): Promise<PhoneCode[]> {
  try {
    logger.info('Initializing phone codes collection with real data...', {
      component: 'PhoneCodeInit',
      action: 'initializePhoneCodes'
    });

    const phoneCodesRef = collection(db, 'phoneCodes');
    const createdCodes: PhoneCode[] = [];

    for (const phoneCodeData of INITIAL_PHONE_CODES_DATA) {
      const docRef = await addDoc(phoneCodesRef, {
        ...phoneCodeData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });

      createdCodes.push({
        id: docRef.id,
        ...phoneCodeData
      });
    }

    logger.info(`Successfully initialized ${createdCodes.length} phone codes`, {
      component: 'PhoneCodeInit',
      action: 'initializePhoneCodes',
      metadata: { count: createdCodes.length }
    });

    return createdCodes;
  } catch (error) {
    logger.error('Error initializing phone codes', error as Error, {
      component: 'PhoneCodeInit',
      action: 'initializePhoneCodes'
    });
    throw new Error('Error al inicializar códigos telefónicos');
  }
}
