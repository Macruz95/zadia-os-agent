import { Badge } from '@/components/ui/badge';
import { Opportunity, OpportunityStage } from '../../types/sales.types';
import { OpportunityCard } from './OpportunityCard';
import { STAGE_CONFIG } from './KanbanConfig';

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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-PY', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className={`rounded-lg border-2 ${stageConfig.color} p-4`}>
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
      <div className="space-y-3">
        {opportunities.map((opportunity) => (
          <OpportunityCard
            key={opportunity.id}
            opportunity={opportunity}
            stage={stage}
            onStageChange={onStageChange}
            onCardClick={onCardClick}
          />
        ))}

        {/* Empty State */}
        {opportunities.length === 0 && (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No hay oportunidades en esta etapa
          </div>
        )}
      </div>
    </div>
  );
}