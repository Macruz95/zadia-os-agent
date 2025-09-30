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
import { PhoneCode, phoneCodeSchema } from '../types/phone-codes.types';
import { MOCK_PHONE_CODES } from '../mock-phone-codes';

/**
 * Phone Codes Service
 * Handles phone code CRUD operations with Firebase Firestore
 */
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

      // If no phone codes in Firestore, return mock data
      if (phoneCodes.length === 0) {
        return MOCK_PHONE_CODES;
      }

      return phoneCodes;
    } catch (error) {
      console.warn('Error fetching phone codes from Firestore, using mock data:', error);
      return MOCK_PHONE_CODES;
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

      // If no phone codes in Firestore, return filtered mock data
      if (phoneCodes.length === 0) {
        return MOCK_PHONE_CODES.filter(code => code.countryId === countryId);
      }

      return phoneCodes;
    } catch (error) {
      console.warn('Error fetching phone codes from Firestore, using mock data:', error);
      return MOCK_PHONE_CODES.filter(code => code.countryId === countryId);
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
        // Try to find in mock data
        const mockPhoneCode = MOCK_PHONE_CODES.find(code => code.id === id);
        return mockPhoneCode || null;
      }

      const data = phoneCodeSnap.data();
      const phoneCode = {
        id: phoneCodeSnap.id,
        ...data,
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
        updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date()
      };

      return phoneCodeSchema.parse(phoneCode);
    } catch (error) {
      console.warn('Error fetching phone code from Firestore, using mock data:', error);
      const mockPhoneCode = MOCK_PHONE_CODES.find(code => code.id === id);
      return mockPhoneCode || null;
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

      // Try to find in mock data
      const mockPhoneCode = MOCK_PHONE_CODES.find(code => code.dialCode === dialCode);
      return mockPhoneCode || null;
    } catch (error) {
      console.warn('Error finding phone code by dial code, using mock data:', error);
      const mockPhoneCode = MOCK_PHONE_CODES.find(code => code.dialCode === dialCode);
      return mockPhoneCode || null;
    }
  }
}