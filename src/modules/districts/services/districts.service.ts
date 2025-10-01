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
import { District, districtSchema } from '../types/districts.types';
import { MASTER_DISTRICTS_SV } from '@/modules/geographical/data';

/**
 * ⚠️ CRÍTICO: NO MODIFICAR - SISTEMA DE DIRECCIONES FUNCIONA PERFECTO
 * ⚠️ Si tocas este archivo se rompe todo el sistema de direcciones
 * Districts Service  
 * Handles district CRUD operations with Firebase Firestore
 */
export class DistrictsService {  /**
   * Get districts by municipality ID
   */
  static async getDistrictsByMunicipality(municipalityId: string): Promise<District[]> {
    try {
      const districtsRef = collection(db, 'districts');
      const q = query(
        districtsRef,
        where('municipalityId', '==', municipalityId),
        where('isActive', '==', true),
        orderBy('name')
      );
      const querySnapshot = await getDocs(q);

      const districts: District[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const district = {
          id: doc.id,
          ...data,
          createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
          updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date()
        };

        districts.push(districtSchema.parse(district));
      });

      // If no districts in Firestore, return master data filtered by municipality
      if (districts.length === 0) {
        return MASTER_DISTRICTS_SV.filter(district => district.municipalityId === municipalityId);
      }

      return districts;
    } catch (error) {
      logger.error('Error fetching districts from Firestore, using master data', error as Error, {
        component: 'DistrictsService',
        action: 'getDistrictsByMunicipality',
        metadata: { municipalityId }
      });
      return MASTER_DISTRICTS_SV.filter(district => district.municipalityId === municipalityId);
    }
  }

  /**
   * Get district by ID
   */
  static async getDistrictById(id: string): Promise<District | null> {
    try {
      const districtRef = doc(db, 'districts', id);
      const districtSnap = await getDoc(districtRef);

      if (!districtSnap.exists()) {
        // Try to find in master data
        const masterDistrict = MASTER_DISTRICTS_SV.find(district => district.id === id);
        return masterDistrict || null;
      }

      const data = districtSnap.data();
      const district = {
        id: districtSnap.id,
        ...data,
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
        updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date()
      };

      return districtSchema.parse(district);
    } catch (error) {
      logger.error('Error fetching district from Firestore, using master data', error as Error, {
        component: 'DistrictsService',
        action: 'getDistrictById',
        metadata: { districtId: id }
      });
      const masterDistrict = MASTER_DISTRICTS_SV.find(district => district.id === id);
      return masterDistrict || null;
    }
  }

  /**
   * Create new district
   */
  static async createDistrict(districtData: Omit<District, 'id'>): Promise<string> {
    try {
      const validatedData = districtSchema.omit({ id: true }).parse(districtData);

      const districtsRef = collection(db, 'districts');
      const docRef = await addDoc(districtsRef, {
        ...validatedData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });

      return docRef.id;
    } catch (error) {
      throw new Error(`Error creating district: ${error}`);
    }
  }

  /**
   * Update district
   */
  static async updateDistrict(id: string, updates: Partial<Omit<District, 'id'>>): Promise<void> {
    try {
      const districtRef = doc(db, 'districts', id);
      await updateDoc(districtRef, {
        ...updates,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      throw new Error(`Error updating district: ${error}`);
    }
  }

  /**
   * Delete district (soft delete)
   */
  static async deleteDistrict(id: string): Promise<void> {
    try {
      const districtRef = doc(db, 'districts', id);
      await updateDoc(districtRef, {
        isActive: false,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      throw new Error(`Error deleting district: ${error}`);
    }
  }
}