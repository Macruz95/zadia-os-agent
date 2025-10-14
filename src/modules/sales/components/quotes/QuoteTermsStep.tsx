'use client';

import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, Trash2, AlertCircle } from 'lucide-react';
import { QuoteCalculatorSummary } from './QuoteCalculatorSummary';
import type { QuoteItem } from '../../types/sales.types';

interface QuoteFormData {
  items: Omit<QuoteItem, 'id'>[];
  taxes: Record<string, number>;
  additionalDiscounts: number;
  notes?: string;
  internalNotes?: string;
  currency: string;
}

interface QuoteTermsStepProps {
  formData: QuoteFormData;
  updateFormData: (updates: Partial<QuoteFormData>) => void;
}

export function QuoteTermsStep({ formData, updateFormData }: QuoteTermsStepProps) {
  const [newTaxName, setNewTaxName] = useState('');
  const [newTaxRate, setNewTaxRate] = useState('');

  const handleAddTax = () => {
    if (!newTaxName || !newTaxRate) return;

    const rate = parseFloat(newTaxRate);
    if (isNaN(rate) || rate < 0) return;

    updateFormData({
      taxes: {
        ...formData.taxes,
        [newTaxName]: rate,
      },
    });

    setNewTaxName('');
    setNewTaxRate('');
  };

  const handleRemoveTax = (taxName: string) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { [taxName]: _removed, ...remainingTaxes } = formData.taxes;
    updateFormData({ taxes: remainingTaxes });
  };

  const handleDiscountChange = (value: string) => {
    const discount = parseFloat(value) || 0;
    if (discount < 0) return;
    updateFormData({ additionalDiscounts: discount });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Columna izquierda: Configuración */}
      <div className="space-y-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Configure los impuestos que aplican a esta cotización. Los porcentajes se calculan 
            sobre el subtotal.
          </AlertDescription>
        </Alert>

        {/* Impuestos */}
        <div className="space-y-4">
          <Label>Impuestos</Label>

          {/* Lista de impuestos */}
          {Object.keys(formData.taxes).length > 0 && (
            <div className="space-y-2">
              {Object.entries(formData.taxes).map(([name, rate]) => (
                <div
                  key={name}
                  className="flex items-center justify-between p-3 border rounded-md"
                >
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{name}</Badge>
                    <span className="text-sm text-muted-foreground">{rate}%</span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveTax(name)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Agregar impuesto */}
          <div className="flex gap-2">
            <Input
              placeholder="Nombre (ej: IVA)"
              value={newTaxName}
              onChange={(e) => setNewTaxName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddTax()}
            />
            <Input
              type="number"
              placeholder="% (ej: 13)"
              value={newTaxRate}
              onChange={(e) => setNewTaxRate(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddTax()}
              className="w-24"
              min="0"
              step="0.01"
            />
            <Button type="button" onClick={handleAddTax} size="icon">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Descuentos adicionales */}
        <div className="space-y-2">
          <Label htmlFor="additionalDiscounts">Descuentos Adicionales</Label>
          <Input
            id="additionalDiscounts"
            type="number"
            value={formData.additionalDiscounts}
            onChange={(e) => handleDiscountChange(e.target.value)}
            placeholder="0.00"
            min="0"
            step="0.01"
          />
          <p className="text-xs text-muted-foreground">
            Monto fijo a descontar del total (en {formData.currency})
          </p>
        </div>

        {/* Notas */}
        <div className="space-y-2">
          <Label htmlFor="notes">Notas (visibles en la cotización)</Label>
          <Textarea
            id="notes"
            value={formData.notes || ''}
            onChange={(e) => updateFormData({ notes: e.target.value })}
            placeholder="Notas adicionales para el cliente..."
            rows={3}
          />
        </div>

        {/* Notas internas */}
        <div className="space-y-2">
          <Label htmlFor="internalNotes">Notas Internas (privadas)</Label>
          <Textarea
            id="internalNotes"
            value={formData.internalNotes || ''}
            onChange={(e) => updateFormData({ internalNotes: e.target.value })}
            placeholder="Notas internas solo para el equipo de ventas..."
            rows={3}
          />
        </div>
      </div>

      {/* Columna derecha: Resumen de cálculos */}
      <div>
        <QuoteCalculatorSummary
          items={formData.items}
          taxes={formData.taxes}
          additionalDiscounts={formData.additionalDiscounts}
          currency={formData.currency}
        />
      </div>
    </div>
  );
}
