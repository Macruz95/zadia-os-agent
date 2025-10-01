import { LeadStatus, LeadPriority } from '../../types/sales.types';
import { Flame, Thermometer, Snowflake } from 'lucide-react';

export const LEAD_STATUS_LABELS = {
  new: 'Nuevo',
  contacted: 'Contactado',
  qualifying: 'Calificando',
  disqualified: 'Descalificado',
  converted: 'Convertido'
};

export const LEAD_SOURCE_LABELS = {
  web: 'Web',
  referral: 'Referido',
  event: 'Evento',
  'cold-call': 'Llamada',
  imported: 'Importado'
};

export function getStatusBadgeVariant(status: LeadStatus) {
  switch (status) {
    case 'new': return 'default';
    case 'contacted': return 'secondary';
    case 'qualifying': return 'outline';
    case 'converted': return 'default';
    case 'disqualified': return 'destructive';
    default: return 'default';
  }
}

export function getPriorityIcon(priority: LeadPriority) {
  switch (priority) {
    case 'hot': return <Flame className="h-4 w-4 text-red-500" />;
    case 'warm': return <Thermometer className="h-4 w-4 text-yellow-500" />;
    case 'cold': return <Snowflake className="h-4 w-4 text-blue-500" />;
    default: return <Thermometer className="h-4 w-4 text-yellow-500" />;
  }
}