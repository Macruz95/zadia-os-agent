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
    console.log('🔍 Creating client with contacts:', formData);
    
    try {
      const batch = writeBatch(db);
      
      // Validate and prepare client data (without contacts)
      const { contacts, ...clientData } = formData;
      const validatedClient = ClientSchema.parse(clientData);
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
      console.log('📋 Client document prepared with ID:', clientRef.id);
      
      // Create contact documents
      if (contacts && contacts.length > 0) {
        console.log('👥 Creating contacts:', contacts.length);
        
        for (const contactData of contacts) {
          // Skip empty contacts
          if (!contactData.phone || contactData.phone.trim() === '') {
            console.log('⚠️ Skipping contact without phone');
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
          console.log('📞 Contact prepared:', contactDoc);
        }
      }
      
      // Execute batch
      await batch.commit();
      console.log('✅ Client and contacts created successfully');
      
      return clientRef.id;
    } catch (error) {
      console.error('❌ Error creating client with contacts:', error);
      throw error;
    }
  }

  /**
   * Create a new client (legacy method - without contacts)
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
    const q = query(collection(db, CLIENTS_COLLECTION), orderBy('lastInteractionDate', 'desc'));
    const querySnapshot = await getDocs(q);
    const clients = querySnapshot.docs.map(docToClient);
    console.log('✅ Clients found:', clients.length);
    
    return clients;
  }

  /**
   * Get client by ID
   */
  static async getClientById(clientId: string): Promise<Client | null> {
    console.log('🔍 getClientById called with ID:', clientId);
    
    // Import auth here to check current user
    const { auth } = await import('../../../../lib/firebase');
    const currentUser = auth.currentUser;
    console.log('👤 Current user:', currentUser ? { uid: currentUser.uid, email: currentUser.email } : 'No user');
    
    try {
      const docRef = doc(db, CLIENTS_COLLECTION, clientId);
      console.log('📄 Attempting to get document from:', CLIENTS_COLLECTION, 'with ID:', clientId);
      
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const client = docToClient(docSnap);
        console.log('✅ Client found:', client);
        return client;
      } else {
        console.log('⚠️ Client not found for ID:', clientId);
        return null;
      }
    } catch (error) {
      console.error('❌ Error getting client by ID:', error);
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
   * Create test client data for development
   */
  static async createTestClient(): Promise<string> {
    try {
      console.log('🧪 Creating test client data');
      
      const testClient = {
        name: 'Tech Solutions S.A. de C.V.',
        documentId: '0614257890123',
        clientType: 'Empresa',
        status: 'Activo',
        tags: ['Tecnología', 'Desarrollo'],
        source: 'Referido',
        communicationOptIn: true,
        address: {
          country: 'SV',
          state: 'SS',
          city: 'SV-SS-01',
          district: 'SV-SS-01-01',
          street: 'Avenida Tecnológica #456',
          postalCode: '1101'
        },
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        lastInteractionDate: Timestamp.now()
      };
      
      const docRef = await addDoc(collection(db, CLIENTS_COLLECTION), testClient);
      console.log('✅ Test client created with ID:', docRef.id);
      
      return docRef.id;
    } catch (error) {
      console.error('❌ Error creating test client:', error);
      throw error;
    }
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
      if (clientType) q = query(q, where('clientType', '==', clientType));
      if (status) q = query(q, where('status', '==', status));
      if (source) q = query(q, where('source', '==', source));
      if (tags && tags.length > 0) q = query(q, where('tags', 'array-contains-any', tags));
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