/**
 * ZADIA OS - Active Period Card
 * 
 * Shows current work period status and actions
 * Includes bonuses and carried debt tracking
 */

import { useState, useEffect } from 'react';
import { format, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';
import {
    Calendar,
    DollarSign,
    Clock,
    LogOut,
    AlertCircle,
    Gift,
    AlertTriangle,
    Pencil,
    CreditCard,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import type { WorkPeriod, Loan, Bonus } from '../../types/hr.types';
import { BONUS_TYPE_CONFIG } from '../../types/hr.types';
import { BonusesService } from '../../services/bonuses.service';
import { AddLoanDialog } from './AddLoanDialog';
import { AddBonusDialog } from './AddBonusDialog';
import { EndPeriodDialog } from './EndPeriodDialog';
import { EditPeriodDialog } from './EditPeriodDialog';
import { AddLoanPaymentDialog } from './AddLoanPaymentDialog';

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
    const [showBonusDialog, setShowBonusDialog] = useState(false);
    const [showEndDialog, setShowEndDialog] = useState(false);
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [showPaymentDialog, setShowPaymentDialog] = useState(false);
    const [selectedLoanForPayment, setSelectedLoanForPayment] = useState<Loan | null>(null);
    const [bonuses, setBonuses] = useState<Bonus[]>([]);

    // Fetch bonuses
    useEffect(() => {
        const fetchBonuses = async () => {
            const data = await BonusesService.getBonusesByPeriod(period.id);
            setBonuses(data);
        };
        fetchBonuses();
    }, [period.id]);

    // Calculate live stats
    const startDate = period.startDate.toDate();
    const today = new Date();
    const daysElapsed = differenceInDays(today, startDate) + 1;
    const currentSalary = daysElapsed * period.dailyRate;
    // Use remaining balance for loans (not original amount)
    const totalLoansRemaining = loans.reduce((sum, loan) => sum + (loan.remainingBalance ?? loan.amount), 0);
    const totalBonuses = bonuses.reduce((sum, bonus) => sum + bonus.amount, 0);
    const carriedDebt = period.carriedDebt || 0;
    
    // Net = Salary + Bonuses - Loans Remaining - Carried Debt
    const currentNet = currentSalary + totalBonuses - totalLoansRemaining - carriedDebt;

    // Filter loans with pending balance
    const pendingLoans = loans.filter(loan => (loan.remainingBalance ?? loan.amount) > 0);

    const handleBonusAdded = async () => {
        const data = await BonusesService.getBonusesByPeriod(period.id);
        setBonuses(data);
        onLoanAdded(); // Refresh parent data
    };

    const handlePeriodEdited = () => {
        onLoanAdded(); // Refresh parent data to get updated period
    };

    return (
        <Card className="border-primary/20 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    Temporada Activa
                </CardTitle>
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowEditDialog(true)}
                        title="Editar temporada"
                    >
                        <Pencil className="h-4 w-4" />
                    </Button>
                    <Badge variant="default" className="animate-pulse">
                        En Curso
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Carried Debt Warning */}
                {carriedDebt > 0 && (
                    <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg p-3 flex items-center gap-3">
                        <AlertTriangle className="h-5 w-5 text-orange-500" />
                        <div>
                            <p className="font-medium text-orange-700 dark:text-orange-400">
                                Deuda de temporada anterior
                            </p>
                            <p className="text-sm text-orange-600 dark:text-orange-500">
                                ${carriedDebt.toFixed(2)} pendientes que se descontarán de esta temporada
                            </p>
                        </div>
                    </div>
                )}

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

                {/* Bonuses Section */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h4 className="font-medium flex items-center gap-2">
                            <Gift className="h-4 w-4 text-blue-500" />
                            Bonificaciones / Aguinaldo
                        </h4>
                        <span className="font-bold text-blue-600">
                            +${totalBonuses.toFixed(2)}
                        </span>
                    </div>

                    {bonuses.length > 0 ? (
                        <div className="space-y-2">
                            {bonuses.slice(0, 3).map((bonus) => (
                                <div key={bonus.id} className="flex justify-between text-sm bg-blue-50 dark:bg-blue-950/20 p-2 rounded">
                                    <span>
                                        {format(bonus.date.toDate(), 'dd MMM', { locale: es })} - {BONUS_TYPE_CONFIG[bonus.type].label}
                                        {bonus.description && `: ${bonus.description}`}
                                    </span>
                                    <span className="font-medium text-blue-600">+${bonus.amount.toFixed(2)}</span>
                                </div>
                            ))}
                            {bonuses.length > 3 && (
                                <p className="text-xs text-center text-muted-foreground">
                                    + {bonuses.length - 3} bonificaciones más...
                                </p>
                            )}
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground italic">
                            No hay bonificaciones registradas en este periodo.
                        </p>
                    )}
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
                            -${totalLoansRemaining.toFixed(2)}
                        </span>
                    </div>

                    {loans.length > 0 ? (
                        <div className="space-y-2">
                            {loans.slice(0, 5).map((loan) => {
                                const remaining = loan.remainingBalance ?? loan.amount;
                                const isPaid = remaining === 0;
                                const isPartial = remaining > 0 && remaining < loan.amount;
                                
                                return (
                                    <div 
                                        key={loan.id} 
                                        className={`flex items-center justify-between text-sm p-2 rounded ${
                                            isPaid 
                                                ? 'bg-green-50 dark:bg-green-950/20' 
                                                : 'bg-orange-50 dark:bg-orange-950/20'
                                        }`}
                                    >
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <span>{format(loan.date.toDate(), 'dd MMM', { locale: es })} - {loan.reason}</span>
                                                {isPaid && (
                                                    <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                                                        Pagado
                                                    </Badge>
                                                )}
                                                {isPartial && (
                                                    <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-700">
                                                        Parcial
                                                    </Badge>
                                                )}
                                            </div>
                                            {isPartial && (
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    Original: ${loan.amount.toFixed(2)} | Saldo: ${remaining.toFixed(2)}
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`font-medium ${isPaid ? 'text-green-600 line-through' : 'text-orange-600'}`}>
                                                -${remaining.toFixed(2)}
                                            </span>
                                            {!isPaid && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-7 px-2"
                                                    onClick={() => {
                                                        setSelectedLoanForPayment(loan);
                                                        setShowPaymentDialog(true);
                                                    }}
                                                    title="Registrar abono"
                                                >
                                                    <CreditCard className="h-3 w-3" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                            {loans.length > 5 && (
                                <p className="text-xs text-center text-muted-foreground">
                                    + {loans.length - 5} préstamos más...
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

                {/* Summary */}
                <div className="bg-muted/30 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                        <span>Salario ({daysElapsed} días × ${period.dailyRate})</span>
                        <span className="text-green-600">+${currentSalary.toFixed(2)}</span>
                    </div>
                    {totalBonuses > 0 && (
                        <div className="flex justify-between text-sm">
                            <span>Bonificaciones</span>
                            <span className="text-blue-600">+${totalBonuses.toFixed(2)}</span>
                        </div>
                    )}
                    {totalLoansRemaining > 0 && (
                        <div className="flex justify-between text-sm">
                            <span>Préstamos (saldo pendiente)</span>
                            <span className="text-orange-600">-${totalLoansRemaining.toFixed(2)}</span>
                        </div>
                    )}
                    {carriedDebt > 0 && (
                        <div className="flex justify-between text-sm">
                            <span>Deuda anterior</span>
                            <span className="text-red-600">-${carriedDebt.toFixed(2)}</span>
                        </div>
                    )}
                </div>

                {/* Net Payable & Actions */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-muted/20 p-4 rounded-lg border">
                    <div>
                        <p className="text-sm text-muted-foreground">Saldo Actual a Pagar</p>
                        <p className={`text-3xl font-bold ${currentNet >= 0 ? 'text-green-700' : 'text-red-600'}`}>
                            ${currentNet.toFixed(2)}
                        </p>
                        {currentNet < 0 && (
                            <p className="text-xs text-red-500">
                                Esta cantidad quedará como deuda para la próxima temporada
                            </p>
                        )}
                    </div>

                    <div className="flex flex-wrap gap-2 w-full md:w-auto">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowBonusDialog(true)}
                        >
                            <Gift className="mr-2 h-4 w-4" />
                            Bonificación
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowLoanDialog(true)}
                        >
                            <DollarSign className="mr-2 h-4 w-4" />
                            Préstamo
                        </Button>
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setShowEndDialog(true)}
                        >
                            <LogOut className="mr-2 h-4 w-4" />
                            Finalizar
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

            <AddBonusDialog
                open={showBonusDialog}
                onOpenChange={setShowBonusDialog}
                periodId={period.id}
                employeeId={period.employeeId}
                onSuccess={handleBonusAdded}
            />

            <EndPeriodDialog
                open={showEndDialog}
                onOpenChange={setShowEndDialog}
                period={period}
                currentLoans={totalLoansRemaining}
                currentBonuses={totalBonuses}
                carriedDebt={carriedDebt}
                onSuccess={onPeriodEnded}
            />

            <EditPeriodDialog
                open={showEditDialog}
                onOpenChange={setShowEditDialog}
                period={period}
                onSuccess={handlePeriodEdited}
            />

            {selectedLoanForPayment && (
                <AddLoanPaymentDialog
                    open={showPaymentDialog}
                    onOpenChange={(open) => {
                        setShowPaymentDialog(open);
                        if (!open) setSelectedLoanForPayment(null);
                    }}
                    loan={selectedLoanForPayment}
                    currentPeriodId={period.id}
                    onSuccess={onLoanAdded}
                />
            )}
        </Card>
    );
}
