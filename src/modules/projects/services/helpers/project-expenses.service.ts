/**
 * ZADIA OS - Project Expenses Service
 * Gestión de gastos del proyecto
 * Rule #1: Real Firebase operations
 * Rule #3: Zod validation
 * Rule #5: Max 200 lines per file
 */

import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
  serverTimestamp,
  runTransaction,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { logger } from '@/lib/logger';
import type { ProjectExpense } from '../../types/projects.types';
import {
  createExpenseSchema,
  updateExpenseSchema,
  approveExpenseSchema,
  type CreateExpenseInput,
  type UpdateExpenseInput,
  type ApproveExpenseInput,
} from '../../validations/project-extensions.validation';

const EXPENSES_COLLECTION = 'projectExpenses';
const PROJECTS_COLLECTION = 'projects';

/**
 * Crear gasto
 */
export async function createExpense(
  data: CreateExpenseInput
): Promise<string> {
  try {
    // Validar con Zod
    const validated = createExpenseSchema.parse(data);

    const expenseData = {
      projectId: validated.projectId,
      description: validated.description,
      category: validated.category,
      amount: validated.amount,
      currency: validated.currency,
      status: 'pending' as const,
      approvedBy: null,
      approvedAt: null,
      rejectionReason: null,
      receiptUrl: validated.receiptUrl || null,
      receiptFileName: validated.receiptFileName || null,
      expenseDate: Timestamp.fromDate(validated.expenseDate),
      createdBy: validated.createdBy,
      createdByName: validated.createdByName,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(
      collection(db, EXPENSES_COLLECTION),
      expenseData
    );

    logger.info('Expense created', {
      component: 'ExpensesService',
      action: 'create',
      metadata: { expenseId: docRef.id, projectId: validated.projectId },
    });

    return docRef.id;
  } catch (error) {
    logger.error('Error creating expense', error as Error, {
      component: 'ExpensesService',
      action: 'create',
    });
    throw new Error('Error al crear gasto');
  }
}

/**
 * Actualizar gasto
 */
export async function updateExpense(
  expenseId: string,
  data: UpdateExpenseInput
): Promise<void> {
  try {
    // Validar con Zod
    const validated = updateExpenseSchema.parse(data);

    const updateData: Record<string, unknown> = {
      ...validated,
      updatedAt: serverTimestamp(),
    };

    if (validated.expenseDate) {
      updateData.expenseDate = Timestamp.fromDate(validated.expenseDate);
    }

    await updateDoc(doc(db, EXPENSES_COLLECTION, expenseId), updateData);

    logger.info('Expense updated', {
      component: 'ExpensesService',
      action: 'update',
      metadata: { expenseId },
    });
  } catch (error) {
    logger.error('Error updating expense', error as Error, {
      component: 'ExpensesService',
      action: 'update',
    });
    throw new Error('Error al actualizar gasto');
  }
}

/**
 * Aprobar o rechazar gasto
 * Actualiza el costo actual del proyecto si se aprueba
 */
export async function approveExpense(
  expenseId: string,
  data: ApproveExpenseInput
): Promise<void> {
  try {
    // Validar con Zod
    const validated = approveExpenseSchema.parse(data);

    await runTransaction(db, async (transaction) => {
      const expenseRef = doc(db, EXPENSES_COLLECTION, expenseId);
      const expenseSnap = await transaction.get(expenseRef);

      if (!expenseSnap.exists()) {
        throw new Error('Gasto no encontrado');
      }

      const expense = expenseSnap.data() as ProjectExpense;

      // Actualizar estado del gasto
      transaction.update(expenseRef, {
        status: validated.approved ? 'approved' : 'rejected',
        approvedBy: validated.approvedBy,
        approvedAt: serverTimestamp(),
        rejectionReason: validated.rejectionReason || null,
        updatedAt: serverTimestamp(),
      });

      // Si se aprueba, actualizar el costo del proyecto
      if (validated.approved) {
        const projectRef = doc(db, PROJECTS_COLLECTION, expense.projectId);
        const projectSnap = await transaction.get(projectRef);

        if (projectSnap.exists()) {
          const project = projectSnap.data();
          const currentCost = project.actualCost || 0;

          // Actualizar costo según categoría
          const updates: Record<string, unknown> = {
            actualCost: currentCost + expense.amount,
            updatedAt: serverTimestamp(),
          };

          if (expense.category === 'materials') {
            updates.materialsCost = (project.materialsCost || 0) + expense.amount;
          } else if (expense.category === 'labor') {
            updates.laborCost = (project.laborCost || 0) + expense.amount;
          } else {
            updates.overheadCost = (project.overheadCost || 0) + expense.amount;
          }

          transaction.update(projectRef, updates);
        }
      }
    });

    logger.info('Expense approval updated', {
      component: 'ExpensesService',
      action: 'approve',
      metadata: { expenseId, approved: validated.approved },
    });
  } catch (error) {
    logger.error('Error approving expense', error as Error, {
      component: 'ExpensesService',
      action: 'approve',
    });
    throw new Error('Error al aprobar/rechazar gasto');
  }
}

/**
 * Obtener gastos de un proyecto
 */
export async function getProjectExpenses(
  projectId: string
): Promise<ProjectExpense[]> {
  try {
    const q = query(
      collection(db, EXPENSES_COLLECTION),
      where('projectId', '==', projectId),
      orderBy('expenseDate', 'desc')
    );

    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as ProjectExpense[];
  } catch (error) {
    logger.error('Error fetching project expenses', error as Error, {
      component: 'ExpensesService',
      action: 'getProjectExpenses',
    });
    throw new Error('Error al obtener gastos del proyecto');
  }
}

/**
 * Eliminar gasto
 */
export async function deleteExpense(expenseId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, EXPENSES_COLLECTION, expenseId));

    logger.info('Expense deleted', {
      component: 'ExpensesService',
      action: 'delete',
      metadata: { expenseId },
    });
  } catch (error) {
    logger.error('Error deleting expense', error as Error, {
      component: 'ExpensesService',
      action: 'delete',
    });
    throw new Error('Error al eliminar gasto');
  }
}
