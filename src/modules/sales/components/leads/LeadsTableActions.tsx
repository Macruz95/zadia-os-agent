import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, UserCheck, UserX } from 'lucide-react';
import { Lead } from '../../types/sales.types';

interface LeadsTableActionsProps {
  lead: Lead;
  onConvertLead: (lead: Lead) => void;
  onDisqualifyLead: (lead: Lead) => void;
  onViewDetails: (leadId: string) => void;
}

export function LeadsTableActions({ 
  lead, 
  onConvertLead, 
  onDisqualifyLead, 
  onViewDetails 
}: LeadsTableActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="h-8 w-8 p-0"
          onClick={(e) => e.stopPropagation()}
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onViewDetails(lead.id)}>
          Ver detalles
        </DropdownMenuItem>
        {lead.status === 'qualifying' && (
          <DropdownMenuItem onClick={() => onConvertLead(lead)}>
            <UserCheck className="h-4 w-4 mr-2" />
            Convertir
          </DropdownMenuItem>
        )}
        {['new', 'contacted', 'qualifying'].includes(lead.status) && (
          <DropdownMenuItem 
            onClick={() => onDisqualifyLead(lead)}
            className="text-destructive"
          >
            <UserX className="h-4 w-4 mr-2" />
            Descalificar
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}