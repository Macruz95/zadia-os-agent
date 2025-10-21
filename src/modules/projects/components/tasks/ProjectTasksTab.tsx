'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useProjectTasks } from '../../hooks/use-project-tasks';
import { ProjectTasksService } from '../../services/project-tasks.service';
import { TaskFormDialog } from './TaskFormDialog';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';
import { Plus, CheckCircle2, Clock, ListTodo } from 'lucide-react';
import { TASK_STATUS_CONFIG } from '../../types/projects.types';
import type { ProjectTask } from '../../types/projects.types';

/**
 * ProjectTasksTab - Tab de tareas del proyecto
 * Rule #1: Real Firebase data via useProjectTasks
 * Rule #2: ShadCN UI + Lucide icons
 * Rule #4: Modular component
 * Rule #5: 195 lines (within limit)
 */

interface ProjectTasksTabProps {
  projectId: string;
}

export function ProjectTasksTab({ projectId }: ProjectTasksTabProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedTask, setSelectedTask] = useState<ProjectTask | null>(null);

  const { 
    tasks, 
    loading, 
    error, 
    todoCount, 
    inProgressCount, 
    doneCount 
  } = useProjectTasks({ projectId, realtime: true });

  const handleCreateTask = () => {
    setSelectedTask(null);
    setShowCreateDialog(true);
  };

  const handleEditTask = (task: ProjectTask) => {
    setSelectedTask(task);
    setShowCreateDialog(true);
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('¿Eliminar esta tarea?')) return;

    try {
      await ProjectTasksService.deleteTask(taskId);
      toast.success('Tarea eliminada');
    } catch (error) {
      logger.error('Error deleting task', error as Error);
      toast.error('Error al eliminar la tarea');
    }
  };

  if (error) {
    return (
      <div className="text-center py-8 text-red-600">
        Error al cargar tareas: {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con KPIs */}
      <div className="flex items-center justify-between">
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <ListTodo className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">{todoCount} Por hacer</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-medium">{inProgressCount} En progreso</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            <span className="text-sm font-medium">{doneCount} Completadas</span>
          </div>
        </div>

        <Button onClick={handleCreateTask}>
          <Plus className="w-4 h-4 mr-2" />
          Nueva Tarea
        </Button>
      </div>

      {/* Lista de Tareas */}
      {loading ? (
        <div className="text-center py-8 text-muted-foreground">
          Cargando tareas...
        </div>
      ) : tasks.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <ListTodo className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-medium text-lg mb-2">Sin tareas</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Aún no hay tareas asignadas a este proyecto
            </p>
            <Button onClick={handleCreateTask}>
              <Plus className="w-4 h-4 mr-2" />
              Crear Primera Tarea
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {tasks.map((task) => {
            const statusConfig = TASK_STATUS_CONFIG[task.status];

            return (
              <Card key={task.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <CardTitle className="text-base">{task.title}</CardTitle>
                      {task.description && (
                        <p className="text-sm text-muted-foreground">
                          {task.description}
                        </p>
                      )}
                    </div>
                    <Badge 
                      variant="outline"
                      style={{ 
                        borderColor: statusConfig.color,
                        color: statusConfig.color 
                      }}
                    >
                      {statusConfig.label}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  {/* Horas estimadas vs reales */}
                  {task.estimatedHours && task.estimatedHours > 0 && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Horas: </span>
                      <span className="font-medium">
                        {task.actualHours || 0} / {task.estimatedHours} hrs
                      </span>
                    </div>
                  )}

                  {/* Asignado a */}
                  {task.assignedTo && (
                    <div className="text-sm text-muted-foreground">
                      Asignado a: <span className="font-medium">{task.assignedTo}</span>
                    </div>
                  )}

                  {/* Acciones */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditTask(task)}
                    >
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteTask(task.id)}
                    >
                      Eliminar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Dialog de Creación/Edición */}
      <TaskFormDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        projectId={projectId}
        task={selectedTask}
      />
    </div>
  );
}
