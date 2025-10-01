/**
 * ZADIA OS - Leads CRUD Service
 * 
 * Handles basic CRUD operations for leads
 * Following ZADIA OS Rule 5: Max 200 lines per file
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
  limit, 
  startAfter,
  Timestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { logger } from '@/lib/logger';
import { 
  Lead, 
  LeadFilters,
  LeadSearchResult 
} from '../types/sales.types';
import { LeadFormData } from '../validations/sales.schema';

const LEADS_COLLECTION = 'leads';

export class LeadsCrudService {
  /**
   * Create a new lead
   */
  static async createLead(data: LeadFormData, createdBy: string): Promise<Lead> {
    try {
      const leadData = {
        ...data,
        status: 'new' as const,
        createdAt: Timestamp.fromDate(new Date()),
        updatedAt: Timestamp.fromDate(new Date()),
        createdBy,
      };

      const docRef = await addDoc(collection(db, LEADS_COLLECTION), leadData);
      
      const createdLead = {
        id: docRef.id,
        ...leadData,
      } as Lead;

      logger.info(`Lead created: ${createdLead.id}`, {
        component: 'LeadsCrudService',
        action: 'createLead'
      });
      
      return createdLead;
    } catch (error) {
      logger.error('Error creating lead:', error as Error, {
        component: 'LeadsCrudService',
        action: 'createLead'
      });
      throw new Error('Error al crear lead');
    }
  }

  /**
   * Update an existing lead
   */
  static async updateLead(id: string, data: Partial<Lead>): Promise<void> {
    try {
      const docRef = doc(db, LEADS_COLLECTION, id);
      const updateData = {
        ...data,
        updatedAt: Timestamp.fromDate(new Date()),
      };

      await updateDoc(docRef, updateData);
      
      logger.info(`Lead updated: ${id}`, {
        component: 'LeadsCrudService',
        action: 'updateLead'
      });
    } catch (error) {
      logger.error('Error updating lead:', error as Error, {
        component: 'LeadsCrudService',
        action: 'updateLead'
      });
      throw new Error('Error al actualizar lead');
    }
  }

  /**
   * Get lead by ID
   */
  static async getLeadById(id: string): Promise<Lead | null> {
    try {
      const docRef = doc(db, LEADS_COLLECTION, id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data(),
        } as Lead;
      }

      return null;
    } catch (error) {
      logger.error('Error getting lead:', error as Error, {
        component: 'LeadsCrudService',
        action: 'getLeadById'
      });
      throw new Error('Error al obtener lead');
    }
  }

  /**
   * Delete a lead (admin only)
   */
  static async deleteLead(id: string): Promise<void> {
    try {
      const docRef = doc(db, LEADS_COLLECTION, id);
      await deleteDoc(docRef);
      
      logger.info(`Lead deleted: ${id}`, {
        component: 'LeadsCrudService',
        action: 'deleteLead'
      });
    } catch (error) {
      logger.error('Error deleting lead:', error as Error, {
        component: 'LeadsCrudService',
        action: 'deleteLead'
      });
      throw new Error('Error al eliminar lead');
    }
  }

  /**
   * Search leads with filters and pagination
   */
  static async searchLeads(
    filters: LeadFilters = {},
    pageSize: number = 20,
    lastDocId?: string
  ): Promise<LeadSearchResult> {
    try {
      let q = query(collection(db, LEADS_COLLECTION));

      // Apply filters
      if (filters.status && filters.status.length > 0) {
        q = query(q, where('status', 'in', filters.status));
      }

      if (filters.source && filters.source.length > 0) {
        q = query(q, where('source', 'in', filters.source));
      }

      if (filters.priority && filters.priority.length > 0) {
        q = query(q, where('priority', 'in', filters.priority));
      }

      if (filters.assignedTo) {
        q = query(q, where('assignedTo', '==', filters.assignedTo));
      }

      if (filters.entityType && filters.entityType.length > 0) {
        q = query(q, where('entityType', 'in', filters.entityType));
      }

      // Order by creation date (newest first)
      q = query(q, orderBy('createdAt', 'desc'));

      // Pagination
      if (lastDocId) {
        const lastDocRef = doc(db, LEADS_COLLECTION, lastDocId);
        const lastDocSnap = await getDoc(lastDocRef);
        if (lastDocSnap.exists()) {
          q = query(q, startAfter(lastDocSnap));
        }
      }

      q = query(q, limit(pageSize));

      const querySnapshot = await getDocs(q);
      const leads = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Lead[];

      // Get total count (simplified - in production, use a separate count query)
      const totalCount = leads.length;

      return {
        leads,
        totalCount,
      };
    } catch (error) {
      logger.error('Error searching leads:', error as Error, {
        component: 'LeadsCrudService',
        action: 'searchLeads'
      });
      throw new Error('Error al buscar leads');
    }
  }

  /**
   * Get leads by assigned salesperson
   */
  static async getLeadsByUser(userId: string): Promise<Lead[]> {
    try {
      const q = query(
        collection(db, LEADS_COLLECTION),
        where('assignedTo', '==', userId),
        where('status', 'in', ['new', 'contacted', 'qualifying']),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Lead[];
    } catch (error) {
      logger.error('Error getting leads by user:', error as Error, {
        component: 'LeadsCrudService',
        action: 'getLeadsByUser'
      });
      return [];
    }
  }
}