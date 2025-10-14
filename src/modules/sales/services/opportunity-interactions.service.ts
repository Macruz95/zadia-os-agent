/**
 * ZADIA OS - Opportunity Interactions Service
 * 
 * Service for managing opportunity interactions (notes, calls, meetings, emails)
 * 
 * @module sales/services/opportunity-interactions.service
 */

import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  getDocs,
  Timestamp,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { logger } from '@/lib/logger';
import type { OpportunityInteraction } from '../types/sales.types';
import type {
  CreateOpportunityInteractionInput,
  StageChangeInteractionInput,
} from '../validations/opportunity-profile.schema';

const INTERACTIONS_COLLECTION = 'opportunityInteractions';

export class OpportunityInteractionsService {
  /**
   * Create a new opportunity interaction
   */
  static async createInteraction(
    data: CreateOpportunityInteractionInput
  ): Promise<OpportunityInteraction> {
    try {
      const interactionData = {
        opportunityId: data.opportunityId,
        type: data.type,
        summary: data.summary,
        details: data.details || '',
        performedAt: serverTimestamp(),
        performedBy: data.performedBy,
      };

      const docRef = await addDoc(
        collection(db, INTERACTIONS_COLLECTION),
        interactionData
      );

      logger.info('Opportunity interaction created', {
        metadata: { opportunityId: data.opportunityId, type: data.type },
      });

      return {
        id: docRef.id,
        ...interactionData,
        performedAt: Timestamp.now(),
      } as OpportunityInteraction;
    } catch (error) {
      logger.error(
        'Error creating opportunity interaction',
        error instanceof Error ? error : new Error(String(error))
      );
      throw new Error('Failed to create opportunity interaction');
    }
  }

  /**
   * Create a stage change interaction
   */
  static async createStageChangeInteraction(
    data: StageChangeInteractionInput
  ): Promise<OpportunityInteraction> {
    try {
      const interactionData = {
        opportunityId: data.opportunityId,
        type: 'stage-change' as const,
        summary: data.summary,
        details: `Etapa cambiada de "${data.previousStage}" a "${data.newStage}"`,
        performedAt: serverTimestamp(),
        performedBy: data.performedBy,
        previousStage: data.previousStage,
        newStage: data.newStage,
      };

      const docRef = await addDoc(
        collection(db, INTERACTIONS_COLLECTION),
        interactionData
      );

      logger.info('Stage change interaction created', {
        metadata: {
          opportunityId: data.opportunityId,
          previousStage: data.previousStage,
          newStage: data.newStage,
        },
      });

      return {
        id: docRef.id,
        ...interactionData,
        performedAt: Timestamp.now(),
      } as OpportunityInteraction;
    } catch (error) {
      logger.error(
        'Error creating stage change interaction',
        error instanceof Error ? error : new Error(String(error))
      );
      throw new Error('Failed to create stage change interaction');
    }
  }

  /**
   * Get all interactions for an opportunity
   */
  static async getInteractionsByOpportunity(
    opportunityId: string
  ): Promise<OpportunityInteraction[]> {
    try {
      const q = query(
        collection(db, INTERACTIONS_COLLECTION),
        where('opportunityId', '==', opportunityId),
        orderBy('performedAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const interactions: OpportunityInteraction[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        interactions.push({
          id: doc.id,
          ...data,
          performedAt: data.performedAt?.toDate() || new Date(),
        } as OpportunityInteraction);
      });

      return interactions;
    } catch (error) {
      logger.error(
        'Error fetching opportunity interactions',
        error instanceof Error ? error : new Error(String(error))
      );
      throw new Error('Failed to fetch opportunity interactions');
    }
  }
}
