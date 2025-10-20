/**
 * ZADIA OS - BOM Service (Facade)
 * Manages Bill of Materials with proper separation of concerns
 * Rule #5: Max 200 lines per file
 */

// CRUD Operations
export {
  createBOM,
  getBOMById,
  updateBOM,
  deleteBOM
} from './helpers/bom-crud.service';

// Search Operations
export {
  getBOMsByProductId,
  getAllBOMs,
  getActiveBOMForProduct
} from './helpers/bom-search.service';

// Validation & Feasibility
export {
  getProductionFeasibility,
  validateBOMItems
} from './helpers/bom-validation.service';

// Re-export helper services for direct access
export { BOMCostCalculator } from './bom-cost-calculator.service';
export { BOMProductionValidator } from './bom-production-validator.service';
export type { ProductionFeasibility } from './bom-production-validator.service';

/**
 * BOMService Class - Backward Compatibility
 */
import * as BOMCRUD from './helpers/bom-crud.service';
import * as BOMSearch from './helpers/bom-search.service';
import * as BOMValidation from './helpers/bom-validation.service';

export class BOMService {
  // CRUD Operations
  static createBOM = BOMCRUD.createBOM;
  static getBOMById = BOMCRUD.getBOMById;
  static updateBOM = BOMCRUD.updateBOM;
  static deleteBOM = BOMCRUD.deleteBOM;
  static deactivateBOM = BOMCRUD.deleteBOM; // Alias

  // Search Operations
  static getBOMsByProductId = BOMSearch.getBOMsByProductId;
  static getAllBOMs = BOMSearch.getAllBOMs;
  static getActiveBOMForProduct = BOMSearch.getActiveBOMForProduct;
  static getBOMsForProduct = BOMSearch.getBOMsByProductId; // Alias

  // Validation & Feasibility
  static getProductionFeasibility = BOMValidation.getProductionFeasibility;
  static calculateProductionFeasibility = BOMValidation.getProductionFeasibility; // Alias
  static validateBOMItems = BOMValidation.validateBOMItems;
}
