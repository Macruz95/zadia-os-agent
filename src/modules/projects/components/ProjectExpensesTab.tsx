/**
 * ZADIA OS - Project Expenses Tab
 * Tab para gestión de gastos del proyecto
 * Rule #4: Modular components
 * Rule #5: Max 200 lines per file
 */

'use client';

import { useState } from 'react';
import { Plus, DollarSign, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useProjectExpenses } from '../hooks/use-project-expenses';
import { ExpensesTable } from './ExpensesTable';
import { AddExpenseDialog } from './AddExpenseDialog';

interface ProjectExpensesTabProps {
  projectId: string;
  userId: string;
  userRole: string;
}

export function ProjectExpensesTab({
  projectId,
  userId,
  userRole,
}: ProjectExpensesTabProps) {
  const {
    expenses,
    loading,
    totalExpenses,
    expensesByCategory,
    approveExpenseHandler,
  } = useProjectExpenses(projectId);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const isAdmin = userRole === 'admin' || userRole === 'manager';

  const handleApprove = async (expenseId: string) => {
    await approveExpenseHandler(expenseId, {
      approved: true,
      approvedBy: userId,
    });
  };

  const handleReject = async (expenseId: string) => {
    await approveExpenseHandler(expenseId, {
      approved: false,
      approvedBy: userId,
      rejectionReason: 'Rechazado',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Gastos del Proyecto</span>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Registrar Gasto
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Total Gastos */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Total Gastos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${totalExpenses.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </div>
              </CardContent>
            </Card>

            {/* Materiales */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Materiales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${(expensesByCategory.materials || 0).toLocaleString('es-MX', {
                    minimumFractionDigits: 2,
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Mano de Obra */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Mano de Obra</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${(expensesByCategory.labor || 0).toLocaleString('es-MX', {
                    minimumFractionDigits: 2,
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Otros Gastos */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Otros
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${((expensesByCategory.equipment || 0) +
                    (expensesByCategory.transport || 0) +
                    (expensesByCategory.overhead || 0) +
                    (expensesByCategory.other || 0)
                  ).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Expenses Table */}
      <ExpensesTable
        expenses={expenses}
        loading={loading}
        isAdmin={isAdmin}
        onApprove={handleApprove}
        onReject={handleReject}
      />

      {/* Add Expense Dialog */}
      <AddExpenseDialog
        projectId={projectId}
        userId={userId}
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
      />
    </div>
  );
}
