/**
 * ZADIA OS - BOM Search Service
 * Handles search and query operations for BOMs
 */

import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { logger } from '@/lib/logger';
import { BillOfMaterials } from '../../../types/inventory.types';

const COLLECTION_NAME = 'bill-of-materials';

/**
 * Get BOMs by finished product ID
 */
export async function getBOMsByProductId(finishedProductId: string): Promise<BillOfMaterials[]> {
  try {
    const bomsRef = collection(db, COLLECTION_NAME);
    const q = query(
      bomsRef,
      where('finishedProductId', '==', finishedProductId),
      where('isActive', '==', true),
      orderBy('version', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const boms: BillOfMaterials[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      boms.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      } as BillOfMaterials);
    });

    return boms;
  } catch (error) {
    logger.error('Error getting BOMs by product', error as Error, {
      component: 'BOMSearch',
      action: 'getBOMsByProductId',
      metadata: { finishedProductId }
    });
    throw new Error('Error al obtener BOMs del producto');
  }
}

/**
 * Get all active BOMs
 */
export async function getAllBOMs(): Promise<BillOfMaterials[]> {
  try {
    const bomsRef = collection(db, COLLECTION_NAME);
    const q = query(
      bomsRef,
      where('isActive', '==', true),
      orderBy('updatedAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const boms: BillOfMaterials[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      boms.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      } as BillOfMaterials);
    });

    return boms;
  } catch (error) {
    logger.error('Error getting all BOMs', error as Error, {
      component: 'BOMSearch',
      action: 'getAllBOMs'
    });
    throw new Error('Error al obtener BOMs');
  }
}

/**
 * Get active BOM for product (returns first active version)
 */
export async function getActiveBOMForProduct(finishedProductId: string): Promise<BillOfMaterials | null> {
  try {
    const boms = await getBOMsByProductId(finishedProductId);
    return boms.length > 0 ? boms[0] : null;
  } catch (error) {
    logger.error('Error getting active BOM for product', error as Error, {
      component: 'BOMSearch',
      action: 'getActiveBOMForProduct',
      metadata: { finishedProductId }
    });
    return null;
  }
}
