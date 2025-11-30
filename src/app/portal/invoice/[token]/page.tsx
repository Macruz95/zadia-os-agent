/**
 * ZADIA OS - Customer Portal Invoice Page
 * 
 * Public page for viewing and paying invoices
 */

import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { FileText, Building2, Calendar, DollarSign } from 'lucide-react';
import { PayInvoiceButton } from './PayInvoiceButton';

interface PageProps {
  params: Promise<{ token: string }>;
}

async function getInvoiceByToken(token: string) {
  try {
    // Token is the invoice ID + a hash for security
    // In production, use a proper token system
    const invoiceId = token.split('-')[0];
    
    const invoiceRef = doc(db, 'invoices', invoiceId);
    const invoiceSnap = await getDoc(invoiceRef);
    
    if (!invoiceSnap.exists()) return null;
    
    const invoice = invoiceSnap.data();
    
    // Verify token matches (simple implementation)
    // In production, use cryptographic verification
    if (invoice.publicToken !== token) {
      return null;
    }
    
    return {
      id: invoiceSnap.id,
      ...invoice,
    };
  } catch {
    return null;
  }
}

function formatCurrency(amount: number, currency: string = 'USD') {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency,
  }).format(amount);
}

function formatDate(timestamp: { seconds: number }) {
  if (!timestamp) return '-';
  return new Date(timestamp.seconds * 1000).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function getStatusBadge(status: string) {
  const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    draft: 'secondary',
    sent: 'default',
    paid: 'outline',
    overdue: 'destructive',
    cancelled: 'secondary',
  };
  
  const labels: Record<string, string> = {
    draft: 'Borrador',
    sent: 'Enviada',
    paid: 'Pagada',
    overdue: 'Vencida',
    cancelled: 'Cancelada',
  };
  
  return (
    <Badge variant={variants[status] || 'default'}>
      {labels[status] || status}
    </Badge>
  );
}

async function InvoiceContent({ token }: { token: string }) {
  const invoice = await getInvoiceByToken(token);
  
  if (!invoice) {
    notFound();
  }
  
  const isPaid = invoice.status === 'paid';
  const canPay = invoice.status === 'sent' || invoice.status === 'overdue';
  
  return (
    <div className="space-y-6">
      {/* Invoice Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Factura {invoice.invoiceNumber}
              </CardTitle>
              <CardDescription className="mt-1">
                Emitida el {formatDate(invoice.issueDate)}
              </CardDescription>
            </div>
            {getStatusBadge(invoice.status)}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            {/* From */}
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-2">De</h4>
              <div className="flex items-start gap-2">
                <Building2 className="h-4 w-4 mt-1 text-muted-foreground" />
                <div>
                  <p className="font-medium">{invoice.tenantName || 'Empresa'}</p>
                  <p className="text-sm text-muted-foreground">
                    {invoice.tenantAddress || ''}
                  </p>
                </div>
              </div>
            </div>
            
            {/* To */}
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-2">Para</h4>
              <div className="flex items-start gap-2">
                <Building2 className="h-4 w-4 mt-1 text-muted-foreground" />
                <div>
                  <p className="font-medium">{invoice.clientName}</p>
                  <p className="text-sm text-muted-foreground">
                    {invoice.clientEmail}
                  </p>
                  {invoice.clientAddress && (
                    <p className="text-sm text-muted-foreground">
                      {invoice.clientAddress}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>Vence: {formatDate(invoice.dueDate)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Invoice Items */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Detalle</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 text-sm font-medium text-muted-foreground pb-2 border-b">
              <div className="col-span-6">Descripción</div>
              <div className="col-span-2 text-right">Cantidad</div>
              <div className="col-span-2 text-right">Precio</div>
              <div className="col-span-2 text-right">Total</div>
            </div>
            
            {/* Items */}
            {invoice.items?.map((item: {
              id: string;
              description: string;
              quantity: number;
              unitPrice: number;
              total: number;
            }, index: number) => (
              <div key={item.id || index} className="grid grid-cols-12 gap-4 text-sm py-2">
                <div className="col-span-6">{item.description}</div>
                <div className="col-span-2 text-right">{item.quantity}</div>
                <div className="col-span-2 text-right">
                  {formatCurrency(item.unitPrice, invoice.currency)}
                </div>
                <div className="col-span-2 text-right font-medium">
                  {formatCurrency(item.total, invoice.currency)}
                </div>
              </div>
            ))}
            
            <Separator className="my-4" />
            
            {/* Totals */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCurrency(invoice.subtotal || 0, invoice.currency)}</span>
              </div>
              
              {invoice.taxAmount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    IVA ({invoice.taxRate || 0}%)
                  </span>
                  <span>{formatCurrency(invoice.taxAmount, invoice.currency)}</span>
                </div>
              )}
              
              {invoice.discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Descuento</span>
                  <span className="text-green-600">
                    -{formatCurrency(invoice.discount, invoice.currency)}
                  </span>
                </div>
              )}
              
              <Separator />
              
              <div className="flex justify-between text-lg font-semibold">
                <span>Total</span>
                <span className="flex items-center gap-1">
                  <DollarSign className="h-5 w-5" />
                  {formatCurrency(invoice.total, invoice.currency)}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Payment Section */}
      {canPay && (
        <Card className="border-primary">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold text-lg">¿Listo para pagar?</h3>
                <p className="text-sm text-muted-foreground">
                  Pago seguro con tarjeta de crédito o débito
                </p>
              </div>
              <PayInvoiceButton 
                invoiceId={invoice.id}
                amount={invoice.total}
                currency={invoice.currency}
                tenantId={invoice.tenantId}
              />
            </div>
          </CardContent>
        </Card>
      )}
      
      {isPaid && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-green-800">Factura Pagada</h3>
                <p className="text-sm text-green-600">
                  Pago recibido el {formatDate(invoice.paidAt)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Notes */}
      {invoice.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Notas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {invoice.notes}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default async function InvoicePage({ params }: PageProps) {
  const { token } = await params;
  
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    }>
      <InvoiceContent token={token} />
    </Suspense>
  );
}
