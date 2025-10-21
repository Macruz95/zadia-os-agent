/**
 * ZADIA OS - Quote Conversion Dialog
 * 
 * Convert approved quote to project
 * REGLA 2: ShadCN UI + Lucide icons
 * REGLA 5: <200 líneas
 * 
 * Refactored: Logic extracted to useQuoteConversion hook,
 * UI sections extracted to separate components
 */

'use client';

import { Loader2, CheckCircle2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { Quote } from '@/modules/sales/types/sales.types';
import { useQuoteConversion } from '../hooks/useQuoteConversion';
import { QuoteSummarySection } from './conversion/QuoteSummarySection';
import { ProjectConfigSection } from './conversion/ProjectConfigSection';
import { ProjectEstimatesSection } from './conversion/ProjectEstimatesSection';

interface QuoteConversionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quote: Quote;
  userId: string;
}

export function QuoteConversionDialog({
  open,
  onOpenChange,
  quote,
  userId,
}: QuoteConversionDialogProps) {
  const {
    config,
    loading,
    estimatedCost,
    estimatedDuration,
    updateConfig,
    handleConvert,
    formatCurrency,
  } = useQuoteConversion({
    quote,
    userId,
    onClose: () => onOpenChange(false),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            Convertir Cotización a Proyecto
          </DialogTitle>
          <DialogDescription>
            Genera un nuevo proyecto a partir de la cotización {quote.number}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <QuoteSummarySection
            quote={quote}
            formatCurrency={formatCurrency}
          />

          <ProjectConfigSection
            config={config}
            estimatedDuration={estimatedDuration}
            updateConfig={updateConfig}
          />

          <ProjectEstimatesSection
            quote={quote}
            estimatedCost={estimatedCost}
            formatCurrency={formatCurrency}
          />
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button onClick={handleConvert} disabled={loading || !config.projectName}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Crear Proyecto
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
