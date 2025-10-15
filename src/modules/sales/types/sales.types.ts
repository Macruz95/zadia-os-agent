/**
 * ZADIA OS - Sales Module Types
 * 
 * Defines all types for the sales pipeline: leads, opportunities, quotes
 */

import { Timestamp } from 'firebase/firestore';

// Base Types
export type LeadSource = 'web' | 'referral' | 'event' | 'cold-call' | 'imported';
export type LeadStatus = 'new' | 'contacted' | 'qualifying' | 'disqualified' | 'converted';
export type LeadPriority = 'hot' | 'warm' | 'cold';
export type EntityType = 'person' | 'company' | 'institution';

export type OpportunityStage = 'qualified' | 'proposal-sent' | 'negotiation' | 'closed-won' | 'closed-lost';
export type OpportunityStatus = 'open' | 'won' | 'lost';
export type OpportunityPriority = 'high' | 'medium' | 'low';

export type QuoteStatus = 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';

// Lead Interface
export interface Lead {
  id: string;
  entityType: EntityType;
  fullName?: string; // For person
  entityName?: string; // For company/institution
  position?: string; // Job title if applicable
  email: string;
  phone: string;
  phoneCountryId?: string; // Country ID for phone code reference
  company?: string; // Company name for person leads
  source: LeadSource;
  status: LeadStatus;
  priority: LeadPriority;
  score: number; // 1-100
  assignedTo: string; // User ID
  notes?: string;
  lastContactDate?: Timestamp; // Last interaction date with lead
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
  convertedAt?: Timestamp;
  convertedToClientId?: string;
  convertedToOpportunityId?: string;
}

// Create Lead Input
export interface CreateLeadInput {
  entityType: 'person' | 'company' | 'institution';
  fullName?: string;
  entityName?: string;
  email: string;
  phone: string;
  company?: string;
  position?: string;
  source: LeadSource;
  priority: LeadPriority;
  notes?: string;
  interests?: string;
}

// Lead Interaction
export interface LeadInteraction {
  id: string;
  leadId: string;
  type: 'note' | 'call' | 'meeting' | 'email';
  summary: string;
  details?: string;
  result?: string;
  performedAt: Timestamp;
  performedBy: string;
  attachments?: string[];
}

// Opportunity Interface
export interface Opportunity {
  id: string;
  name: string;
  clientId: string;
  contactId: string; // Main contact from client
  estimatedValue: number;
  currency: string;
  expectedCloseDate?: Timestamp;
  stage: OpportunityStage;
  status: OpportunityStatus;
  probability: number; // 0-100
  priority: OpportunityPriority;
  assignedTo: string; // Salesperson
  source?: string; // Lead ID if converted
  notes?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
  closedAt?: Timestamp;
  lossReason?: string;
}

// Opportunity Interaction
export interface OpportunityInteraction {
  id: string;
  opportunityId: string;
  type: 'note' | 'call' | 'meeting' | 'email' | 'stage-change';
  summary: string;
  details?: string;
  performedAt: Timestamp;
  performedBy: string;
  previousStage?: OpportunityStage;
  newStage?: OpportunityStage;
}

// Quote Item
export interface QuoteItem {
  id: string;
  productId?: string; // Reference to inventory
  description: string;
  quantity: number;
  unitOfMeasure: string;
  unitPrice: number;
  discount: number; // Percentage or amount
  subtotal: number;
}

// Quote Interface
export interface Quote {
  id: string;
  number: string; // Auto-generated (COT-2025-001)
  opportunityId: string;
  clientId: string;
  contactId: string;
  items: QuoteItem[];
  subtotal: number;
  taxes: Record<string, number>; // {iva: 13, isr: 2}
  totalTaxes: number;
  discounts: number;
  total: number;
  currency: string;
  status: QuoteStatus;
  validUntil: Timestamp;
  paymentTerms: string;
  notes?: string;
  internalNotes?: string;
  assignedTo: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  sentAt?: Timestamp;
  acceptedAt?: Timestamp;
  rejectedAt?: Timestamp;
  attachments?: string[];
}

// Search and Filter Types
export interface LeadFilters {
  status?: LeadStatus[];
  source?: LeadSource[];
  priority?: LeadPriority[];
  assignedTo?: string;
  entityType?: EntityType[];
  createdFrom?: Date;
  createdTo?: Date;
}

export interface OpportunityFilters {
  stage?: OpportunityStage[];
  status?: OpportunityStatus[];
  priority?: OpportunityPriority[];
  assignedTo?: string;
  clientId?: string;
  expectedCloseFrom?: Date;
  expectedCloseTo?: Date;
  valueFrom?: number;
  valueTo?: number;
}

export interface QuoteFilters {
  status?: QuoteStatus[];
  clientId?: string;
  opportunityId?: string;
  assignedTo?: string;
  validFrom?: Date;
  validTo?: Date;
  valueFrom?: number;
  valueTo?: number;
}

// Search Results
export interface LeadSearchResult {
  leads: Lead[];
  totalCount: number;
}

export interface OpportunitySearchResult {
  opportunities: Opportunity[];
  totalCount: number;
}

export interface QuoteSearchResult {
  quotes: Quote[];
  totalCount: number;
}

// Conversion Types
export interface LeadConversionData {
  lead: Lead;
  clientData: {
    entityType: EntityType;
    name: string;
    email: string;
    phone: string;
    company?: string;
    position?: string;
  };
  opportunityData: {
    name: string;
    estimatedValue: number;
    expectedCloseDate?: Date;
    notes?: string;
  };
}

// Sales Pipeline KPIs
export interface SalesPipelineKPIs {
  totalLeads: number;
  leadsThisMonth: number;
  conversionRate: number;
  totalOpportunities: number;
  openOpportunities: number;
  totalPipelineValue: number;
  avgDealSize: number;
  avgSalesCycle: number; // days
  winRate: number;
  totalQuotes: number;
  quotesThisMonth: number;
  quoteAcceptanceRate: number;
}