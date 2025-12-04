import { db } from '../../../../lib/firebase';
import { logger } from '../../../../lib/logger';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  Timestamp,
} from 'firebase/firestore';
import { Contact } from '../../types/clients.types';
import { ContactSchema } from '../../validations/clients.schema';
import { CONTACTS_COLLECTION, docToContact } from '../utils/firestore.utils';

/**
 * Service for managing contact entities
 */
export class ContactsService {
  /**
   * Create a new contact
   */
  static async createContact(contactData: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const validationResult = ContactSchema.safeParse(contactData);
    if (!validationResult.success) {
      throw new Error(`Validation failed: ${validationResult.error.message}`);
    }
    const validated = validationResult.data;
    const docRef = await addDoc(collection(db, CONTACTS_COLLECTION), {
      ...validated,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return docRef.id;
  }

  /**
   * Get contacts by client ID
   * @param clientId - The client ID
   * @param tenantId - Required tenant ID for data isolation
   */
  static async getContactsByClient(clientId: string, tenantId?: string): Promise<Contact[]> {
    try {
      // Build query with tenantId if provided
      let q;
      if (tenantId) {
        q = query(
          collection(db, CONTACTS_COLLECTION),
          where('tenantId', '==', tenantId),
          where('clientId', '==', clientId)
        );
      } else {
        // Fallback for legacy - may fail with security rules
        q = query(
          collection(db, CONTACTS_COLLECTION),
          where('clientId', '==', clientId)
        );
      }

      const querySnapshot = await getDocs(q);

      const contacts = querySnapshot.docs.map(docToContact);

      // Sort in memory instead of using orderBy
      contacts.sort((a, b) => {
        const aTime = a.createdAt?.getTime() || 0;
        const bTime = b.createdAt?.getTime() || 0;
        return bTime - aTime; // Descending order
      });

      return contacts;
    } catch (error) {
      logger.error('Error getting contacts by client', error as Error, {
        component: 'ContactsService',
        action: 'getContactsByClient',
        metadata: {
          clientId,
          collection: CONTACTS_COLLECTION
        }
      });
      throw error;
    }
  }

  /**
   * Get contact by ID
   */
  static async getContactById(contactId: string): Promise<Contact | null> {
    const docRef = doc(db, CONTACTS_COLLECTION, contactId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docToContact(docSnap);
    }
    return null;
  }

  /**
   * Update contact
   */
  static async updateContact(contactId: string, updates: Partial<Contact>): Promise<void> {
    const docRef = doc(db, CONTACTS_COLLECTION, contactId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  }

  /**
   * Delete contact
   */
  static async deleteContact(contactId: string): Promise<void> {
    const docRef = doc(db, CONTACTS_COLLECTION, contactId);
    await deleteDoc(docRef);
  }
}