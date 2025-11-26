/**
 * ZADIA OS - Meeting Dossier Component
 * Dossier de reunión generado por IA (DeepSeek R1)
 */

'use client';

import { useState, useEffect } from 'react';
import { FileText, Users, CheckCircle2, Clock, Sparkles, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useCalendar } from '../hooks/use-calendar';
import type { CalendarEvent, MeetingDossier } from '../types/calendar.types';

interface MeetingDossierProps {
  event: CalendarEvent;
  context?: {
    clientName?: string;
    projectName?: string;
    opportunityName?: string;
  };
}

export function MeetingDossier({ event, context }: MeetingDossierProps) {
  const { generateDossier } = useCalendar();
  const [dossier, setDossier] = useState<MeetingDossier | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDossier();
  }, [event.id]);

  const loadDossier = async () => {
    try {
      setLoading(true);
      setError(null);
      const generated = await generateDossier(event.id, context);
      setDossier(generated);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al generar dossier');
    } finally {
      setLoading(false);
    }
  };

  const startDate = event.startDate instanceof Date 
    ? event.startDate 
    : event.startDate.toDate();

  if (loading) {
    return (
      <Card className="bg-[#161b22] border-gray-800/50">
        <CardContent className="p-6">
          <div className="flex items-center justify-center gap-3 text-gray-400">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Generando dossier con IA...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-[#161b22] border-gray-800/50">
        <CardContent className="p-6">
          <div className="text-center text-red-400">
            <p className="mb-4">{error}</p>
            <Button onClick={loadDossier} variant="outline" size="sm">
              Reintentar
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!dossier) {
    return null;
  }

  const priorityColors = {
    low: 'bg-gray-500/20 text-gray-400',
    medium: 'bg-blue-500/20 text-blue-400',
    high: 'bg-orange-500/20 text-orange-400',
    urgent: 'bg-red-500/20 text-red-400'
  };

  return (
    <Card className="bg-[#161b22] border-gray-800/50">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-white">
              <Sparkles className="h-5 w-5 text-cyan-400" />
              Dossier de Reunión
            </CardTitle>
            <CardDescription className="text-gray-400 mt-1">
              Generado por IA - {format(new Date(dossier.generatedAt instanceof Date ? dossier.generatedAt : dossier.generatedAt.toDate()), "PPP 'a las' HH:mm", { locale: es })}
            </CardDescription>
          </div>
          <Button
            onClick={loadDossier}
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white"
          >
            Regenerar
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Información básica */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-gray-400 mb-1">Fecha y Hora</div>
            <div className="text-white font-medium">
              {format(startDate, "EEEE, d 'de' MMMM 'a las' HH:mm", { locale: es })}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-400 mb-1">Duración</div>
            <div className="text-white font-medium">{event.duration} minutos</div>
          </div>
        </div>

        {/* Participantes */}
        {dossier.participants.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Users className="h-4 w-4 text-gray-400" />
              <h3 className="font-semibold text-white">Participantes</h3>
            </div>
            <div className="space-y-2">
              {dossier.participants.map((participant, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-[#0d1117]">
                  <div>
                    <div className="text-white font-medium">{participant.name}</div>
                    {participant.role && (
                      <div className="text-sm text-gray-400">{participant.role}</div>
                    )}
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      participant.availability === 'confirmed'
                        ? 'bg-green-500/20 text-green-400 border-green-500/30'
                        : participant.availability === 'tentative'
                        ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                        : 'bg-red-500/20 text-red-400 border-red-500/30'
                    }
                  >
                    {participant.availability === 'confirmed' ? 'Confirmado' :
                     participant.availability === 'tentative' ? 'Tentativo' : 'Declinado'}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        <Separator className="bg-gray-800/50" />

        {/* Agenda */}
        {dossier.agenda.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <FileText className="h-4 w-4 text-gray-400" />
              <h3 className="font-semibold text-white">Agenda</h3>
            </div>
            <div className="space-y-3">
              {dossier.agenda.map((item, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-[#0d1117] border border-gray-800/50">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded">
                          {idx + 1}
                        </span>
                        <h4 className="font-medium text-white">{item.title}</h4>
                      </div>
                      {item.description && (
                        <p className="text-sm text-gray-400 mt-1">{item.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Clock className="h-3.5 w-3.5" />
                      {item.duration} min
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Items */}
        {dossier.actionItems && dossier.actionItems.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="h-4 w-4 text-gray-400" />
              <h3 className="font-semibold text-white">Action Items</h3>
            </div>
            <div className="space-y-2">
              {dossier.actionItems.map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-[#0d1117] border border-gray-800/50">
                  <CheckCircle2 className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-white font-medium">{item.title}</span>
                      <Badge
                        variant="outline"
                        className={cn("text-xs", priorityColors[item.priority])}
                      >
                        {item.priority === 'urgent' ? 'Urgente' :
                         item.priority === 'high' ? 'Alta' :
                         item.priority === 'medium' ? 'Media' : 'Baja'}
                      </Badge>
                    </div>
                    {item.description && (
                      <p className="text-sm text-gray-400">{item.description}</p>
                    )}
                    {item.assignedTo && (
                      <p className="text-xs text-gray-500 mt-1">
                        Asignado a: {item.assignedTo}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notas */}
        {dossier.notes && (
          <div>
            <h3 className="font-semibold text-white mb-2">Notas</h3>
            <div className="p-3 rounded-lg bg-[#0d1117] border border-gray-800/50">
              <p className="text-sm text-gray-300 whitespace-pre-wrap">{dossier.notes}</p>
            </div>
          </div>
        )}

        {/* Contexto */}
        {dossier.context && (
          <div>
            <h3 className="font-semibold text-white mb-2">Contexto</h3>
            <div className="p-3 rounded-lg bg-[#0d1117] border border-gray-800/50 space-y-2">
              {dossier.context.relatedClient && (
                <div className="text-sm">
                  <span className="text-gray-400">Cliente: </span>
                  <span className="text-white">{dossier.context.relatedClient.name}</span>
                </div>
              )}
              {dossier.context.relatedProject && (
                <div className="text-sm">
                  <span className="text-gray-400">Proyecto: </span>
                  <span className="text-white">{dossier.context.relatedProject.name}</span>
                </div>
              )}
              {dossier.context.relatedOpportunity && (
                <div className="text-sm">
                  <span className="text-gray-400">Oportunidad: </span>
                  <span className="text-white">{dossier.context.relatedOpportunity.name}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

