/**
 * ZADIA OS - Quote to Project Conversion Types
 * Tipos para el proceso de conversión de cotizaciones a proyectos
 * Rule #5: Max 200 lines per file
 */

import { Timestamp } from 'firebase/firestore';
import type { WorkOrderMaterial } from './work-order.types';

/**
 * Estado de conversión de Cotización a Proyecto
 * Usado durante el proceso de conversión del QuoteAcceptanceWizard
 */
export interface QuoteToProjectConversion {
  quoteId: string;
  projectId?: string;
  
  // Configuración del Proyecto
  projectConfig: {
    name: string;
    description?: string;
    projectManager: string;
    teamMembers: string[];
    startDate: Timestamp;
    estimatedEndDate: Timestamp;
  };
  
  // Reservas de Inventario
  inventoryReservations: {
    itemId: string;
    itemName: string;
    quantityReserved: number;
    status: 'reserved' | 'pending' | 'failed';
  }[];
  
  // Órdenes de Trabajo
  workOrders: {
    name: string;
    phase: string;
    assignedTo: string;
    materials: WorkOrderMaterial[];
    estimatedHours: number;
  }[];
  
  // Estado
  status: 'preparing' | 'converting' | 'completed' | 'failed';
  error?: string;
  
  // Metadata
  createdAt: Timestamp;
  completedAt?: Timestamp;
}
