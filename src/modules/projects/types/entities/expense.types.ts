/**
 * ZADIA OS - Project Expense Entity Types
 * Gestión de gastos del proyecto
 * Rule #5: Max 200 lines per file
 */

import { Timestamp } from 'firebase/firestore';

/**
 * Categoría de gasto
 */
export type ExpenseCategory = 
  | 'materials'
  | 'labor'
  | 'overhead'
  | 'equipment'
  | 'transport'
  | 'subcontractor'
  | 'other';

/**
 * Estado del gasto
 */
export type ExpenseStatus = 
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'paid';

/**
 * Gasto del Proyecto
 */
export interface ProjectExpense {
  id: string;
  projectId: string;
  
  // Descripción
  description: string;
  category: ExpenseCategory;
  
  // Monto
  amount: number;
  currency: string;
  
  // Estado
  status: ExpenseStatus;
  
  // Aprobación
  approvedBy?: string;
  approvedAt?: Timestamp;
  rejectionReason?: string;
  
  // Comprobante
  receiptUrl?: string;
  receiptFileName?: string;
  
  // Fecha del gasto
  expenseDate: Timestamp;
  
  // Tracking
  createdBy: string;
  createdByName: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * Input para crear gasto
 */
export interface CreateExpenseInput {
  projectId: string;
  description: string;
  category: ExpenseCategory;
  amount: number;
  currency?: string;
  expenseDate: Date;
  receiptUrl?: string;
  receiptFileName?: string;
  createdBy: string;
  createdByName: string;
}

/**
 * Input para actualizar gasto
 */
export interface UpdateExpenseInput {
  description?: string;
  category?: ExpenseCategory;
  amount?: number;
  expenseDate?: Date;
  receiptUrl?: string;
  receiptFileName?: string;
}

/**
 * Input para aprobar/rechazar gasto
 */
export interface ApproveExpenseInput {
  approved: boolean;
  approvedBy: string;
  rejectionReason?: string;
}
