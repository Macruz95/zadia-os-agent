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
   */
  static async createClientWithContacts(formData: ClientFormData): Promise<string> {
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
      
      // Create client document
      const clientRef = doc(collection(db, CLIENTS_COLLECTION));
      const clientDoc = {
        ...validatedClient,
        birthDate: validatedClient.birthDate ? Timestamp.fromDate(validatedClient.birthDate) : null,
        lastInteractionDate: now,
        createdAt: now,
        updatedAt: now,
      };
      
      batch.set(clientRef, clientDoc);
      
      // Create contact documents
      if (contacts && contacts.length > 0) {
        for (const contactData of contacts) {
          // Skip empty contacts
          if (!contactData.phone || contactData.phone.trim() === '') {
            continue;
          }
          
          const contactRef = doc(collection(db, 'contacts'));
          const contactDoc = {
            clientId: clientRef.id,
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
   */
  static async createClient(clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const validationResult = ClientSchema.safeParse(clientData);
    if (!validationResult.success) {
      throw new Error(`Validation failed: ${validationResult.error.message}`);
    }
    const validated = validationResult.data;
    const now = Timestamp.now();
    const docRef = await addDoc(collection(db, CLIENTS_COLLECTION), {
      ...validated,
      birthDate: validated.birthDate ? Timestamp.fromDate(validated.birthDate) : null,
      lastInteractionDate: now, // Set to creation time by default
      createdAt: now,
      updatedAt: now,
    });
    return docRef.id;
  }
}