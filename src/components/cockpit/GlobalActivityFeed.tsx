/**
 * ZADIA OS - Global Activity Feed Widget
 * 
 * Panel que muestra eventos en tiempo real de TODO el sistema
 * Visualiza cómo una acción repercute en múltiples módulos
 * 
 * Rule #2: ShadCN UI + Lucide Icons
 * Rule #5: Max 200 lines
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Activity, 
  TrendingUp, 
  FileText, 
  DollarSign, 
  Package, 
  FolderKanban,
  Users,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Zap
} from 'lucide-react';
import { EventBus, ZadiaEvent, ZadiaEventType } from '@/lib/events';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

// Event type to icon/color mapping
const EVENT_CONFIG: Record<string, { icon: React.ElementType; color: string; module: string }> = {
  // Sales
  'lead:created': { icon: Users, color: 'bg-blue-500', module: 'Ventas' },
  'lead:converted': { icon: TrendingUp, color: 'bg-green-500', module: 'Ventas' },
  'opportunity:created': { icon: TrendingUp, color: 'bg-purple-500', module: 'Ventas' },
  'opportunity:won': { icon: CheckCircle2, color: 'bg-green-500', module: 'Ventas' },
  'opportunity:lost': { icon: AlertTriangle, color: 'bg-red-500', module: 'Ventas' },
  'quote:created': { icon: FileText, color: 'bg-blue-500', module: 'Ventas' },
  'quote:approved': { icon: CheckCircle2, color: 'bg-green-500', module: 'Ventas' },
  // Finance
  'invoice:created': { icon: FileText, color: 'bg-indigo-500', module: 'Finanzas' },
  'invoice:paid': { icon: DollarSign, color: 'bg-green-500', module: 'Finanzas' },
  'invoice:overdue': { icon: AlertTriangle, color: 'bg-red-500', module: 'Finanzas' },
  'payment:received': { icon: DollarSign, color: 'bg-green-500', module: 'Finanzas' },
  // Inventory
  'product:created': { icon: Package, color: 'bg-orange-500', module: 'Inventario' },
  'product:low_stock': { icon: AlertTriangle, color: 'bg-yellow-500', module: 'Inventario' },
  'movement:in': { icon: Package, color: 'bg-green-500', module: 'Inventario' },
  'movement:out': { icon: Package, color: 'bg-red-500', module: 'Inventario' },
  // Projects
  'project:created': { icon: FolderKanban, color: 'bg-cyan-500', module: 'Proyectos' },
  'project:completed': { icon: CheckCircle2, color: 'bg-green-500', module: 'Proyectos' },
  'project:delayed': { icon: Clock, color: 'bg-yellow-500', module: 'Proyectos' },
  'task:completed': { icon: CheckCircle2, color: 'bg-green-500', module: 'Proyectos' },
  // Default
  'default': { icon: Activity, color: 'bg-gray-500', module: 'Sistema' }
};

function getEventConfig(type: ZadiaEventType) {
  return EVENT_CONFIG[type] || EVENT_CONFIG['default'];
}

function getEventDescription(event: ZadiaEvent): string {
  const data = event.data as Record<string, unknown>;
  
  switch (event.type) {
    case 'lead:created':
      return `Nuevo lead: ${data.name || 'Sin nombre'}`;
    case 'lead:converted':
      return `Lead convertido a cliente`;
    case 'opportunity:created':
      return `Nueva oportunidad: ${data.title || ''}`;
    case 'opportunity:won':
      return `¡Oportunidad ganada! $${data.value || 0}`;
    case 'quote:created':
      return `Cotización creada: $${data.total || 0}`;
    case 'quote:approved':
      return `Cotización aprobada: $${data.total || 0}`;
    case 'invoice:created':
      return `Factura ${data.number || ''} creada`;
    case 'invoice:paid':
      return `Factura pagada: $${data.amount || 0}`;
    case 'invoice:overdue':
      return `Factura vencida: ${data.daysOverdue || 0} días`;
    case 'payment:received':
      return `Pago recibido: $${data.amount || 0}`;
    case 'product:created':
      return `Producto creado: ${data.name || ''}`;
    case 'product:low_stock':
      return `Stock bajo: ${data.itemName || ''}`;
    case 'project:created':
      return `Proyecto iniciado: ${data.name || ''}`;
    case 'task:completed':
      return `Tarea completada`;
    default:
      return event.type.replace(':', ' - ');
  }
}

interface GlobalActivityFeedProps {
  maxEvents?: number;
  showHeader?: boolean;
  compact?: boolean;
}

export function GlobalActivityFeed({ 
  maxEvents = 20, 
  showHeader = true,
  compact = false 
}: GlobalActivityFeedProps) {
  const [events, setEvents] = useState<ZadiaEvent[]>([]);
  const [isLive, setIsLive] = useState(true);

  const handleNewEvent = useCallback((event: ZadiaEvent) => {
    setEvents(prev => {
      const updated = [event, ...prev].slice(0, maxEvents);
      return updated;
    });
  }, [maxEvents]);

  useEffect(() => {
    // Load initial events
    setEvents(EventBus.getRecentEvents(maxEvents));

    // Subscribe to all events
    const unsubscribe = EventBus.subscribe('*', handleNewEvent);

    return () => unsubscribe();
  }, [maxEvents, handleNewEvent]);

  return (
    <Card className={cn("h-full", compact && "border-0 shadow-none")}>
      {showHeader && (
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Actividad Global
            {isLive && (
              <Badge variant="outline" className="ml-auto text-xs">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-1" />
                En vivo
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
      )}
      <CardContent className={cn("p-0", !showHeader && "pt-0")}>
        <ScrollArea className={cn("px-4", compact ? "h-[300px]" : "h-[400px]")}>
          {events.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
              <Zap className="h-8 w-8 mb-2 opacity-50" />
              <p className="text-sm">Sin actividad reciente</p>
              <p className="text-xs">Los eventos aparecerán aquí</p>
            </div>
          ) : (
            <div className="space-y-3 py-2">
              {events.map((event) => {
                const config = getEventConfig(event.type);
                const Icon = config.icon;
                
                return (
                  <div 
                    key={event.id} 
                    className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className={cn(
                      "p-1.5 rounded-full text-white shrink-0",
                      config.color
                    )}>
                      <Icon className="h-3 w-3" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {getEventDescription(event)}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant="secondary" className="text-[10px] px-1 py-0">
                          {config.module}
                        </Badge>
                        <span>
                          {formatDistanceToNow(new Date(event.timestamp), { 
                            addSuffix: true,
                            locale: es 
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
