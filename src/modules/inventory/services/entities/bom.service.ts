/**
 * ZADIA OS - Bill of Materials (BOM) Service
 * 
 * Manages product recipes and cost calculations
 */

import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc,
  getDoc,
  query, 
  where, 
  orderBy,
  Timestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { logger } from '@/lib/logger';
import { BillOfMaterials, BOMItem } from '../../types/inventory.types';
import { RawMaterialCrudService } from './raw-material-crud.service';
import { FinishedProductCrudService } from './finished-product-crud.service';

const COLLECTION_NAME = 'bill-of-materials';

export class BOMService {
  /**
   * Create new BOM for finished product
   */
  static async createBOM(
    bomData: Omit<BillOfMaterials, 'id' | 'createdAt' | 'updatedAt'>,
    createdBy: string
  ): Promise<BillOfMaterials> {
    try {
      // Calculate totals from items
      const tempBOM = {
        ...bomData,
        id: 'temp',
        createdAt: new Date(),
        updatedAt: new Date()
      } as BillOfMaterials;
      
      const { 
        totalMaterialCost, 
        totalLaborCost, 
        totalOverheadCost, 
        totalCost 
      } = await this.calculateBOMCosts(tempBOM);

      const bomWithCalculations: Omit<BillOfMaterials, 'id'> = {
        ...bomData,
        totalMaterialCost,
        totalLaborCost,
        totalOverheadCost,
        totalCost,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy,
        isActive: true
      };

      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        ...bomWithCalculations,
        createdAt: Timestamp.fromDate(bomWithCalculations.createdAt),
        updatedAt: Timestamp.fromDate(bomWithCalculations.updatedAt)
      });

      const createdBOM: BillOfMaterials = {
        ...bomWithCalculations,
        id: docRef.id
      };

      // Update finished product unit cost
      await FinishedProductCrudService.updateUnitCost(
        bomData.finishedProductId,
        totalMaterialCost,
        createdBy
      );

