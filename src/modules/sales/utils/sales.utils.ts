/**
 * ZADIA OS - Sales Utilities
 * 
 * Common utility functions for sales module
 */

import { Lead, Opportunity } from '../types/sales.types';
import { LeadStatus, OpportunityStage, QuoteStatus } from '../types/sales.types';
import { formatCurrency as formatCurrencyUtil, type CurrencyCode } from '@/lib/currency.utils';

/**
 * Format currency values for display
 * @deprecated Use formatCurrency from @/lib/currency.utils instead
 */
export function formatCurrency(amount: number, currency: string = 'COP'): string {
  return formatCurrencyUtil(amount, { currency: currency as CurrencyCode });
}

/**
 * Calculate conversion rate between stages
 */
export function calculateConversionRate(converted: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((converted / total) * 100);
}

/**
 * Get status color for leads
 */
export function getLeadStatusColor(status: LeadStatus): string {
  const colors: Record<LeadStatus, string> = {
    new: 'bg-blue-100 text-blue-800',
    contacted: 'bg-yellow-100 text-yellow-800',
    qualifying: 'bg-green-100 text-green-800',
    disqualified: 'bg-red-100 text-red-800',
    converted: 'bg-purple-100 text-purple-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}

/**
 * Get stage color for opportunities
 */
export function getOpportunityStageColor(stage: OpportunityStage): string {
  const colors: Record<OpportunityStage, string> = {
    qualified: 'bg-blue-100 text-blue-800',
    'proposal-sent': 'bg-yellow-100 text-yellow-800',
    negotiation: 'bg-orange-100 text-orange-800',
    'closed-won': 'bg-green-100 text-green-800',
    'closed-lost': 'bg-red-100 text-red-800',
  };
  return colors[stage] || 'bg-gray-100 text-gray-800';
}

/**
 * Get status color for quotes
 */
export function getQuoteStatusColor(status: QuoteStatus): string {
  const colors: Record<QuoteStatus, string> = {
    draft: 'bg-gray-100 text-gray-800',
    sent: 'bg-blue-100 text-blue-800',
    accepted: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    expired: 'bg-orange-100 text-orange-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}

/**
 * Generate next quote number
 */
export function generateQuoteNumber(lastQuoteNumber?: string): string {
  const currentYear = new Date().getFullYear();
  const yearSuffix = currentYear.toString().slice(-2);
  
  if (!lastQuoteNumber) {
    return `COT-${yearSuffix}-0001`;
  }
  
  // Extract number from last quote (COT-24-0001 -> 0001)
  const match = lastQuoteNumber.match(/COT-\d{2}-(\d{4})/);
  if (match) {
    const lastNumber = parseInt(match[1], 10);
    const nextNumber = (lastNumber + 1).toString().padStart(4, '0');
    return `COT-${yearSuffix}-${nextNumber}`;
  }
  
  return `COT-${yearSuffix}-0001`;
}

/**
 * Calculate days until deadline
 */
export function getDaysUntilDeadline(deadline: Date): number {
  const today = new Date();
  const diffTime = deadline.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Check if date is overdue
 */
export function isOverdue(deadline: Date): boolean {
  return new Date() > deadline;
}

/**
 * Format relative time (e.g., "2 days ago")
 */
export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffTime = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Hoy';
  if (diffDays === 1) return 'Ayer';
  if (diffDays < 7) return `Hace ${diffDays} días`;
  if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semanas`;
  if (diffDays < 365) return `Hace ${Math.floor(diffDays / 30)} meses`;
  
  return `Hace ${Math.floor(diffDays / 365)} años`;
}

/**
 * Validate opportunity value range
 */
export function isValidOpportunityValue(value: number): boolean {
  return value > 0 && value <= 10000000000; // Max 10B COP
}

/**
 * Calculate weighted pipeline value
 */
export function calculateWeightedPipelineValue(opportunities: Opportunity[]): number {
  const stageWeights: Record<OpportunityStage, number> = {
    qualified: 0.1,
    'proposal-sent': 0.25,
    negotiation: 0.75,
    'closed-won': 1.0,
    'closed-lost': 0.0,
  };
  
  return opportunities.reduce((total, opp) => {
    const weight = stageWeights[opp.stage] || 0;
    return total + (opp.estimatedValue * weight);
  }, 0);
}

/**
 * Generate sales funnel data
 */
export function generateSalesFunnelData(leads: Lead[], opportunities: Opportunity[]) {
  const qualifyingLeads = leads.filter(l => l.status === 'qualifying').length;
  const activeOpportunities = opportunities.filter(o => 
    !['closed-won', 'closed-lost'].includes(o.stage)
  ).length;
  const wonOpportunities = opportunities.filter(o => o.stage === 'closed-won').length;
  
  return [
    { stage: 'Leads', count: leads.length, color: '#3B82F6' },
    { stage: 'Qualifying', count: qualifyingLeads, color: '#10B981' },
    { stage: 'Opportunities', count: activeOpportunities, color: '#F59E0B' },
    { stage: 'Won', count: wonOpportunities, color: '#EF4444' },
  ];
}