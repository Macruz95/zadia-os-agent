/**
 * ZADIA OS - Task Card Component
 * Tarjeta de tarea para el gestor
 */

'use client';

import { Calendar, User, Tag, AlertTriangle, CheckCircle2, Clock, Link2 } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { RICEZScore } from './RICEZScore';
import type { Task } from '../types/tasks.types';

interface TaskCardProps {
  task: Task;
  onClick?: () => void;
  showScore?: boolean;
  showDependencies?: boolean;
}

export function TaskCard({ task, onClick, showScore = true, showDependencies = true }: TaskCardProps) {
  const dueDate = task.dueDate 
    ? (task.dueDate instanceof Date ? task.dueDate : task.dueDate.toDate())
    : null;

  const isOverdue = dueDate && dueDate < new Date() && task.status !== 'done';

  const statusColors = {
    backlog: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    todo: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    'in-progress': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    review: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    done: 'bg-green-500/20 text-green-400 border-green-500/30',
    cancelled: 'bg-red-500/20 text-red-400 border-red-500/30'
  };

  const priorityColors = {
    low: 'bg-gray-500/20 text-gray-400',
    medium: 'bg-blue-500/20 text-blue-400',
    high: 'bg-orange-500/20 text-orange-400',
    urgent: 'bg-red-500/20 text-red-400'
  };

  const domainColors = {
    sales: 'bg-purple-500/20 text-purple-400',
    projects: 'bg-cyan-500/20 text-cyan-400',
    finance: 'bg-green-500/20 text-green-400',
    hr: 'bg-yellow-500/20 text-yellow-400',
    inventory: 'bg-orange-500/20 text-orange-400',
    general: 'bg-gray-500/20 text-gray-400'
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        "group relative p-4 rounded-xl border transition-all duration-200",
        "bg-[#161b22] border-gray-800/50 hover:border-cyan-500/30",
        "hover:bg-[#1c2333] cursor-pointer",
        isOverdue && "border-red-500/50 bg-red-500/5"
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white truncate group-hover:text-cyan-400 transition-colors">
            {task.title}
          </h3>
          {task.description && (
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">
              {task.description}
            </p>
          )}
        </div>
        
        {isOverdue && (
          <AlertTriangle className="h-4 w-4 text-red-400 flex-shrink-0" />
        )}
      </div>

      {/* Score RICE-Z */}
      {showScore && task.ricezScore && (
        <div className="mb-3">
          <RICEZScore score={task.ricezScore} compact />
        </div>
      )}

      {/* Metadata */}
      <div className="flex flex-col gap-2 mt-3">
        {/* Fecha límite */}
        {dueDate && (
          <div className={cn(
            "flex items-center gap-2 text-sm",
            isOverdue ? "text-red-400" : "text-gray-500"
          )}>
            <Calendar className="h-3.5 w-3.5" />
            <span>
              {isOverdue ? 'Vencida: ' : 'Vence: '}
              {format(dueDate, "d 'de' MMMM, yyyy", { locale: es })}
            </span>
          </div>
        )}

        {/* Asignado */}
        {task.assignedToName && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <User className="h-3.5 w-3.5" />
            <span>{task.assignedToName}</span>
          </div>
        )}

        {/* Horas estimadas */}
        {task.estimatedHours && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Clock className="h-3.5 w-3.5" />
            <span>{task.estimatedHours}h estimadas</span>
            {task.actualHours && (
              <span className="text-gray-600">({task.actualHours}h reales)</span>
            )}
          </div>
        )}

        {/* Dependencias */}
        {showDependencies && task.dependencies.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Link2 className="h-3.5 w-3.5" />
            <span>{task.dependencies.length} dependencia{task.dependencies.length > 1 ? 's' : ''}</span>
          </div>
        )}
      </div>

      {/* Badges */}
      <div className="flex items-center gap-2 mt-3 flex-wrap">
        <Badge 
          variant="outline" 
          className={cn("text-xs", statusColors[task.status])}
        >
          {task.status === 'backlog' ? 'Backlog' :
           task.status === 'todo' ? 'Por hacer' :
           task.status === 'in-progress' ? 'En progreso' :
           task.status === 'review' ? 'Revisión' :
           task.status === 'done' ? 'Completada' : 'Cancelada'}
        </Badge>
        
        <Badge 
          variant="outline" 
          className={cn("text-xs", priorityColors[task.priority])}
        >
          {task.priority === 'urgent' ? 'Urgente' : 
           task.priority === 'high' ? 'Alta' :
           task.priority === 'medium' ? 'Media' : 'Baja'}
        </Badge>

        <Badge 
          variant="outline" 
          className={cn("text-xs", domainColors[task.domain])}
        >
          {task.domain === 'sales' ? 'Ventas' :
           task.domain === 'projects' ? 'Proyectos' :
           task.domain === 'finance' ? 'Finanzas' :
           task.domain === 'hr' ? 'RRHH' :
           task.domain === 'inventory' ? 'Inventario' : 'General'}
        </Badge>

        {task.autoScored && (
          <Badge variant="outline" className="text-xs bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            IA
          </Badge>
        )}
      </div>

      {/* Tags */}
      {task.tags && task.tags.length > 0 && (
        <div className="flex items-center gap-1 mt-2 flex-wrap">
          {task.tags.slice(0, 3).map(tag => (
            <Badge key={tag} variant="outline" className="text-xs bg-gray-500/10 text-gray-400 border-gray-500/20">
              <Tag className="h-2.5 w-2.5 mr-1" />
              {tag}
            </Badge>
          ))}
          {task.tags.length > 3 && (
            <span className="text-xs text-gray-500">+{task.tags.length - 3}</span>
          )}
        </div>
      )}
    </div>
  );
}

