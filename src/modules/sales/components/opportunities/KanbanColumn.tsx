import { Badge } from '@/components/ui/badge';
import { Opportunity, OpportunityStage } from '../../types/sales.types';
import { OpportunityCard } from './OpportunityCard';
import { STAGE_CONFIG } from './KanbanConfig';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

interface KanbanColumnProps {
  stage: OpportunityStage;
  opportunities: Opportunity[];
  onStageChange: (opportunityId: string, newStage: OpportunityStage) => void;
  onCardClick: (opportunityId: string) => void;
}

export function KanbanColumn({ stage, opportunities, onStageChange, onCardClick }: KanbanColumnProps) {
  const stageConfig = STAGE_CONFIG[stage];
  const stageValue = opportunities.reduce((sum, opp) => sum + opp.estimatedValue, 0);
  const Icon = stageConfig.icon;

  const { setNodeRef } = useDroppable({
    id: stage,
    data: {
      type: 'Column',
      stage,
    },
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-PY', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className={`rounded-lg border-2 ${stageConfig.color} p-4 flex flex-col h-full bg-[#0a0f1a]/50 backdrop-blur-sm`}>
      {/* Stage Header */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Icon className={`h-5 w-5 ${stageConfig.textColor}`} />
          <h3 className={`font-semibold ${stageConfig.textColor}`}>
            {stageConfig.title}
          </h3>
          <Badge variant="outline" className={stageConfig.textColor}>
            {opportunities.length}
          </Badge>
        </div>
        <p className={`text-sm ${stageConfig.textColor}`}>
          {formatCurrency(stageValue)}
        </p>
      </div>

      {/* Opportunities Cards */}
      <div className="space-y-3 flex-1 min-h-[150px]" ref={setNodeRef}>
        <SortableContext
          items={opportunities.map(o => o.id)}
          strategy={verticalListSortingStrategy}
        >
          {opportunities.map((opportunity) => (
            <OpportunityCard
              key={opportunity.id}
              opportunity={opportunity}
              stage={stage}
              onStageChange={onStageChange}
              onCardClick={onCardClick}
            />
          ))}
        </SortableContext>

        {/* Empty State */}
        {opportunities.length === 0 && (
          <div className="text-center py-8 text-muted-foreground text-sm opacity-50">
            Arratre tarjetas aquí
          </div>
        )}
      </div>
    </div>
  );
}