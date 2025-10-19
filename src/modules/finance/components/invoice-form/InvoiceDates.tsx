/**
 * ZADIA OS - Invoice Dates Component
 * Fechas de emisión y vencimiento de la factura
 * Rule #2: ShadCN UI + Lucide Icons
 * Rule #5: Max 200 lines
 */

'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface InvoiceDatesProps {
  issueDate: string;
  dueDate: string;
  onIssueDateChange: (value: string) => void;
  onDueDateChange: (value: string) => void;
}

export function InvoiceDates({
  issueDate,
  dueDate,
  onIssueDateChange,
  onDueDateChange,
}: InvoiceDatesProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Fechas</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="issueDate">Fecha de Emisión *</Label>
          <Input
            id="issueDate"
            type="date"
            value={issueDate}
            onChange={(e) => onIssueDateChange(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="dueDate">Fecha de Vencimiento *</Label>
          <Input
            id="dueDate"
            type="date"
            value={dueDate}
            onChange={(e) => onDueDateChange(e.target.value)}
            required
          />
        </div>
      </CardContent>
    </Card>
  );
}
