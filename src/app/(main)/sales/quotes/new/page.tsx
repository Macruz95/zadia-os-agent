/**
 * ZADIA OS - New Quote Page
 * 
 * Page for creating new quotes
 * REGLA 1: Firebase real (QuoteFormWizard integrado)
 * REGLA 2: ShadCN UI + Lucide Icons
 * REGLA 4: Modular (usa componentes existentes)
 * REGLA 5: <100 líneas
 */

'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { QuoteFormWizard } from '@/modules/sales/components/quotes/QuoteFormWizard';

export default function NewQuotePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const opportunityId = searchParams.get('opportunityId') || undefined;

  return (
    <div className="container mx-auto py-6">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Nueva Cotización</h1>
          <p className="text-muted-foreground mt-2">
            Complete el formulario para crear una nueva cotización
          </p>
        </div>
      </div>

      {/* Wizard en modo página completa */}
      <div className="max-w-5xl mx-auto">
        <QuoteFormWizard
          open={true}
          onOpenChange={(open) => {
            if (!open) {
              router.back();
            }
          }}
          opportunityId={opportunityId}
          onSuccess={(quoteId) => {
            router.push(`/sales/quotes/${quoteId}`);
          }}
          asPage={true}
        />
      </div>
    </div>
  );
}
