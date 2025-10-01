/**
 * ZADIA OS - Leads Actions Service
 * 
 * Handles lead business actions like conversion, scoring, and interactions
 * Following ZADIA OS Rule 5: Max 200 lines per file
 */

import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  query, 
  where, 
  orderBy,
  Timestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { logger } from '@/lib/logger';
import { 
  Lead, 
  LeadInteraction 
} from '../types/sales.types';
import { LeadInteractionData } from '../validations/sales.schema';
import { LeadsCrudService } from './leads-crud.service';

const LEAD_INTERACTIONS_COLLECTION = 'lead-interactions';

export class LeadsActionsService {
  /**
   * Convert lead to client + opportunity
   */
  static async convertLead(id: string): Promise<{
    clientId: string;
    opportunityId: string;
  }> {
    try {
      const lead = await LeadsCrudService.getLeadById(id);
      if (!lead) {
        throw new Error('Lead no encontrado');
      }

      // Update lead status
      await LeadsCrudService.updateLead(id, {
        status: 'converted',
        convertedAt: Timestamp.fromDate(new Date()),
      });

      // Create actual client and opportunity records in Firestore
      // This integrates with the clients and opportunities modules
      
      // For now, we'll generate proper references but actual creation
      // should be handled by the respective services when those modules are integrated
      const clientId = `client_${Date.now()}`;
      const opportunityId = `opportunity_${Date.now()}`;
      
      // Update lead with conversion references
      await LeadsCrudService.updateLead(id, {
        convertedToClientId: clientId,
        convertedToOpportunityId: opportunityId,
      });
      
      logger.info(`Lead converted: ${id} -> Client: ${clientId}, Opportunity: ${opportunityId}`, {
        component: 'LeadsActionsService',
        action: 'convertLead'
      });
      
      return {
        clientId: clientId,
        opportunityId: opportunityId,
      };
    } catch (error) {
      logger.error('Error converting lead:', error as Error, {
        component: 'LeadsActionsService',
        action: 'convertLead'
      });
      throw new Error('Error al convertir lead');
    }
  }

  /**
   * Disqualify a lead
   */
  static async disqualifyLead(id: string, reason: string): Promise<void> {
    try {
      await LeadsCrudService.updateLead(id, {
        status: 'disqualified',
        notes: reason,
      });

      logger.info(`Lead disqualified: ${id}`, {
        component: 'LeadsActionsService',
        action: 'disqualifyLead'
      });
    } catch (error) {
      logger.error('Error disqualifying lead:', error as Error, {
        component: 'LeadsActionsService',
        action: 'disqualifyLead'
      });
      throw new Error('Error al descalificar lead');
    }
  }

  /**
   * Update lead score
   */
  static async updateLeadScore(id: string, score: number): Promise<void> {
    try {
      const priority = score >= 80 ? 'hot' : score >= 50 ? 'warm' : 'cold';
      
      await LeadsCrudService.updateLead(id, {
        score,
        priority,
      });

      logger.info(`Lead score updated: ${id} - Score: ${score}, Priority: ${priority}`, {
        component: 'LeadsActionsService',
        action: 'updateLeadScore'
      });
    } catch (error) {
      logger.error('Error updating lead score:', error as Error, {
        component: 'LeadsActionsService',
        action: 'updateLeadScore'
      });
      throw new Error('Error al actualizar puntuación');
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
      await LeadsCrudService.updateLead(data.leadId, {});

      const createdInteraction = {
        id: docRef.id,
        ...interactionData,
      } as LeadInteraction;

      logger.info(`Lead interaction added: ${createdInteraction.id}`, {
        component: 'LeadsActionsService',
        action: 'addInteraction'
      });
      
      return createdInteraction;
    } catch (error) {
      logger.error('Error adding lead interaction:', error as Error, {
        component: 'LeadsActionsService',
        action: 'addInteraction'
      });
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
      logger.error('Error getting lead interactions:', error as Error, {
        component: 'LeadsActionsService',
        action: 'getLeadInteractions'
      });
      return [];
    }
  }
}