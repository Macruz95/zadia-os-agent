'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, Check, Save } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTenantId } from '@/contexts/TenantContext';
import { QuoteBasicInfoStep } from './QuoteBasicInfoStep';
import { QuoteCalculatorStep } from './QuoteCalculatorStep';
import { QuoteItemsStep } from './QuoteItemsStep';
import { QuoteTermsStep } from './QuoteTermsStep';
import { QuoteReviewStep } from './QuoteReviewStep';
import { QuotesService } from '../../services/quotes.service';
import type { QuoteItem } from '../../types/sales.types';

interface QuoteFormData {
  opportunityId?: string; // Optional - from opportunity
  opportunityName?: string;
  leadId?: string; // Optional - from lead (NEW)
  leadName?: string; // For display (NEW)
  clientId?: string; // Now optional for lead-based quotes
  clientName?: string;
  contactId?: string; // Now optional for lead-based quotes
  contactName?: string;
  currency: string;
  validUntil: Date;
  paymentTerms: string;
  items: Omit<QuoteItem, 'id'>[];
  taxes: Record<string, number>;
  additionalDiscounts: number;
  notes?: string;
  internalNotes?: string;
}

interface QuoteFormWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  opportunityId?: string;
  leadId?: string; // NEW: For creating quote directly from lead
  leadName?: string; // NEW: Lead name for display
  onSuccess?: (quoteId: string) => void;
  asPage?: boolean; // New prop to render without Dialog
}

const STEPS = [
  { number: 1, title: 'Información Básica', description: 'Oportunidad y términos' },
  { number: 2, title: 'Calculadora', description: 'Calcular costos y precios' },
  { number: 3, title: 'Items', description: 'Revisar productos y servicios' },
  { number: 4, title: 'Términos', description: 'Impuestos y descuentos' },
  { number: 5, title: 'Revisión', description: 'Verificar y crear' },
];

