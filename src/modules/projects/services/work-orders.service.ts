/**
 * ZADIA OS - Work Orders Service (Facade)
 * Gestión de órdenes de trabajo en proyectos
 * Rule #5: Modular architecture - Main facade
 */

// CRUD Operations
export {
  createWorkOrder,
  getWorkOrderById,
  getWorkOrdersByProject,
  updateWorkOrder,
} from './work-orders/work-order-crud.service';

// Status Management
export {
  changeStatus,
  updateProgress,
} from './work-orders/work-order-status.service';

// Materials Management
export { recordMaterialConsumption } from './work-orders/work-order-materials.service';

// Labor Management
export { recordLaborHours } from './work-orders/work-order-labor.service';

/**
 * Legacy object-style export for backward compatibility
 */
import * as crud from './work-orders/work-order-crud.service';
import * as status from './work-orders/work-order-status.service';
import * as materials from './work-orders/work-order-materials.service';
import * as labor from './work-orders/work-order-labor.service';

export const WorkOrdersService = {
  // CRUD
  createWorkOrder: crud.createWorkOrder,
  getWorkOrderById: crud.getWorkOrderById,
  getWorkOrdersByProject: crud.getWorkOrdersByProject,
  updateWorkOrder: crud.updateWorkOrder,
  // Status
  changeStatus: status.changeStatus,
  updateProgress: status.updateProgress,
  // Materials
  recordMaterialConsumption: materials.recordMaterialConsumption,
  // Labor
  recordLaborHours: labor.recordLaborHours,
};
