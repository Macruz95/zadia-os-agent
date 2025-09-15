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
import { Municipality, municipalitySchema } from '../types/municipalities.types';
import { MOCK_MUNICIPALITIES } from '../mock-municipalities';

/**
 * Municipalities Service
 * Handles municipality CRUD operations with Firebase Firestore
 */
export class MunicipalitiesService {

  /**
   * Get municipalities by department ID
   */
  static async getMunicipalitiesByDepartment(departmentId: string): Promise<Municipality[]> {
    console.log('getMunicipalitiesByDepartment called with departmentId:', departmentId);
    try {
      const municipalitiesRef = collection(db, 'municipalities');
      const q = query(
        municipalitiesRef,
        where('departmentId', '==', departmentId),
        where('isActive', '==', true),
        orderBy('name')
      );
      const querySnapshot = await getDocs(q);

      const municipalities: Municipality[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const municipality = {
          id: doc.id,
          ...data,
          createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
          updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date()
        };

        municipalities.push(municipalitySchema.parse(municipality));
      });

      // If no municipalities in Firestore, return mock data filtered by department
      if (municipalities.length === 0) {
        console.log('No municipalities in Firestore, using mock data');
        console.log('MOCK_MUNICIPALITIES:', MOCK_MUNICIPALITIES);
        const filtered = MOCK_MUNICIPALITIES.filter(mun => mun.departmentId === departmentId);
        console.log('Filtered municipalities for departmentId', departmentId, ':', filtered);
        return filtered;
      }

      return municipalities;
    } catch (error) {
      console.warn('Error fetching municipalities from Firestore, using mock data:', error);
      console.log('MOCK_MUNICIPALITIES in catch:', MOCK_MUNICIPALITIES);
      const filtered = MOCK_MUNICIPALITIES.filter(mun => mun.departmentId === departmentId);
      console.log('Filtered municipalities in catch for departmentId', departmentId, ':', filtered);
      return filtered;
    }
  }

  /**
   * Get municipality by ID
   */
  static async getMunicipalityById(id: string): Promise<Municipality | null> {
    try {
      const municipalityRef = doc(db, 'municipalities', id);
      const municipalitySnap = await getDoc(municipalityRef);

      if (!municipalitySnap.exists()) {
        // Try to find in mock data
        const mockMunicipality = MOCK_MUNICIPALITIES.find(mun => mun.id === id);
        return mockMunicipality || null;
      }

      const data = municipalitySnap.data();
      const municipality = {
        id: municipalitySnap.id,
        ...data,
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
        updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date()
      };

      return municipalitySchema.parse(municipality);
    } catch (error) {
      console.warn('Error fetching municipality from Firestore, using mock data:', error);
      const mockMunicipality = MOCK_MUNICIPALITIES.find(mun => mun.id === id);
      return mockMunicipality || null;
    }
  }

  /**
   * Create new municipality
   */
  static async createMunicipality(municipalityData: Omit<Municipality, 'id'>): Promise<string> {
    try {
      const validatedData = municipalitySchema.omit({ id: true }).parse(municipalityData);

      const municipalitiesRef = collection(db, 'municipalities');
      const docRef = await addDoc(municipalitiesRef, {
        ...validatedData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });

      return docRef.id;
    } catch (error) {
      throw new Error(`Error creating municipality: ${error}`);
    }
  }

  /**
   * Update municipality
   */
  static async updateMunicipality(id: string, updates: Partial<Omit<Municipality, 'id'>>): Promise<void> {
    try {
      const municipalityRef = doc(db, 'municipalities', id);
      await updateDoc(municipalityRef, {
        ...updates,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      throw new Error(`Error updating municipality: ${error}`);
    }
  }

  /**
   * Delete municipality (soft delete)
   */
  static async deleteMunicipality(id: string): Promise<void> {
    try {
      const municipalityRef = doc(db, 'municipalities', id);
      await updateDoc(municipalityRef, {
        isActive: false,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      throw new Error(`Error deleting municipality: ${error}`);
    }
  }
}