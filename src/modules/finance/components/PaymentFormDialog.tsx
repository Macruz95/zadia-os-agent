// src/modules/finance/components/PaymentFormDialog.tsx

'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { DollarSign, CreditCard, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { PAYMENT_METHOD_CONFIG } from '../types/finance.types';
import type { Invoice, PaymentMethod } from '../types/finance.types';

interface PaymentFormDialogProps {
  invoice: Invoice | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (paymentData: {
    amount: number;
    method: PaymentMethod;
    reference?: string;
    notes?: string;
    paymentDate: Date;
  }) => Promise<void>;
}

/**
 * Diálogo para registrar un pago a una factura
 */
export function PaymentFormDialog({
  invoice,
  open,
  onOpenChange,
  onSubmit,
}: PaymentFormDialogProps) {
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<PaymentMethod>('bank-transfer');
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentDate, setPaymentDate] = useState(
    format(new Date(), 'yyyy-MM-dd')
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!invoice) return;

    const amountNum = parseFloat(amount);

    // Validaciones
    if (isNaN(amountNum) || amountNum <= 0) {
      setError('Ingresa un monto válido');
      return;
    }

    if (amountNum > invoice.amountDue) {
      setError('El monto no puede ser mayor al saldo pendiente');
      return;
    }

    try {
      setLoading(true);

      await onSubmit({
        amount: amountNum,
        method,
        reference: reference.trim() || undefined,
        notes: notes.trim() || undefined,
        paymentDate: new Date(paymentDate),
      });

      // Reset form
      setAmount('');
      setReference('');
      setNotes('');
      setPaymentDate(format(new Date(), 'yyyy-MM-dd'));
      onOpenChange(false);
    } catch {
      setError('Error al registrar el pago');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    if (!invoice) return '';
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: invoice.currency,
    }).format(value);
  };

  const amountNum = parseFloat(amount) || 0;
  const remainingBalance = invoice ? invoice.amountDue - amountNum : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Registrar Pago</DialogTitle>
          <DialogDescription>
            {invoice && (
              <>
                Factura: <strong>{invoice.number}</strong> - Cliente:{' '}
                <strong>{invoice.clientName}</strong>
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        {invoice && (
          <Card className="bg-muted/50">
            <CardContent className="pt-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground mb-1">Total Factura</p>
                  <p className="font-semibold">
                    {formatCurrency(invoice.total)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Monto Pagado</p>
                  <p className="font-semibold text-green-600">
                    {formatCurrency(invoice.amountPaid)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Saldo Pendiente</p>
                  <p className="font-semibold text-orange-600">
                    {formatCurrency(invoice.amountDue)}
                  </p>
                </div>
                {amountNum > 0 && (
                  <div>
                    <p className="text-muted-foreground mb-1">
                      Saldo después del pago
                    </p>
                    <p
                      className={`font-semibold ${
                        remainingBalance <= 0
                          ? 'text-green-600'
                          : 'text-orange-600'
                      }`}
                    >
                      {formatCurrency(Math.max(0, remainingBalance))}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Monto del Pago *</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                max={invoice?.amountDue}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="method">Método de Pago *</Label>
            <Select value={method} onValueChange={(v) => setMethod(v as PaymentMethod)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(PAYMENT_METHOD_CONFIG).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      {config.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="paymentDate">Fecha de Pago *</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
              <Input
                id="paymentDate"
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reference">Referencia / Número de Transacción</Label>
            <Input
              id="reference"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="Ej: TRANS-123456"
              maxLength={100}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notas</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Información adicional sobre el pago..."
              maxLength={500}
              rows={3}
            />
            <p className="text-xs text-muted-foreground text-right">
              {notes.length}/500
            </p>
          </div>

          {error && (
            <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
              {error}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Registrando...' : 'Registrar Pago'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
