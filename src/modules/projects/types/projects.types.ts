/**
 * ZADIA OS - Projects Types (Facade)
 * Punto de entrada unificado para todos los tipos del módulo
 * Rule #5: Modular architecture - Main facade
 */

// ============================================
// ENTITIES
// ============================================

// Project
export type {
  ProjectStatus,
  ProjectPriority,
  Project,
  CreateProjectData,
  UpdateProjectData,
  ProjectSearchParams,
  ProjectKPIs,
} from './entities/project.types';

// Work Orders
export type {
  WorkOrderStatus,
  WorkOrderMaterial,
  WorkOrder,
  CreateWorkOrderData,
  UpdateWorkOrderData,
} from './entities/work-order.types';

// Tasks
export type {
  TaskStatus,
  ProjectTask,
  CreateTaskData,
  UpdateTaskData,
} from './entities/task.types';

// Expenses
export type {
  ExpenseCategory,
  ExpenseStatus,
  ProjectExpense,
  CreateExpenseInput,
  UpdateExpenseInput,
  ApproveExpenseInput,
} from './entities/expense.types';

// Documents
export type {
  DocumentType,
  ProjectDocument,
  CreateDocumentInput,
  UpdateDocumentInput,
} from './entities/document.types';

// Timeline & Tracking
export type {
  ProjectTimelineEventType,
  ProjectTimelineEntry,
  WorkSession,
} from './entities/timeline.types';

// Conversion
export type {
  QuoteToProjectConversion,
} from './entities/conversion.types';

// ============================================
// UI STATES
// ============================================

export type {
  ProjectDirectoryState,
  ProjectProfileState,
  ProjectFilters,
} from './ui/state.types';

// ============================================
// UI CONFIG
// ============================================

export {
  PROJECT_STATUS_CONFIG,
  PROJECT_PRIORITY_CONFIG,
  WORK_ORDER_STATUS_CONFIG,
  TASK_STATUS_CONFIG,
} from './ui/config.types';
