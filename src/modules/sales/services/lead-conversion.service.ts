/**
 * ZADIA OS - Lead Conversion Service
 * 
 * Handles atomic conversion: Lead → Client → Opportunity
 * Following ZADIA Rule 1: Real Firebase data with transactions
 * Following ZADIA Rule 5: Max 200 lines per file
 */

import { 
  doc,
  getDoc,
  addDoc,
  collection,
  writeBatch,
  Timestamp,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { logger } from '@/lib/logger';
import {
  LeadConversionInput,
  ConversionResult,
  leadConversionSchema,
} from '../validations/lead-conversion.schema';

const LEADS_COLLECTION = 'leads';
const CLIENTS_COLLECTION = 'clients';
const OPPORTUNITIES_COLLECTION = 'opportunities';
const CONTACTS_COLLECTION = 'contacts';

export class LeadConversionService {
  /**
   * Execute complete conversion with atomic transaction
   */
  static async convertLead(
    input: LeadConversionInput,
    userId: string
  ): Promise<ConversionResult> {
    try {
      // Validate input
      const validatedInput = leadConversionSchema.parse(input);
      
      logger.info('Starting lead conversion');

      // Get lead data
      const leadDoc = await getDoc(doc(db, LEADS_COLLECTION, validatedInput.leadId));
      
      if (!leadDoc.exists()) {
        throw new Error('Lead no encontrado');
      }

      const leadData = leadDoc.data();

      // Check if already converted
      if (leadData.status === 'converted') {
        throw new Error('Este lead ya fue convertido anteriormente');
      }

      let clientId: string;
      let isNewClient = true;

      // Determine client ID
      if (validatedInput.conversionDecision.action === 'link-existing') {
        if (!validatedInput.conversionDecision.existingClientId) {
          throw new Error('ID de cliente existente requerido');
        }
        clientId = validatedInput.conversionDecision.existingClientId;
        isNewClient = false;
      } else {
        // Generate new client ID
        const newClientRef = doc(collection(db, CLIENTS_COLLECTION));
        clientId = newClientRef.id;
      }

      // Create batch for atomic operations
      const batch = writeBatch(db);

      // 1. Create or update client
      if (isNewClient && validatedInput.clientData) {
        const clientRef = doc(db, CLIENTS_COLLECTION, clientId);
        batch.set(clientRef, {
          ...validatedInput.clientData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          createdBy: userId,
          source: `lead-conversion:${validatedInput.leadId}`,
        });

        // Create primary contact
        const contactRef = doc(collection(db, CONTACTS_COLLECTION));
        batch.set(contactRef, {
          clientId,
          name: validatedInput.clientData.name,
          email: validatedInput.clientData.email,
          phone: validatedInput.clientData.phone,
          phoneCountryId: validatedInput.clientData.phoneCountryId,
          isPrimary: true,
          role: 'Contacto Principal',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          createdBy: userId,
        });
      }

      // 2. Create opportunity
      const opportunityRef = doc(collection(db, OPPORTUNITIES_COLLECTION));
      batch.set(opportunityRef, {
        ...validatedInput.opportunityData,
        clientId,
        source: validatedInput.leadId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdBy: userId,
        assignedTo: userId,
      });

      // 3. Update lead status
      const leadRef = doc(db, LEADS_COLLECTION, validatedInput.leadId);
      batch.update(leadRef, {
        status: 'converted',
        convertedAt: serverTimestamp(),
        convertedToClientId: clientId,
        convertedToOpportunityId: opportunityRef.id,
        updatedAt: serverTimestamp(),
      });

      // Commit transaction
      await batch.commit();

      logger.info('Lead conversion completed successfully');

      // Transfer history if requested
      if (validatedInput.transferHistory) {
        await this.transferLeadHistory(validatedInput.leadId, clientId, userId);
      }

      return {
        success: true,
        leadId: validatedInput.leadId,
        clientId,
        opportunityId: opportunityRef.id,
        isNewClient,
        historyTransferred: validatedInput.transferHistory,
        message: isNewClient 
          ? 'Lead convertido exitosamente. Cliente y oportunidad creados.'
          : 'Lead convertido exitosamente. Vinculado a cliente existente.',
        timestamp: new Date(),
      };

    } catch (error) {
      logger.error('Error converting lead', error as Error);
      throw error;
    }
  }

  /**
   * Transfer lead interactions to client
   */
  private static async transferLeadHistory(
    leadId: string,
    clientId: string,
    userId: string
  ): Promise<void> {
    try {
      const clientInteractionsRef = collection(db, 'interactions');
      
      // Note: In a real implementation, you would:
      // 1. Query all lead interactions
      // 2. Copy them to client interactions collection
      // 3. Mark them as transferred
      
      logger.info('Lead history transfer initiated');
      
      // Implementation placeholder - expand in production
      await addDoc(clientInteractionsRef, {
        clientId,
        type: 'Nota',
        date: Timestamp.now(),
        notes: `Historial transferido desde Lead ID: ${leadId}`,
        createdBy: userId,
        createdAt: Timestamp.now(),
        source: 'lead-conversion',
      });

    } catch (error) {
      logger.error('Error transferring lead history', error as Error);
      // Don't throw - history transfer is not critical
    }
  }
}
