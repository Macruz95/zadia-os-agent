/**
 * ZADIA OS - Add Loan Dialog
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
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
import { LoansService } from '@/modules/hr/services/loans.service';
import { useAuth } from '@/contexts/AuthContext';

const loanSchema = z.object({
    amount: z.number().min(0.01, 'Monto requerido'),
    reason: z.string().min(3, 'Motivo requerido'),
});

type LoanFormData = z.infer<typeof loanSchema>;

interface AddLoanDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    periodId: string;
    employeeId: string;
    onSuccess: () => void;
}

export function AddLoanDialog({
    open,
    onOpenChange,
    periodId,
    employeeId,
    onSuccess,
}: AddLoanDialogProps) {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);

    const { register, handleSubmit, reset, formState: { errors } } = useForm<LoanFormData>({
        resolver: zodResolver(loanSchema),
        defaultValues: {
            amount: 0,
            reason: ''
        }
    });

    const onSubmit = async (data: LoanFormData) => {
        if (!user) return;

        try {
            setLoading(true);
            await LoansService.addLoan(
                employeeId,
                periodId,
                data.amount,
                data.reason,
                user.uid
            );

            toast.success('Préstamo registrado correctamente');
            reset();
            onSuccess();
            onOpenChange(false);
        } catch {
            toast.error('Error al registrar préstamo');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Registrar Préstamo / Adelanto</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="amount">Monto ($)</Label>
                        <Input
                            id="amount"
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            {...register('amount', { valueAsNumber: true })}
                        />
                        {errors.amount && (
                            <p className="text-sm text-destructive">{errors.amount.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="reason">Motivo</Label>
                        <Textarea
                            id="reason"
                            placeholder="Ej: Adelanto de quincena, Emergencia médica..."
                            {...register('reason')}
                        />
                        {errors.reason && (
                            <p className="text-sm text-destructive">{errors.reason.message}</p>
                        )}
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
                            Registrar
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
