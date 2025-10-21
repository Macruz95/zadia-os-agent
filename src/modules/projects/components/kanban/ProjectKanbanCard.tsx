'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import type { Project } from '../../types/projects.types';
import { PROJECT_PRIORITY_CONFIG } from '../../types/projects.types';
import { Building2, DollarSign, Calendar, GripVertical } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * ProjectKanbanCard - Card individual para Kanban
 * Rule #2: ShadCN UI + Lucide icons
 * Rule #4: Modular component
 * Rule #5: 125 lines (within limit)
 */

interface ProjectKanbanCardProps {
  project: Project;
  onClick: () => void;
  isDragging?: boolean;
}

export function ProjectKanbanCard({ project, onClick, isDragging = false }: ProjectKanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: project.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging || isSortableDragging ? 0.5 : 1,
  };

  const priorityConfig = PROJECT_PRIORITY_CONFIG[project.priority];

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm truncate">{project.name}</h4>
            <div className="flex items-center gap-1 mt-1">
              <Building2 className="w-3 h-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground truncate">
                {project.clientName}
              </span>
            </div>
          </div>
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing"
          >
            <GripVertical className="w-4 h-4 text-muted-foreground" />
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Prioridad */}
        <Badge
          variant="outline"
          className="text-xs"
          style={{ borderColor: priorityConfig.color, color: priorityConfig.color }}
        >
          <priorityConfig.icon className="w-3 h-3 mr-1" />
          {priorityConfig.label}
        </Badge>

        {/* Precio */}
        <div className="flex items-center gap-1 text-sm">
          <DollarSign className="w-3 h-3 text-muted-foreground" />
          <span className="font-medium">
            {project.salesPrice.toLocaleString('en-US', {
              style: 'currency',
              currency: project.currency,
              maximumFractionDigits: 0,
            })}
          </span>
        </div>

        {/* Progreso */}
        {project.progressPercent !== undefined && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Progreso</span>
              <span className="font-medium">{project.progressPercent}%</span>
            </div>
            <Progress value={project.progressPercent} className="h-1.5" />
          </div>
        )}

        {/* Fechas */}
        {project.estimatedEndDate && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="w-3 h-3" />
            <span>
              {format(
                project.estimatedEndDate instanceof Date 
                  ? project.estimatedEndDate 
                  : project.estimatedEndDate.toDate(), 
                'dd MMM yyyy', 
                { locale: es }
              )}
            </span>
          </div>
        )}

        {/* Project Manager */}
        {project.projectManager && (
          <div className="text-xs text-muted-foreground truncate">
            PM: {project.projectManager}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
