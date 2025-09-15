'use client';

import { MessageSquare, FileText, Briefcase, Users, Clock } from 'lucide-react';
import { formatDate } from '../../utils/date.utils';
import { formatCurrency } from '../../utils/currency.utils';
import { Interaction, Transaction, Project, Quote, Meeting, Task } from '../../types/clients.types';

interface TimelineItemProps {
  item: Interaction | Transaction | Project | Quote | Meeting | Task;
  type: string;
}

export const TimelineItem = ({ item, type }: TimelineItemProps) => {
  const getIcon = () => {
    switch (type) {
      case 'interaction': return <MessageSquare className="w-4 h-4" />;
      case 'transaction': return <FileText className="w-4 h-4" />;
      case 'project': return <Briefcase className="w-4 h-4" />;
      case 'quote': return <FileText className="w-4 h-4" />;
      case 'meeting': return <Users className="w-4 h-4" />;
      case 'task': return <Clock className="w-4 h-4" />;
      default: return <MessageSquare className="w-4 h-4" />;
    }
  };

  const getContent = () => {
    switch (type) {
      case 'interaction':
        return (
          <div>
            <p className="font-medium">{(item as Interaction).type}</p>
            <p className="text-sm text-muted-foreground">{(item as Interaction).notes}</p>
          </div>
        );
      case 'transaction':
        return (
          <div>
            <p className="font-medium">{(item as Transaction).type}: {formatCurrency((item as Transaction).amount)}</p>
            <p className="text-sm text-muted-foreground">Estado: {(item as Transaction).status}</p>
          </div>
        );
      case 'project':
        return (
          <div>
            <p className="font-medium">{(item as Project).name}</p>
            <p className="text-sm text-muted-foreground">Progreso: {(item as Project).progress}%</p>
          </div>
        );
      case 'quote':
        return (
          <div>
            <p className="font-medium">Cotización {(item as Quote).number}</p>
            <p className="text-sm text-muted-foreground">
              Monto: {formatCurrency((item as Quote).estimatedAmount)} - Estado: {(item as Quote).status}
            </p>
          </div>
        );
      case 'meeting':
        return (
          <div>
            <p className="font-medium">Reunión</p>
            <p className="text-sm text-muted-foreground">
              {(item as Meeting).attendees.length} asistentes - {(item as Meeting).duration} min
            </p>
          </div>
        );
      case 'task':
        return (
          <div>
            <p className="font-medium">{(item as Task).title}</p>
            <p className="text-sm text-muted-foreground">
              Prioridad: {(item as Task).priority} - Estado: {(item as Task).status}
            </p>
          </div>
        );
      default:
        return <p>Evento desconocido</p>;
    }
  };

  const getTimelineDate = () => {
    switch (type) {
      case 'interaction':
        return (item as Interaction).date;
      case 'transaction':
        return (item as Transaction).dueDate || (item as Transaction).createdAt;
      case 'project':
        return (item as Project).startDate;
      case 'quote':
        return (item as Quote).date;
      case 'meeting':
        return (item as Meeting).date;
      case 'task':
        return (item as Task).dueDate || (item as Task).createdAt;
      default:
        return (item as Interaction).createdAt;
    }
  };

  return (
    <div className="flex flex-col p-4 border rounded-lg bg-card hover:shadow-md transition-all duration-200 h-full">
      <div className="flex items-start gap-3 mb-3">
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
            {getIcon()}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          {getContent()}
        </div>
      </div>
      <div className="mt-auto pt-2 border-t border-gray-100">
        <p className="text-xs text-muted-foreground">
          {formatDate(getTimelineDate())}
        </p>
      </div>
    </div>
  );
};