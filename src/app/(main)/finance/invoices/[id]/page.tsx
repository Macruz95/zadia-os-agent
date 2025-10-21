// src/app/(main)/finance/invoices/[id]/page.tsx

'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  ArrowLeft,
  Calendar,
  User,
  DollarSign,
  Download,
  History,
  Mail,
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
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PaymentFormDialog } from '@/modules/finance/components/PaymentFormDialog';
import { SendInvoiceEmailDialog } from '@/modules/finance/components/invoices/SendInvoiceEmailDialog';
import { InvoicesService } from '@/modules/finance/services/invoices.service';
import { InvoicesPDFService } from '@/modules/finance/services/invoices-pdf.service';
import { usePayments } from '@/modules/finance/hooks/use-payments';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import {
  INVOICE_STATUS_CONFIG,
  PAYMENT_METHOD_CONFIG,
} from '@/modules/finance/types/finance.types';
import type {
  Invoice,
  PaymentMethod,
} from '@/modules/finance/types/finance.types';

interface PageProps {
  params: Promise<{ id: string }>;
}

/**
 * Página de detalles de factura
 * Muestra información completa, items y historial de pagos
 */
export default function InvoiceDetailsPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);

  const { payments, loading: paymentsLoading, fetchPaymentsByInvoice, createPayment } = usePayments(id);

  // PDF Download Handler
  const handleDownloadPDF = async () => {
    if (!invoice) return;
    
    try {
      await InvoicesPDFService.downloadInvoicePDF(invoice);
      toast.success('PDF descargado correctamente');
    } catch {
      toast.error('Error al generar PDF');
    }
  };

  // Email Handler
  const handleSendEmail = () => {
    setEmailDialogOpen(true);
  };

  useEffect(() => {
    loadInvoice();
  }, [id]);

  const loadInvoice = async () => {
    try {
      setLoading(true);
      const data = await InvoicesService.getInvoiceById(id);
      setInvoice(data);
    } catch {
      router.push('/finance/invoices');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSubmit = async (paymentData: {
    amount: number;
    method: PaymentMethod;
    reference?: string;
    notes?: string;
    paymentDate: Date;
  }) => {
    if (!invoice || !user) return;

    await createPayment({
      invoiceId: invoice.id,
      invoiceNumber: invoice.number,
      clientId: invoice.clientId,
      clientName: invoice.clientName,
      amount: paymentData.amount,
      currency: invoice.currency,
      method: paymentData.method,
      status: 'completed',
      reference: paymentData.reference,
      notes: paymentData.notes,
      paymentDate: paymentData.paymentDate,
      recordedBy: user.uid,
      recordedByName: user.displayName || user.email || 'Usuario',
    });

    // Recargar factura y pagos
    loadInvoice();
    fetchPaymentsByInvoice(id);
  };

  const formatCurrency = (amount: number) => {
    if (!invoice) return '';
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: invoice.currency,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (!invoice) {
    return null;
  }

  const statusConfig = INVOICE_STATUS_CONFIG[invoice.status];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{invoice.number}</h1>
            <p className="text-muted-foreground">Factura</p>
          </div>
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
        </div>
        <div className="flex items-center gap-2">
          {invoice.status !== 'paid' && invoice.status !== 'cancelled' && (
            <Button onClick={() => setPaymentDialogOpen(true)}>
              <DollarSign className="h-4 w-4 mr-2" />
              Registrar Pago
            </Button>
          )}
          <Button variant="outline" onClick={handleDownloadPDF}>
            <Download className="h-4 w-4 mr-2" />
            Descargar PDF
          </Button>
          <Button variant="outline" onClick={handleSendEmail}>
            <Mail className="h-4 w-4 mr-2" />
            Enviar Email
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Invoice Info */}
          <Card>
            <CardHeader>
              <CardTitle>Información de la Factura</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Cliente</p>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <p className="font-medium">{invoice.clientName}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Fecha de Emisión</p>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <p>{format(invoice.issueDate.toDate(), 'dd MMM yyyy', { locale: es })}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Vencimiento</p>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <p>{format(invoice.dueDate.toDate(), 'dd MMM yyyy', { locale: es })}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Términos de Pago</p>
                  <p>{invoice.paymentTerms}</p>
                </div>
              </div>

              {invoice.notes && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Notas</p>
                    <p className="text-sm">{invoice.notes}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Items Table */}
          <Card>
            <CardHeader>
              <CardTitle>Ítems</CardTitle>
              <CardDescription>{invoice.items.length} ítem(s)</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Descripción</TableHead>
                    <TableHead className="text-right">Cantidad</TableHead>
                    <TableHead className="text-right">Precio Unit.</TableHead>
                    <TableHead className="text-right">Descuento</TableHead>
                    <TableHead className="text-right">Subtotal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoice.items.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">
                        {item.description}
                      </TableCell>
                      <TableCell className="text-right">
                        {item.quantity} {item.unitOfMeasure}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(item.unitPrice)}
                      </TableCell>
                      <TableCell className="text-right">
                        {item.discount > 0 ? formatCurrency(item.discount) : '-'}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(item.subtotal)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <Separator className="my-4" />

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatCurrency(invoice.subtotal)}</span>
                </div>
                {Object.entries(invoice.taxes).map(([name, rate]) => (
                  <div key={name} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {name} ({rate}%)
                    </span>
                    <span>
                      {formatCurrency((invoice.subtotal * rate) / 100)}
                    </span>
                  </div>
                ))}
                {invoice.discounts > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Descuentos</span>
                    <span className="text-destructive">
                      -{formatCurrency(invoice.discounts)}
                    </span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>{formatCurrency(invoice.total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment History */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <History className="h-5 w-5" />
                <CardTitle>Historial de Pagos</CardTitle>
              </div>
              <CardDescription>
                {payments.length} pago(s) registrado(s)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {paymentsLoading ? (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  Cargando pagos...
                </div>
              ) : payments.length === 0 ? (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  No hay pagos registrados
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Método</TableHead>
                      <TableHead>Referencia</TableHead>
                      <TableHead className="text-right">Monto</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>
                          {format(payment.paymentDate.toDate(), 'dd MMM yyyy', {
                            locale: es,
                          })}
                        </TableCell>
                        <TableCell>
                          {PAYMENT_METHOD_CONFIG[payment.method].label}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {payment.reference || '-'}
                        </TableCell>
                        <TableCell className="text-right font-medium text-green-600">
                          {formatCurrency(payment.amount)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Summary */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Resumen Financiero</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Factura</p>
                <p className="text-2xl font-bold">{formatCurrency(invoice.total)}</p>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground mb-1">Monto Pagado</p>
                <p className="text-xl font-semibold text-green-600">
                  {formatCurrency(invoice.amountPaid)}
                </p>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground mb-1">Saldo Pendiente</p>
                <p className="text-2xl font-bold text-orange-600">
                  {formatCurrency(invoice.amountDue)}
                </p>
              </div>
            </CardContent>
          </Card>

          {invoice.quoteId && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Relacionado</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Cotización</span>
                  <Button
                    variant="link"
                    size="sm"
                    onClick={() => router.push(`/sales/quotes/${invoice.quoteId}`)}
                  >
                    {invoice.quoteNumber}
                  </Button>
                </div>
                {invoice.projectId && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Proyecto</span>
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => router.push(`/projects/${invoice.projectId}`)}
                    >
                      Ver Proyecto
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Payment Dialog */}
      <PaymentFormDialog
        invoice={invoice}
        open={paymentDialogOpen}
        onOpenChange={setPaymentDialogOpen}
        onSubmit={handlePaymentSubmit}
      />

      {/* Email Dialog */}
      <SendInvoiceEmailDialog
        invoice={invoice}
        open={emailDialogOpen}
        onClose={() => setEmailDialogOpen(false)}
        onSuccess={() => {
          // Refresh invoice to show 'sent' status
          loadInvoice();
        }}
      />
    </div>
  );
}
