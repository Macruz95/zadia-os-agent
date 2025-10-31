/**
 * ZADIA OS - Work Sessions Tab
 * Tab para gestión de sesiones de trabajo del proyecto
 * Rule #4: Modular components
 * Rule #5: Max 200 lines per file
 */

'use client';

import { useState } from 'react';
import { Play, Pause, Clock, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useWorkSessions } from '../hooks/use-work-sessions';
import { SessionsHistory } from './SessionsHistory';
import type { WorkSession } from '../types/projects.types';

interface WorkSessionsTabProps {
  projectId: string;
  userId: string;
  userName: string;
  hourlyRate?: number;
}

export function WorkSessionsTab({
  projectId,
  userId,
  userName,
  hourlyRate = 50,
}: WorkSessionsTabProps) {
  const {
    sessions,
    loading,
    activeSession,
    totalHours,
    totalCost,
    startSession,
    stopSession,
  } = useWorkSessions(projectId);

  const { formattedTime } = useWorkSessionTimer(activeSession);

  const [isStarting, setIsStarting] = useState(false);
  const [isStopping, setIsStopping] = useState(false);

  const handleStartSession = async () => {
    try {
      setIsStarting(true);
      await startSession(userId, userName, hourlyRate);
      toast.success('Sesión iniciada');
    } catch {
      toast.error('Error al iniciar sesión');
    } finally {
      setIsStarting(false);
    }
  };

  const handleStopSession = async () => {
    if (!activeSession) return;

    try {
      setIsStopping(true);
      await stopSession(activeSession.id);
      toast.success('Sesión finalizada');
    } catch {
      toast.error('Error al finalizar sesión');
    } finally {
      setIsStopping(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Timer Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Sesión Actual
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              {activeSession ? (
                <>
                  <div className="text-4xl font-bold font-mono">
                    {formattedTime}
                  </div>
                  <Badge variant="default">En progreso</Badge>
                </>
              ) : (
                <>
                  <div className="text-4xl font-bold text-muted-foreground font-mono">
                    00:00:00
                  </div>
                  <Badge variant="secondary">Sin sesión activa</Badge>
                </>
              )}
            </div>

            <div className="flex gap-2">
              {activeSession ? (
                <Button
                  onClick={handleStopSession}
                  disabled={isStopping}
                  variant="destructive"
                  size="lg"
                >
                  <Pause className="mr-2 h-5 w-5" />
                  Detener
                </Button>
              ) : (
                <Button
                  onClick={handleStartSession}
                  disabled={isStarting}
                  size="lg"
                >
                  <Play className="mr-2 h-5 w-5" />
                  Iniciar
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Horas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalHours.toFixed(2)}h
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Costo Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totalCost.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* History */}
      <SessionsHistory sessions={sessions} loading={loading} />
    </div>
  );
}

/**
 * Hook para timer de sesión activa
 */
function useWorkSessionTimer(activeSession: WorkSession | null) {
  const now = Date.now();
  const startTime = activeSession?.startTime.toMillis() || now;
  const currentElapsed = Math.floor((now - startTime) / 1000);

  const hours = Math.floor(currentElapsed / 3600);
  const minutes = Math.floor((currentElapsed % 3600) / 60);
  const seconds = currentElapsed % 60;

  const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes
    .toString()
    .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  return { formattedTime, elapsedSeconds: currentElapsed };
}
