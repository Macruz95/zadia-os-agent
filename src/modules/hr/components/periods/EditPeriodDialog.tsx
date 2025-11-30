/**
 * ZADIA OS - Edit Period Dialog
 * 
 * Dialog for editing work period details (dates, rate, notes)
 */

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Calendar, DollarSign, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { WorkPeriodsService } from '@/modules/hr/services/work-periods.service';
import type { WorkPeriod } from '@/modules/hr/types/hr.types';

const editPeriodSchema = z.object({
    startDate: z.string().min(1, 'Fecha de inicio requerida'),
    endDate: z.string().optional(),
    dailyRate: z.number().min(0.01, 'Tarifa debe ser mayor a 0'),
    notes: z.string().optional(),
});

type EditPeriodFormData = z.infer<typeof editPeriodSchema>;

interface EditPeriodDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    period: WorkPeriod;
    onSuccess: () => void;
}

/**
 * Helper to parse date string to local Date at noon (avoids timezone issues)
 */
function parseLocalDate(dateStr: string): Date {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day, 12, 0, 0);
}

/**
 * Helper to format date for input[type="date"]
 */
function formatDateForInput(date: Date | { toDate: () => Date }): string {
    const d = 'toDate' in date ? date.toDate() : date;
    return format(d, 'yyyy-MM-dd');
}

export function EditPeriodDialog({
    open,
    onOpenChange,
    period,
    onSuccess,
}: EditPeriodDialogProps) {
    const [loading, setLoading] = useState(false);

    const { register, handleSubmit, reset, formState: { errors } } = useForm<EditPeriodFormData>({
        resolver: zodResolver(editPeriodSchema),
        defaultValues: {
            startDate: formatDateForInput(period.startDate),
            endDate: period.endDate ? formatDateForInput(period.endDate) : '',
            dailyRate: period.dailyRate,
            notes: period.notes || '',
        }
    });

    // Reset form when period changes
    useEffect(() => {
        reset({
            startDate: formatDateForInput(period.startDate),
            endDate: period.endDate ? formatDateForInput(period.endDate) : '',
            dailyRate: period.dailyRate,
            notes: period.notes || '',
        });
    }, [period, reset]);

    const onSubmit = async (data: EditPeriodFormData) => {
        try {
            setLoading(true);
            
            await WorkPeriodsService.updatePeriod(period.id, {
                startDate: parseLocalDate(data.startDate),
                endDate: data.endDate ? parseLocalDate(data.endDate) : null,
                dailyRate: data.dailyRate,
                notes: data.notes || '',
            });

            toast.success('Temporada actualizada correctamente');
            onSuccess();
            onOpenChange(false);
        } catch {
            toast.error('Error al actualizar temporada');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        Editar Temporada
                    </DialogTitle>
                    <DialogDescription>
                        Modifica las fechas, tarifa diaria o notas del período
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="startDate">Fecha de Inicio</Label>
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
                            <Label htmlFor="endDate">Fecha de Fin</Label>
                            <Input
                                id="endDate"
                                type="date"
                                {...register('endDate')}
                            />
                            {errors.endDate && (
                                <p className="text-sm text-destructive">{errors.endDate.message}</p>
                            )}
                            <p className="text-xs text-muted-foreground">
                                Dejar vacío si está activa
                            </p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="dailyRate" className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4" />
                            Tarifa Diaria
                        </Label>
                        <Input
                            id="dailyRate"
                            type="number"
                            step="0.01"
                            min="0.01"
                            {...register('dailyRate', { valueAsNumber: true })}
                        />
                        {errors.dailyRate && (
                            <p className="text-sm text-destructive">{errors.dailyRate.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="notes" className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            Notas
                        </Label>
                        <Textarea
                            id="notes"
                            placeholder="Observaciones sobre esta temporada..."
                            rows={3}
                            {...register('notes')}
                        />
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={loading}
                        >
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Guardar Cambios
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
