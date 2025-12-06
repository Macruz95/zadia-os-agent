/**
 * ZADIA OS - End Period Dialog
 * 
 * Dialog for ending a work period with debt carryover options
 */

import { useState } from 'react';
import { format } from 'date-fns';
import { Loader2, AlertTriangle, ArrowRight } from 'lucide-react';
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
import { Checkbox } from '@/components/ui/checkbox';
import { WorkPeriodsService } from '@/modules/hr/services/work-periods.service';
import { useTenantId } from '@/contexts/TenantContext';
import type { WorkPeriod } from '@/modules/hr/types/hr.types';

interface EndPeriodDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    period: WorkPeriod;
    currentLoans: number;
    currentBonuses?: number;
    carriedDebt?: number;
    onSuccess: () => void;
}

export function EndPeriodDialog({
    open,
    onOpenChange,
    period,
    currentLoans,
    currentBonuses = 0,
    carriedDebt = 0,
    onSuccess,
}: EndPeriodDialogProps) {
    const [loading, setLoading] = useState(false);
    const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [carryDebt, setCarryDebt] = useState(true);
    const tenantId = useTenantId();

    const handleEndPeriod = async () => {
        try {
            setLoading(true);
            await WorkPeriodsService.endPeriod(period.id, new Date(endDate), carryDebt, tenantId || undefined);

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
    
    // Total earnings = Salary + Bonuses
    const totalEarnings = estimatedSalary + currentBonuses;
    
    // Total deductions = Loans + Carried Debt
    const totalDeductions = currentLoans + carriedDebt;
    
    // Net payable
    const estimatedNet = totalEarnings - totalDeductions;
    
    // If negative, this will be the debt to carry
    const debtToCarry = estimatedNet < 0 ? Math.abs(estimatedNet) : 0;
    const amountToPay = estimatedNet >= 0 ? estimatedNet : 0;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg">
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
                        <p className="font-semibold text-base mb-3">Resumen de la Temporada</p>
                        
                        {/* Earnings */}
                        <div className="space-y-1">
                            <div className="flex justify-between">
                                <span>Salario ({estimatedDays} días × ${period.dailyRate}):</span>
                                <span className="font-medium text-green-600">+${estimatedSalary.toFixed(2)}</span>
                            </div>
                            {currentBonuses > 0 && (
                                <div className="flex justify-between">
                                    <span>Bonificaciones:</span>
                                    <span className="font-medium text-blue-600">+${currentBonuses.toFixed(2)}</span>
                                </div>
                            )}
                            <div className="flex justify-between font-medium border-t pt-1 mt-1">
                                <span>Total Devengado:</span>
                                <span className="text-green-700">${totalEarnings.toFixed(2)}</span>
                            </div>
                        </div>

                        {/* Deductions */}
                        <div className="space-y-1 mt-3">
                            {currentLoans > 0 && (
                                <div className="flex justify-between text-orange-600">
                                    <span>Préstamos:</span>
                                    <span>-${currentLoans.toFixed(2)}</span>
                                </div>
                            )}
                            {carriedDebt > 0 && (
                                <div className="flex justify-between text-red-600">
                                    <span>Deuda de temporada anterior:</span>
                                    <span>-${carriedDebt.toFixed(2)}</span>
                                </div>
                            )}
                            {totalDeductions > 0 && (
                                <div className="flex justify-between font-medium border-t pt-1 mt-1">
                                    <span>Total Deducciones:</span>
                                    <span className="text-orange-700">-${totalDeductions.toFixed(2)}</span>
                                </div>
                            )}
                        </div>

                        {/* Final Amount */}
                        <div className="border-t-2 pt-3 mt-3">
                            <div className="flex justify-between font-bold text-lg">
                                <span>A Pagar:</span>
                                <span className={amountToPay > 0 ? 'text-green-600' : 'text-gray-500'}>
                                    ${amountToPay.toFixed(2)}
                                </span>
                            </div>
                            
                            {debtToCarry > 0 && (
                                <div className="flex justify-between font-bold text-lg mt-2 text-red-600">
                                    <span className="flex items-center gap-2">
                                        Deuda pendiente:
                                        <ArrowRight className="h-4 w-4" />
                                    </span>
                                    <span>${debtToCarry.toFixed(2)}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Carry Debt Option */}
                    {debtToCarry > 0 && (
                        <div className="flex items-center space-x-2 bg-red-50 dark:bg-red-950/20 p-3 rounded-lg border border-red-200 dark:border-red-800">
                            <Checkbox
                                id="carryDebt"
                                checked={carryDebt}
                                onCheckedChange={(checked) => setCarryDebt(checked === true)}
                            />
                            <Label 
                                htmlFor="carryDebt" 
                                className="text-sm cursor-pointer"
                            >
                                Transferir deuda de <strong>${debtToCarry.toFixed(2)}</strong> a la próxima temporada
                            </Label>
                        </div>
                    )}

                    <div className="flex items-start gap-2 text-yellow-600 text-xs bg-yellow-50 dark:bg-yellow-950/20 p-2 rounded">
                        <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                        <div>
                            <p className="font-medium">Antes de finalizar, verifica que:</p>
                            <ul className="list-disc ml-4 mt-1">
                                <li>Todos los préstamos estén registrados</li>
                                <li>Todas las bonificaciones estén registradas</li>
                                <li>La fecha de salida sea correcta</li>
                            </ul>
                            <p className="mt-1">Esta acción no se puede deshacer.</p>
                        </div>
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
