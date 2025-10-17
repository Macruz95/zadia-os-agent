'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Clock, 
  User, 
  CheckCircle2, 
  XCircle, 
  FileText,
  TrendingUp,
  DollarSign,
} from 'lucide-react';
import type { ProjectTimelineEntry } from '../types/projects.types';
import { ProjectsService } from '../services/projects.service';
import { logger } from '@/lib/logger';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// Rule #2: ShadCN UI + Lucide Icons only

interface ProjectTimelineProps {
  projectId: string;
}

// Icon mapping for different event types
const eventIcons: Record<string, React.ElementType> = {
  'status-change': TrendingUp,
  'work-order-completed': CheckCircle2,
  'task-completed': CheckCircle2,
  'note': FileText,
  'material-consumed': DollarSign,
  'cost-update': DollarSign,
  'milestone': TrendingUp,
  'team-member-added': User,
  'team-member-removed': XCircle,
};

// Color mapping for event types
const eventColors: Record<string, string> = {
  'status-change': 'text-purple-600',
  'work-order-completed': 'text-green-600',
  'task-completed': 'text-green-600',
  'note': 'text-blue-600',
  'material-consumed': 'text-orange-600',
  'cost-update': 'text-orange-600',
  'milestone': 'text-purple-600',
  'team-member-added': 'text-blue-600',
  'team-member-removed': 'text-red-600',
};

export function ProjectTimeline({ projectId }: ProjectTimelineProps) {
  const [timeline, setTimeline] = useState<ProjectTimelineEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) return;

    const fetchTimeline = async () => {
      try {
        setLoading(true);
        const entries = await ProjectsService.getProjectTimeline(projectId);
        setTimeline(entries);
        setError(null);
      } catch (err) {
        logger.error('Error fetching project timeline', err as Error);
        setError('Error al cargar el historial del proyecto');
      } finally {
        setLoading(false);
      }
    };

    fetchTimeline();
  }, [projectId]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Historial del Proyecto
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex gap-4">
                <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
                  <div className="h-3 w-1/2 bg-gray-200 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Historial del Proyecto
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (timeline.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Historial del Proyecto
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">
              No hay eventos registrados en el historial
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Historial del Proyecto
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {timeline.length} eventos registrados
        </p>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-5 top-0 bottom-0 w-px bg-border" />

          {/* Timeline entries */}
          <div className="space-y-6">
            {timeline.map((entry, index) => {
              const Icon = eventIcons[entry.type] || FileText;
              const iconColor = eventColors[entry.type] || 'text-gray-600';

              return (
                <div key={entry.id} className="relative flex gap-4">
                  {/* Icon */}
                  <div className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 border-background bg-white ${iconColor}`}>
                    <Icon className="h-5 w-5" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 space-y-1 pb-6">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{entry.title}</p>
                        {entry.description && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {entry.description}
                          </p>
                        )}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {entry.type === 'status-change' && 'Cambio de Estado'}
                        {entry.type === 'work-order-completed' && 'Orden Completada'}
                        {entry.type === 'task-completed' && 'Tarea Completada'}
                        {entry.type === 'note' && 'Nota'}
                        {entry.type === 'material-consumed' && 'Material Consumido'}
                        {entry.type === 'cost-update' && 'Actualización de Costos'}
                        {entry.type === 'milestone' && 'Hito'}
                        {entry.type === 'team-member-added' && 'Miembro Agregado'}
                        {entry.type === 'team-member-removed' && 'Miembro Removido'}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {entry.performedByName || 'Sistema'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {format(entry.performedAt.toDate(), "dd MMM yyyy 'a las' HH:mm", { locale: es })}
                      </span>
                    </div>

                    {index < timeline.length - 1 && (
                      <Separator className="mt-4" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
