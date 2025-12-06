/**
 * ZADIA OS - Tasks Page
 * Página principal del Gestor de Tareas RICE-Z
 */

import { TaskManager } from '@/modules/tasks/components/TaskManager';

export default function TasksPage() {
  return (
    <div className="p-6 space-y-6">
      <TaskManager />
    </div>
  );
}

