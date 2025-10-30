import { Timestamp } from 'firebase/firestore';
import { QuoteItem } from './sales.types';

/**
 * Quote Template Type
 * Allows saving quote configurations as reusable templates
 */
export interface QuoteTemplate {
  id: string;
  name: string;
  description?: string;
  category?: 'product' | 'service' | 'custom';
  
  // Template data
  items: QuoteItem[];
  terms?: string;
  validityDays?: number;
  notes?: string;
  
  // Metadata
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  usageCount: number;
  isActive: boolean;
}

export interface QuoteTemplateFormData {
  name: string;
  description?: string;
  category?: 'product' | 'service' | 'custom';
  items: QuoteItem[];
  terms?: string;
  validityDays?: number;
  notes?: string;
}

export interface QuoteTemplateFilters {
  searchQuery?: string;
  category?: 'product' | 'service' | 'custom' | 'all';
  isActive?: boolean;
}
