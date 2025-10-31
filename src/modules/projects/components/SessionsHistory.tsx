/**
 * ZADIA OS - Sessions History Component
 * Historial de sesiones de trabajo
 * Rule #5: Max 200 lines per file
 */

'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import type { WorkSession } from '../types/projects.types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface SessionsHistoryProps {
  sessions: WorkSession[];
  loading: boolean;
  onDelete?: (sessionId: string) => void;
}

export function SessionsHistory({
  sessions,
  loading,
  onDelete,
}: SessionsHistoryProps) {
  if (loading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Cargando sesiones...
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No hay sesiones registradas
      </div>
    );
  }

  const completedSessions = sessions.filter((s) => s.endTime);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Historial de Sesiones</h3>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuario</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Inicio</TableHead>
              <TableHead>Fin</TableHead>
              <TableHead>Duración</TableHead>
              <TableHead>Tarifa/h</TableHead>
              <TableHead>Costo</TableHead>
              <TableHead>Estado</TableHead>
              {onDelete && <TableHead className="w-[50px]"></TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {completedSessions.map((session) => (
              <TableRow key={session.id}>
                <TableCell className="font-medium">
                  {session.userName}
                </TableCell>
                <TableCell>
                  {format(session.startTime.toDate(), 'dd MMM yyyy', {
                    locale: es,
                  })}
                </TableCell>
                <TableCell>
                  {format(session.startTime.toDate(), 'HH:mm', {
                    locale: es,
                  })}
                </TableCell>
                <TableCell>
                  {session.endTime
                    ? format(session.endTime.toDate(), 'HH:mm', {
                        locale: es,
                      })
                    : '-'}
                </TableCell>
                <TableCell>
                  {session.durationSeconds
                    ? formatDuration(session.durationSeconds)
                    : '-'}
                </TableCell>
                <TableCell>
                  ${session.hourlyRate.toFixed(2)}
                </TableCell>
                <TableCell className="font-semibold">
                  ${session.totalCost?.toFixed(2) || '0.00'}
                </TableCell>
                <TableCell>
                  {session.endTime ? (
                    <Badge variant="secondary">Completada</Badge>
                  ) : (
                    <Badge>En progreso</Badge>
                  )}
                </TableCell>
                {onDelete && (
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(session.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
}
