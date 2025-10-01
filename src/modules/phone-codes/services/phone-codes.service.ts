import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { logger } from '@/lib/logger';
import { PhoneCode, phoneCodeSchema } from '../types/phone-codes.types';

/**
 * Phone Codes Service
 * Handles phone code CRUD operations with Firebase Firestore
 * 
 * Following ZADIA OS Rule 1: No mocks, only real data from Firestore
 * Implements auto-initialization system for empty collections
 */

// Real phone codes data for initialization (not mocks - real data to populate Firestore)
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
export class PhoneCodesService {
  /**
   * Get all phone codes
   */
  static async getPhoneCodes(): Promise<PhoneCode[]> {
    try {
      const phoneCodesRef = collection(db, 'phoneCodes');
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
          component: 'PhoneCodesService',
          action: 'initializePhoneCodes'
        });
        
        return await this.initializePhoneCodes();
      }

      return phoneCodes;
    } catch (error) {
      logger.error('Error fetching phone codes from Firestore', error as Error, {
        component: 'PhoneCodesService',
        action: 'getPhoneCodes'
      });
      throw new Error('Error al obtener códigos telefónicos');
    }
  }

  /**
   * Get phone codes by country ID
   */
  static async getPhoneCodesByCountry(countryId: string): Promise<PhoneCode[]> {
    try {
      const phoneCodesRef = collection(db, 'phoneCodes');
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
        const initializedCodes = await this.initializePhoneCodes();
        return initializedCodes.filter(code => code.countryId === countryId);
      }

      return phoneCodes;
    } catch (error) {
      logger.error('Error fetching phone codes from Firestore', error as Error, {
        component: 'PhoneCodesService',
        action: 'getPhoneCodesByCountry',
        metadata: { countryId }
      });
      throw new Error(`Error al obtener códigos telefónicos para ${countryId}`);
    }
  }

  /**
   * Get phone code by ID
   */
  static async getPhoneCodeById(id: string): Promise<PhoneCode | null> {
    try {
      const phoneCodeRef = doc(db, 'phoneCodes', id);
      const phoneCodeSnap = await getDoc(phoneCodeRef);

      if (!phoneCodeSnap.exists()) {
        return null;
      }

      const data = phoneCodeSnap.data();
      const phoneCode = {
        id: phoneCodeSnap.id,
        ...data
      };

      return phoneCodeSchema.parse(phoneCode);
    } catch (error) {
      logger.error('Error fetching phone code from Firestore', error as Error, {
        component: 'PhoneCodesService',
        action: 'getPhoneCodeById',
        metadata: { phoneCodeId: id }
      });
      throw new Error(`Error al obtener código telefónico ${id}`);
    }
  }

  /**
   * Create new phone code
   */
  static async createPhoneCode(phoneCodeData: Omit<PhoneCode, 'id'>): Promise<string> {
    try {
      const validatedData = phoneCodeSchema.omit({ id: true }).parse(phoneCodeData);

      const phoneCodesRef = collection(db, 'phoneCodes');
      const docRef = await addDoc(phoneCodesRef, {
        ...validatedData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });

      return docRef.id;
    } catch (error) {
      throw new Error(`Error creating phone code: ${error}`);
    }
  }

  /**
   * Update phone code
   */
  static async updatePhoneCode(id: string, updates: Partial<Omit<PhoneCode, 'id'>>): Promise<void> {
    try {
      const phoneCodeRef = doc(db, 'phoneCodes', id);
      await updateDoc(phoneCodeRef, {
        ...updates,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      throw new Error(`Error updating phone code: ${error}`);
    }
  }

  /**
   * Delete phone code (soft delete)
   */
  static async deletePhoneCode(id: string): Promise<void> {
    try {
      const phoneCodeRef = doc(db, 'phoneCodes', id);
      await updateDoc(phoneCodeRef, {
        isActive: false,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      throw new Error(`Error deleting phone code: ${error}`);
    }
  }

  /**
   * Find phone code by dial code
   */
  static async findByDialCode(dialCode: string): Promise<PhoneCode | null> {
    try {
      const phoneCodesRef = collection(db, 'phoneCodes');
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
          ...data
        };
        return phoneCodeSchema.parse(phoneCode);
      }

      return null;
    } catch (error) {
      logger.error('Error finding phone code by dial code', error as Error, {
        component: 'PhoneCodesService',
        action: 'findByDialCode',
        metadata: { dialCode }
      });
      throw new Error(`Error al buscar código telefónico ${dialCode}`);
    }
  }

  /**
   * Initialize phone codes collection with real data
   * This runs only once when Firestore collection is empty
   */
  private static async initializePhoneCodes(): Promise<PhoneCode[]> {
    try {
      logger.info('Initializing phone codes collection with real data...', {
        component: 'PhoneCodesService',
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
        component: 'PhoneCodesService',
        action: 'initializePhoneCodes',
        metadata: { count: createdCodes.length }
      });

      return createdCodes;
    } catch (error) {
      logger.error('Error initializing phone codes', error as Error, {
        component: 'PhoneCodesService',
        action: 'initializePhoneCodes'
      });
      throw new Error('Error al inicializar códigos telefónicos');
    }
  }
}