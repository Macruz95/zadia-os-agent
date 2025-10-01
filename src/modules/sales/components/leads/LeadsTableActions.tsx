import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, UserCheck, UserX, Edit, Trash2, Eye } from 'lucide-react';
import { Lead } from '../../types/sales.types';

interface LeadsTableActionsProps {
  lead: Lead;
  onConvertLead: (lead: Lead) => void;
  onDisqualifyLead: (lead: Lead) => void;
  onViewDetails: (leadId: string) => void;
  onEditLead?: (lead: Lead) => void;
  onDeleteLead?: (lead: Lead) => void;
}

export function LeadsTableActions({ 
  lead, 
  onConvertLead, 
  onDisqualifyLead, 
  onViewDetails,
  onEditLead,
  onDeleteLead
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
        <DropdownMenuItem onClick={(e) => {
          e.stopPropagation();
          onViewDetails(lead.id);
        }}>
          <Eye className="h-4 w-4 mr-2 text-blue-500" />
          Ver detalles
        </DropdownMenuItem>
        {onEditLead && (
          <DropdownMenuItem onClick={(e) => {
            e.stopPropagation();
            onEditLead(lead);
          }}>
            <Edit className="h-4 w-4 mr-2 text-blue-600" />
            Editar
          </DropdownMenuItem>
        )}
        {lead.status === 'qualifying' && (
          <DropdownMenuItem onClick={(e) => {
            e.stopPropagation();
            onConvertLead(lead);
          }}>
            <UserCheck className="h-4 w-4 mr-2 text-green-600" />
            Convertir
          </DropdownMenuItem>
        )}
        {['new', 'contacted', 'qualifying'].includes(lead.status) && (
          <DropdownMenuItem 
            onClick={(e) => {
              e.stopPropagation();
              onDisqualifyLead(lead);
            }}
            className="text-destructive"
          >
            <UserX className="h-4 w-4 mr-2 text-red-500" />
            Descalificar
          </DropdownMenuItem>
        )}
        {onDeleteLead && (
          <DropdownMenuItem 
            onClick={(e) => {
              e.stopPropagation();
              onDeleteLead(lead);
            }}
            className="text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-2 text-red-600" />
            Eliminar
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}