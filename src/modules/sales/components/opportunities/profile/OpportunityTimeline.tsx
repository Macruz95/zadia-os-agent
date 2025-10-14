/**
 * ZADIA OS - Opportunity Timeline Component
 * 
 * Unified timeline showing interactions, stage changes, quotes, and projects
 * 
 * @component
 */

'use client';

import { useEffect, useState } from 'react';
import { FileText, Phone, Calendar as CalendarIcon, Mail, TrendingUp, FileCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';
import { OpportunityInteractionsService } from '@/modules/sales/services/opportunity-interactions.service';
import { QuotesService } from '@/modules/sales/services/quotes.service';
import type { OpportunityInteraction, Quote } from '@/modules/sales/types/sales.types';

interface OpportunityTimelineProps {
  opportunityId: string;
}

type TimelineEvent = {
  id: string;
  type: 'interaction' | 'quote' | 'project';
  date: Date;
  icon: React.ElementType;
  iconColor: string;
  title: string;
  description: string;
  badge?: { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' };
  data?: OpportunityInteraction | Quote;
};

export function OpportunityTimeline({ opportunityId }: OpportunityTimelineProps) {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTimelineData();
  }, [opportunityId]);

  const loadTimelineData = async () => {
    try {
      setLoading(true);

      // Load interactions
      const interactions = await OpportunityInteractionsService.getInteractionsByOpportunity(opportunityId);

      // Load quotes
      const quotes = await QuotesService.getQuotesByOpportunity(opportunityId);

      // Convert to timeline events
      const timelineEvents: TimelineEvent[] = [];

      // Add interactions
      interactions.forEach((interaction) => {
        const iconMap: Record<string, { icon: React.ElementType; color: string }> = {
          note: { icon: FileText, color: 'text-blue-500' },
          call: { icon: Phone, color: 'text-green-500' },
          meeting: { icon: CalendarIcon, color: 'text-purple-500' },
          email: { icon: Mail, color: 'text-orange-500' },
          'stage-change': { icon: TrendingUp, color: 'text-indigo-500' },
        };

        const config = iconMap[interaction.type] || iconMap.note;

        timelineEvents.push({
          id: interaction.id,
          type: 'interaction',
          date: interaction.performedAt instanceof Date
            ? interaction.performedAt
            : interaction.performedAt.toDate(),
          icon: config.icon,
          iconColor: config.color,
          title: interaction.summary,
          description: interaction.details || '',
          badge: interaction.type === 'stage-change'
            ? { label: 'Cambio de Etapa', variant: 'outline' }
            : undefined,
          data: interaction,
        });
      });

      // Add quotes
      quotes.forEach((quote) => {
        const statusVariants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
          draft: 'secondary',
          sent: 'outline',
          accepted: 'default',
          rejected: 'destructive',
          expired: 'destructive',
        };

        const statusLabels: Record<string, string> = {
          draft: 'Borrador',
          sent: 'Enviada',
          accepted: 'Aceptada',
          rejected: 'Rechazada',
          expired: 'Expirada',
        };

        timelineEvents.push({
          id: quote.id,
          type: 'quote',
          date: quote.createdAt instanceof Date ? quote.createdAt : quote.createdAt.toDate(),
          icon: FileCheck,
          iconColor: 'text-cyan-500',
          title: `Cotización ${quote.number}`,
          description: `Total: ${formatCurrency(quote.total)}`,
          badge: { label: statusLabels[quote.status], variant: statusVariants[quote.status] },
          data: quote,
        });
      });

      // Sort by date (most recent first)
      timelineEvents.sort((a, b) => b.date.getTime() - a.date.getTime());

      setEvents(timelineEvents);
    } catch (error) {
      logger.error('Error loading timeline data', error as Error);
      toast.error('Error al cargar el timeline');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-PY', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (events.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>
              No hay eventos registrados aún. Crea tu primera interacción usando los tabs arriba.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Timeline ({events.length} eventos)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative space-y-6">
          {/* Timeline Line */}
          <div className="absolute left-5 top-0 bottom-0 w-px bg-border" />

          {/* Events */}
          {events.map((event) => {
            const Icon = event.icon;
            return (
              <div key={event.id} className="relative flex gap-4">
                {/* Icon */}
                <div className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full bg-background border-2 border-border`}>
                  <Icon className={`h-5 w-5 ${event.iconColor}`} />
                </div>

                {/* Content */}
                <div className="flex-1 pb-6">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-semibold">{event.title}</h4>
                      {event.badge && (
                        <Badge variant={event.badge.variant}>{event.badge.label}</Badge>
                      )}
                    </div>
                    <span className="text-sm text-muted-foreground whitespace-nowrap">
                      {format(event.date, 'dd MMM yyyy HH:mm', { locale: es })}
                    </span>
                  </div>
                  {event.description && (
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {event.description}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
