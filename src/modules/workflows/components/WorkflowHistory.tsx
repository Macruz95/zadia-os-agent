/**
 * ZADIA OS - Workflow History Component
 * Historial de ejecuciones de flujos
 */

'use client';

import { useState, useEffect } from 'react';
import { Clock, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useWorkflows } from '../hooks/use-workflows';
import { cn } from '@/lib/utils';
import type { WorkflowExecution } from '../types/workflows.types';

interface WorkflowHistoryProps {
  workflowId?: string;
  limit?: number;
}

export function WorkflowHistory({ workflowId, limit = 10 }: WorkflowHistoryProps) {
  const { getExecutions } = useWorkflows();
  const [executions, setExecutions] = useState<WorkflowExecution[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadExecutions();
  }, [workflowId]);

  const loadExecutions = async () => {
    try {
      setLoading(true);
      const execs = await getExecutions(workflowId);
      setExecutions(execs.slice(0, limit));
    } catch {
      // Error handled silently
    } finally {
      setLoading(false);
    }
  };

  const statusColors = {
    pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    running: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    completed: 'bg-green-500/20 text-green-400 border-green-500/30',
    failed: 'bg-red-500/20 text-red-400 border-red-500/30',
    cancelled: 'bg-gray-500/20 text-gray-400 border-gray-500/30'
  };

  const statusIcons = {
    pending: Clock,
    running: Loader2,
    completed: CheckCircle2,
    failed: XCircle,
    cancelled: XCircle
  };

  if (loading) {
    return (
      <Card className="bg-[#161b22] border-gray-800/50">
        <CardContent className="p-6">
          <div className="text-center text-gray-400">Cargando historial...</div>
        </CardContent>
      </Card>
    );
  }

  if (executions.length === 0) {
    return (
      <Card className="bg-[#161b22] border-gray-800/50">
        <CardHeader>
          <CardTitle className="text-white">Historial de Ejecuciones</CardTitle>
          <CardDescription className="text-gray-400">
            No hay ejecuciones registradas
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="bg-[#161b22] border-gray-800/50">
      <CardHeader>
        <CardTitle className="text-white">Historial de Ejecuciones</CardTitle>
        <CardDescription className="text-gray-400">
          {executions.length} ejecución{executions.length !== 1 ? 'es' : ''} reciente{executions.length !== 1 ? 's' : ''}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {executions.map((execution) => {
          const StatusIcon = statusIcons[execution.status];
          const startedAt = execution.startedAt instanceof Date 
            ? execution.startedAt 
            : execution.startedAt.toDate();
          
          const completedAt = execution.completedAt
            ? (execution.completedAt instanceof Date 
                ? execution.completedAt 
                : execution.completedAt.toDate())
            : null;

          return (
            <div
              key={execution.id}
              className="p-3 rounded-lg border bg-[#0d1117] border-gray-800/50 hover:border-cyan-500/30 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <StatusIcon className={cn(
                      "h-4 w-4",
                      execution.status === 'running' && "animate-spin",
                      execution.status === 'completed' && "text-green-400",
                      execution.status === 'failed' && "text-red-400",
                      execution.status === 'pending' && "text-yellow-400"
                    )} />
                    <span className="font-medium text-white">{execution.workflowName}</span>
                  </div>
                  
                  <div className="text-sm text-gray-400 space-y-1">
                    <div>
                      Iniciado: {format(startedAt, "d 'de' MMMM 'a las' HH:mm", { locale: es })}
                    </div>
                    {completedAt && (
                      <div>
                        Completado: {format(completedAt, "d 'de' MMMM 'a las' HH:mm", { locale: es })}
                        {execution.duration && (
                          <span className="ml-2">({execution.duration}s)</span>
                        )}
                      </div>
                    )}
                    {execution.executedSteps.length > 0 && (
                      <div>
                        Pasos ejecutados: {execution.executedSteps.length}
                      </div>
                    )}
                  </div>

                  {execution.error && (
                    <div className="mt-2 p-2 rounded bg-red-500/10 border border-red-500/30">
                      <p className="text-xs text-red-400">{execution.error.message}</p>
                    </div>
                  )}

                  {execution.result && execution.result.success && (
                    <div className="mt-2 p-2 rounded bg-green-500/10 border border-green-500/30">
                      <p className="text-xs text-green-400">
                        {execution.result.message || 'Ejecución completada exitosamente'}
                      </p>
                    </div>
                  )}
                </div>

                <Badge
                  variant="outline"
                  className={cn("text-xs", statusColors[execution.status])}
                >
                  {execution.status === 'pending' ? 'Pendiente' :
                   execution.status === 'running' ? 'Ejecutando' :
                   execution.status === 'completed' ? 'Completado' :
                   execution.status === 'failed' ? 'Fallido' : 'Cancelado'}
                </Badge>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

