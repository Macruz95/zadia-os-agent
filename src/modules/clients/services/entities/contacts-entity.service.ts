import { db } from '../../../../lib/firebase';
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
  orderBy,
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
    const validated = ContactSchema.parse(contactData);
    const docRef = await addDoc(collection(db, CONTACTS_COLLECTION), {
      ...validated,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return docRef.id;
  }

  /**
   * Get contacts by client ID
   */
  static async getContactsByClient(clientId: string): Promise<Contact[]> {
    console.log('🔍 getContactsByClient called with clientId:', clientId);
    console.log('🔗 Firestore collection:', CONTACTS_COLLECTION);

    try {
      // First try without orderBy to avoid composite index issues
      console.log('🔍 Executing query without orderBy first...');
      const simpleQuery = query(
        collection(db, CONTACTS_COLLECTION),
        where('clientId', '==', clientId)
      );

      const querySnapshot = await getDocs(simpleQuery);

      console.log('📊 Query snapshot size:', querySnapshot.size);
      console.log('📋 Raw documents:', querySnapshot.docs.map(doc => ({
        id: doc.id,
        data: doc.data()
      })));

      const contacts = querySnapshot.docs.map(docToContact);

      // Sort in memory instead of using orderBy
      contacts.sort((a, b) => {
        const aTime = a.createdAt?.getTime() || 0;
        const bTime = b.createdAt?.getTime() || 0;
        return bTime - aTime; // Descending order
      });

      console.log('✅ Contacts found:', contacts.length);
      console.log('📋 Contact details:', contacts.map(c => ({
        id: c.id,
        name: c.name,
        email: c.email,
        phone: c.phone,
        isPrimary: c.isPrimary,
        clientId: c.clientId
      })));

      return contacts;
    } catch (error) {
      console.error('❌ Error getting contacts by client:', error);
      console.error('❌ Error details:', {
        clientId,
        collection: CONTACTS_COLLECTION,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
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

  /**
   * Diagnostic function to check contacts collection
   */
  static async diagnoseContacts(clientId?: string): Promise<void> {
    console.log('🔍 Starting contacts diagnosis...');

    try {
      // Get all contacts in collection
      console.log('📊 Getting all contacts in collection...');
      const allContactsQuery = query(collection(db, CONTACTS_COLLECTION));
      const allContactsSnapshot = await getDocs(allContactsQuery);

      console.log('📋 All contacts in collection:', allContactsSnapshot.size);
      allContactsSnapshot.docs.forEach((doc, index) => {
        const data = doc.data();
        console.log(`📄 Contact ${index + 1}:`, {
          id: doc.id,
          clientId: data.clientId,
          name: data.name,
          email: data.email,
          phone: data.phone,
          isPrimary: data.isPrimary
        });
      });

      if (clientId) {
        console.log(`🎯 Checking contacts for clientId: ${clientId}`);

        // Try without orderBy first
        console.log('🔍 Trying query without orderBy...');
        const simpleQuery = query(
          collection(db, CONTACTS_COLLECTION),
          where('clientId', '==', clientId)
        );
        const simpleSnapshot = await getDocs(simpleQuery);
        console.log('📊 Simple query results:', simpleSnapshot.size);

        // Try with orderBy
        console.log('🔍 Trying query with orderBy...');
        const orderedQuery = query(
          collection(db, CONTACTS_COLLECTION),
          where('clientId', '==', clientId),
          orderBy('createdAt', 'desc')
        );
        const orderedSnapshot = await getDocs(orderedQuery);
        console.log('📊 Ordered query results:', orderedSnapshot.size);
      }

    } catch (error) {
      console.error('❌ Error in diagnosis:', error);
    }
  }
}