'use client';

import { useState } from 'react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, closestCorners } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { WorkOrderKanbanCard } from './WorkOrderKanbanCard';
import { WorkOrdersService } from '../../services/work-orders/work-order-crud.service';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';
import type { WorkOrder, WorkOrderStatus } from '../../types/projects.types';
import { WORK_ORDER_STATUS_CONFIG } from '../../types/projects.types';

/**
 * WorkOrdersKanban - Vista Kanban para órdenes de trabajo
 * Rule #1: Real Firebase data + drag-and-drop updates
 * Rule #2: ShadCN UI + Lucide icons
 * Rule #4: Modular component architecture
 * Rule #5: 155 lines (within limit)
 */

interface WorkOrdersKanbanProps {
  workOrders: WorkOrder[];
  onWorkOrderClick: (workOrderId: string) => void;
}

const STATUS_ORDER: WorkOrderStatus[] = [
  'pending',
  'in-progress',
  'paused',
  'completed',
  'cancelled',
];

export function WorkOrdersKanban({ workOrders, onWorkOrderClick }: WorkOrdersKanbanProps) {
  const [activeWorkOrder, setActiveWorkOrder] = useState<WorkOrder | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Group work orders by status
  const workOrdersByStatus = STATUS_ORDER.reduce((acc, status) => {
    acc[status] = workOrders.filter((wo) => wo.status === status);
    return acc;
  }, {} as Record<WorkOrderStatus, WorkOrder[]>);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const workOrder = workOrders.find((wo) => wo.id === active.id);
    if (workOrder) {
      setActiveWorkOrder(workOrder);
      setIsDragging(true);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setIsDragging(false);
    setActiveWorkOrder(null);

    if (!over || active.id === over.id) return;

    // Extract status from droppable ID
    const newStatus = over.id as WorkOrderStatus;
    const workOrderId = active.id as string;
    const workOrder = workOrders.find((wo) => wo.id === workOrderId);

    if (!workOrder || workOrder.status === newStatus) return;

    try {
      // Update work order status in Firebase
      await WorkOrdersService.updateWorkOrder(workOrderId, { status: newStatus });

      toast.success(`Orden movida a ${WORK_ORDER_STATUS_CONFIG[newStatus].label}`);
      logger.info(`Work order status changed via Kanban: ${workOrderId} to ${newStatus}`);
    } catch (error) {
      logger.error('Error changing work order status', error as Error);
      toast.error('Error al actualizar el estado');
    }
  };

  return (
    <DndContext
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      collisionDetection={closestCorners}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {STATUS_ORDER.map((status) => {
          const config = WORK_ORDER_STATUS_CONFIG[status];
          const statusWorkOrders = workOrdersByStatus[status] || [];

          return (
            <Card key={status} className="flex flex-col h-full">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">
                    {config.label}
                  </CardTitle>
                  <Badge variant="secondary" className="text-xs">
                    {statusWorkOrders.length}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="flex-1 pt-0">
                <SortableContext
                  id={status}
                  items={statusWorkOrders.map((wo) => wo.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-2 min-h-[200px]">
                    {statusWorkOrders.map((workOrder) => (
                      <WorkOrderKanbanCard
                        key={workOrder.id}
                        workOrder={workOrder}
                        onClick={() => onWorkOrderClick(workOrder.id)}
                        isDragging={isDragging && activeWorkOrder?.id === workOrder.id}
                      />
                    ))}

                    {statusWorkOrders.length === 0 && (
                      <div className="flex items-center justify-center h-32 border-2 border-dashed border-muted rounded-lg">
                        <p className="text-sm text-muted-foreground">
                          Sin órdenes
                        </p>
                      </div>
                    )}
                  </div>
                </SortableContext>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {activeWorkOrder && (
          <div className="opacity-80">
            <WorkOrderKanbanCard
              workOrder={activeWorkOrder}
              onClick={() => {}}
              isDragging={true}
            />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
