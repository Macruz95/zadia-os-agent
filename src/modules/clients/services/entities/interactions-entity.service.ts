import { db } from '../../../../lib/firebase';
import { logger } from '../../../../lib/logger';
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
  limit,
  Timestamp,
} from 'firebase/firestore';
import { Interaction } from '../../types/clients.types';
import { InteractionSchema } from '../../validations/clients.schema';
import { INTERACTIONS_COLLECTION, docToInteraction } from '../utils/firestore.utils';

/**
 * Service for managing interaction entities
 */
export class InteractionsService {
  /**
   * Create a new interaction
   */
  static async createInteraction(interactionData: Omit<Interaction, 'id' | 'createdAt'>): Promise<string> {
    const validated = InteractionSchema.parse(interactionData);
    const docRef = await addDoc(collection(db, INTERACTIONS_COLLECTION), {
      ...validated,
      date: Timestamp.fromDate(validated.date),
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  }

  /**
   * Get interactions by client ID
   * @param clientId - The client ID
   * @param limitCount - Maximum number of results
   * @param tenantId - Required tenant ID for data isolation
   */
  static async getInteractionsByClient(clientId: string, limitCount = 10, tenantId?: string): Promise<Interaction[]> {
    logger.serviceCall('InteractionsEntityService', 'getInteractionsByClient', { clientId, limitCount, tenantId });
    try {
      let q;
      if (tenantId) {
        q = query(
          collection(db, INTERACTIONS_COLLECTION),
          where('tenantId', '==', tenantId),
          where('clientId', '==', clientId),
          orderBy('date', 'desc'),
          limit(limitCount)
        );
      } else {
        // Fallback for legacy - may fail with security rules
        q = query(
          collection(db, INTERACTIONS_COLLECTION),
          where('clientId', '==', clientId),
          orderBy('date', 'desc'),
          limit(limitCount)
        );
      }
      const querySnapshot = await getDocs(q);
      const interactions = querySnapshot.docs.map(docToInteraction);
      logger.debug(`Interactions retrieved for client ${clientId}`, { 
        component: 'InteractionsEntityService',
        metadata: { count: interactions.length }
      });
      return interactions;
    } catch (error) {
      logger.error('Error getting interactions by client', error as Error, { 
        component: 'InteractionsEntityService',
        metadata: { clientId, limitCount }
      });
      throw error;
    }
  }

  /**
   * Get interaction by ID
   */
  static async getInteractionById(interactionId: string): Promise<Interaction | null> {
    const docRef = doc(db, INTERACTIONS_COLLECTION, interactionId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docToInteraction(docSnap);
    }
    return null;
  }

  /**
   * Update interaction
   */
  static async updateInteraction(interactionId: string, updates: Partial<Interaction>): Promise<void> {
    const docRef = doc(db, INTERACTIONS_COLLECTION, interactionId);
    await updateDoc(docRef, {
      ...updates,
      date: updates.date ? Timestamp.fromDate(updates.date) : undefined,
    });
  }

  /**
   * Delete interaction
   */
  static async deleteInteraction(interactionId: string): Promise<void> {
    const docRef = doc(db, INTERACTIONS_COLLECTION, interactionId);
    await deleteDoc(docRef);
  }
}