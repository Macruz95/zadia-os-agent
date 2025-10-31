/**
 * ZADIA OS - Task Card Component
 * Tarjeta individual de tarea con acciones
 * Rule #5: Max 200 lines per file
 */

'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreVertical, Trash2, Calendar, User } from 'lucide-react';
import type { ProjectTask, TaskStatus } from '../types/entities/task.types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface TaskCardProps {
  task: ProjectTask;
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
  onDelete: (taskId: string) => void;
}

const priorityColors: Record<string, string> = {
  low: 'bg-blue-500',
  medium: 'bg-yellow-500',
  high: 'bg-orange-500',
  urgent: 'bg-red-500',
  critical: 'bg-red-600',
};

const priorityLabels: Record<string, string> = {
  low: 'Baja',
  medium: 'Media',
  high: 'Alta',
  urgent: 'Urgente',
  critical: 'Crítica',
};

export function TaskCard({ task, onStatusChange, onDelete }: TaskCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="pt-4">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm truncate">{task.title}</h4>
              {task.description && (
                <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                  {task.description}
                </p>
              )}
            </div>

            {/* Actions Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onStatusChange(task.id, 'todo')}>
                  Mover a Por Hacer
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onStatusChange(task.id, 'in-progress')}>
                  Mover a En Progreso
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onStatusChange(task.id, 'review')}>
                  Mover a Revisión
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onStatusChange(task.id, 'done')}>
                  Marcar Completada
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDelete(task.id)}
                  className="text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Priority */}
          <div className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${priorityColors[task.priority]}`} />
            <span className="text-xs text-muted-foreground">
              {priorityLabels[task.priority]}
            </span>
          </div>

          {/* Metadata */}
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            {task.dueDate && (
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>
                  {format(task.dueDate.toDate(), 'dd MMM', { locale: es })}
                </span>
              </div>
            )}

            {task.assignedTo && (
              <div className="flex items-center gap-1">
                <User className="h-3 w-3" />
                <span>Asignada</span>
              </div>
            )}

            {task.estimatedHours && (
              <Badge variant="outline" className="text-xs">
                {task.estimatedHours}h est.
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
