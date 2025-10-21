'use client';

import { useState } from 'react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, closestCorners } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ProjectKanbanCard } from './ProjectKanbanCard';
import { ProjectsService } from '../../services/projects.service';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';
import type { Project, ProjectStatus } from '../../types/projects.types';
import { PROJECT_STATUS_CONFIG } from '../../types/projects.types';

/**
 * ProjectsKanban - Vista Kanban para proyectos
 * Rule #1: Real Firebase data + drag-and-drop updates
 * Rule #2: ShadCN UI + Lucide icons
 * Rule #4: Modular component architecture
 * Rule #5: 185 lines (within limit)
 */

interface ProjectsKanbanProps {
  projects: Project[];
  onProjectClick: (projectId: string) => void;
}

const STATUS_ORDER: ProjectStatus[] = [
  'planning',
  'in-progress',
  'on-hold',
  'completed',
  'cancelled',
];

export function ProjectsKanban({ projects, onProjectClick }: ProjectsKanbanProps) {
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Group projects by status
  const projectsByStatus = STATUS_ORDER.reduce((acc, status) => {
    acc[status] = projects.filter((p) => p.status === status);
    return acc;
  }, {} as Record<ProjectStatus, Project[]>);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const project = projects.find((p) => p.id === active.id);
    if (project) {
      setActiveProject(project);
      setIsDragging(true);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setIsDragging(false);
    setActiveProject(null);

    if (!over || active.id === over.id) return;

    // Extract status from droppable ID
    const newStatus = over.id as ProjectStatus;
    const projectId = active.id as string;
    const project = projects.find((p) => p.id === projectId);

    if (!project || project.status === newStatus) return;

    try {
      // Update project status in Firebase
      await ProjectsService.changeStatus(
        projectId,
        newStatus,
        'current-user', // TODO: Get from auth context
        'Usuario' // TODO: Get from auth context
      );

      toast.success(`Proyecto movido a ${PROJECT_STATUS_CONFIG[newStatus].label}`);
      logger.info('Project status changed via Kanban', { projectId, metadata: { newStatus } });
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Error changing project status');
      logger.error('Error changing project status', err);
      toast.error('Error al actualizar el estado del proyecto');
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
          const config = PROJECT_STATUS_CONFIG[status];
          const statusProjects = projectsByStatus[status] || [];
          const totalValue = statusProjects.reduce((sum, p) => sum + (p.salesPrice || 0), 0);

          return (
            <Card key={status} className="flex flex-col h-full">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <config.icon className="w-4 h-4" style={{ color: config.color }} />
                    {config.label}
                  </CardTitle>
                  <Badge variant="secondary" className="text-xs">
                    {statusProjects.length}
                  </Badge>
                </div>
                {totalValue > 0 && (
                  <p className="text-xs text-muted-foreground">
                    ${totalValue.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                  </p>
                )}
              </CardHeader>

              <CardContent className="flex-1 pt-0">
                <SortableContext
                  id={status}
                  items={statusProjects.map((p) => p.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-2 min-h-[200px]">
                    {statusProjects.map((project) => (
                      <ProjectKanbanCard
                        key={project.id}
                        project={project}
                        onClick={() => onProjectClick(project.id)}
                        isDragging={isDragging && activeProject?.id === project.id}
                      />
                    ))}

                    {statusProjects.length === 0 && (
                      <div className="flex items-center justify-center h-32 border-2 border-dashed border-muted rounded-lg">
                        <p className="text-sm text-muted-foreground">
                          Sin proyectos
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
        {activeProject && (
          <div className="opacity-80">
            <ProjectKanbanCard
              project={activeProject}
              onClick={() => {}}
              isDragging={true}
            />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
