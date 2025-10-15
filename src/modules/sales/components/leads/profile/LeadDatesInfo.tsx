/**
 * ZADIA OS - Lead Dates Information Component
 * 
 * Displays important dates and additional metadata
 */

'use client';

import { Calendar, Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Lead } from '../../../types/sales.types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface LeadDatesInfoProps {
  lead: Lead;
}

export function LeadDatesInfo({ lead }: LeadDatesInfoProps) {
  return (
    <div className="space-y-6">
      {/* Important Dates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Fechas Importantes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Fecha de creación</label>
            <p className="text-sm">
              {format(lead.createdAt.toDate(), 'dd/MM/yyyy HH:mm', { locale: es })}
            </p>
          </div>

          <Separator />

          <div>
            <label className="text-sm font-medium text-muted-foreground">Última actualización</label>
            <p className="text-sm">
              {format(lead.updatedAt.toDate(), 'dd/MM/yyyy HH:mm', { locale: es })}
            </p>
          </div>

          {lead.lastContactDate && (
            <>
              <Separator />
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Último contacto</label>
                <p className="text-sm">
                  {format(lead.lastContactDate.toDate(), 'dd/MM/yyyy HH:mm', { locale: es })}
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Additional Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Información Adicional
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <label className="text-sm font-medium text-muted-foreground">ID del Lead</label>
            <p className="text-xs font-mono bg-muted p-2 rounded">{lead.id}</p>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">Creado por</label>
            <p className="text-sm">{lead.createdBy}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
