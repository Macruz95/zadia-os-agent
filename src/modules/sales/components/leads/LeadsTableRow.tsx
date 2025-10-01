import { Badge } from '@/components/ui/badge';
import { TableCell, TableRow } from '@/components/ui/table';
import { Mail, PhoneCall } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Lead } from '../../types/sales.types';
import { LEAD_STATUS_LABELS, LEAD_SOURCE_LABELS, getStatusBadgeVariant, getPriorityIcon } from './LeadsTableUtils';
import { LeadsTableActions } from './LeadsTableActions';

interface LeadsTableRowProps {
  lead: Lead;
  onConvertLead: (lead: Lead) => void;
  onDisqualifyLead: (lead: Lead) => void;
  onRowClick: (leadId: string) => void;
  onEditLead?: (lead: Lead) => void;
  onDeleteLead?: (lead: Lead) => void;
}

export function LeadsTableRow({ 
  lead, 
  onConvertLead, 
  onDisqualifyLead, 
  onRowClick,
  onEditLead,
  onDeleteLead
}: LeadsTableRowProps) {
  return (
    <TableRow 
      className="cursor-pointer hover:bg-muted/50"
      onClick={() => onRowClick(lead.id)}
    >
      <TableCell>
        <div>
          <p className="font-medium">
            {lead.entityType === 'person' 
              ? lead.fullName 
              : lead.entityName
            }
          </p>
          {lead.company && (
            <p className="text-sm text-muted-foreground">
              {lead.company}
            </p>
          )}
        </div>
      </TableCell>
      <TableCell>
        <div className="space-y-1">
          <div className="flex items-center gap-1">
            <Mail className="h-3 w-3 text-muted-foreground" />
            <span className="text-sm">{lead.email}</span>
          </div>
          <div className="flex items-center gap-1">
            <PhoneCall className="h-3 w-3 text-muted-foreground" />
            <span className="text-sm">{lead.phone}</span>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <Badge variant="outline">
          {LEAD_SOURCE_LABELS[lead.source]}
        </Badge>
      </TableCell>
      <TableCell>
        <Badge variant={getStatusBadgeVariant(lead.status)}>
          {LEAD_STATUS_LABELS[lead.status]}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <span>{getPriorityIcon(lead.priority)}</span>
          <span className="text-sm">{lead.score}</span>
        </div>
      </TableCell>
      <TableCell>{lead.score}</TableCell>
      <TableCell>
        {format(lead.createdAt.toDate(), 'dd/MM/yyyy', { locale: es })}
      </TableCell>
      <TableCell className="text-right">
        <LeadsTableActions
          lead={lead}
          onConvertLead={onConvertLead}
          onDisqualifyLead={onDisqualifyLead}
          onViewDetails={onRowClick}
          onEditLead={onEditLead}
          onDeleteLead={onDeleteLead}
        />
      </TableCell>
    </TableRow>
  );
}