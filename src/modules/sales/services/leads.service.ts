/**
 * ZADIA OS - Leads Service (Main)
 * 
 * Aggregates all lead-related services following single responsibility principle
 * Following ZADIA OS Rule 5: Max 200 lines per file
 */

import { 
  Lead, 
  LeadFilters,
  LeadSearchResult,
  LeadInteraction 
} from '../types/sales.types';
import { 
  LeadFormData, 
  LeadInteractionData 
} from '../validations/sales.schema';
import { LeadsCrudService } from './leads-crud.service';
import { LeadsActionsService } from './leads-actions.service';

/**
 * Main Leads Service - Aggregates all lead operations
 * Follows composition pattern for better maintainability
 */
export class LeadsService {
  // CRUD Operations (delegated to LeadsCrudService)
  static async createLead(data: LeadFormData, createdBy: string): Promise<Lead> {
    return LeadsCrudService.createLead(data, createdBy);
  }

  static async updateLead(id: string, data: Partial<Lead>): Promise<void> {
    return LeadsCrudService.updateLead(id, data);
  }

  static async getLeadById(id: string): Promise<Lead | null> {
    return LeadsCrudService.getLeadById(id);
  }

  static async deleteLead(id: string): Promise<void> {
    return LeadsCrudService.deleteLead(id);
  }

  static async searchLeads(
    filters: LeadFilters = {},
    pageSize: number = 20,
    lastDocId?: string
  ): Promise<LeadSearchResult> {
    return LeadsCrudService.searchLeads(filters, pageSize, lastDocId);
  }

  static async getLeadsByUser(userId: string): Promise<Lead[]> {
    return LeadsCrudService.getLeadsByUser(userId);
  }

  // Business Actions (delegated to LeadsActionsService)
  static async convertLead(id: string): Promise<{
    clientId: string;
    opportunityId: string;
  }> {
    return LeadsActionsService.convertLead(id);
  }

  static async disqualifyLead(id: string, reason: string): Promise<void> {
    return LeadsActionsService.disqualifyLead(id, reason);
  }

  static async updateLeadScore(id: string, score: number): Promise<void> {
    return LeadsActionsService.updateLeadScore(id, score);
  }

  static async addInteraction(
    data: LeadInteractionData, 
    performedBy: string
  ): Promise<LeadInteraction> {
    return LeadsActionsService.addInteraction(data, performedBy);
  }

  static async getLeadInteractions(leadId: string): Promise<LeadInteraction[]> {
    return LeadsActionsService.getLeadInteractions(leadId);
  }
}

// Export individual functions for convenience
export const createLead = LeadsService.createLead;
export const updateLead = LeadsService.updateLead;
export const getLeadById = LeadsService.getLeadById;
export const deleteLead = LeadsService.deleteLead;
export const searchLeads = LeadsService.searchLeads;
export const getLeadsByUser = LeadsService.getLeadsByUser;
export const convertLead = LeadsService.convertLead;
export const disqualifyLead = LeadsService.disqualifyLead;
export const updateLeadScore = LeadsService.updateLeadScore;
export const addInteraction = LeadsService.addInteraction;
export const getLeadInteractions = LeadsService.getLeadInteractions;