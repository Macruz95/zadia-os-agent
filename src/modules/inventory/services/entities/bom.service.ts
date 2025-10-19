/**/**

 * ZADIA OS - BOM Service (Facade) * BOM Service - Refactored and Optimized

 * Manages Bill of Materials with proper separation of concerns * Manages Bill of Materials CRUD operations with proper separation of concerns

 * Rule #5: Max 200 lines per file */

 */

import { 

// CRUD Operations  collection, 

export {  doc, 

  createBOM,  getDocs, 

  getBOMById,  addDoc, 

  updateBOM,  updateDoc,

  deleteBOM  getDoc,

} from './helpers/bom-crud.service';  query, 

  where, 

// Search Operations  orderBy,

export {  Timestamp 

  getBOMsByProductId,} from 'firebase/firestore';

  getAllBOMs,import { db } from '@/lib/firebase';

  getActiveBOMForProductimport { logger } from '@/lib/logger';

} from './helpers/bom-search.service';import { BillOfMaterials } from '../../types/inventory.types';

import { BOMCostCalculator } from './bom-cost-calculator.service';

// Validation & Feasibilityimport { BOMProductionValidator, ProductionFeasibility } from './bom-production-validator.service';

export {

  getProductionFeasibility,const COLLECTION_NAME = 'bill-of-materials';

  validateBOMItems

} from './helpers/bom-validation.service';export class BOMService {

  /**

// Re-export helper services for direct access   * Create new BOM for finished product

export { BOMCostCalculator } from './bom-cost-calculator.service';   */

export { BOMProductionValidator } from './bom-production-validator.service';  static async createBOM(

export type { ProductionFeasibility } from './bom-production-validator.service';    bomData: Omit<BillOfMaterials, 'id' | 'createdAt' | 'updatedAt'>,

    createdBy: string

/**  ): Promise<BillOfMaterials> {

 * BOMService Class - Backward Compatibility    try {

 */      // Validate BOM structure

import * as BOMCRUD from './helpers/bom-crud.service';      const validation = BOMProductionValidator.validateBOMStructure(bomData as BillOfMaterials);

import * as BOMSearch from './helpers/bom-search.service';      if (!validation.isValid) {

import * as BOMValidation from './helpers/bom-validation.service';        throw new Error(`Invalid BOM structure: ${validation.errors.join(', ')}`);

      }

export class BOMService {

  // CRUD Operations      // Calculate costs

  static createBOM = BOMCRUD.createBOM;      const tempBOM = {

  static getBOMById = BOMCRUD.getBOMById;        ...bomData,

  static updateBOM = BOMCRUD.updateBOM;        id: 'temp',

  static deleteBOM = BOMCRUD.deleteBOM;        createdAt: new Date(),

  static deactivateBOM = BOMCRUD.deleteBOM; // Alias        updatedAt: new Date()

      } as BillOfMaterials;

  // Search Operations      

  static getBOMsByProductId = BOMSearch.getBOMsByProductId;      const costs = await BOMCostCalculator.calculateBOMCosts(tempBOM);

  static getAllBOMs = BOMSearch.getAllBOMs;

  static getActiveBOMForProduct = BOMSearch.getActiveBOMForProduct;      // Create BOM document

  static getBOMsForProduct = BOMSearch.getBOMsByProductId; // Alias      const bomToCreate = {

        ...bomData,

  // Validation & Feasibility        ...costs,

  static getProductionFeasibility = BOMValidation.getProductionFeasibility;        createdBy,

  static calculateProductionFeasibility = BOMValidation.getProductionFeasibility; // Alias        createdAt: Timestamp.now(),

  static validateBOMItems = BOMValidation.validateBOMItems;        updatedAt: Timestamp.now()

}      };


      const docRef = await addDoc(collection(db, COLLECTION_NAME), bomToCreate);
      
      const createdBOM: BillOfMaterials = {
        ...bomToCreate,
        id: docRef.id,
        createdAt: bomToCreate.createdAt.toDate(),
        updatedAt: bomToCreate.updatedAt.toDate()
      };

      logger.info('BOM created successfully', {
        component: 'BOMService',
        action: 'createBOM'
      });

      return createdBOM;
    } catch (error) {
      logger.error('Error creating BOM:', error as Error);
      throw new Error('Error al crear BOM');
    }
  }

  /**
   * Get BOM by ID
   */
  static async getBOMById(id: string): Promise<BillOfMaterials | null> {
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
      logger.error('Error getting BOM:', error as Error);
      throw new Error('Error al obtener BOM');
    }
  }

  /**
   * Get BOMs by finished product ID
   */
  static async getBOMsByProductId(finishedProductId: string): Promise<BillOfMaterials[]> {
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
      logger.error('Error getting BOMs by product:', error as Error);
      throw new Error('Error al obtener BOMs del producto');
    }
  }

  /**
   * Update BOM
   */
  static async updateBOM(
    id: string,
    updates: Partial<Omit<BillOfMaterials, 'id' | 'createdAt' | 'createdBy'>>
  ): Promise<void> {
    try {
      const bomRef = doc(db, COLLECTION_NAME, id);
      
      // If items are being updated, recalculate costs
      if (updates.items) {
        const currentBOM = await this.getBOMById(id);
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
        component: 'BOMService',
        action: 'updateBOM'
      });
    } catch (error) {
      logger.error('Error updating BOM:', error as Error);
      throw new Error('Error al actualizar BOM');
    }
  }

  /**
   * Delete BOM (soft delete)
   */
  static async deleteBOM(id: string): Promise<void> {
    try {
      const bomRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(bomRef, {
        isActive: false,
        updatedAt: Timestamp.now()
      });

      logger.info('BOM deleted successfully', {
        component: 'BOMService',
        action: 'deleteBOM'
      });
    } catch (error) {
      logger.error('Error deleting BOM:', error as Error);
      throw new Error('Error al eliminar BOM');
    }
  }

  /**
   * Get production feasibility
   */
  static async getProductionFeasibility(
    bomId: string,
    quantity: number = 1
  ): Promise<ProductionFeasibility> {
    try {
      const bom = await this.getBOMById(bomId);
      if (!bom) {
        throw new Error('BOM not found');
      }

      return await BOMProductionValidator.calculateProductionFeasibility(bom, quantity);
    } catch (error) {
      logger.error('Error calculating production feasibility:', error as Error);
      throw new Error('Error al calcular factibilidad de producción');
    }
  }

  /**
   * Get all active BOMs
   */
  static async getAllBOMs(): Promise<BillOfMaterials[]> {
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
      logger.error('Error getting all BOMs:', error as Error);
      throw new Error('Error al obtener BOMs');
    }
  }

  /**
   * Get BOMs for finished product (alias for compatibility)
   */
  static async getBOMsForProduct(finishedProductId: string): Promise<BillOfMaterials[]> {
    return this.getBOMsByProductId(finishedProductId);
  }

  /**
   * Deactivate BOM (alias for compatibility)
   */
  static async deactivateBOM(id: string): Promise<void> {
    return this.deleteBOM(id);
  }

  /**
   * Get active BOM for product (alias for compatibility)
   */
  static async getActiveBOMForProduct(finishedProductId: string): Promise<BillOfMaterials | null> {
    try {
      const boms = await this.getBOMsByProductId(finishedProductId);
      return boms.length > 0 ? boms[0] : null;
    } catch (error) {
      logger.error('Error getting active BOM for product:', error as Error);
      return null;
    }
  }

  /**
   * Validate BOM items (delegates to validator service)
   */
  static async validateBOMItems(items: unknown[]): Promise<unknown> {
    try {
      const tempBOM = { items } as BillOfMaterials;
      return BOMProductionValidator.validateBOMStructure(tempBOM);
    } catch (error) {
      logger.error('Error validating BOM items:', error as Error);
      return {
        isValid: false,
        errors: ['Error validating BOM items'],
        warnings: []
      };
    }
  }

  /**
   * Calculate production feasibility (alias for compatibility)
   */
  static async calculateProductionFeasibility(bomId: string, quantity: number): Promise<unknown> {
    return this.getProductionFeasibility(bomId, quantity);
  }
}