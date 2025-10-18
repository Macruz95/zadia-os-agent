/**
 * ZADIA OS - Quote Details Page
 * 
 * Complete quote details view
 * REGLA 1: Firebase real (useQuote hook)
 * REGLA 2: ShadCN UI + Lucide Icons
 * REGLA 4: Modular (usa componentes separados)
 * REGLA 5: <200 líneas
 */

'use client';

import { use, useRef } from 'react';
import { Loader2, AlertCircle, Rocket, FileText, Package } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuote } from '@/modules/sales/hooks/use-quote';
import { QuoteHeader } from '@/modules/sales/components/quotes/QuoteHeader';
import { QuotePreview } from '@/modules/sales/components/quotes/QuotePreview';
import { QuoteConversionDialog } from '@/modules/projects/components/QuoteConversionDialog';
import { useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useReactToPrint } from 'react-to-print';

interface QuoteDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function QuoteDetailsPage({ params }: QuoteDetailsPageProps) {
  const resolvedParams = use(params);
  const quoteId = resolvedParams.id;
  const { user } = useAuth();
  const router = useRouter();

  const {
    quote,
    loading,
    error,
    markAsSent,
    markAsAccepted,
    markAsRejected,
  } = useQuote(quoteId);

  const [showConversionDialog, setShowConversionDialog] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const handleDownloadPDF = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Cotizacion_${quote?.number || quoteId}`,
    onAfterPrint: () => {
      toast.success('PDF generado correctamente');
    },
    onPrintError: () => {
      toast.error('Error al generar PDF');
    },
  });

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Cargando cotización...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !quote) {
    return (
      <div className="container mx-auto py-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error || 'Cotización no encontrada'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <QuoteHeader
        quote={quote}
        onMarkAsSent={markAsSent}
        onMarkAsAccepted={markAsAccepted}
        onMarkAsRejected={markAsRejected}
        onDownloadPDF={handleDownloadPDF}
      />

      {/* Content */}
      <div className="container mx-auto py-6">
        <div className="grid grid-cols-3 gap-6">
          {/* Main content - 2 columns */}
          <div className="col-span-2">
            <Tabs defaultValue="preview" className="w-full">
              <TabsList>
                <TabsTrigger value="preview">Vista Previa</TabsTrigger>
                <TabsTrigger value="history">Historial</TabsTrigger>
              </TabsList>
              
              <TabsContent value="preview" className="mt-6">
                <div ref={printRef}>
                  <QuotePreview quote={quote} />
                </div>
              </TabsContent>
              
              <TabsContent value="history" className="mt-6">
                <div className="border rounded-lg p-8 text-center text-muted-foreground">
                  <p>Historial de cambios próximamente</p>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar - 1 column */}
          <div className="space-y-6">
            {/* Info Card */}
            <div className="border rounded-lg p-6">
              <h3 className="font-semibold mb-4">Información</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Cliente ID</p>
                  <p className="font-medium">{quote.clientId}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Oportunidad ID</p>
                  <p className="font-medium">{quote.opportunityId}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Moneda</p>
                  <p className="font-medium">{quote.currency}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Términos de Pago</p>
                  <p className="font-medium">{quote.paymentTerms}</p>
                </div>
              </div>
            </div>

            {/* Actions Card */}
            {quote.status === 'accepted' && (
              <div className="border rounded-lg p-6 bg-primary/5 space-y-3">
                <div>
                  <h3 className="font-semibold mb-2">Crear Pedido</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Generar un pedido a partir de esta cotización aceptada.
                  </p>
                  <Button
                    onClick={() =>
                      router.push(`/orders/new?quoteId=${quote.id}`)
                    }
                    className="w-full"
                    variant="default"
                  >
                    <Package className="mr-2 h-4 w-4" />
                    Crear Pedido
                  </Button>
                </div>

                <div className="pt-3 border-t">
                  <h3 className="font-semibold mb-2">Generar Factura</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Crear factura a partir de esta cotización aceptada.
                  </p>
                  <Button
                    onClick={() =>
                      router.push(`/finance/invoices/new?quoteId=${quote.id}`)
                    }
                    className="w-full"
                    variant="outline"
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Generar Factura
                  </Button>
                </div>
                
                <div className="pt-3 border-t">
                  <h3 className="font-semibold mb-2">Crear Proyecto</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Convertir esta cotización en un proyecto ejecutable.
                  </p>
                  <Button
                    onClick={() => setShowConversionDialog(true)}
                    className="w-full"
                    variant="outline"
                  >
                    <Rocket className="mr-2 h-4 w-4" />
                    Lanzar Proyecto
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Conversion Dialog */}
      {quote && showConversionDialog && user && (
        <QuoteConversionDialog
          open={showConversionDialog}
          onOpenChange={setShowConversionDialog}
          quote={quote}
          userId={user.uid}
        />
      )}
    </div>
  );
}
