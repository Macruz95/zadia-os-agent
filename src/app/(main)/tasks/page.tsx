/**
 * ZADIA OS - Tasks Page
 * Página principal del Gestor de Tareas RICE-Z
 */

import { TaskManager } from '@/modules/tasks/components/TaskManager';

export default function TasksPage() {
  return (
    <div className="container mx-auto p-6">
      <TaskManager />
    </div>
  );
}

