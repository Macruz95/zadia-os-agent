/**
 * ZADIA OS - Use Project Expenses Hook
 * Hook para gestionar gastos del proyecto
 * Rule #4: Modular React hooks
 * Rule #5: Max 200 lines per file
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';
import type { ProjectExpense } from '../types/projects.types';
import {
  createExpense,
  updateExpense,
  approveExpense,
  deleteExpense,
} from '../services/helpers/project-expenses.service';
import type {
  CreateExpenseInput,
  UpdateExpenseInput,
  ApproveExpenseInput,
} from '../validations/project-extensions.validation';

interface UseProjectExpensesReturn {
  expenses: ProjectExpense[];
  loading: boolean;
  error: string | null;
  addExpense: (data: CreateExpenseInput) => Promise<string>;
  editExpense: (expenseId: string, data: UpdateExpenseInput) => Promise<void>;
  approveExpenseHandler: (expenseId: string, data: ApproveExpenseInput) => Promise<void>;
  removeExpense: (expenseId: string) => Promise<void>;
  totalExpenses: number;
  expensesByCategory: Record<string, number>;
  pendingExpenses: ProjectExpense[];
  approvedExpenses: ProjectExpense[];
}

/**
 * Hook para gestionar gastos de un proyecto
 */
export function useProjectExpenses(projectId: string): UseProjectExpensesReturn {
  const [expenses, setExpenses] = useState<ProjectExpense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Real-time listener para gastos del proyecto
  useEffect(() => {
    if (!projectId) return;

    const q = query(
      collection(db, 'projectExpenses'),
      where('projectId', '==', projectId)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const expensesData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as ProjectExpense[];

        // Ordenar por fecha más reciente
        expensesData.sort((a, b) => 
          b.expenseDate.toMillis() - a.expenseDate.toMillis()
        );

        setExpenses(expensesData);
        setLoading(false);
        setError(null);
      },
      (err) => {
        logger.error('Error listening to expenses', err);
        setError('Error al cargar gastos');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [projectId]);

  // Calcular total de gastos aprobados
  const totalExpenses = expenses
    .filter(e => e.status === 'approved')
    .reduce((acc, expense) => acc + expense.amount, 0);

  // Gastos por categoría (solo aprobados)
  const expensesByCategory = expenses
    .filter(e => e.status === 'approved')
    .reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);

  // Filtros útiles
  const pendingExpenses = expenses.filter(e => e.status === 'pending');
  const approvedExpenses = expenses.filter(e => e.status === 'approved');

  // Crear gasto
  const addExpense = useCallback(
    async (data: CreateExpenseInput): Promise<string> => {
      try {
        const expenseId = await createExpense(data);
        toast.success('Gasto registrado exitosamente');
        return expenseId;
      } catch (err) {
        logger.error('Error creating expense', err as Error);
        toast.error('Error al crear gasto');
        throw err;
      }
    },
    []
  );

  // Actualizar gasto
  const editExpense = useCallback(
    async (expenseId: string, data: UpdateExpenseInput) => {
      try {
        await updateExpense(expenseId, data);
        toast.success('Gasto actualizado');
      } catch (err) {
        logger.error('Error updating expense', err as Error);
        toast.error('Error al actualizar gasto');
        throw err;
      }
    },
    []
  );

  // Aprobar/Rechazar gasto
  const approveExpenseHandler = useCallback(
    async (expenseId: string, data: ApproveExpenseInput) => {
      try {
        await approveExpense(expenseId, data);
        toast.success(
          data.approved ? 'Gasto aprobado' : 'Gasto rechazado'
        );
      } catch (err) {
        logger.error('Error approving expense', err as Error);
        toast.error('Error al procesar aprobación');
        throw err;
      }
    },
    []
  );

  // Eliminar gasto
  const removeExpense = useCallback(
    async (expenseId: string) => {
      try {
        await deleteExpense(expenseId);
        toast.success('Gasto eliminado');
      } catch (err) {
        logger.error('Error deleting expense', err as Error);
        toast.error('Error al eliminar gasto');
        throw err;
      }
    },
    []
  );

  return {
    expenses,
    loading,
    error,
    addExpense,
    editExpense,
    approveExpenseHandler,
    removeExpense,
    totalExpenses,
    expensesByCategory,
    pendingExpenses,
    approvedExpenses,
  };
}
