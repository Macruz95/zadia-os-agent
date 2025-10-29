'use client';

import { useQuoteCalculator } from '../../hooks/use-quote-calculator';
import { QuoteReviewInfo, QuoteReviewHeader, QuoteReviewItems, QuoteReviewTotals } from './review';
import type { QuoteItem } from '../../types/sales.types';

interface QuoteFormData {
  opportunityName?: string;
  clientId?: string;
  clientName?: string;
  contactId?: string;
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

interface QuoteReviewStepProps {
  formData: QuoteFormData;
}

export function QuoteReviewStep({ formData }: QuoteReviewStepProps) {
  const calculation = useQuoteCalculator({
    items: formData.items,
    taxes: formData.taxes,
    additionalDiscounts: formData.additionalDiscounts,
  });

  return (
    <div className="space-y-6">
      <QuoteReviewInfo
        opportunityName={formData.opportunityName}
        currency={formData.currency}
        validUntil={formData.validUntil}
        paymentTerms={formData.paymentTerms}
        notes={formData.notes}
        internalNotes={formData.internalNotes}
      />

      <QuoteReviewHeader
        clientId={formData.clientId}
        clientName={formData.clientName}
        contactId={formData.contactId}
        contactName={formData.contactName}
      />

      <QuoteReviewItems
        items={formData.items}
        currency={formData.currency}
      />

      <QuoteReviewTotals
        calculation={calculation}
        taxes={formData.taxes}
        additionalDiscounts={formData.additionalDiscounts}
        currency={formData.currency}
      />
    </div>
  );
}
