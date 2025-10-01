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
import { Municipality, municipalitySchema } from '../types/municipalities.types';
import { MASTER_MUNICIPALITIES_SV } from '@/modules/geographical/data';

/**
 * ⚠️ CRÍTICO: NO MODIFICAR - SISTEMA DE DIRECCIONES FUNCIONA PERFECTO
 * ⚠️ Si tocas este archivo se rompe todo el sistema de direcciones
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

      // If no municipalities in Firestore, return master data filtered by department
      if (municipalities.length === 0) {
        const filtered = MASTER_MUNICIPALITIES_SV.filter(mun => mun.departmentId === departmentId);
        return filtered;
      }

      return municipalities;
    } catch (error) {
      logger.error('Error fetching municipalities from Firestore, using master data', error as Error, {
        component: 'MunicipalitiesService',
        action: 'getMunicipalitiesByDepartment',
        metadata: { departmentId }
      });
      const filtered = MASTER_MUNICIPALITIES_SV.filter(mun => mun.departmentId === departmentId);
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
        // Try to find in master data
        const masterMunicipality = MASTER_MUNICIPALITIES_SV.find(mun => mun.id === id);
        return masterMunicipality || null;
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
      logger.error('Error fetching municipality from Firestore, using master data', error as Error, {
        component: 'MunicipalitiesService',
        action: 'getMunicipalityById',
        metadata: { municipalityId: id }
      });
      const masterMunicipality = MASTER_MUNICIPALITIES_SV.find(mun => mun.id === id);
      return masterMunicipality || null;
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