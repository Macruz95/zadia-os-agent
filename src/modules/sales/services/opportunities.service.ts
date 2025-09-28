/**
 * ZADIA OS - Opportunities Service
 * 
 * Handles all opportunity operations with Firebase integration
 */

import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { logger } from '@/lib/logger';
import { Opportunity } from '../types/sales.types';
import { OpportunityFormData } from '../validations/sales.schema';

const OPPORTUNITIES_COLLECTION = 'opportunities';

export class OpportunitiesService {
  /**
   * Create a new opportunity
   */
  static async createOpportunity(data: OpportunityFormData, createdBy: string): Promise<Opportunity> {
    try {
      const now = Timestamp.fromDate(new Date());
      const opportunityData = {
        ...data,
        expectedCloseDate: data.expectedCloseDate ? Timestamp.fromDate(data.expectedCloseDate) : undefined,
        status: 'open' as const,
        createdAt: now,
        updatedAt: now,
        createdBy,
        probability: 0, // Default probability based on stage
      };

      const docRef = await addDoc(collection(db, OPPORTUNITIES_COLLECTION), opportunityData);
      
      const newOpportunity: Opportunity = {
        ...opportunityData,
        id: docRef.id,
      };

      logger.info('Opportunity created successfully', { component: 'OpportunitiesService', action: 'create' });
      return newOpportunity;
    } catch (error) {
      logger.error('Error creating opportunity', error instanceof Error ? error : new Error(String(error)));
      throw new Error('Failed to create opportunity');
    }
  }

  /**
   * Get all opportunities
   */
  static async getOpportunities(): Promise<Opportunity[]> {
    try {
      const q = query(
        collection(db, OPPORTUNITIES_COLLECTION),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const opportunities: Opportunity[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        opportunities.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          expectedCloseDate: data.expectedCloseDate?.toDate() || null,
        } as Opportunity);
      });

      return opportunities;
    } catch (error) {
      logger.error('Error fetching opportunities', error instanceof Error ? error : new Error(String(error)));
      throw new Error('Failed to fetch opportunities');
    }
  }

  /**
   * Get opportunity by ID
   */
  static async getOpportunityById(id: string): Promise<Opportunity | null> {
    try {
      const docRef = doc(db, OPPORTUNITIES_COLLECTION, id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return null;
      }

      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        expectedCloseDate: data.expectedCloseDate?.toDate() || null,
      } as Opportunity;
    } catch (error) {
      logger.error('Error fetching opportunity', error instanceof Error ? error : new Error(String(error)));
      throw new Error('Failed to fetch opportunity');
    }
  }

  /**
   * Update opportunity
   */
  static async updateOpportunity(id: string, updates: Partial<OpportunityFormData>): Promise<void> {
    try {
      const docRef = doc(db, OPPORTUNITIES_COLLECTION, id);
      const updateData = {
        ...updates,
        updatedAt: Timestamp.fromDate(new Date()),
      };

      await updateDoc(docRef, updateData);
      logger.info('Opportunity updated successfully', { component: 'OpportunitiesService', action: 'update' });
    } catch (error) {
      logger.error('Error updating opportunity', error instanceof Error ? error : new Error(String(error)));
      throw new Error('Failed to update opportunity');
    }
  }

  /**
   * Update opportunity stage
   */
  static async updateOpportunityStage(id: string, stage: string, updatedBy: string): Promise<void> {
    try {
      const docRef = doc(db, OPPORTUNITIES_COLLECTION, id);
      const updateData = {
        stage,
        updatedAt: Timestamp.fromDate(new Date()),
        updatedBy,
      };

      await updateDoc(docRef, updateData);
      logger.info('Opportunity stage updated', { component: 'OpportunitiesService', action: 'updateStage' });
    } catch (error) {
      logger.error('Error updating opportunity stage', error instanceof Error ? error : new Error(String(error)));
      throw new Error('Failed to update opportunity stage');
    }
  }

  /**
   * Delete opportunity
   */
  static async deleteOpportunity(id: string): Promise<void> {
    try {
      const docRef = doc(db, OPPORTUNITIES_COLLECTION, id);
      await deleteDoc(docRef);
      logger.info('Opportunity deleted successfully', { component: 'OpportunitiesService', action: 'delete' });
    } catch (error) {
      logger.error('Error deleting opportunity', error instanceof Error ? error : new Error(String(error)));
      throw new Error('Failed to delete opportunity');
    }
  }

  /**
   * Get opportunities by stage
   */
  static async getOpportunitiesByStage(stage: string): Promise<Opportunity[]> {
    try {
      const q = query(
        collection(db, OPPORTUNITIES_COLLECTION),
        where('stage', '==', stage),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const opportunities: Opportunity[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        opportunities.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          expectedCloseDate: data.expectedCloseDate?.toDate() || null,
        } as Opportunity);
      });

      return opportunities;
    } catch (error) {
      logger.error('Error fetching opportunities by stage', error instanceof Error ? error : new Error(String(error)));
      throw new Error('Failed to fetch opportunities by stage');
    }
  }

  /**
   * Get opportunities by assigned user
   */
  static async getOpportunitiesByAssignedUser(userId: string): Promise<Opportunity[]> {
    try {
      const q = query(
        collection(db, OPPORTUNITIES_COLLECTION),
        where('assignedTo', '==', userId),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const opportunities: Opportunity[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        opportunities.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          expectedCloseDate: data.expectedCloseDate?.toDate() || null,
        } as Opportunity);
      });

      return opportunities;
    } catch (error) {
      logger.error('Error fetching opportunities by user', error instanceof Error ? error : new Error(String(error)));
      throw new Error('Failed to fetch opportunities by user');
    }
  }
}