/**
 * ZADIA OS - Project Tasks Tab
 * Tab mejorado para gestión de tareas del proyecto
 * Rule #4: Modular components
 * Rule #5: Max 200 lines per file
 */

'use client';

import { useState } from 'react';
import { Plus, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TasksKanban } from './TasksKanban';
import { AddTaskDialog } from './AddTaskDialog';
import type { ProjectTask, TaskStatus } from '../types/entities/task.types';
import type { ProjectPriority } from '../types/entities/project.types';

interface ProjectTasksTabProps {
  projectId: string;
  tasks: ProjectTask[];
  loading: boolean;
  onAddTask: (task: Partial<ProjectTask>) => Promise<void>;
  onUpdateTask: (taskId: string, updates: Partial<ProjectTask>) => Promise<void>;
  onDeleteTask: (taskId: string) => Promise<void>;
}

type TaskFilter = TaskStatus | 'all';

export function ProjectTasksTab({
  tasks,
  loading,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
}: ProjectTasksTabProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<ProjectPriority | 'all'>('all');

  // Filtrar tareas
  const filteredTasks = tasks.filter((task) => {
    if (statusFilter !== 'all' && task.status !== statusFilter) return false;
    if (priorityFilter !== 'all' && task.priority !== priorityFilter) return false;
    return true;
  });

  // Agrupar tareas por estado
  const tasksByStatus = {
    todo: filteredTasks.filter((t) => t.status === 'todo'),
    'in-progress': filteredTasks.filter((t) => t.status === 'in-progress'),
    review: filteredTasks.filter((t) => t.status === 'review'),
    done: filteredTasks.filter((t) => t.status === 'done'),
  };

  const handleAddTask = async (data: Partial<ProjectTask>) => {
    await onAddTask(data);
    setIsAddDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header con filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Tareas del Proyecto</span>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Nueva Tarea
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Filtros:</span>
            </div>

            <Select
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value as TaskStatus | 'all')}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="todo">Por Hacer</SelectItem>
                <SelectItem value="in-progress">En Progreso</SelectItem>
                <SelectItem value="review">En Revisión</SelectItem>
                <SelectItem value="done">Completada</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={priorityFilter}
              onValueChange={(value) => setPriorityFilter(value as ProjectPriority | 'all')}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Prioridad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="low">Baja</SelectItem>
                <SelectItem value="medium">Media</SelectItem>
                <SelectItem value="high">Alta</SelectItem>
                <SelectItem value="critical">Crítica</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Kanban Board */}
      <TasksKanban
        tasksByStatus={tasksByStatus}
        loading={loading}
        onUpdateTask={onUpdateTask}
        onDeleteTask={onDeleteTask}
      />

      {/* Add Task Dialog */}
      <AddTaskDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSubmit={handleAddTask}
      />
    </div>
  );
}
