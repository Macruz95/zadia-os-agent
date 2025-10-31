/**
 * ZADIA OS - Expenses Table Component
 * Tabla de gastos del proyecto con aprobación
 * Rule #5: Max 200 lines per file
 */

'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, ExternalLink } from 'lucide-react';
import type { ProjectExpense } from '../types/projects.types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface ExpensesTableProps {
  expenses: ProjectExpense[];
  loading: boolean;
  isAdmin: boolean;
  onApprove: (expenseId: string) => void;
  onReject: (expenseId: string) => void;
}

const categoryLabels: Record<string, string> = {
  materials: 'Materiales',
  labor: 'Mano de Obra',
  equipment: 'Equipo',
  transport: 'Transporte',
  overhead: 'Gastos Generales',
  other: 'Otros',
};

const statusColors = {
  pending: 'bg-yellow-500',
  approved: 'bg-green-500',
  rejected: 'bg-red-500',
  paid: 'bg-blue-500',
};

const statusLabels = {
  pending: 'Pendiente',
  approved: 'Aprobado',
  rejected: 'Rechazado',
  paid: 'Pagado',
};

export function ExpensesTable({
  expenses,
  loading,
  isAdmin,
  onApprove,
  onReject,
}: ExpensesTableProps) {
  if (loading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Cargando gastos...
      </div>
    );
  }

  if (expenses.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No hay gastos registrados
      </div>
    );
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Fecha</TableHead>
            <TableHead>Descripción</TableHead>
            <TableHead>Categoría</TableHead>
            <TableHead>Monto</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Creado Por</TableHead>
            <TableHead>Comprobante</TableHead>
            {isAdmin && <TableHead className="w-[120px]">Acciones</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {expenses.map((expense) => (
            <TableRow key={expense.id}>
              <TableCell className="whitespace-nowrap">
                {format(expense.expenseDate.toDate(), 'dd MMM yyyy', {
                  locale: es,
                })}
              </TableCell>
              <TableCell>
                <div className="max-w-[300px]">
                  <p className="font-medium truncate">{expense.description}</p>
                  {expense.rejectionReason && (
                    <p className="text-xs text-muted-foreground truncate">
                      {expense.rejectionReason}
                    </p>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline">
                  {categoryLabels[expense.category] || expense.category}
                </Badge>
              </TableCell>
              <TableCell className="font-semibold">
                {expense.currency} ${expense.amount.toLocaleString('es-MX', {
                  minimumFractionDigits: 2,
                })}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${statusColors[expense.status]}`} />
                  <span className="text-sm">
                    {statusLabels[expense.status]}
                  </span>
                </div>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {expense.createdByName}
              </TableCell>
              <TableCell>
                {expense.receiptUrl ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                  >
                    <a
                      href={expense.receiptUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Ver
                    </a>
                  </Button>
                ) : (
                  <span className="text-xs text-muted-foreground">-</span>
                )}
              </TableCell>
              {isAdmin && (
                <TableCell>
                  {expense.status === 'pending' && (
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onApprove(expense.id)}
                        title="Aprobar"
                      >
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onReject(expense.id)}
                        title="Rechazar"
                      >
                        <XCircle className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  )}
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
