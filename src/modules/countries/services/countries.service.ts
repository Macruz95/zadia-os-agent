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
import { Country, countrySchema } from '../types/countries.types';

/**
 * Countries Service
 * Handles country CRUD operations with Firebase Firestore
 */
export class CountriesService {

  /**
   * Get all active countries
   */
  static async getCountries(): Promise<Country[]> {
    try {
      const countriesRef = collection(db, 'countries');
      const q = query(countriesRef, where('isActive', '==', true), orderBy('name'));
      const querySnapshot = await getDocs(q);

      const countries: Country[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const country = {
          id: doc.id,
          ...data,
          createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
          updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date()
        };

        // Validate data structure with Zod
        countries.push(countrySchema.parse(country));
      });

      return countries;
    } catch (error) {
      throw new Error(`Error fetching countries: ${error}`);
    }
  }

  /**
   * Get country by ID
   */
  static async getCountryById(id: string): Promise<Country | null> {
    try {
      const countryRef = doc(db, 'countries', id);
      const countrySnap = await getDoc(countryRef);

      if (!countrySnap.exists()) {
        return null;
      }

      const data = countrySnap.data();
      const country = {
        id: countrySnap.id,
        ...data,
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
        updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date()
      };

      return countrySchema.parse(country);
    } catch (error) {
      throw new Error(`Error fetching country: ${error}`);
    }
  }

  /**
   * Get country by ISO code
   */
  static async getCountryByIsoCode(isoCode: string): Promise<Country | null> {
    try {
      const countriesRef = collection(db, 'countries');
      const q = query(countriesRef, where('isoCode', '==', isoCode.toUpperCase()));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return null;
      }

      const doc = querySnapshot.docs[0];
      const data = doc.data();
      const country = {
        id: doc.id,
        ...data,
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
        updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date()
      };

      return countrySchema.parse(country);
    } catch (error) {
      throw new Error(`Error fetching country by ISO code: ${error}`);
    }
  }

  /**
   * Create new country
   */
  static async createCountry(countryData: Omit<Country, 'id'>): Promise<string> {
    try {
      // Validate input data
      const validatedData = countrySchema.omit({ id: true }).parse(countryData);

      const countriesRef = collection(db, 'countries');
      const docRef = await addDoc(countriesRef, {
        ...validatedData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });

      return docRef.id;
    } catch (error) {
      throw new Error(`Error creating country: ${error}`);
    }
  }

  /**
   * Update country
   */
  static async updateCountry(id: string, updates: Partial<Omit<Country, 'id'>>): Promise<void> {
    try {
      const countryRef = doc(db, 'countries', id);
      await updateDoc(countryRef, {
        ...updates,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      throw new Error(`Error updating country: ${error}`);
    }
  }

  /**
   * Delete country (soft delete by setting isActive to false)
   */
  static async deleteCountry(id: string): Promise<void> {
    try {
      const countryRef = doc(db, 'countries', id);
      await updateDoc(countryRef, {
        isActive: false,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      throw new Error(`Error deleting country: ${error}`);
    }
  }
}