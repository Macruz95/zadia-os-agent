/**
 * ZADIA OS - Active Period Card
 * 
 * Shows current work period status and actions
 */

import { useState } from 'react';
import { format, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';
import {
    Calendar,
    DollarSign,
    Clock,
    LogOut,
    AlertCircle,
    // Plus removed - not used in this component
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import type { WorkPeriod, Loan } from '../../types/hr.types';
import { AddLoanDialog } from './AddLoanDialog';
import { EndPeriodDialog } from './EndPeriodDialog';

interface ActivePeriodCardProps {
    period: WorkPeriod;
    loans: Loan[];
    onLoanAdded: () => void;
    onPeriodEnded: () => void;
}

export function ActivePeriodCard({
    period,
    loans,
    onLoanAdded,
    onPeriodEnded
}: ActivePeriodCardProps) {
    const [showLoanDialog, setShowLoanDialog] = useState(false);
    const [showEndDialog, setShowEndDialog] = useState(false);

    // Calculate live stats
    const startDate = period.startDate.toDate();
    const today = new Date();
    const daysElapsed = differenceInDays(today, startDate) + 1;
    const currentSalary = daysElapsed * period.dailyRate;
    const totalLoans = loans.reduce((sum, loan) => sum + loan.amount, 0);
    const currentNet = currentSalary - totalLoans;

    return (
        <Card className="border-primary/20 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    Temporada Activa
                </CardTitle>
                <Badge variant="default" className="animate-pulse">
                    En Curso
                </Badge>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Key Metrics Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Inicio</p>
                        <p className="font-medium flex items-center gap-1">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            {format(startDate, 'dd MMM yyyy', { locale: es })}
                        </p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Días Laborados</p>
                        <p className="text-2xl font-bold text-primary">{daysElapsed}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Tarifa Diaria</p>
                        <p className="font-medium">${period.dailyRate.toFixed(2)}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Salario Acumulado</p>
                        <p className="font-medium text-green-600">
                            ${currentSalary.toFixed(2)}
                        </p>
                    </div>
                </div>

                <Separator />

                {/* Loans Section */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h4 className="font-medium flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 text-orange-500" />
                            Préstamos / Adelantos
                        </h4>
                        <span className="font-bold text-orange-600">
                            -${totalLoans.toFixed(2)}
                        </span>
                    </div>

                    {loans.length > 0 ? (
                        <div className="space-y-2">
                            {loans.slice(0, 3).map((loan) => (
                                <div key={loan.id} className="flex justify-between text-sm bg-muted/30 p-2 rounded">
                                    <span>{format(loan.date.toDate(), 'dd MMM', { locale: es })} - {loan.reason}</span>
                                    <span className="font-medium">-${loan.amount.toFixed(2)}</span>
                                </div>
                            ))}
                            {loans.length > 3 && (
                                <p className="text-xs text-center text-muted-foreground">
                                    + {loans.length - 3} préstamos más...
                                </p>
                            )}
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground italic">
                            No hay préstamos registrados en este periodo.
                        </p>
                    )}
                </div>

                <Separator />

                {/* Net Payable & Actions */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-muted/20 p-4 rounded-lg border">
                    <div>
                        <p className="text-sm text-muted-foreground">Saldo Actual a Pagar</p>
                        <p className="text-3xl font-bold text-green-700">
                            ${currentNet.toFixed(2)}
                        </p>
                    </div>

                    <div className="flex gap-2 w-full md:w-auto">
                        <Button
                            variant="outline"
                            className="flex-1"
                            onClick={() => setShowLoanDialog(true)}
                        >
                            <DollarSign className="mr-2 h-4 w-4" />
                            Registrar Préstamo
                        </Button>
                        <Button
                            variant="destructive"
                            className="flex-1"
                            onClick={() => setShowEndDialog(true)}
                        >
                            <LogOut className="mr-2 h-4 w-4" />
                            Finalizar Temporada
                        </Button>
                    </div>
                </div>
            </CardContent>

            <AddLoanDialog
                open={showLoanDialog}
                onOpenChange={setShowLoanDialog}
                periodId={period.id}
                employeeId={period.employeeId}
                onSuccess={onLoanAdded}
            />

            <EndPeriodDialog
                open={showEndDialog}
                onOpenChange={setShowEndDialog}
                period={period}
                currentLoans={totalLoans}
                onSuccess={onPeriodEnded}
            />
        </Card>
    );
}
