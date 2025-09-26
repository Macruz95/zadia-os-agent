import { Client, ClientSearchParams } from '../../types/clients.types';
import type { ClientFormData } from '../../validations/clients.schema';
import { ClientCreationService } from './client-creation.service';
import { ClientCrudService } from './client-crud.service';
import { ClientSearchService } from './client-search.service';

/**
 * Main service for managing client entities - orchestrates specialized services
 */
export class ClientsService {
  /**
   * Create a new client with contacts
   */
  static async createClientWithContacts(formData: ClientFormData): Promise<string> {
    return ClientCreationService.createClientWithContacts(formData);
  }

  /**
   * Create a new client (legacy method - without contacts)
   */
  static async createClient(clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    return ClientCreationService.createClient(clientData);
  }

  /**
   * Get all clients
   */
  static async getClients(): Promise<Client[]> {
    return ClientCrudService.getClients();
  }

  /**
   * Get client by ID
   */
  static async getClientById(clientId: string): Promise<Client | null> {
    return ClientCrudService.getClientById(clientId);
  }

  /**
   * Update client
   */
  static async updateClient(clientId: string, updates: Partial<Client>): Promise<void> {
    return ClientCrudService.updateClient(clientId, updates);
  }

  /**
   * Delete client
   */
  static async deleteClient(clientId: string): Promise<void> {
    return ClientCrudService.deleteClient(clientId);
  }

  /**
   * Search clients with filters and pagination
   */
  static async searchClients(params: ClientSearchParams): Promise<{
    clients: Client[];
    totalCount: number;
    hasMore: boolean;
  }> {
    return ClientSearchService.searchClients(params);
  }
}