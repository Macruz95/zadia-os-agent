/**
 * ZADIA OS - Orders Service (Facade)
 * Gestión de pedidos de venta
 * Rule #5: Modular architecture - Main facade
 */

// CRUD Operations
export {
  createOrder,
  getOrderById,
  updateOrder,
} from './helpers/order-crud.service';

// Search & Filters
export { searchOrders } from './helpers/order-search.service';

// Status Management
export {
  updateOrderStatus,
  addTracking,
  cancelOrder,
} from './helpers/order-status.service';

// Statistics
export { getOrderStats } from './helpers/order-stats.service';

// Utilities
export { generateOrderNumber } from './helpers/order-utils.service';

/**
 * Legacy object-style export for backward compatibility
 */
import * as crud from './helpers/order-crud.service';
import * as search from './helpers/order-search.service';
import * as status from './helpers/order-status.service';
import * as stats from './helpers/order-stats.service';
import * as utils from './helpers/order-utils.service';

export const OrdersService = {
  // CRUD
  createOrder: crud.createOrder,
  getOrderById: crud.getOrderById,
  updateOrder: crud.updateOrder,
  // Search
  searchOrders: search.searchOrders,
  // Status
  updateOrderStatus: status.updateOrderStatus,
  addTracking: status.addTracking,
  cancelOrder: status.cancelOrder,
  // Stats
  getOrderStats: stats.getOrderStats,
  // Utils
  generateOrderNumber: utils.generateOrderNumber,
};
