/**
 * ZADIA OS - Customer Portal Quote Page
 * 
 * Public page for viewing and accepting quotes
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
import { FileText, Building2, Calendar, Clock } from 'lucide-react';
import { AcceptQuoteButton } from './AcceptQuoteButton';

interface PageProps {
  params: Promise<{ token: string }>;
}

async function getQuoteByToken(token: string) {
  try {
    const quoteId = token.split('-')[0];
    
    const quoteRef = doc(db, 'quotes', quoteId);
    const quoteSnap = await getDoc(quoteRef);
    
    if (!quoteSnap.exists()) return null;
    
    const quote = quoteSnap.data();
    
    if (quote.publicToken !== token) {
      return null;
    }
    
    return {
      id: quoteSnap.id,
      ...quote,
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
    accepted: 'outline',
    rejected: 'destructive',
    expired: 'secondary',
  };
  
  const labels: Record<string, string> = {
    draft: 'Borrador',
    sent: 'Enviada',
    accepted: 'Aceptada',
    rejected: 'Rechazada',
    expired: 'Expirada',
  };
  
  return (
    <Badge variant={variants[status] || 'default'}>
      {labels[status] || status}
    </Badge>
  );
}

function isExpired(expiresAt: { seconds: number }) {
  if (!expiresAt) return false;
  return new Date(expiresAt.seconds * 1000) < new Date();
}

async function QuoteContent({ token }: { token: string }) {
  const quote = await getQuoteByToken(token);
  
  if (!quote) {
    notFound();
  }
  
  const expired = isExpired(quote.expiresAt);
  const canAccept = quote.status === 'sent' && !expired;
  const isAccepted = quote.status === 'accepted';
  
  return (
    <div className="space-y-6">
      {/* Quote Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Cotización {quote.quoteNumber}
              </CardTitle>
              <CardDescription className="mt-1">
                Creada el {formatDate(quote.createdAt)}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {expired && quote.status === 'sent' && (
                <Badge variant="destructive">Expirada</Badge>
              )}
              {getStatusBadge(quote.status)}
            </div>
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
                  <p className="font-medium">{quote.tenantName || 'Empresa'}</p>
                  <p className="text-sm text-muted-foreground">
                    {quote.tenantEmail || ''}
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
                  <p className="font-medium">{quote.clientName}</p>
                  <p className="text-sm text-muted-foreground">
                    {quote.clientEmail}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>Válida hasta: {formatDate(quote.expiresAt)}</span>
            </div>
            {quote.validityDays && (
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>Validez: {quote.validityDays} días</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Quote Items */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Detalle de la Propuesta</CardTitle>
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
            {quote.items?.map((item: {
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
                  {formatCurrency(item.unitPrice, quote.currency)}
                </div>
                <div className="col-span-2 text-right font-medium">
                  {formatCurrency(item.total, quote.currency)}
                </div>
              </div>
            ))}
            
            <Separator className="my-4" />
            
            {/* Totals */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCurrency(quote.subtotal || 0, quote.currency)}</span>
              </div>
              
              {quote.taxAmount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    IVA ({quote.taxRate || 0}%)
                  </span>
                  <span>{formatCurrency(quote.taxAmount, quote.currency)}</span>
                </div>
              )}
              
              {quote.discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Descuento</span>
                  <span className="text-green-600">
                    -{formatCurrency(quote.discount, quote.currency)}
                  </span>
                </div>
              )}
              
              <Separator />
              
              <div className="flex justify-between text-lg font-semibold">
                <span>Total</span>
                <span>{formatCurrency(quote.total, quote.currency)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Accept Section */}
      {canAccept && (
        <Card className="border-primary">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold text-lg">¿Aceptar esta propuesta?</h3>
                <p className="text-sm text-muted-foreground">
                  Al aceptar, confirmas tu acuerdo con los términos presentados
                </p>
              </div>
              <AcceptQuoteButton quoteId={quote.id} token={token} />
            </div>
          </CardContent>
        </Card>
      )}
      
      {isAccepted && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <FileText className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-green-800">Cotización Aceptada</h3>
                <p className="text-sm text-green-600">
                  Aceptada el {formatDate(quote.acceptedAt)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {expired && quote.status === 'sent' && (
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <h3 className="font-semibold text-amber-800">Cotización Expirada</h3>
                <p className="text-sm text-amber-600">
                  Esta cotización venció el {formatDate(quote.expiresAt)}.
                  Por favor contacta al proveedor para una nueva cotización.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Terms & Notes */}
      {(quote.terms || quote.notes) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Términos y Condiciones</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {quote.terms && (
              <div>
                <h4 className="font-medium text-sm mb-2">Términos</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {quote.terms}
                </p>
              </div>
            )}
            {quote.notes && (
              <div>
                <h4 className="font-medium text-sm mb-2">Notas</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {quote.notes}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default async function QuotePage({ params }: PageProps) {
  const { token } = await params;
  
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    }>
      <QuoteContent token={token} />
    </Suspense>
  );
}
