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

/**
 * Municipalities Service
 * Handles municipality CRUD operations with Firebase Firestore
 */
export class MunicipalitiesService {

  /**
   * Get municipalities by department ID
   */
  static async getMunicipalitiesByDepartment(departmentId: string): Promise<Municipality[]> {
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

      return municipalities;
    } catch (error) {
      throw new Error(`Error fetching municipalities: ${error}`);
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
        return null;
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
      throw new Error(`Error fetching municipality: ${error}`);
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