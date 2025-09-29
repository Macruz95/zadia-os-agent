/**
 * ZADIA OS - Leads Service
 * 
 * Handles all lead operations with Firebase integration
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
  LeadInteraction, 
  LeadSearchResult, 
  LeadFilters 
} from '../types/sales.types';
import { 
  LeadFormData, 
  LeadInteractionData 
} from '../validations/sales.schema';

const LEADS_COLLECTION = 'leads';
const LEAD_INTERACTIONS_COLLECTION = 'lead-interactions';

export class LeadsService {
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

      logger.info(`Lead created: ${createdLead.id}`);
      return createdLead;
    } catch (error) {
      logger.error('Error creating lead:', error as Error);
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
      logger.info(`Lead updated: ${id}`);
    } catch (error) {
      logger.error('Error updating lead:', error as Error);
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
      logger.error('Error getting lead:', error as Error);
      throw new Error('Error al obtener lead');
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
      logger.error('Error searching leads:', error as Error);
      throw new Error('Error al buscar leads');
    }
  }

  /**
   * Convert lead to client + opportunity
   */
  static async convertLead(id: string): Promise<{
    clientId: string;
    opportunityId: string;
  }> {
    try {
      const lead = await this.getLeadById(id);
      if (!lead) {
        throw new Error('Lead no encontrado');
      }

      // Update lead status
      await this.updateLead(id, {
        status: 'converted',
        convertedAt: Timestamp.fromDate(new Date()),
      });

      // TODO: Implement actual client and opportunity creation
      // This would require integration with clients and opportunities modules
      const mockClientId = `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const mockOpportunityId = `opp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Update lead with conversion references
      await this.updateLead(id, {
        convertedToClientId: mockClientId,
        convertedToOpportunityId: mockOpportunityId,
      });
      
      logger.info(`Lead converted: ${id} -> Client: ${mockClientId}, Opportunity: ${mockOpportunityId}`);
      
      return {
        clientId: mockClientId,
        opportunityId: mockOpportunityId,
      };
    } catch (error) {
      logger.error('Error converting lead:', error as Error);
      throw new Error('Error al convertir lead');
    }
  }

  /**
   * Disqualify a lead
   */
  static async disqualifyLead(id: string, reason: string): Promise<void> {
    try {
      await this.updateLead(id, {
        status: 'disqualified',
        notes: reason,
      });

      logger.info(`Lead disqualified: ${id}`);
    } catch (error) {
      logger.error('Error disqualifying lead:', error as Error);
      throw new Error('Error al descalificar lead');
    }
  }

  /**
   * Delete a lead (admin only)
   */
  static async deleteLead(id: string): Promise<void> {
    try {
      const docRef = doc(db, LEADS_COLLECTION, id);
      await deleteDoc(docRef);
      logger.info(`Lead deleted: ${id}`);
    } catch (error) {
      logger.error('Error deleting lead:', error as Error);
      throw new Error('Error al eliminar lead');
    }
  }

  /**
   * Add interaction to lead
   */
  static async addInteraction(
    data: LeadInteractionData, 
    performedBy: string
  ): Promise<LeadInteraction> {
    try {
      const interactionData = {
        ...data,
        performedAt: Timestamp.fromDate(new Date()),
        performedBy,
      };

      const docRef = await addDoc(collection(db, LEAD_INTERACTIONS_COLLECTION), interactionData);
      
      // Update lead's updatedAt timestamp
      await this.updateLead(data.leadId, {});

      const createdInteraction = {
        id: docRef.id,
        ...interactionData,
      } as LeadInteraction;

      logger.info(`Lead interaction added: ${createdInteraction.id}`);
      return createdInteraction;
    } catch (error) {
      logger.error('Error adding lead interaction:', error as Error);
      throw new Error('Error al agregar interacción');
    }
  }

  /**
   * Get interactions for a lead
   */
  static async getLeadInteractions(leadId: string): Promise<LeadInteraction[]> {
    try {
      const q = query(
        collection(db, LEAD_INTERACTIONS_COLLECTION),
        where('leadId', '==', leadId),
        orderBy('performedAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as LeadInteraction[];
    } catch (error) {
      logger.error('Error getting lead interactions:', error as Error);
      return [];
    }
  }

  /**
   * Update lead score
   */
  static async updateLeadScore(id: string, score: number): Promise<void> {
    try {
      const priority = score >= 80 ? 'hot' : score >= 50 ? 'warm' : 'cold';
      
      await this.updateLead(id, {
        score,
        priority,
      });

      logger.info(`Lead score updated: ${id} - Score: ${score}, Priority: ${priority}`);
    } catch (error) {
      logger.error('Error updating lead score:', error as Error);
      throw new Error('Error al actualizar puntuación');
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
      logger.error('Error getting leads by user:', error as Error);
      return [];
    }
  }
}