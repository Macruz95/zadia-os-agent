/**
 * ZADIA OS - Invoice Additional Info Component
 * Información adicional de la factura (términos, notas)
 * Rule #2: ShadCN UI + Lucide Icons
 * Rule #5: Max 200 lines
 */

'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface InvoiceAdditionalInfoProps {
  paymentTerms: string;
  notes: string;
  onPaymentTermsChange: (value: string) => void;
  onNotesChange: (value: string) => void;
}

export function InvoiceAdditionalInfo({
  paymentTerms,
  notes,
  onPaymentTermsChange,
  onNotesChange,
}: InvoiceAdditionalInfoProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Información Adicional</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="paymentTerms">Términos de Pago *</Label>
          <Input
            id="paymentTerms"
            value={paymentTerms}
            onChange={(e) => onPaymentTermsChange(e.target.value)}
            placeholder="Ej: 30 días, Contado, 50% anticipo"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="notes">Notas</Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            placeholder="Información adicional..."
            rows={3}
            maxLength={1000}
          />
          <p className="text-xs text-muted-foreground text-right">
            {notes.length}/1000
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
