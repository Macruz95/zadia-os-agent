/**
 * ZADIA OS - Task Manager Component
 * Vista principal del gestor de tareas RICE-Z
 */

'use client';

import { useState } from 'react';
import { CheckSquare, Plus, Search, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTasks } from '../hooks/use-tasks';
import { TaskCard } from './TaskCard';
import { RICEZScore } from './RICEZScore';
import { DependencyGraph } from './DependencyGraph';
import type { Task, TaskStatus, TaskPriority, TaskDomain } from '../types/tasks.types';

export function TaskManager() {
  const { tasks, loading, getTasksByStatus, getTopPriorityTasks } = useTasks();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'all'>('all');
  const [domainFilter, setDomainFilter] = useState<TaskDomain | 'all'>('all');

  // Filtrar tareas
  const filteredTasks = tasks.filter(task => {
    if (searchQuery && !task.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !task.description?.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (statusFilter !== 'all' && task.status !== statusFilter) {
      return false;
    }
    if (priorityFilter !== 'all' && task.priority !== priorityFilter) {
      return false;
    }
    if (domainFilter !== 'all' && task.domain !== domainFilter) {
      return false;
    }
    return true;
  });

  // Ordenar por score RICE-Z
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    const scoreA = a.ricezScore?.total || 0;
    const scoreB = b.ricezScore?.total || 0;
    return scoreB - scoreA;
  });

  const topTasks = getTopPriorityTasks(5);
  
  type KanbanStatus = 'todo' | 'in-progress' | 'review' | 'done';
  const tasksByStatus: Record<KanbanStatus, Task[]> = {
    todo: getTasksByStatus('todo'),
    'in-progress': getTasksByStatus('in-progress'),
    review: getTasksByStatus('review'),
    done: getTasksByStatus('done')
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-500">Cargando tareas...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <CheckSquare className="h-6 w-6 text-cyan-400" />
            Gestor de Tareas RICE-Z
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Priorización inteligente con scoring RICE-Z automático por IA
          </p>
        </div>
        <Button className="bg-cyan-600 hover:bg-cyan-700">
          <Plus className="h-4 w-4 mr-2" />
          Nueva Tarea
        </Button>
      </div>

      {/* Top Priority Tasks */}
      {topTasks.length > 0 && (
        <Card className="bg-[#161b22] border-gray-800/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-cyan-400" />
              Top 5 Prioridades
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {topTasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onClick={() => setSelectedTask(task)}
                  showScore
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filtros y búsqueda */}
      <Card className="bg-[#161b22] border-gray-800/50">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar tareas..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-[#0d1117] border-gray-800/50 text-white"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as TaskStatus | 'all')}>
              <SelectTrigger className="w-full md:w-[180px] bg-[#0d1117] border-gray-800/50 text-white">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent className="bg-[#161b22] border-gray-800/50">
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="backlog">Backlog</SelectItem>
                <SelectItem value="todo">Por hacer</SelectItem>
                <SelectItem value="in-progress">En progreso</SelectItem>
                <SelectItem value="review">Revisión</SelectItem>
                <SelectItem value="done">Completadas</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={(v) => setPriorityFilter(v as TaskPriority | 'all')}>
              <SelectTrigger className="w-full md:w-[180px] bg-[#0d1117] border-gray-800/50 text-white">
                <SelectValue placeholder="Prioridad" />
              </SelectTrigger>
              <SelectContent className="bg-[#161b22] border-gray-800/50">
                <SelectItem value="all">Todas las prioridades</SelectItem>
                <SelectItem value="low">Baja</SelectItem>
                <SelectItem value="medium">Media</SelectItem>
                <SelectItem value="high">Alta</SelectItem>
                <SelectItem value="urgent">Urgente</SelectItem>
              </SelectContent>
            </Select>
            <Select value={domainFilter} onValueChange={(v) => setDomainFilter(v as TaskDomain | 'all')}>
              <SelectTrigger className="w-full md:w-[180px] bg-[#0d1117] border-gray-800/50 text-white">
                <SelectValue placeholder="Dominio" />
              </SelectTrigger>
              <SelectContent className="bg-[#161b22] border-gray-800/50">
                <SelectItem value="all">Todos los dominios</SelectItem>
                <SelectItem value="sales">Ventas</SelectItem>
                <SelectItem value="projects">Proyectos</SelectItem>
                <SelectItem value="finance">Finanzas</SelectItem>
                <SelectItem value="hr">RRHH</SelectItem>
                <SelectItem value="inventory">Inventario</SelectItem>
                <SelectItem value="general">General</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Vista principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de tareas */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="bg-[#161b22] border-gray-800/50">
              <TabsTrigger value="all">Todas ({sortedTasks.length})</TabsTrigger>
              <TabsTrigger value="todo">Por hacer ({tasksByStatus.todo.length})</TabsTrigger>
              <TabsTrigger value="in-progress">En progreso ({tasksByStatus['in-progress'].length})</TabsTrigger>
              <TabsTrigger value="review">Revisión ({tasksByStatus.review.length})</TabsTrigger>
              <TabsTrigger value="done">Completadas ({tasksByStatus.done.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-4">
              <div className="space-y-4">
                {sortedTasks.length === 0 ? (
                  <div className="text-center text-gray-400 py-12">
                    <CheckSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No hay tareas que coincidan con los filtros</p>
                  </div>
                ) : (
                  sortedTasks.map(task => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onClick={() => setSelectedTask(task)}
                      showScore
                      showDependencies
                    />
                  ))
                )}
              </div>
            </TabsContent>

            {(['todo', 'in-progress', 'review', 'done'] as const).map(status => (
              <TabsContent key={status} value={status} className="mt-4">
                <div className="space-y-4">
                  {tasksByStatus[status].length === 0 ? (
                    <div className="text-center text-gray-400 py-12">
                      <p>No hay tareas en {status}</p>
                    </div>
                  ) : (
                    tasksByStatus[status].map((task: Task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onClick={() => setSelectedTask(task)}
                        showScore
                        showDependencies
                      />
                    ))
                  )}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>

        {/* Panel lateral */}
        {selectedTask && (
          <div className="space-y-6">
            {/* Score RICE-Z */}
            {selectedTask.ricezScore && (
              <RICEZScore score={selectedTask.ricezScore} />
            )}

            {/* Dependencias */}
            <DependencyGraph
              task={selectedTask}
              allTasks={tasks}
              onTaskClick={(taskId) => {
                const task = tasks.find(t => t.id === taskId);
                if (task) setSelectedTask(task);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

