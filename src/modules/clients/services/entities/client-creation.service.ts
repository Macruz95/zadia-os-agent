import { db } from '../../../../lib/firebase';
import {
  collection,
  doc,
  addDoc,
  Timestamp,
  writeBatch
} from 'firebase/firestore';
import { Client } from '../../types/clients.types';
import { ClientSchema } from '../../validations/clients.schema';
import { CLIENTS_COLLECTION } from '../utils/firestore.utils';
import type { ClientFormData } from '../../validations/clients.schema';

/**
 * Service for creating client entities
 */
export class ClientCreationService {
  /**
   * Create a new client with contacts
   * @param formData - Client form data
   * @param tenantId - Required tenant ID for data isolation
   */
  static async createClientWithContacts(formData: ClientFormData, tenantId?: string): Promise<string> {
    if (!tenantId) {
      throw new Error('tenantId is required for data isolation');
    }
    
    try {
      const batch = writeBatch(db);
      
      // Validate and prepare client data (without contacts)
      const { contacts, ...clientData } = formData;
      const validationResult = ClientSchema.safeParse(clientData);
      if (!validationResult.success) {
        throw new Error(`Validation failed: ${validationResult.error.message}`);
      }
      const validatedClient = validationResult.data;
      const now = Timestamp.now();
      
      // Create client document with tenantId
      const clientRef = doc(collection(db, CLIENTS_COLLECTION));
      const clientDoc = {
        ...validatedClient,
        tenantId, // CRITICAL: Add tenant isolation
        birthDate: validatedClient.birthDate ? Timestamp.fromDate(validatedClient.birthDate) : null,
        lastInteractionDate: now,
        createdAt: now,
        updatedAt: now,
      };
      
      batch.set(clientRef, clientDoc);
      
      // Create contact documents with tenantId
      if (contacts && contacts.length > 0) {
        for (const contactData of contacts) {
          // Skip empty contacts
          if (!contactData.phone || contactData.phone.trim() === '') {
            continue;
          }
          
          const contactRef = doc(collection(db, 'contacts'));
          const contactDoc = {
            clientId: clientRef.id,
            tenantId, // CRITICAL: Add tenant isolation
            name: contactData.name || '',
            role: contactData.role || '',
            email: contactData.email || '',
            phone: contactData.phone,
            phoneCountryId: contactData.phoneCountryId || '',
            isPrimary: contactData.isPrimary || false,
            createdAt: now,
            updatedAt: now,
          };
          
          batch.set(contactRef, contactDoc);
        }
      }
      
      // Execute batch
      await batch.commit();
      
      return clientRef.id;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Create a new client (legacy method - without contacts)
   * @param clientData - Client data
   * @param tenantId - Required tenant ID for data isolation
   */
  static async createClient(
    clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>,
    tenantId?: string
  ): Promise<string> {
    if (!tenantId) {
      throw new Error('tenantId is required for data isolation');
    }
    
    const validationResult = ClientSchema.safeParse(clientData);
    if (!validationResult.success) {
      throw new Error(`Validation failed: ${validationResult.error.message}`);
    }
    const validated = validationResult.data;
    const now = Timestamp.now();
    const docRef = await addDoc(collection(db, CLIENTS_COLLECTION), {
      ...validated,
      tenantId, // CRITICAL: Add tenant isolation
      birthDate: validated.birthDate ? Timestamp.fromDate(validated.birthDate) : null,
      lastInteractionDate: now,
      createdAt: now,
      updatedAt: now,
    });
    return docRef.id;
  }
}