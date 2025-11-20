import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, DollarSign, Calendar } from 'lucide-react';
import { Opportunity, OpportunityStage } from '../../types/sales.types';
import { PRIORITY_COLORS } from './KanbanConfig';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { markOpportunityAsWonAction } from '@/actions/opportunity-actions';
import { toast } from 'sonner';

interface OpportunityCardProps {
  opportunity: Opportunity;
  stage: OpportunityStage;
  onStageChange: (opportunityId: string, newStage: OpportunityStage) => void;
  onCardClick: (opportunityId: string) => void;
  onRefresh?: () => void;
}

export function OpportunityCard({ opportunity, stage, onStageChange, onCardClick, onRefresh }: OpportunityCardProps) {
  const [isMarkingAsWon, setIsMarkingAsWon] = useState(false);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-PY', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const handleMarkAsWon = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMarkingAsWon(true);

    try {
      const formData = new FormData();
      formData.append('opportunityId', opportunity.id);
      formData.append('projectName', `Proyecto - ${opportunity.name}`);
      formData.append('priority', opportunity.priority === 'high' ? 'high' : 'medium');

      const result = await markOpportunityAsWonAction({}, formData);

      if (result.success) {
        toast.success(`¡Oportunidad ganada! Proyecto creado automáticamente.`);
        if (onRefresh) {
          onRefresh();
        }
      } else {
        toast.error(result.error || 'Error al marcar como ganada');
      }
    } catch (error) {
      toast.error('Error inesperado');
      console.error(error);
    } finally {
      setIsMarkingAsWon(false);
    }
  };

  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => onCardClick(opportunity.id)}
    >
      <CardContent className="p-3">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="font-medium text-sm leading-tight mb-1">
                {opportunity.name}
              </h4>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <DollarSign className="h-3 w-3" />
                <span>{formatCurrency(opportunity.estimatedValue)}</span>
                <span className="mx-1">•</span>
                <span>{opportunity.probability}%</span>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-6 w-6 p-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  Ver detalles
                </DropdownMenuItem>
                <DropdownMenuItem>
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem>
                  Agregar nota
                </DropdownMenuItem>
                {stage !== 'closed-won' && stage !== 'closed-lost' && (
                  <>
                    {stage !== 'negotiation' && (
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          onStageChange(opportunity.id, 'negotiation');
                        }}
                      >
                        Mover a Negociación
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      onClick={handleMarkAsWon}
                      disabled={isMarkingAsWon}
                    >
                      {isMarkingAsWon ? 'Creando proyecto...' : '✨ Marcar como Ganada'}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        onStageChange(opportunity.id, 'closed-lost');
                      }}
                      className="text-destructive"
                    >
                      Marcar como Perdida
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Priority & Date */}
          <div className="flex items-center justify-between">
            <Badge
              variant="outline"
              className={`text-xs ${PRIORITY_COLORS[opportunity.priority]}`}
            >
              {opportunity.priority === 'high' ? 'Alta' :
                opportunity.priority === 'medium' ? 'Media' : 'Baja'}
            </Badge>

            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>
                {opportunity.expectedCloseDate ?
                  format(opportunity.expectedCloseDate.toDate(), 'dd MMM', { locale: es }) :
                  'Sin fecha'
                }
              </span>
            </div>
          </div>

          {/* Assigned User */}
          {opportunity.assignedTo && (
            <div className="flex items-center gap-2">
              <Avatar className="h-5 w-5">
                <AvatarFallback className="text-xs">
                  {opportunity.assignedTo.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground">
                {opportunity.assignedTo}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}