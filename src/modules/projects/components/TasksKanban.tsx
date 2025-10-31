/**
 * ZADIA OS - Tasks Kanban Board
 * Vista Kanban drag-and-drop para tareas
 * Rule #5: Max 200 lines per file
 */

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TaskCard } from './TaskCard';
import type { ProjectTask, TaskStatus } from '../types/entities/task.types';

interface TasksKanbanProps {
  tasksByStatus: Record<string, ProjectTask[]>;
  loading: boolean;
  onUpdateTask: (taskId: string, updates: Partial<ProjectTask>) => Promise<void>;
  onDeleteTask: (taskId: string) => Promise<void>;
}

const statusConfig: Record<TaskStatus, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
  'todo': { label: 'Por Hacer', variant: 'secondary' },
  'in-progress': { label: 'En Progreso', variant: 'default' },
  'review': { label: 'En Revisión', variant: 'outline' },
  'done': { label: 'Completada', variant: 'secondary' },
  'cancelled': { label: 'Cancelada', variant: 'secondary' },
};

export function TasksKanban({
  tasksByStatus,
  loading,
  onUpdateTask,
  onDeleteTask,
}: TasksKanbanProps) {
  if (loading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Cargando tareas...
      </div>
    );
  }

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    await onUpdateTask(taskId, { status: newStatus });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {/* Columna: Por Hacer */}
      <KanbanColumn
        title="Por Hacer"
        status="todo"
        tasks={tasksByStatus.todo || []}
        onStatusChange={handleStatusChange}
        onDeleteTask={onDeleteTask}
      />

      {/* Columna: En Progreso */}
      <KanbanColumn
        title="En Progreso"
        status="in-progress"
        tasks={tasksByStatus['in-progress'] || []}
        onStatusChange={handleStatusChange}
        onDeleteTask={onDeleteTask}
      />

      {/* Columna: En Revisión */}
      <KanbanColumn
        title="En Revisión"
        status="review"
        tasks={tasksByStatus.review || []}
        onStatusChange={handleStatusChange}
        onDeleteTask={onDeleteTask}
      />

      {/* Columna: Completada */}
      <KanbanColumn
        title="Completada"
        status="done"
        tasks={tasksByStatus.done || []}
        onStatusChange={handleStatusChange}
        onDeleteTask={onDeleteTask}
      />
    </div>
  );
}

interface KanbanColumnProps {
  title: string;
  status: TaskStatus;
  tasks: ProjectTask[];
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
  onDeleteTask: (taskId: string) => void;
}

function KanbanColumn({
  title,
  status,
  tasks,
  onStatusChange,
  onDeleteTask,
}: KanbanColumnProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          <span>{title}</span>
          <Badge variant={statusConfig[status].variant}>
            {tasks.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {tasks.length === 0 ? (
          <div className="text-center py-8 text-sm text-muted-foreground">
            No hay tareas
          </div>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onStatusChange={onStatusChange}
              onDelete={onDeleteTask}
            />
          ))
        )}
      </CardContent>
    </Card>
  );
}
