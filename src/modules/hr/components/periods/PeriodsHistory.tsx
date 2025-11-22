/**
 * ZADIA OS - Periods History
 * 
 * Shows past work periods
 */

import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import type { WorkPeriod } from '../../types/hr.types';

interface PeriodsHistoryProps {
    periods: WorkPeriod[];
}

export function PeriodsHistory({ periods }: PeriodsHistoryProps) {
    const historyPeriods = periods.filter(p => p.status === 'completed');

    if (historyPeriods.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Historial de Temporadas</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground text-sm">
                        No hay temporadas finalizadas registradas.
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">Historial de Temporadas</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Periodo</TableHead>
                            <TableHead>Días</TableHead>
                            <TableHead>Tarifa</TableHead>
                            <TableHead>Salario</TableHead>
                            <TableHead>Préstamos</TableHead>
                            <TableHead className="text-right">Pagado</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {historyPeriods.map((period) => (
                            <TableRow key={period.id}>
                                <TableCell>
                                    <div className="flex flex-col text-sm">
                                        <span className="font-medium">
                                            {format(period.startDate.toDate(), 'dd MMM yyyy', { locale: es })}
                                        </span>
                                        <span className="text-muted-foreground text-xs">
                                            al {period.endDate ? format(period.endDate.toDate(), 'dd MMM yyyy', { locale: es }) : '-'}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell>{period.totalDays}</TableCell>
                                <TableCell>${period.dailyRate.toFixed(2)}</TableCell>
                                <TableCell>${period.totalSalary.toFixed(2)}</TableCell>
                                <TableCell className="text-orange-600">
                                    -${period.totalLoans.toFixed(2)}
                                </TableCell>
                                <TableCell className="text-right font-bold text-green-600">
                                    ${period.netPayable.toFixed(2)}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
