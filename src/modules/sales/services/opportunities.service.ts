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

const getStageProbability = (stage: string) => {
  const stageProbabilities: Record<string, number> = {
    'qualified': 20,
    'proposal-sent': 50,
    'negotiation': 80,
    'closed-won': 100,
    'closed-lost': 0
  };
  return stageProbabilities[stage] || 0;
};

export class OpportunitiesService {
  /**
   * Create a new opportunity
   * @param tenantId - Required tenant ID for data isolation
   */
  static async createOpportunity(data: OpportunityFormData, createdBy: string, tenantId: string): Promise<Opportunity> {
    if (!tenantId) {
      throw new Error('tenantId is required for data isolation');
    }

    try {
      const now = Timestamp.fromDate(new Date());
      const opportunityData = {
        ...data,
        tenantId, // CRITICAL: Add tenant isolation
        expectedCloseDate: data.expectedCloseDate ? Timestamp.fromDate(data.expectedCloseDate) : undefined,
        status: 'open' as const,
        createdAt: now,
        updatedAt: now,
        createdBy,
        probability: getStageProbability(data.stage || 'qualified'),
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
   * @param tenantId - Required tenant ID for data isolation
   */
  static async getOpportunities(tenantId: string): Promise<Opportunity[]> {
    if (!tenantId) {
      return []; // Return empty if no tenant
    }

    try {
      const q = query(
        collection(db, OPPORTUNITIES_COLLECTION),
        where('tenantId', '==', tenantId), // CRITICAL: Filter by tenant
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
   * @param tenantId - Required tenant ID for data isolation
   */
  static async getOpportunityById(id: string, tenantId: string): Promise<Opportunity | null> {
    try {
      const docRef = doc(db, OPPORTUNITIES_COLLECTION, id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return null;
      }

      const data = docSnap.data();

      // Verify tenant isolation
      if (tenantId && data.tenantId && data.tenantId !== tenantId) {
        logger.warn('Tenant mismatch on opportunity access', {
          component: 'OpportunitiesService',
          action: 'getById',
        });
        return null;
      }

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
   * @param tenantId - Required tenant ID for data isolation
   */
  static async updateOpportunity(id: string, updates: Partial<OpportunityFormData>, tenantId: string): Promise<void> {
    try {
      // Verify tenant ownership before update
      if (tenantId) {
        const existing = await this.getOpportunityById(id, tenantId);
        if (!existing) {
          throw new Error('Opportunity not found or access denied');
        }
      }

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
   * @param tenantId - Required tenant ID for data isolation
   */
  static async updateOpportunityStage(id: string, stage: string, updatedBy: string, tenantId: string): Promise<void> {
    try {
      // Verify tenant ownership before stage update
      if (tenantId) {
        const existing = await this.getOpportunityById(id, tenantId);
        if (!existing) {
          throw new Error('Opportunity not found or access denied');
        }
      }

      const docRef = doc(db, OPPORTUNITIES_COLLECTION, id);
      const updateData = {
        stage,
        probability: getStageProbability(stage),
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
   * @param tenantId - Required tenant ID for data isolation
   */
  static async deleteOpportunity(id: string, tenantId: string): Promise<void> {
    try {
      // Verify tenant ownership before deletion
      if (tenantId) {
        const existing = await this.getOpportunityById(id, tenantId);
        if (!existing) {
          throw new Error('Opportunity not found or access denied');
        }
      }

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
   * @param tenantId - Required tenant ID for data isolation
   */
  static async getOpportunitiesByStage(stage: string, tenantId: string): Promise<Opportunity[]> {
    if (!tenantId) {
      return []; // Return empty if no tenant
    }

    try {
      const q = query(
        collection(db, OPPORTUNITIES_COLLECTION),
        where('tenantId', '==', tenantId), // CRITICAL: Filter by tenant
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
   * @param tenantId - Required tenant ID for data isolation
   */
  static async getOpportunitiesByAssignedUser(userId: string, tenantId: string): Promise<Opportunity[]> {
    if (!tenantId) {
      return []; // Return empty if no tenant
    }

    try {
      const q = query(
        collection(db, OPPORTUNITIES_COLLECTION),
        where('tenantId', '==', tenantId), // CRITICAL: Filter by tenant
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