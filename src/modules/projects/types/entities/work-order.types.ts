/**
 * ZADIA OS - Work Order Entity Types
 * Tipos de órdenes de trabajo
 * Rule #5: Max 200 lines per file
 */

import { Timestamp } from 'firebase/firestore';

/**
 * Estado de Orden de Trabajo
 */
export type WorkOrderStatus = 
  | 'pending'         // Pendiente
  | 'in-progress'     // En Proceso
  | 'paused'          // Pausado
  | 'completed'       // Completado
  | 'cancelled';      // Cancelado

/**
 * Material usado en Orden de Trabajo
 */
export interface WorkOrderMaterial {
  rawMaterialId: string;
  rawMaterialName: string;
  quantityRequired: number;
  quantityUsed: number;
  unitOfMeasure: string;
  unitCost: number;
  totalCost: number;
}

/**
 * Orden de Trabajo - Fases de producción
 * Representa una fase específica dentro de la ejecución del proyecto
 */
export interface WorkOrder {
  id: string;
  projectId: string;
  
  // Información
  name: string;                    // Ej: "Corte de madera"
  description?: string;
  phase: string;                   // Ej: "Producción", "Acabado"
  status: WorkOrderStatus;
  
  // Responsable
  assignedTo: string;              // UID del responsable
  
  // Fechas
  estimatedStartDate?: Timestamp;
  estimatedEndDate?: Timestamp;
  actualStartDate?: Timestamp;
  actualEndDate?: Timestamp;
  
  // Progreso
  progressPercent: number;
  
  // Materiales (referencia a inventario)
  materials: WorkOrderMaterial[];
  
  // Mano de obra
  laborHours: number;              // Horas trabajadas
  laborCostPerHour: number;
  
  // Costos
  estimatedCost: number;
  actualCost: number;
  
  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
}

/**
 * Datos para crear una orden de trabajo
 */
export type CreateWorkOrderData = Omit<
  WorkOrder,
  'id' | 'createdAt' | 'updatedAt' | 'actualCost' | 'laborHours' | 'progressPercent'
>;

/**
 * Datos para actualizar una orden de trabajo
 */
export type UpdateWorkOrderData = Partial<
  Omit<WorkOrder, 'id' | 'projectId' | 'createdAt' | 'createdBy'>
>;
