/**
 * ZADIA OS - Lead Profile Header Component
 * 
 * Header with back button, title, and action buttons
 */

'use client';

import { ArrowLeft, Edit, UserCheck, UserX, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lead } from '../../../types/sales.types';
import { LEAD_STATUS_LABELS, LEAD_SOURCE_LABELS, getStatusBadgeVariant, getPriorityIcon } from '../LeadsTableUtils';

interface LeadProfileHeaderProps {
  lead: Lead;
  onBack: () => void;
  onEdit: () => void;
  onConvert: () => void;
  onDisqualify: () => void;
  onDelete: () => void;
}

export function LeadProfileHeader({
  lead,
  onBack,
  onEdit,
  onConvert,
  onDisqualify,
  onDelete,
}: LeadProfileHeaderProps) {
  const leadName = lead.fullName || lead.entityName || 'Sin nombre';
  const priorityIcon = getPriorityIcon(lead.priority);

  return (
    <div className="space-y-4">
      {/* Title and Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Leads
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{leadName}</h1>
            <p className="text-muted-foreground">Detalles del lead</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onEdit}>
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>

          {lead.status === 'qualifying' && (
            <Button variant="default" size="sm" onClick={onConvert}>
              <UserCheck className="h-4 w-4 mr-2" />
              Convertir
            </Button>
          )}

          {['new', 'contacted', 'qualifying'].includes(lead.status) && (
            <Button variant="outline" size="sm" onClick={onDisqualify}>
              <UserX className="h-4 w-4 mr-2" />
              Descalificar
            </Button>
          )}

          <Button variant="destructive" size="sm" onClick={onDelete}>
            <Trash2 className="h-4 w-4 mr-2" />
            Eliminar
          </Button>
        </div>
      </div>

      {/* Status and Priority Badges */}
      <div className="flex items-center gap-4">
        <Badge className={getStatusBadgeVariant(lead.status)}>
          {LEAD_STATUS_LABELS[lead.status]}
        </Badge>
        <div className="flex items-center gap-2">
          {priorityIcon}
          <span className="text-sm font-medium capitalize">{lead.priority}</span>
        </div>
        <Badge variant="outline">
          {LEAD_SOURCE_LABELS[lead.source]}
        </Badge>
      </div>
    </div>
  );
}
