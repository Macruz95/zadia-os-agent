// src/modules/finance/components/InvoicesList.tsx

'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  FileText,
  DollarSign,
  Calendar,
  AlertCircle,
  Eye,
  CheckCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { INVOICE_STATUS_CONFIG } from '../types/finance.types';
import type { Invoice } from '../types/finance.types';

interface InvoicesListProps {
  invoices: Invoice[];
  loading?: boolean;
  onViewInvoice: (invoiceId: string) => void;
  onRecordPayment: (invoice: Invoice) => void;
}

/**
 * Lista de facturas con tabla y acciones
 */
export function InvoicesList({
  invoices,
  loading,
  onViewInvoice,
  onRecordPayment,
}: InvoicesListProps) {
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (invoices.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No hay facturas</h3>
          <p className="text-sm text-muted-foreground">
            Las facturas aparecerán aquí una vez creadas
          </p>
        </CardContent>
      </Card>
    );
  }

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(amount);
  };

  const isOverdue = (invoice: Invoice) => {
    return (
      invoice.status !== 'paid' &&
      invoice.status !== 'cancelled' &&
      invoice.dueDate.toDate() < new Date()
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Facturas</CardTitle>
        <CardDescription>
          {invoices.length} factura{invoices.length !== 1 ? 's' : ''}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Número</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha Emisión</TableHead>
                <TableHead>Vencimiento</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Pagado</TableHead>
                <TableHead className="text-right">Por Pagar</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => {
                const statusConfig = INVOICE_STATUS_CONFIG[invoice.status];
                const overdue = isOverdue(invoice);

                return (
                  <TableRow
                    key={invoice.id}
                    onMouseEnter={() => setHoveredRow(invoice.id)}
                    onMouseLeave={() => setHoveredRow(null)}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => onViewInvoice(invoice.id)}
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        {invoice.number}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{invoice.clientName}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            statusConfig.color as
                              | 'default'
                              | 'secondary'
                              | 'destructive'
                              | 'outline'
                          }
                        >
                          {statusConfig.label}
                        </Badge>
                        {overdue && (
                          <AlertCircle className="h-4 w-4 text-destructive" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                        {format(invoice.issueDate.toDate(), 'dd MMM yyyy', {
                          locale: es,
                        })}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div
                        className={`flex items-center gap-2 text-sm ${
                          overdue ? 'text-destructive font-medium' : ''
                        }`}
                      >
                        <Calendar className="h-3.5 w-3.5" />
                        {format(invoice.dueDate.toDate(), 'dd MMM yyyy', {
                          locale: es,
                        })}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(invoice.total, invoice.currency)}
                    </TableCell>
                    <TableCell className="text-right text-green-600">
                      {formatCurrency(invoice.amountPaid, invoice.currency)}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      <div
                        className={
                          invoice.amountDue > 0
                            ? 'text-orange-600'
                            : 'text-muted-foreground'
                        }
                      >
                        {formatCurrency(invoice.amountDue, invoice.currency)}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div
                        className="flex items-center justify-end gap-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {hoveredRow === invoice.id && (
                          <>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => onViewInvoice(invoice.id)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {invoice.status !== 'paid' &&
                              invoice.status !== 'cancelled' && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => onRecordPayment(invoice)}
                                >
                                  <DollarSign className="h-4 w-4" />
                                </Button>
                              )}
                            {invoice.status === 'partially-paid' && (
                              <Badge
                                variant="outline"
                                className="text-xs font-normal"
                              >
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Pago Parcial
                              </Badge>
                            )}
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
