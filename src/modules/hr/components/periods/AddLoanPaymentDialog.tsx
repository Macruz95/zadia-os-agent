/**
 * ZADIA OS - Add Loan Payment Dialog
 * Dialog para registrar abonos a préstamos
 */

'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, CreditCard, Banknote, Building2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
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
import { LoanPaymentsService } from '@/modules/hr/services/loan-payments.service';
import { useAuth } from '@/contexts/AuthContext';
import { useTenantId } from '@/contexts/TenantContext';
import type { Loan, LoanPayment } from '@/modules/hr/types/hr.types';
import { formatCurrency } from '@/lib/currency.utils';

const paymentSchema = z.object({
  amount: z.number().min(0.01, 'Monto requerido'),
  paymentType: z.enum(['deduction', 'cash', 'transfer']),
  notes: z.string().optional(),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

interface AddLoanPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loan: Loan;
  currentPeriodId: string;
  onSuccess: () => void;
}

const PAYMENT_TYPE_CONFIG: Record<LoanPayment['paymentType'], { label: string; icon: React.ReactNode }> = {
  deduction: { label: 'Descuento de Nómina', icon: <CreditCard className="h-4 w-4" /> },
  cash: { label: 'Efectivo', icon: <Banknote className="h-4 w-4" /> },
  transfer: { label: 'Transferencia', icon: <Building2 className="h-4 w-4" /> },
};

export function AddLoanPaymentDialog({
  open,
  onOpenChange,
  loan,
  currentPeriodId,
  onSuccess,
}: AddLoanPaymentDialogProps) {
  const { user } = useAuth();
  const tenantId = useTenantId();
  const [loading, setLoading] = useState(false);

  const remainingBalance = loan.remainingBalance ?? loan.amount;

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      amount: remainingBalance,
      paymentType: 'deduction',
      notes: '',
    },
  });

  const watchedPaymentType = watch('paymentType');

  const onSubmit = async (data: PaymentFormData) => {
    if (!user) return;

    if (data.amount > remainingBalance) {
      toast.error(`El abono no puede ser mayor al saldo pendiente (${formatCurrency(remainingBalance)})`);
      return;
    }

    try {
      setLoading(true);
      await LoanPaymentsService.addPayment(
        loan.id,
        loan.employeeId,
        currentPeriodId,
        data.amount,
        data.paymentType,
        user.uid,
        data.notes,
        tenantId || undefined
      );

      toast.success('Abono registrado correctamente');
      reset();
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al registrar abono');
    } finally {
      setLoading(false);
    }
  };

  const handlePayFullAmount = () => {
    setValue('amount', remainingBalance);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Registrar Abono a Préstamo</DialogTitle>
        </DialogHeader>

        {/* Loan Summary */}
        <div className="rounded-lg bg-muted p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Monto original:</span>
            <span className="font-medium">{formatCurrency(loan.amount)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Saldo pendiente:</span>
            <span className="font-bold text-destructive">{formatCurrency(remainingBalance)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Motivo:</span>
            <span>{loan.reason}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Payment Type */}
          <div className="space-y-2">
            <Label>Tipo de Pago</Label>
            <Select
              value={watchedPaymentType}
              onValueChange={(value: LoanPayment['paymentType']) => setValue('paymentType', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(PAYMENT_TYPE_CONFIG).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    <div className="flex items-center gap-2">
                      {config.icon}
                      {config.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="amount">Monto del Abono ($)</Label>
              <Button
                type="button"
                variant="link"
                size="sm"
                className="h-auto p-0 text-xs"
                onClick={handlePayFullAmount}
              >
                Pagar todo
              </Button>
            </div>
            <Input
              id="amount"
              type="number"
              step="0.01"
              max={remainingBalance}
              placeholder="0.00"
              {...register('amount', { valueAsNumber: true })}
            />
            {errors.amount && (
              <p className="text-sm text-destructive">{errors.amount.message}</p>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notas (opcional)</Label>
            <Textarea
              id="notes"
              placeholder="Observaciones del pago..."
              {...register('notes')}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Registrar Abono
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
