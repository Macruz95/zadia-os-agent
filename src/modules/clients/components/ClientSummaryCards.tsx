'use client';

import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Progress } from '../../../components/ui/progress';
import { Project, Quote, Task } from '../types/clients.types';
import { formatCurrency, formatDate, getStatusColor } from '../utils/clients.utils';

interface ClientSummaryCardsProps {
  projects: Project[];
  quotes: Quote[];
  tasks: Task[];
}

export const ClientSummaryCards = ({ projects, quotes, tasks }: ClientSummaryCardsProps) => {
  const activeProjects = projects.filter(p => p.status === 'EnProgreso');
  const openQuotes = quotes.filter(q => q.status === 'Enviada' || q.status === 'Borrador');
  const pendingTasks = tasks.filter(t => t.status === 'Pendiente' || t.status === 'EnProgreso').slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Active Projects */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Proyectos Activos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {activeProjects.map((project) => (
            <div key={project.id} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">{project.name}</span>
                <span>{project.progress}%</span>
              </div>
              <Progress value={project.progress} />
            </div>
          ))}
          {activeProjects.length === 0 && (
            <p className="text-sm text-muted-foreground">No hay proyectos activos</p>
          )}
        </CardContent>
      </Card>

      {/* Open Quotes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Cotizaciones Abiertas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {openQuotes.map((quote) => (
            <div key={quote.id} className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium">{quote.number}</p>
                <p className="text-xs text-muted-foreground">{formatCurrency(quote.estimatedAmount)}</p>
              </div>
              <Badge variant="outline" className="text-xs">
                {quote.status}
              </Badge>
            </div>
          ))}
          {openQuotes.length === 0 && (
            <p className="text-sm text-muted-foreground">No hay cotizaciones abiertas</p>
          )}
        </CardContent>
      </Card>

      {/* Pending Tasks */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Tareas Pendientes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {pendingTasks.map((task) => (
            <div key={task.id} className="space-y-1">
              <p className="text-sm font-medium">{task.title}</p>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={`text-xs ${getStatusColor(task.priority)}`}>
                  {task.priority}
                </Badge>
                {task.dueDate && (
                  <span className="text-xs text-muted-foreground">
                    Vence: {formatDate(task.dueDate)}
                  </span>
                )}
              </div>
            </div>
          ))}
          {pendingTasks.length === 0 && (
            <p className="text-sm text-muted-foreground">No hay tareas pendientes</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};