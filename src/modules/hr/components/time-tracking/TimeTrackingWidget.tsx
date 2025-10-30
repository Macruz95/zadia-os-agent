/**
 * ZADIA OS - Time Tracking Widget
 * 
 * Timer widget for tracking work sessions
 * REGLA #2: ShadCN UI + Lucide Icons
 * REGLA #5: <200 líneas
 */

'use client';

import { useState } from 'react';
import { Play, Square, DollarSign, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTimeTracker } from '../../hooks/use-time-tracker';
import { notificationService } from '@/lib/notifications';

interface TimeTrackingWidgetProps {
  employeeId: string;
  employeeName: string;
  hourlyRate: number;
  projectId?: string;
  projectName?: string;
  taskId?: string;
  taskName?: string;
}

export function TimeTrackingWidget(props: TimeTrackingWidgetProps) {
  const [activityInput, setActivityInput] = useState('');
  
  const {
    isRunning,
    formattedTime,
    currentCost,
    activity,
    loading,
    start,
    stop,
  } = useTimeTracker(props);

  const handleStart = async () => {
    if (!activityInput.trim()) {
      notificationService.error('Describe la actividad antes de iniciar');
      return;
    }

    try {
      await start(activityInput);
      notificationService.success('Timer iniciado');
    } catch {
      notificationService.error('Error al iniciar timer');
    }
  };

  const handleStop = async () => {
    try {
      await stop();
      notificationService.success('Sesión registrada');
      setActivityInput('');
    } catch {
      notificationService.error('Error al detener timer');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Control de Tiempo
        </CardTitle>
        <CardDescription>
          Registra tu tiempo de trabajo en esta tarea
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Timer Display */}
        <div className="flex items-center justify-center p-6 bg-muted rounded-lg">
          <div className="text-center">
            <div className="text-4xl font-mono font-bold mb-2">
              {formattedTime}
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <DollarSign className="h-4 w-4" />
              <span>${currentCost.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Activity Input or Display */}
        {!isRunning ? (
          <div className="space-y-2">
            <Label htmlFor="activity">¿En qué vas a trabajar?</Label>
            <Input
              id="activity"
              placeholder="Ej: Desarrollo de funcionalidad X"
              value={activityInput}
              onChange={(e) => setActivityInput(e.target.value)}
              disabled={loading}
            />
          </div>
        ) : (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm font-medium text-blue-900">
              Trabajando en: {activity}
            </p>
          </div>
        )}

        {/* Project Info */}
        {props.projectName && (
          <div className="text-sm text-muted-foreground">
            Proyecto: <span className="font-medium">{props.projectName}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          {!isRunning ? (
            <Button
              onClick={handleStart}
              disabled={loading || !activityInput.trim()}
              className="flex-1"
            >
              <Play className="h-4 w-4 mr-2" />
              Iniciar
            </Button>
          ) : (
            <Button
              onClick={handleStop}
              disabled={loading}
              variant="destructive"
              className="flex-1"
            >
              <Square className="h-4 w-4 mr-2" />
              Detener y Guardar
            </Button>
          )}
        </div>

        {/* Info */}
        <div className="text-xs text-muted-foreground text-center">
          Tarifa: ${props.hourlyRate}/hora
        </div>
      </CardContent>
    </Card>
  );
}
