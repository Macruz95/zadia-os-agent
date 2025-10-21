'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import type { WorkOrder } from '../../types/projects.types';
import { Package, GripVertical, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * WorkOrderKanbanCard - Card individual para Kanban de órdenes
 * Rule #2: ShadCN UI + Lucide icons
 * Rule #4: Modular component
 * Rule #5: 115 lines (within limit)
 */

interface WorkOrderKanbanCardProps {
  workOrder: WorkOrder;
  onClick: () => void;
  isDragging?: boolean;
}

export function WorkOrderKanbanCard({ workOrder, onClick, isDragging = false }: WorkOrderKanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: workOrder.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging || isSortableDragging ? 0.5 : 1,
  };

  const progressPercent = workOrder.progressPercent || 0;
  const totalMaterials = workOrder.materials?.length || 0;

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
            <h4 className="font-semibold text-sm truncate">{workOrder.name}</h4>
            {workOrder.description && (
              <p className="text-xs text-muted-foreground truncate mt-1">
                {workOrder.description}
              </p>
            )}
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
        {/* Materiales */}
        {totalMaterials > 0 && (
          <div className="flex items-center gap-1 text-xs">
            <Package className="w-3 h-3 text-muted-foreground" />
            <span className="text-muted-foreground">
              {totalMaterials} materiales
            </span>
          </div>
        )}

        {/* Progreso */}
        {progressPercent > 0 && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Progreso</span>
              <span className="font-medium">{progressPercent}%</span>
            </div>
            <Progress value={progressPercent} className="h-1.5" />
          </div>
        )}

        {/* Fechas */}
        {workOrder.estimatedStartDate && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span>
              {format(
                workOrder.estimatedStartDate instanceof Date
                  ? workOrder.estimatedStartDate
                  : workOrder.estimatedStartDate.toDate(),
                'dd MMM',
                { locale: es }
              )}
            </span>
          </div>
        )}

        {/* Asignado */}
        {workOrder.assignedTo && (
          <Badge variant="secondary" className="text-xs">
            Asignado
          </Badge>
        )}
      </CardContent>
    </Card>
  );
}
