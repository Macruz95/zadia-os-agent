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
  limit,
  Timestamp,
  Query,
} from 'firebase/firestore';
import { Client, ClientSearchParams } from '../../types/clients.types';
import { ClientSchema } from '../../validations/clients.schema';
import { CLIENTS_COLLECTION, docToClient } from '../utils/firestore.utils';

/**
 * Service for managing client entities
 */
export class ClientsService {
  /**
   * Create a new client
   */
  static async createClient(clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const validated = ClientSchema.parse(clientData);
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

  /**
   * Get all clients
   */
  static async getClients(): Promise<Client[]> {
    console.log('ClientsService.getClients: Starting to fetch clients');
    const q = query(collection(db, CLIENTS_COLLECTION), orderBy('lastInteractionDate', 'desc'));
    const querySnapshot = await getDocs(q);
    const clients = querySnapshot.docs.map(docToClient);
    console.log('ClientsService.getClients: Found', clients.length, 'clients');
    console.log('ClientsService.getClients: Clients data:', clients);
    return clients;
  }

  /**
   * Get client by ID
   */
  static async getClientById(clientId: string): Promise<Client | null> {
    const docRef = doc(db, CLIENTS_COLLECTION, clientId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docToClient(docSnap);
    }
    return null;
  }

  /**
   * Update client
   */
  static async updateClient(clientId: string, updates: Partial<Client>): Promise<void> {
    const docRef = doc(db, CLIENTS_COLLECTION, clientId);
    await updateDoc(docRef, {
      ...updates,
      birthDate: updates.birthDate ? Timestamp.fromDate(updates.birthDate) : undefined,
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

  /**
   * Search clients with filters and pagination
   */
  static async searchClients(params: ClientSearchParams): Promise<{
    clients: Client[];
    totalCount: number;
    hasMore: boolean;
  }> {
    console.log('ClientsService.searchClients: Starting search with params:', params);
    let q: Query = collection(db, CLIENTS_COLLECTION);

    // Apply filters
    if (params.filters) {
      const { clientType, status, tags, source } = params.filters;
      if (clientType) q = query(q, where('clientType', '==', clientType));
      if (status) q = query(q, where('status', '==', status));
      if (source) q = query(q, where('source', '==', source));
      if (tags && tags.length > 0) q = query(q, where('tags', 'array-contains-any', tags));
    }

    // Apply sorting
    const sortBy = params.sortBy || 'lastInteractionDate';
    const sortOrder = params.sortOrder || 'desc';
    q = query(q, orderBy(sortBy, sortOrder));

    // Apply pagination
    const pageSize = params.pageSize || 20;
    q = query(q, limit(pageSize + 1)); // +1 to check if there's more

    const querySnapshot = await getDocs(q);
    const clients = querySnapshot.docs.slice(0, pageSize).map(docToClient);
    const hasMore = querySnapshot.docs.length > pageSize;

    console.log('ClientsService.searchClients: Found', clients.length, 'clients');
    console.log('ClientsService.searchClients: Clients data:', clients);

    return {
      clients,
      totalCount: clients.length, // Simplified - would need separate count query
      hasMore,
    };
  }
}