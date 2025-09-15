/**
 * ZADIA OS - Clients Service
 * 
 * Refactored main service that aggregates all client-related operations
 * Following SOLID principles and clean architecture patterns
 */

// Entity Services
export { ClientsService } from './entities/clients-entity.service';
export { ContactsService } from './entities/contacts-entity.service';
export { InteractionsService } from './entities/interactions-entity.service';

// Legacy API compatibility layer
import { ClientsService } from './entities/clients-entity.service';
import { ContactsService } from './entities/contacts-entity.service';
import { InteractionsService } from './entities/interactions-entity.service';

/**
 * Legacy API exports for backward compatibility
 * @deprecated Use specific entity services instead
 */
export const createClient = ClientsService.createClient;
export const getClients = ClientsService.getClients;
export const getClient = ClientsService.getClientById;
export const getClientById = ClientsService.getClientById;
export const updateClient = ClientsService.updateClient;
export const deleteClient = ClientsService.deleteClient;
export const searchClients = ClientsService.searchClients;

export const createContact = ContactsService.createContact;
export const getContactsByClient = ContactsService.getContactsByClient;
export const getContactById = ContactsService.getContactById;
export const updateContact = ContactsService.updateContact;
export const deleteContact = ContactsService.deleteContact;

export const createInteraction = InteractionsService.createInteraction;
export const getInteractionsByClient = InteractionsService.getInteractionsByClient;
export const getInteractionById = InteractionsService.getInteractionById;
export const updateInteraction = InteractionsService.updateInteraction;
export const deleteInteraction = InteractionsService.deleteInteraction;

// Re-export types
export * from '../types/clients.types';