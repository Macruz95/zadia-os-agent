// src/app/(main)/finance/invoices/page.tsx

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  FileText,
  DollarSign,
  AlertCircle,
  TrendingUp,
  Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { InvoicesList } from '@/modules/finance/components/InvoicesList';
import { PaymentFormDialog } from '@/modules/finance/components/PaymentFormDialog';
import { useInvoices } from '@/modules/finance/hooks/use-invoices';
import { usePayments } from '@/modules/finance/hooks/use-payments';
import { useAuth } from '@/contexts/AuthContext';
import type {
  Invoice,
  InvoiceStatus,
  PaymentMethod,
} from '@/modules/finance/types/finance.types';
import type { Timestamp } from 'firebase/firestore';

/**
 * Página principal de Facturas
 * Muestra lista de facturas, estadísticas y diálogo de pagos
 */
export default function InvoicesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | 'all'>(
    'all'
  );
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);

  // Hook de facturas con filtro
  const filters =
    statusFilter !== 'all' ? { status: statusFilter } : {};
  const { invoices, stats, loading, fetchInvoices } = useInvoices(filters);

  // Hook de pagos
  const { createPayment } = usePayments();

  const handleViewInvoice = (invoiceId: string) => {
    router.push(`/finance/invoices/${invoiceId}`);
  };

  const handleRecordPayment = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setPaymentDialogOpen(true);
  };

  const handlePaymentSubmit = async (paymentData: {
    amount: number;
    method: PaymentMethod;
    reference?: string;
    notes?: string;
    paymentDate: Date;
  }) => {
    if (!selectedInvoice || !user) return;

    await createPayment({
      invoiceId: selectedInvoice.id,
      invoiceNumber: selectedInvoice.number,
      clientId: selectedInvoice.clientId,
      clientName: selectedInvoice.clientName,
      amount: paymentData.amount,
      currency: selectedInvoice.currency,
      method: paymentData.method,
      status: 'completed',
      reference: paymentData.reference,
      notes: paymentData.notes,
      paymentDate: paymentData.paymentDate,
      recordedBy: user.uid,
      recordedByName: user.displayName || user.email || 'Usuario',
    });

    // Refrescar lista
    fetchInvoices();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Filtrar facturas por estado
  const filteredInvoices =
    statusFilter === 'all'
      ? invoices
      : invoices.filter((inv) => inv.status === statusFilter);

  // Contar facturas vencidas
  const overdueCount = invoices.filter((inv) => {
    return (
      inv.status !== 'paid' &&
      inv.status !== 'cancelled' &&
      (inv.dueDate as Timestamp).toDate() < new Date()
    );
  }).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Facturas</h1>
          <p className="text-muted-foreground">
            Gestiona facturas y pagos de clientes
          </p>
        </div>
        <Button onClick={() => router.push('/finance/invoices/new')}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Factura
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Facturado
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(stats.totalBilled)}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.totalInvoices} facturas emitidas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Cobrado
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(stats.totalPaid)}
              </div>
              <p className="text-xs text-muted-foreground">
                {((stats.totalPaid / stats.totalBilled) * 100).toFixed(1)}% del
                total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Por Cobrar
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {formatCurrency(stats.totalDue)}
              </div>
              <p className="text-xs text-muted-foreground">
                Saldo pendiente de pago
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vencidas</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">
                {stats.overdueInvoices}
              </div>
              <p className="text-xs text-muted-foreground">
                {formatCurrency(stats.overdueAmount)} vencido
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs Filter */}
      <Tabs
        value={statusFilter}
        onValueChange={(v) => setStatusFilter(v as InvoiceStatus | 'all')}
      >
        <TabsList>
          <TabsTrigger value="all">
            Todas ({invoices.length})
          </TabsTrigger>
          <TabsTrigger value="draft">Borradores</TabsTrigger>
          <TabsTrigger value="sent">Enviadas</TabsTrigger>
          <TabsTrigger value="partially-paid">Pago Parcial</TabsTrigger>
          <TabsTrigger value="paid">Pagadas</TabsTrigger>
          {overdueCount > 0 && (
            <TabsTrigger value="overdue" className="text-destructive">
              Vencidas ({overdueCount})
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value={statusFilter} className="mt-6">
          <InvoicesList
            invoices={filteredInvoices}
            loading={loading}
            onViewInvoice={handleViewInvoice}
            onRecordPayment={handleRecordPayment}
          />
        </TabsContent>
      </Tabs>

      {/* Payment Dialog */}
      <PaymentFormDialog
        invoice={selectedInvoice}
        open={paymentDialogOpen}
        onOpenChange={setPaymentDialogOpen}
        onSubmit={handlePaymentSubmit}
      />
    </div>
  );
}
