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
  Query,
  writeBatch
} from 'firebase/firestore';
import { Client, ClientSearchParams } from '../../types/clients.types';
import { ClientSchema } from '../../validations/clients.schema';
import { CLIENTS_COLLECTION, docToClient } from '../utils/firestore.utils';
import type { ClientFormData } from '../../validations/clients.schema';

/**
 * Service for managing client entities
 */
export class ClientsService {
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

  /**
   * Search clients with filters and pagination
   */
  static async searchClients(params: ClientSearchParams): Promise<{
    clients: Client[];
    totalCount: number;
    hasMore: boolean;
  }> {
    let q: Query = collection(db, CLIENTS_COLLECTION);

    // Apply filters first (before sorting to avoid composite indexes)
    if (params.filters) {
      const { clientType, status, tags, source } = params.filters;
      
      // Validate and sanitize clientType
      if (clientType) {
        const validClientTypes = ['PersonaNatural', 'Organización', 'Empresa'];
        if (!validClientTypes.includes(clientType)) {
          throw new Error('Invalid client type filter');
        }
        q = query(q, where('clientType', '==', clientType));
      }
      
      // Validate and sanitize status
      if (status) {
        const validStatuses = ['Potencial', 'Activo', 'Inactivo'];
        if (!validStatuses.includes(status)) {
          throw new Error('Invalid status filter');
        }
        q = query(q, where('status', '==', status));
      }
      
      // Validate and sanitize source
      if (source) {
        if (typeof source !== 'string' || source.length > 100) {
          throw new Error('Invalid source filter');
        }
        const sanitizedSource = source.trim().substring(0, 100);
        q = query(q, where('source', '==', sanitizedSource));
      }
      
      // Validate and sanitize tags
      if (tags && tags.length > 0) {
        if (!Array.isArray(tags) || tags.length > 10) {
          throw new Error('Invalid tags filter');
        }
        const sanitizedTags = tags.filter(tag => 
          typeof tag === 'string' && tag.length <= 50
        ).map(tag => tag.trim());
        if (sanitizedTags.length > 0) {
          q = query(q, where('tags', 'array-contains-any', sanitizedTags));
        }
      }
    }

    // Get all matching documents first
    const querySnapshot = await getDocs(q);
    let clients = querySnapshot.docs.map(docToClient);

    // Apply text search in memory if query is provided
    if (params.query && params.query.trim()) {
      const { searchInClient } = await import('../../utils/clients.utils');
      clients = clients.filter(client => searchInClient(client, params.query!));
    }

    // Apply sorting in memory to avoid composite index requirements
    const sortBy = params.sortBy || 'lastInteractionDate';
    const sortOrder = params.sortOrder || 'desc';

    // Helper function for safe comparison
    const compareValues = (a: unknown, b: unknown): number => {
      // Handle dates
      if (a instanceof Date && b instanceof Date) {
        return a.getTime() - b.getTime();
      }

      // Handle strings
      if (typeof a === 'string' && typeof b === 'string') {
        const aLower = a.toLowerCase();
        const bLower = b.toLowerCase();
        return aLower.localeCompare(bLower);
      }

      // Handle numbers
      if (typeof a === 'number' && typeof b === 'number') {
        return a - b;
      }

      // Convert to strings for comparison
      const aStr = String(a || '');
      const bStr = String(b || '');
      return aStr.localeCompare(bStr);
    };

    clients.sort((a, b) => {
      const aValue = a[sortBy as keyof Client];
      const bValue = b[sortBy as keyof Client];

      const comparison = compareValues(aValue, bValue);
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    // Apply pagination
    const pageSize = params.pageSize || 20;
    const page = params.page || 1;
    const startIndex = (page - 1) * pageSize;
    const paginatedClients = clients.slice(startIndex, startIndex + pageSize);
    const hasMore = startIndex + pageSize < clients.length;

    return {
      clients: paginatedClients,
      totalCount: clients.length,
      hasMore,
    };
  }
}