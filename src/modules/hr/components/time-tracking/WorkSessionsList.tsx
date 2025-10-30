/**
 * ZADIA OS - Work Sessions List
 * 
 * Table displaying work sessions history
 * REGLA #2: ShadCN UI + Lucide Icons
 * REGLA #5: <200 líneas
 */

'use client';

import { useMemo } from 'react';
import { Clock, DollarSign, Calendar } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { WorkSession } from '../../types/time-tracking.types';

interface WorkSessionsListProps {
  sessions: WorkSession[];
  loading?: boolean;
}

const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
};

export function WorkSessionsList({ sessions, loading }: WorkSessionsListProps) {
  // Calculate totals
  const totals = useMemo(() => {
    return sessions.reduce(
      (acc, session) => ({
        hours: acc.hours + session.durationSeconds / 3600,
        cost: acc.cost + session.laborCost,
      }),
      { hours: 0, cost: 0 }
    );
  }, [sessions]);

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'default',
      completed: 'secondary',
      paused: 'outline',
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {status === 'active' && 'En progreso'}
        {status === 'completed' && 'Completada'}
        {status === 'paused' && 'Pausada'}
      </Badge>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            Cargando sesiones...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (sessions.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            No hay sesiones registradas
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Historial de Sesiones
        </CardTitle>
        <CardDescription>
          Total: {totals.hours.toFixed(1)}h | ${totals.cost.toFixed(2)}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Actividad</TableHead>
              <TableHead>Proyecto</TableHead>
              <TableHead>Duración</TableHead>
              <TableHead>Costo</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {sessions.map((session) => (
              <TableRow key={session.id}>
                <TableCell className="text-sm">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-muted-foreground" />
                    {formatDate(session.startTime.toDate())}
                  </div>
                </TableCell>

                <TableCell>
                  <div className="max-w-xs">
                    <p className="font-medium truncate">{session.activity}</p>
                    {session.notes && (
                      <p className="text-xs text-muted-foreground truncate">
                        {session.notes}
                      </p>
                    )}
                  </div>
                </TableCell>

                <TableCell className="text-sm">
                  {session.projectName || (
                    <span className="text-muted-foreground">Sin proyecto</span>
                  )}
                </TableCell>

                <TableCell>
                  <div className="flex items-center gap-1 text-sm">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    {formatDuration(session.durationSeconds)}
                  </div>
                </TableCell>

                <TableCell>
                  <div className="flex items-center gap-1 font-medium">
                    <DollarSign className="h-3 w-3 text-green-600" />
                    {session.laborCost.toFixed(2)}
                  </div>
                </TableCell>

                <TableCell>
                  {getStatusBadge(session.status)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
