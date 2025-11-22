/**
 * ZADIA OS - Quote to Project Conversion Service
 * 
 * Handles atomic conversion of accepted quotes into projects
 * with inventory reservation and work order creation
 * Following ZADIA Rule 1: Real Firebase data only
 */

import {
  collection,
  doc,
  writeBatch,
  serverTimestamp,
  Timestamp,
  getDoc
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { logger } from '@/lib/logger';
import {
  QuoteProjectConversionInput,
  ConversionResult,
  InventoryReservationInput,
  WorkOrderInput
} from '../validations/quote-project-conversion.schema';
import { Quote } from '../types/sales.types';
import { ProjectsService } from '@/modules/projects/services/projects.service';

const QUOTES_COLLECTION = 'quotes';
const PROJECTS_COLLECTION = 'projects';
const INVENTORY_RESERVATIONS_COLLECTION = 'inventoryReservations';
const WORK_ORDERS_COLLECTION = 'workOrders';
const OPPORTUNITIES_COLLECTION = 'opportunities';

/**
 * Convert accepted quote to project with atomic transaction
 */
export async function convertQuoteToProject(
  data: QuoteProjectConversionInput
): Promise<ConversionResult> {
  try {
    // Step 1: Validate quote exists and is accepted
    const quoteRef = doc(db, QUOTES_COLLECTION, data.quoteId);
    const quoteSnap = await getDoc(quoteRef);

    if (!quoteSnap.exists()) {
      throw new Error('Cotización no encontrada');
    }

    const quote = { id: quoteSnap.id, ...quoteSnap.data() } as Quote;

    if (quote.status !== 'accepted') {
      throw new Error('La cotización debe estar aceptada para convertir a proyecto');
    }

    // Step 2: Create atomic batch
    const batch = writeBatch(db);
    const now = serverTimestamp();

    // Step 3: Create project
    const projectRef = doc(collection(db, PROJECTS_COLLECTION));
    const projectData = {
      ...data.projectConfig,
      quoteId: data.quoteId,
      opportunityId: quote.opportunityId,
      clientId: quote.clientId,
      number: await generateProjectNumber(),
      status: 'Planificación' as const,
      progress: 0,
      totalBudget: data.projectConfig.budget || quote.total,
      currency: quote.currency,
      quoteTotal: quote.total,
      quoteItems: quote.items,
      createdAt: now,
      updatedAt: now,
      startDate: Timestamp.fromDate(data.projectConfig.startDate),
      estimatedEndDate: data.projectConfig.estimatedEndDate
        ? Timestamp.fromDate(data.projectConfig.estimatedEndDate)
        : null,
    };
    batch.set(projectRef, projectData);

    // Step 4: Update quote status
    batch.update(quoteRef, {
      status: 'converted-to-project',
      convertedToProjectId: projectRef.id,
      convertedAt: now,
      customerPO: data.acceptance.customerPO || null,
      acceptanceNotes: data.acceptance.acceptanceNotes || null,
      updatedAt: now,
    });

    // Step 5: Update opportunity (mark as won if not already)
    if (quote.opportunityId) {
      const opportunityRef = doc(db, OPPORTUNITIES_COLLECTION, quote.opportunityId);
      const opportunitySnap = await getDoc(opportunityRef);

      if (opportunitySnap.exists()) {
        const oppData = opportunitySnap.data();
        if (oppData.status !== 'won') {
          batch.update(opportunityRef, {
            status: 'won',
            stage: 'closed-won',
            closedAt: now,
            projectId: projectRef.id,
            updatedAt: now,
          });
        }
      }
    }

    // Step 6: Create inventory reservations
    const reservationIds: string[] = [];
    data.inventoryReservations?.forEach((reservation: InventoryReservationInput) => {
      const reservationRef = doc(collection(db, INVENTORY_RESERVATIONS_COLLECTION));
      batch.set(reservationRef, {
        ...reservation,
        projectId: projectRef.id,
        quoteId: data.quoteId,
        status: 'reserved',
        reservedAt: now,
        createdAt: now,
        updatedAt: now,
        expectedDeliveryDate: reservation.expectedDeliveryDate
          ? Timestamp.fromDate(reservation.expectedDeliveryDate)
          : null,
      });
      reservationIds.push(reservationRef.id);
    });

    // Step 7: Create work orders
    const workOrderIds: string[] = [];
    data.workOrders?.forEach((workOrder: WorkOrderInput, index: number) => {
      const workOrderRef = doc(collection(db, WORK_ORDERS_COLLECTION));
      batch.set(workOrderRef, {
        ...workOrder,
        projectId: projectRef.id,
        quoteId: data.quoteId,
        clientId: quote.clientId,
        number: `WO-${projectRef.id.slice(-6)}-${String(index + 1).padStart(3, '0')}`,
        status: 'pending',
        createdAt: now,
        updatedAt: now,
        scheduledDate: workOrder.scheduledDate
          ? Timestamp.fromDate(workOrder.scheduledDate)
          : null,
      });
      workOrderIds.push(workOrderRef.id);
    });

    // Step 8: Commit batch
    await batch.commit();

    // Step 9: Add Timeline Entry (Non-blocking)
    try {
      await ProjectsService.addTimelineEntry({
        projectId: projectRef.id,
        type: 'milestone',
        title: 'Proyecto creado desde cotización',
        description: `Proyecto generado automáticamente desde cotización ${quote.number}`,
        performedBy: 'system', // TODO: Pass actual user ID
        performedByName: 'Sistema',
        performedAt: Timestamp.now(),
        metadata: {
          quoteId: data.quoteId,
          quoteNumber: quote.number,
        },
      });
    } catch (timelineError) {
      logger.warn('Failed to create timeline entry', {
        component: 'QuoteProjectConversionService',
        metadata: { error: (timelineError as Error).message }
      });
      // Don't fail the whole process if timeline fails
    }

    logger.info('Quote converted to project successfully', {
      component: 'QuoteProjectConversionService',
      metadata: {
        quoteId: data.quoteId,
        projectId: projectRef.id,
        reservations: reservationIds.length,
        workOrders: workOrderIds.length,
      }
    });

    return {
      success: true,
      quoteId: data.quoteId,
      projectId: projectRef.id,
      reservationsCreated: reservationIds.length,
      workOrdersCreated: workOrderIds.length,
      message: 'Proyecto creado exitosamente',
      timestamp: new Date(),
    };

  } catch (error) {
    logger.error('Error converting quote to project', error as Error, {
      component: 'QuoteProjectConversionService',
      metadata: { quoteId: data.quoteId },
    });
    throw error;
  }
}

/**
 * Generate unique project number
 */
async function generateProjectNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, '0');

  // In production, this should query Firestore for the last project number
  // For now, use timestamp-based unique number
  const timestamp = Date.now().toString().slice(-4);

  return `PRJ-${year}${month}-${timestamp}`;
}
