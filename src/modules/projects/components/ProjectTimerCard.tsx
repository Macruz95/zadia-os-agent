'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Clock, Play, Pause, Trash2 } from 'lucide-react';
import { useProjectTimer } from '../hooks/use-project-timer';

interface ProjectTimerCardProps {
  projectId: string;
  project: {
    name?: string;
    hourlyRate?: number;
    startDate?: unknown;
  };
}

export function ProjectTimerCard({ projectId, project }: ProjectTimerCardProps) {
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);
  
  const {
    isTimerActive,
    elapsedTime,
    workSessions,
    totalHours,
    totalCost,
    startTimer,
    pauseTimer,
    deleteSession,
    formatTime,
    formatDate
  } = useProjectTimer({
    projectId,
    hourlyRate: project.hourlyRate || 15,
    hasStarted: !!project.startDate
  });

  const handleDeleteSession = async () => {
    if (sessionToDelete) {
      await deleteSession(sessionToDelete);
      setSessionToDelete(null);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="mr-2 h-5 w-5" />
            Control de Tiempo del Proyecto
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Timer Display */}
          <div className="flex items-center justify-center gap-4 p-6 rounded-lg bg-slate-50 dark:bg-slate-900">
            <div className="text-center">
              <p className="text-6xl font-mono font-bold tabular-nums">
                {formatTime(elapsedTime)}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                {isTimerActive ? 'Sesión en curso' : 'Timer detenido'}
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <Button
                onClick={isTimerActive ? pauseTimer : startTimer}
                size="lg"
                variant={isTimerActive ? 'destructive' : 'default'}
              >
                {isTimerActive ? (
                  <>
                    <Pause className="h-4 w-4 mr-2" />
                    Pausar
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Iniciar
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-2 gap-4 p-4 rounded-lg border">
            <div>
              <p className="text-sm text-muted-foreground">Total de Horas</p>
              <p className="text-2xl font-bold">{totalHours.toFixed(2)}h</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Costo Total de Mano de Obra</p>
              <p className="text-2xl font-bold text-green-600">${totalCost.toFixed(2)}</p>
            </div>
          </div>

          {/* Sessions History */}
          <div>
            <h4 className="font-semibold mb-3">Historial de Sesiones</h4>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Duración</TableHead>
                    <TableHead className="text-right">Costo</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {workSessions.length > 0 ? (
                    workSessions.map((session) => (
                      <TableRow key={session.id}>
                        <TableCell>{formatDate(session.startTime)}</TableCell>
                        <TableCell>{formatTime(session.durationSeconds * 1000)}</TableCell>
                        <TableCell className="text-right font-medium">
                          ${session.cost.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSessionToDelete(session.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                        No hay sesiones de trabajo registradas
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!sessionToDelete} onOpenChange={() => setSessionToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar sesión de trabajo?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La sesión será eliminada permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteSession} className="bg-red-600 hover:bg-red-700">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