      logger.info(`BOM created for product: ${bomData.finishedProductName}`);
      return createdBOM;
    } catch (error) {
      logger.error('Error creating BOM:', error as Error);
      throw new Error('Error al crear lista de materiales');
    }
  }

  /**
   * Get BOM by ID
   */
  static async getBOMById(id: string): Promise<BillOfMaterials | null> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return null;
      }

      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      } as BillOfMaterials;
    } catch (error) {
      logger.error('Error getting BOM by ID:', error as Error);
      return null;
    }
  }

  /**
   * Get BOMs for finished product
   */
  static async getBOMsForProduct(finishedProductId: string): Promise<BillOfMaterials[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('finishedProductId', '==', finishedProductId),
        where('isActive', '==', true),
        orderBy('version', 'desc')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      })) as BillOfMaterials[];
    } catch (error) {
      logger.error('Error getting BOMs for product:', error as Error);
      return [];
    }
  }

  /**
   * Get active (latest) BOM for finished product
   */
  static async getActiveBOMForProduct(finishedProductId: string): Promise<BillOfMaterials | null> {
    try {
      const boms = await this.getBOMsForProduct(finishedProductId);
      return boms.length > 0 ? boms[0] : null;
    } catch (error) {
      logger.error('Error getting active BOM for product:', error as Error);
      return null;
    }
  }

  /**
   * Update BOM
   */
  static async updateBOM(
    id: string,
    bomData: Partial<Omit<BillOfMaterials, 'id' | 'createdAt' | 'updatedAt'>>,
    updatedBy: string
  ): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const currentBOM = await this.getBOMById(id);
      
      if (!currentBOM) {
        throw new Error('BOM no encontrado');
      }

      // If items are being updated, recalculate costs
      let calculatedData = bomData;
      if (bomData.items) {
        const costs = await this.calculateBOMCosts({
          ...currentBOM,
          ...bomData
        } as BillOfMaterials);
        
        calculatedData = {
          ...bomData,
          ...costs
        };
      }

      const updateData: Record<string, unknown> = {
        ...calculatedData,
        updatedAt: Timestamp.fromDate(new Date()),
        updatedBy
      };

      await updateDoc(docRef, updateData);

      // If material costs changed, update finished product unit cost
      if (calculatedData.totalMaterialCost !== undefined) {
        await FinishedProductCrudService.updateUnitCost(
          currentBOM.finishedProductId,
          calculatedData.totalMaterialCost,
          updatedBy
        );
      }

      logger.info(`BOM updated: ${id}`);
    } catch (error) {
      logger.error('Error updating BOM:', error as Error);
      throw new Error('Error al actualizar lista de materiales');
    }
  }

  /**
   * Deactivate BOM (soft delete)
   */
  static async deactivateBOM(id: string, deactivatedBy: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, {
        isActive: false,
        updatedAt: Timestamp.fromDate(new Date()),
        deactivatedBy
      });

      logger.info(`BOM deactivated: ${id}`);
    } catch (error) {
      logger.error('Error deactivating BOM:', error as Error);
      throw new Error('Error al desactivar lista de materiales');
    }
  }

  /**
   * Calculate total costs for BOM
   */
  private static async calculateBOMCosts(bom: BillOfMaterials): Promise<{
    totalMaterialCost: number;
    totalLaborCost: number;
    totalOverheadCost: number;
    totalCost: number;
  }> {
    // Calculate material costs
    let totalMaterialCost = 0;
    
    for (const item of bom.items) {
      // Get current raw material data to ensure we have latest cost
      const rawMaterial = await RawMaterialCrudService.getRawMaterialById(item.rawMaterialId);
      const unitCost = rawMaterial?.unitCost || item.unitCost;
      totalMaterialCost += item.quantity * unitCost;
    }

    // Calculate labor costs
    const totalLaborCost = bom.estimatedLaborHours * bom.laborCostPerHour;
    
    // Calculate overhead costs
    const totalOverheadCost = totalMaterialCost * (bom.overheadPercentage / 100);
    
    // Calculate total cost
    const totalCost = totalMaterialCost + totalLaborCost + totalOverheadCost;

    return {
      totalMaterialCost,
      totalLaborCost,
      totalOverheadCost,
      totalCost
    };
  }

  /**
   * Validate BOM items (check if raw materials exist and have sufficient stock)
   */
  static async validateBOMItems(items: BOMItem[]): Promise<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
  }> {
    const errors: string[] = [];
    const warnings: string[] = [];

    for (const item of items) {
      const rawMaterial = await RawMaterialCrudService.getRawMaterialById(item.rawMaterialId);
      
      if (!rawMaterial) {
        errors.push(`Material no encontrado: ${item.rawMaterialName}`);
        continue;
      }

      if (!rawMaterial.isActive) {
        warnings.push(`Material inactivo: ${item.rawMaterialName}`);
      }

      if (rawMaterial.currentStock < item.quantity) {
        warnings.push(
          `Stock insuficiente para ${item.rawMaterialName}: disponible ${rawMaterial.currentStock}, requerido ${item.quantity}`
        );
      }

      // Check if unit of measure matches
      if (rawMaterial.unitOfMeasure !== item.unitOfMeasure) {
        warnings.push(
          `Unidad de medida diferente para ${item.rawMaterialName}: material usa ${rawMaterial.unitOfMeasure}, BOM especifica ${item.unitOfMeasure}`
        );
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Calculate production feasibility based on current stock
   */
  static async calculateProductionFeasibility(
    bomId: string,
    quantityToProduce: number
  ): Promise<{
    canProduce: boolean;
    maxQuantityPossible: number;
    missingMaterials: Array<{
      materialId: string;
      materialName: string;
      required: number;
      available: number;
      missing: number;
    }>;
  }> {
    try {
      const bom = await this.getBOMById(bomId);
      if (!bom) {
        throw new Error('BOM no encontrado');
      }

      let canProduce = true;
      let maxQuantityPossible = Infinity;
      const missingMaterials = [];

      for (const item of bom.items) {
        const rawMaterial = await RawMaterialCrudService.getRawMaterialById(item.rawMaterialId);
        if (!rawMaterial) continue;

        const requiredQuantity = item.quantity * quantityToProduce;
        const availableQuantity = rawMaterial.currentStock;

        if (availableQuantity < requiredQuantity) {
          canProduce = false;
          missingMaterials.push({
            materialId: item.rawMaterialId,
            materialName: item.rawMaterialName,
            required: requiredQuantity,
            available: availableQuantity,
            missing: requiredQuantity - availableQuantity
          });
        }

        // Calculate max possible quantity with this material
        const maxWithThisMaterial = Math.floor(availableQuantity / item.quantity);
        maxQuantityPossible = Math.min(maxQuantityPossible, maxWithThisMaterial);
      }

      return {
        canProduce,
        maxQuantityPossible: maxQuantityPossible === Infinity ? 0 : maxQuantityPossible,
        missingMaterials
      };
    } catch (error) {
      logger.error('Error calculating production feasibility:', error as Error);
      throw error;
    }
  }
}