export function QuoteFormWizard({
  open,
  onOpenChange,
  opportunityId,
  leadId,
  leadName,
  onSuccess,
  asPage = false,
}: QuoteFormWizardProps) {
  const router = useRouter();
  const { user } = useAuth();
  const tenantId = useTenantId();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<QuoteFormData>({
    opportunityId: opportunityId,
    leadId: leadId, // NEW: From lead
    leadName: leadName, // NEW: Lead name for display
    clientId: undefined, // Optional for lead-based quotes
    contactId: undefined, // Optional for lead-based quotes
    currency: 'USD',
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 días
    paymentTerms: '30 días netos',
    items: [],
    taxes: { IVA: 13 },
    additionalDiscounts: 0,
  });

  const progress = (currentStep / STEPS.length) * 100;

  const updateFormData = useCallback((updates: Partial<QuoteFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  }, []);

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!user?.uid) {
      toast.error('Usuario no autenticado');
      return;
    }

    // Must have either leadId or clientId
    if (!formData.leadId && !formData.clientId) {
      toast.error('Debe seleccionar un Lead o Cliente');
      return;
    }

    if (!tenantId) {
      toast.error('No se detectó un espacio de trabajo activo (tenantId)');
      return;
    }

    try {
      setIsSubmitting(true);

      // Calcular totales
      const subtotal = formData.items.reduce((sum, item) => sum + item.subtotal, 0);
      const taxesBreakdown: Record<string, number> = {};
      let totalTaxes = 0;

      Object.entries(formData.taxes).forEach(([name, rate]) => {
        const taxAmount = (subtotal * rate) / 100;
        taxesBreakdown[name] = taxAmount;
        totalTaxes += taxAmount;
      });

      const total = subtotal + totalTaxes - formData.additionalDiscounts;

      // Construir datos completos para QuotesService
      const quoteData = {
        // Source identifiers
        opportunityId: formData.opportunityId,
        opportunityName: formData.opportunityName,
        leadId: formData.leadId, // NEW
        leadName: formData.leadName, // NEW

        // Client info (optional for lead-based)
        clientId: formData.clientId,
        clientName: formData.clientName,
        contactId: formData.contactId || formData.clientId,
        contactName: formData.contactName || formData.clientName,

        // Quote details
        items: formData.items,
        subtotal,
        taxes: formData.taxes,
        totalTaxes,
        discounts: formData.additionalDiscounts,
        total,
        currency: formData.currency,
        validUntil: formData.validUntil,
        paymentTerms: formData.paymentTerms,
        notes: formData.notes,
        internalNotes: formData.internalNotes,
        assignedTo: user.uid,
        attachments: [],
      };

      // Crear cotización
      const quote = await QuotesService.createQuote(quoteData, user.uid, tenantId);

      toast.success('Cotización creada exitosamente');

      if (onSuccess) {
        onSuccess(quote.id);
      }

      onOpenChange(false);
      router.refresh();
    } catch {
      toast.error('No se pudo crear la cotización. Por favor, inténtelo nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        // Either opportunity, direct client, OR lead required
        const hasOpportunity = formData.opportunityId;
        const hasDirectClient = formData.clientId && formData.contactId;
        const hasLead = formData.leadId; // NEW: Allow lead-based quotes
        return (hasOpportunity || hasDirectClient || hasLead) && formData.validUntil && formData.paymentTerms;
      case 2:
        return true; // Calculator step is optional
      case 3:
        return formData.items.length > 0;
      case 4:
        return true; // Taxes y discounts son opcionales
      case 5:
        return true;
      default:
        return false;
    }
  };

  // Render content without Dialog wrapper when asPage={true}
  const wizardContent = (
    <>
      {/* Header - only show in dialog mode */}
      {!asPage && (
        <DialogHeader>
          <DialogTitle>Nueva Cotización</DialogTitle>
          <DialogDescription>
            {STEPS[currentStep - 1].description}
          </DialogDescription>
        </DialogHeader>
      )}

      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          {STEPS.map((step) => (
            <div
              key={step.number}
              className={`flex items-center gap-2 ${currentStep === step.number ? 'text-primary font-medium' : 'text-muted-foreground'
                }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${currentStep > step.number
                  ? 'bg-primary text-primary-foreground'
                  : currentStep === step.number
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                  }`}
              >
                {currentStep > step.number ? <Check className="w-3 h-3" /> : step.number}
              </div>
              <span className="hidden sm:inline">{step.title}</span>
            </div>
          ))}
        </div>
        <Progress value={progress} />
      </div>

      {/* Step content */}
      <div className="py-4">
        {currentStep === 1 && (
          <QuoteBasicInfoStep formData={formData} updateFormData={updateFormData} />
        )}
        {currentStep === 2 && (
          <QuoteCalculatorStep
            onItemsChange={(items) => updateFormData({ items })}
            currency={formData.currency}
          />
        )}
        {currentStep === 3 && (
          <QuoteItemsStep formData={formData} updateFormData={updateFormData} />
        )}
        {currentStep === 4 && (
          <QuoteTermsStep formData={formData} updateFormData={updateFormData} />
        )}
        {currentStep === 5 && <QuoteReviewStep formData={formData} />}
      </div>

      {/* Navigation buttons */}
      <div className="flex justify-between pt-4 border-t">
        <Button variant="outline" onClick={handleBack} disabled={currentStep === 1}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Anterior
        </Button>

        {currentStep < STEPS.length ? (
          <Button onClick={handleNext} disabled={!canProceed()}>
            Siguiente
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={isSubmitting || !canProceed()}>
            {isSubmitting ? (
              <>Guardando...</>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Crear Cotización
              </>
            )}
          </Button>
        )}
      </div>
    </>
  );

  // Return as page or dialog
  if (asPage) {
    return (
      <div className="border rounded-lg p-6 bg-card">
        {wizardContent}
      </div>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        {wizardContent}
      </DialogContent>
    </Dialog>
  );
}
