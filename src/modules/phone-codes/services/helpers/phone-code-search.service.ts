/**
 * ZADIA OS - Phone Codes Search Service
 * Handles search and filtering operations
 */

import { collection, getDocs, query, where, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { logger } from '@/lib/logger';
import { PhoneCode, phoneCodeSchema } from '../../types/phone-codes.types';
import { initializePhoneCodes } from './phone-code-init.service';

const COLLECTION = 'phoneCodes';

/**
 * Get all active phone codes
 */
export async function getPhoneCodes(): Promise<PhoneCode[]> {
  try {
    const phoneCodesRef = collection(db, COLLECTION);
    const q = query(
      phoneCodesRef,
      where('isActive', '==', true),
      orderBy('priority', 'desc'),
      orderBy('code')
    );
    const querySnapshot = await getDocs(q);

    const phoneCodes: PhoneCode[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const phoneCode = {
        id: doc.id,
        ...data,
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
        updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date()
      };

      phoneCodes.push(phoneCodeSchema.parse(phoneCode));
    });

    // If no phone codes in Firestore, initialize with real data
    if (phoneCodes.length === 0) {
      logger.info('No phone codes found in Firestore. Initializing with real data...', {
        component: 'PhoneCodeSearch',
        action: 'getPhoneCodes'
      });
      
      return await initializePhoneCodes();
    }

    return phoneCodes;
  } catch (error) {
    logger.error('Error fetching phone codes from Firestore', error as Error, {
      component: 'PhoneCodeSearch',
      action: 'getPhoneCodes'
    });
    throw new Error('Error al obtener códigos telefónicos');
  }
}

/**
 * Get phone codes by country ID
 */
export async function getPhoneCodesByCountry(countryId: string): Promise<PhoneCode[]> {
  try {
    const phoneCodesRef = collection(db, COLLECTION);
    const q = query(
      phoneCodesRef,
      where('countryId', '==', countryId),
      where('isActive', '==', true),
      orderBy('priority', 'desc')
    );
    const querySnapshot = await getDocs(q);

    const phoneCodes: PhoneCode[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const phoneCode = {
        id: doc.id,
        ...data,
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
        updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date()
      };

      phoneCodes.push(phoneCodeSchema.parse(phoneCode));
    });

    // If no phone codes in Firestore, initialize and return filtered data
    if (phoneCodes.length === 0) {
      const initializedCodes = await initializePhoneCodes();
      return initializedCodes.filter(code => code.countryId === countryId);
    }

    return phoneCodes;
  } catch (error) {
    logger.error('Error fetching phone codes from Firestore', error as Error, {
      component: 'PhoneCodeSearch',
      action: 'getPhoneCodesByCountry',
      metadata: { countryId }
    });
    throw new Error(`Error al obtener códigos telefónicos para ${countryId}`);
  }
}

/**
 * Find phone code by dial code
 */
export async function findByDialCode(dialCode: string): Promise<PhoneCode | null> {
  try {
    const phoneCodesRef = collection(db, COLLECTION);
    const q = query(
      phoneCodesRef,
      where('dialCode', '==', dialCode),
      where('isActive', '==', true)
    );
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      const data = doc.data();
      const phoneCode = {
        id: doc.id,
        ...data,
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
        updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date()
      };
      return phoneCodeSchema.parse(phoneCode);
    }

    return null;
  } catch (error) {
    logger.error('Error finding phone code by dial code', error as Error, {
      component: 'PhoneCodeSearch',
      action: 'findByDialCode',
      metadata: { dialCode }
    });
    throw new Error(`Error al buscar código telefónico ${dialCode}`);
  }
}
