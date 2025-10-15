/**
 * ZADIA OS - Lead Contact Information Component
 * 
 * Displays basic contact information and notes
 */

'use client';

import { Mail, Phone, Building } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lead } from '../../../types/sales.types';

interface LeadContactInfoProps {
  lead: Lead;
}

export function LeadContactInfo({ lead }: LeadContactInfoProps) {
  const leadName = lead.fullName || lead.entityName || 'Sin nombre';

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Información Básica
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Nombre/Entidad</label>
              <p className="text-sm">{leadName}</p>
            </div>

            {lead.email && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Email</label>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-blue-500" />
                  <p className="text-sm">{lead.email}</p>
                </div>
              </div>
            )}

            {lead.phone && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Teléfono</label>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-green-500" />
                  <p className="text-sm">{lead.phone}</p>
                </div>
              </div>
            )}

            {lead.entityType && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Tipo</label>
                <p className="text-sm capitalize">{lead.entityType}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      {lead.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{lead.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
