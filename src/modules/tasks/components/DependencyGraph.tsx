/**
 * ZADIA OS - Dependency Graph Component
 * Visualización de dependencias entre tareas
 */

'use client';

import { useState } from 'react';
import { Link2, ArrowRight, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Task, DependencyAnalysis } from '../types/tasks.types';

interface DependencyGraphProps {
  task: Task;
  allTasks: Task[];
  analysis?: DependencyAnalysis;
  onTaskClick?: (taskId: string) => void;
}

export function DependencyGraph({ task, allTasks, analysis, onTaskClick }: DependencyGraphProps) {
  const [expanded, setExpanded] = useState(false);

  const getTaskById = (taskId: string) => allTasks.find(t => t.id === taskId);

  const blockers = task.dependencies.filter(d => d.type === 'blocked-by');
  const blocks = task.blocks.map(id => {
    const t = getTaskById(id);
    return t ? { taskId: id, taskTitle: t.title, type: 'blocks' as const, critical: false } : null;
  }).filter(Boolean) as typeof task.dependencies;

  const criticalPath = analysis?.criticalPath || [];
  const estimatedDelay = analysis?.estimatedDelay || 0;

  if (blockers.length === 0 && blocks.length === 0 && !expanded) {
    return (
      <Card className="bg-[#161b22] border-gray-800/50">
        <CardHeader>
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <Link2 className="h-4 w-4 text-gray-400" />
            Dependencias
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-400 py-4">
            <p className="text-sm">Sin dependencias</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(true)}
              className="mt-2 text-xs"
            >
              Ver análisis completo
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-[#161b22] border-gray-800/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <Link2 className="h-4 w-4 text-cyan-400" />
              Dependencias
            </CardTitle>
            <CardDescription className="text-gray-400 text-xs">
              {blockers.length + blocks.length} relación{blockers.length + blocks.length !== 1 ? 'es' : ''}
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
            className="text-xs"
          >
            {expanded ? 'Colapsar' : 'Expandir'}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Advertencia de retraso */}
        {estimatedDelay > 0 && (
          <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/30">
            <div className="flex items-center gap-2 text-orange-400 text-sm">
              <AlertTriangle className="h-4 w-4" />
              <span>Retraso estimado: {estimatedDelay} día{estimatedDelay !== 1 ? 's' : ''}</span>
            </div>
          </div>
        )}

        {/* Bloqueada por */}
        {blockers.length > 0 && (
          <div>
            <div className="text-xs font-semibold text-gray-400 mb-2 uppercase">
              Bloqueada por ({blockers.length})
            </div>
            <div className="space-y-2">
              {blockers.map((dep, idx) => {
                const depTask = getTaskById(dep.taskId);
                const isCritical = criticalPath.includes(dep.taskId);
                
                return (
                  <div
                    key={idx}
                    onClick={() => onTaskClick?.(dep.taskId)}
                    className={cn(
                      "p-2 rounded-lg border transition-all cursor-pointer",
                      "bg-[#0d1117] border-gray-800/50 hover:border-cyan-500/30",
                      isCritical && "border-orange-500/50 bg-orange-500/10"
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <ArrowRight className="h-3.5 w-3.5 text-gray-500 rotate-180" />
                        <span className="text-sm text-white truncate">
                          {depTask?.title || dep.taskTitle}
                        </span>
                        {isCritical && (
                          <Badge variant="outline" className="text-xs bg-orange-500/20 text-orange-400 border-orange-500/30">
                            Crítica
                          </Badge>
                        )}
                      </div>
                      {depTask && (
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-xs",
                            depTask.status === 'done' 
                              ? "bg-green-500/20 text-green-400 border-green-500/30"
                              : "bg-gray-500/20 text-gray-400 border-gray-500/30"
                          )}
                        >
                          {depTask.status === 'done' ? (
                            <CheckCircle2 className="h-3 w-3" />
                          ) : (
                            depTask.status
                          )}
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Bloquea */}
        {blocks.length > 0 && (
          <div>
            <div className="text-xs font-semibold text-gray-400 mb-2 uppercase">
              Bloquea ({blocks.length})
            </div>
            <div className="space-y-2">
              {blocks.map((dep, idx) => {
                const depTask = getTaskById(dep.taskId);
                
                return (
                  <div
                    key={idx}
                    onClick={() => onTaskClick?.(dep.taskId)}
                    className={cn(
                      "p-2 rounded-lg border transition-all cursor-pointer",
                      "bg-[#0d1117] border-gray-800/50 hover:border-cyan-500/30"
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <ArrowRight className="h-3.5 w-3.5 text-gray-500" />
                        <span className="text-sm text-white truncate">
                          {depTask?.title || dep.taskTitle}
                        </span>
                      </div>
                      {depTask && (
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-xs",
                            depTask.status === 'done' 
                              ? "bg-green-500/20 text-green-400 border-green-500/30"
                              : "bg-gray-500/20 text-gray-400 border-gray-500/30"
                          )}
                        >
                          {depTask.status === 'done' ? (
                            <CheckCircle2 className="h-3 w-3" />
                          ) : (
                            depTask.status
                          )}
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Camino crítico */}
        {expanded && criticalPath.length > 0 && (
          <div>
            <div className="text-xs font-semibold text-orange-400 mb-2 uppercase">
              Camino Crítico
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {criticalPath.map((taskId, idx) => {
                const criticalTask = getTaskById(taskId);
                return (
                  <div key={idx} className="flex items-center gap-2">
                    {idx > 0 && <ArrowRight className="h-3 w-3 text-gray-500" />}
                    <Badge
                      variant="outline"
                      className="text-xs bg-orange-500/20 text-orange-400 border-orange-500/30 cursor-pointer hover:bg-orange-500/30"
                      onClick={() => onTaskClick?.(taskId)}
                    >
                      {criticalTask?.title || taskId.slice(0, 8)}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

