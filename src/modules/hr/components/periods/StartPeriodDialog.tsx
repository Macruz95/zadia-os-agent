/**
 * ZADIA OS - Start Period Dialog
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
import { WorkPeriodsService } from '@/modules/hr/services/work-periods.service';

const startPeriodSchema = z.object({
    startDate: z.string(),
    dailyRate: z.number().min(0.01, 'Tarifa requerida'),
});

type StartPeriodFormData = z.infer<typeof startPeriodSchema>;

interface StartPeriodDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    employeeId: string;
    defaultRate: number;
    onSuccess: () => void;
}

export function StartPeriodDialog({
    open,
    onOpenChange,
    employeeId,
    defaultRate,
    onSuccess,
}: StartPeriodDialogProps) {
    const [loading, setLoading] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm<StartPeriodFormData>({
        resolver: zodResolver(startPeriodSchema),
        defaultValues: {
            startDate: new Date().toISOString().split('T')[0],
            dailyRate: defaultRate,
        }
    });

    const onSubmit = async (data: StartPeriodFormData) => {
        try {
            setLoading(true);
            await WorkPeriodsService.startPeriod(
                employeeId,
                data.dailyRate,
                new Date(data.startDate)
            );

            toast.success('Temporada iniciada correctamente');
            onSuccess();
            onOpenChange(false);
        } catch {
            toast.error('Error al iniciar temporada');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Iniciar Nueva Temporada</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="startDate">Fecha de Llegada</Label>
                        <Input
                            id="startDate"
                            type="date"
                            {...register('startDate')}
                        />
                        {errors.startDate && (
                            <p className="text-sm text-destructive">{errors.startDate.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="dailyRate">Tarifa Diaria ($)</Label>
                        <Input
                            id="dailyRate"
                            type="number"
                            step="0.01"
                            {...register('dailyRate', { valueAsNumber: true })}
                        />
                        {errors.dailyRate && (
                            <p className="text-sm text-destructive">{errors.dailyRate.message}</p>
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
                            Iniciar Temporada
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
