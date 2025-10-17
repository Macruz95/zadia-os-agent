/**
 * ZADIA OS - Quote to Project Conversion Service
 * 
 * Handles the complete conversion flow from accepted quotes to projects
 * Rule #1: Real Firebase operations (no mocks)
 * Rule #3: Zod validation on all inputs
 * Rule #4: Modular service architecture
 */

import { 
  doc, 
  Timestamp,
  runTransaction,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { logger } from '@/lib/logger';
import { ProjectsService } from '@/modules/projects/services/projects.service';
import type { Quote } from '@/modules/sales/types/sales.types';
import type { CreateProjectInput } from '@/modules/projects/validations/projects.validation';

/**
 * Conversion configuration options
 */
export interface ConversionConfig {
  projectName?: string;
  projectDescription?: string;
  startDate?: Date;
  estimatedEndDate?: Date;
  projectManager?: string;
  teamMembers?: string[];
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  notes?: string;
}

/**
 * Conversion result
 */
export interface ConversionResult {
  success: boolean;
  projectId?: string;
  quoteId: string;
  message: string;
  timestamp: Date;
}

/**
 * Quote to Project Conversion Service
 */
export const QuoteConversionService = {

  /**
   * Convert a quote to a project
   * Creates project and updates quote status atomically
   */
  async convertQuoteToProject(
    quote: Quote,
    config: ConversionConfig,
    userId: string
  ): Promise<ConversionResult> {
    try {
      // Validate quote status
      if (quote.status !== 'accepted') {
        return {
          success: false,
          quoteId: quote.id,
          message: 'Solo se pueden convertir cotizaciones aceptadas',
          timestamp: new Date(),
        };
      }

      // Validate quote is not expired
      const now = new Date();
      if (quote.validUntil.toDate() < now) {
        return {
          success: false,
          quoteId: quote.id,
          message: 'La cotización ha expirado',
          timestamp: new Date(),
        };
      }

      // Map quote data to project data
      const projectData: CreateProjectInput = {
        name: config.projectName || `Proyecto - ${quote.number}`,
        description: config.projectDescription || quote.notes || `Proyecto generado de cotización ${quote.number}`,
        projectType: 'production', // Can be configured
        status: 'planning',
        priority: config.priority || 'medium',
        
        // Client info from quote
        clientId: quote.clientId,
        clientName: '', // Will be populated from client data
        opportunityId: quote.opportunityId,
        quoteId: quote.id,
        quoteNumber: quote.number,
        
        // Financial data from quote
        salesPrice: quote.total,
        estimatedCost: quote.total * 0.7, // Estimate 70% cost (can be configured)
        currency: quote.currency,
        paymentTerms: quote.paymentTerms,
        
        // Dates (keep as Date, not Timestamp - validation schema expects Date)
        startDate: config.startDate,
        estimatedEndDate: config.estimatedEndDate,
        
        // Team
        projectManager: config.projectManager || quote.assignedTo,
        teamMembers: config.teamMembers || [],
        
        // Additional
        tags: ['convertido-de-cotizacion'],
        createdBy: userId,
      };

      // Create project and update quote in a transaction
      const projectId = await runTransaction(db, async (transaction) => {
        // Create project
        const newProjectId = await ProjectsService.createProject(projectData);

        // Update quote status
        const quoteRef = doc(db, 'quotes', quote.id);
        transaction.update(quoteRef, {
          status: 'accepted', // Keep as accepted
          convertedToProject: true,
          projectId: newProjectId,
          updatedAt: Timestamp.now(),
        });

        return newProjectId;
      });

      // Log conversion in project timeline
      await ProjectsService.addTimelineEntry({
        projectId,
        type: 'milestone',
        title: 'Proyecto creado desde cotización',
        description: `Proyecto generado automáticamente desde cotización ${quote.number}`,
        performedBy: userId,
        performedByName: 'Sistema',
        performedAt: Timestamp.now(),
        metadata: {
          quoteId: quote.id,
          quoteNumber: quote.number,
        },
      });

      return {
        success: true,
        projectId,
        quoteId: quote.id,
        message: 'Proyecto creado exitosamente',
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error('Error converting quote to project', error as Error);
      return {
        success: false,
        quoteId: quote.id,
        message: 'Error al crear el proyecto',
        timestamp: new Date(),
      };
    }
  },

  /**
   * Estimate project cost from quote
   * Can be customized based on business rules
   */
  estimateProjectCost(quote: Quote, costRatio: number = 0.7): number {
    // Default: 70% of sales price as estimated cost
    // This can be refined based on:
    // - Product categories
    // - Labor estimates
    // - Material costs
    // - Overhead
    return quote.total * costRatio;
  },

  /**
   * Generate default project name from quote
   */
  generateProjectName(quote: Quote): string {
    return `Proyecto - ${quote.number}`;
  },

  /**
   * Calculate estimated project duration
   * Based on quote items and complexity
   */
  calculateEstimatedDuration(quote: Quote): number {
    // Simple calculation: 1 week per $10,000
    // Can be refined based on actual business logic
    const durationWeeks = Math.ceil(quote.total / 10000);
    return Math.max(durationWeeks, 1); // Minimum 1 week
  },
};
