/**
 * ZADIA OS - BOM CRUD Service
 * Handles create, read, update, delete operations for BOMs
 */

import { 
  collection, 
  doc, 
  getDoc, 
  addDoc, 
  updateDoc, 
  Timestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { logger } from '@/lib/logger';
import { BillOfMaterials } from '../../../types/inventory.types';
import { BOMCostCalculator } from '../bom-cost-calculator.service';
import { BOMProductionValidator } from '../bom-production-validator.service';

const COLLECTION_NAME = 'bill-of-materials';

/**
 * Create new BOM for finished product
 */
export async function createBOM(
  bomData: Omit<BillOfMaterials, 'id' | 'createdAt' | 'updatedAt'>,
  createdBy: string
): Promise<BillOfMaterials> {
  try {
    // Validate BOM structure
    const validation = BOMProductionValidator.validateBOMStructure(bomData as BillOfMaterials);
    if (!validation.isValid) {
      throw new Error(`Invalid BOM structure: ${validation.errors.join(', ')}`);
    }

    // Calculate costs
    const tempBOM = {
      ...bomData,
      id: 'temp',
      createdAt: new Date(),
      updatedAt: new Date()
    } as BillOfMaterials;
    
    const costs = await BOMCostCalculator.calculateBOMCosts(tempBOM);

    // Create BOM document
    const bomToCreate = {
      ...bomData,
      ...costs,
      createdBy,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };

    const docRef = await addDoc(collection(db, COLLECTION_NAME), bomToCreate);
    
    const createdBOM: BillOfMaterials = {
      ...bomToCreate,
      id: docRef.id,
      createdAt: bomToCreate.createdAt.toDate(),
      updatedAt: bomToCreate.updatedAt.toDate()
    };

    logger.info('BOM created successfully', {
      component: 'BOMCRUD',
      action: 'createBOM',
      metadata: { bomId: docRef.id }
    });

    return createdBOM;
  } catch (error) {
    logger.error('Error creating BOM', error as Error, {
      component: 'BOMCRUD',
      action: 'createBOM'
    });
    throw new Error('Error al crear BOM');
  }
}

/**
 * Get BOM by ID
 */
export async function getBOMById(id: string): Promise<BillOfMaterials | null> {
  try {
    const bomRef = doc(db, COLLECTION_NAME, id);
    const bomSnap = await getDoc(bomRef);

    if (!bomSnap.exists()) {
      return null;
    }

    const data = bomSnap.data();
    return {
      id: bomSnap.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date()
    } as BillOfMaterials;
  } catch (error) {
    logger.error('Error getting BOM', error as Error, {
      component: 'BOMCRUD',
      action: 'getBOMById',
      metadata: { bomId: id }
    });
    throw new Error('Error al obtener BOM');
  }
}

/**
 * Update BOM
 */
export async function updateBOM(
  id: string,
  updates: Partial<Omit<BillOfMaterials, 'id' | 'createdAt' | 'createdBy'>>
): Promise<void> {
  try {
    const bomRef = doc(db, COLLECTION_NAME, id);
    
    // If items are being updated, recalculate costs
    if (updates.items) {
      const currentBOM = await getBOMById(id);
      if (currentBOM) {
        const updatedBOM = { ...currentBOM, ...updates } as BillOfMaterials;
        const costs = await BOMCostCalculator.calculateBOMCosts(updatedBOM);
        Object.assign(updates, costs);
      }
    }

    await updateDoc(bomRef, {
      ...updates,
      updatedAt: Timestamp.now()
    });

    logger.info('BOM updated successfully', {
      component: 'BOMCRUD',
      action: 'updateBOM',
      metadata: { bomId: id }
    });
  } catch (error) {
    logger.error('Error updating BOM', error as Error, {
      component: 'BOMCRUD',
      action: 'updateBOM',
      metadata: { bomId: id }
    });
    throw new Error('Error al actualizar BOM');
  }
}

/**
 * Delete BOM (soft delete)
 */
export async function deleteBOM(id: string): Promise<void> {
  try {
    const bomRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(bomRef, {
      isActive: false,
      updatedAt: Timestamp.now()
    });

    logger.info('BOM deleted successfully', {
      component: 'BOMCRUD',
      action: 'deleteBOM',
      metadata: { bomId: id }
    });
  } catch (error) {
    logger.error('Error deleting BOM', error as Error, {
      component: 'BOMCRUD',
      action: 'deleteBOM',
      metadata: { bomId: id }
    });
    throw new Error('Error al eliminar BOM');
  }
}
