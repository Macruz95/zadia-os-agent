import { db } from '../../../../lib/firebase';
import {
  collection,
  doc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { Client } from '../../types/clients.types';
import { CLIENTS_COLLECTION, docToClient } from '../utils/firestore.utils';

/**
 * Service for basic CRUD operations on client entities
 */
export class ClientCrudService {
  /**
   * Get all clients
   */
  static async getClients(): Promise<Client[]> {
    const q = query(collection(db, CLIENTS_COLLECTION), orderBy('lastInteractionDate', 'desc'));
    const querySnapshot = await getDocs(q);
    const clients = querySnapshot.docs.map(docToClient);
    
    return clients;
  }

  /**
   * Get client by ID
   */
  static async getClientById(clientId: string): Promise<Client | null> {
    try {
      // Validate clientId parameter
      if (!clientId || typeof clientId !== 'string' || clientId.trim().length === 0) {
        throw new Error('Invalid client ID provided');
      }
      
      // Sanitize clientId to prevent NoSQL injection
      const sanitizedClientId = clientId.trim().replace(/[^a-zA-Z0-9_-]/g, '');
      if (sanitizedClientId !== clientId.trim()) {
        throw new Error('Invalid client ID format');
      }
      
      const docRef = doc(db, CLIENTS_COLLECTION, sanitizedClientId);
      
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const client = docToClient(docSnap);
        return client;
      } else {
        return null;
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update client
   */
  static async updateClient(clientId: string, updates: Partial<Client>): Promise<void> {
    const docRef = doc(db, CLIENTS_COLLECTION, clientId);

    // Create a clean update object without undefined values
    const cleanUpdates = Object.fromEntries(
      Object.entries(updates).filter((entry) => entry[1] !== undefined)
    );

    await updateDoc(docRef, {
      ...cleanUpdates,
      updatedAt: Timestamp.now(),
    });
  }

  /**
   * Delete client
   */
  static async deleteClient(clientId: string): Promise<void> {
    const docRef = doc(db, CLIENTS_COLLECTION, clientId);
    await deleteDoc(docRef);
  }
}