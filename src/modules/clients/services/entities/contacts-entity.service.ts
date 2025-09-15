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
    const q = query(
      collection(db, CONTACTS_COLLECTION),
      where('clientId', '==', clientId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(docToContact);
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