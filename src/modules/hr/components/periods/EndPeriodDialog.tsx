/**
 * ZADIA OS - End Period Dialog
 */

import { useState } from 'react';
import { format } from 'date-fns';
// es locale removed - not used
import { Loader2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { WorkPeriodsService } from '@/modules/hr/services/work-periods.service';
import type { WorkPeriod } from '@/modules/hr/types/hr.types';

interface EndPeriodDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    period: WorkPeriod;
    currentLoans: number;
    onSuccess: () => void;
}

export function EndPeriodDialog({
    open,
    onOpenChange,
    period,
    currentLoans,
    onSuccess,
}: EndPeriodDialogProps) {
    const [loading, setLoading] = useState(false);
    const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));

    const handleEndPeriod = async () => {
        try {
            setLoading(true);
            await WorkPeriodsService.endPeriod(period.id, new Date(endDate));

            toast.success('Temporada finalizada correctamente');
            onSuccess();
            onOpenChange(false);
        } catch {
            toast.error('Error al finalizar temporada');
        } finally {
            setLoading(false);
        }
    };

    // Preview calculations
    const start = period.startDate.toDate();
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const estimatedDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    const estimatedSalary = estimatedDays * period.dailyRate;
    const estimatedNet = estimatedSalary - currentLoans;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Finalizar Temporada</DialogTitle>
                    <DialogDescription>
                        Esta acción cerrará la temporada actual y calculará el pago final.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Fecha de Salida</Label>
                        <Input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                    </div>

                    <div className="bg-muted p-4 rounded-lg space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span>Días Laborados:</span>
                            <span className="font-medium">{estimatedDays} días</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Salario Total:</span>
                            <span className="font-medium">${estimatedSalary.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-orange-600">
                            <span>Menos Préstamos:</span>
                            <span>-${currentLoans.toFixed(2)}</span>
                        </div>
                        <div className="border-t pt-2 mt-2 flex justify-between font-bold text-lg">
                            <span>A Pagar:</span>
                            <span className="text-green-600">${estimatedNet.toFixed(2)}</span>
                        </div>
                    </div>

                    <div className="flex items-start gap-2 text-yellow-600 text-xs bg-yellow-50 p-2 rounded">
                        <AlertTriangle className="h-4 w-4 mt-0.5" />
                        <p>
                            Asegúrate de que todos los préstamos estén registrados antes de finalizar.
                            Esta acción no se puede deshacer.
                        </p>
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                    >
                        Cancelar
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleEndPeriod}
                        disabled={loading}
                    >
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Finalizar y Cerrar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
