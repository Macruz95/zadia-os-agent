/**
 * ZADIA OS - Opportunity Stage Progress Component
 * 
 * Visual progress bar showing current stage in the sales pipeline
 * 
 * @component
 */

'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Circle, XCircle } from 'lucide-react';
import type { Opportunity, OpportunityStage } from '@/modules/sales/types/sales.types';

interface OpportunityStageProgressProps {
  opportunity: Opportunity;
}

const STAGE_CONFIG: Record<OpportunityStage, { label: string; order: number; color: string }> = {
  'qualified': { label: 'Calificado', order: 0, color: 'bg-blue-500' },
  'proposal-sent': { label: 'Propuesta', order: 1, color: 'bg-yellow-500' },
  'negotiation': { label: 'Negociación', order: 2, color: 'bg-orange-500' },
  'closed-won': { label: 'Ganada', order: 3, color: 'bg-green-500' },
  'closed-lost': { label: 'Perdida', order: 3, color: 'bg-red-500' },
};

export function OpportunityStageProgress({ opportunity }: OpportunityStageProgressProps) {
  const currentStage = opportunity.stage;
  const currentOrder = STAGE_CONFIG[currentStage].order;
  const isWon = currentStage === 'closed-won';
  const isLost = currentStage === 'closed-lost';
  const isClosed = isWon || isLost;

  // Stages for progress (excluding closed-lost)
  const stages: OpportunityStage[] = ['qualified', 'proposal-sent', 'negotiation', 'closed-won'];

  const progressPercent = isClosed
    ? 100
    : ((currentOrder + 1) / stages.length) * 100;

  const getStageIcon = (stage: OpportunityStage) => {
    if (isLost && stage === currentStage) {
      return <XCircle className="h-6 w-6 text-red-500" />;
    }
    
    if (stage === currentStage) {
      return (
        <div className={`h-6 w-6 rounded-full ${STAGE_CONFIG[stage].color} flex items-center justify-center`}>
          <Circle className="h-4 w-4 text-white fill-current" />
        </div>
      );
    }

    const stageOrder = STAGE_CONFIG[stage].order;
    if (stageOrder < currentOrder || isWon) {
      return <CheckCircle2 className="h-6 w-6 text-green-500" />;
    }

    return <Circle className="h-6 w-6 text-muted-foreground" />;
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Progress Bar */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Progreso del Pipeline</span>
              <Badge variant={isWon ? 'default' : isLost ? 'destructive' : 'secondary'}>
                {STAGE_CONFIG[currentStage].label}
              </Badge>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </div>

          {/* Stage Indicators */}
          <div className="flex items-center justify-between">
            {stages.map((stage, index) => (
              <div key={stage} className="flex flex-col items-center gap-2 flex-1">
                {getStageIcon(stage)}
                <span className={`text-xs text-center ${
                  stage === currentStage ? 'font-semibold text-foreground' : 'text-muted-foreground'
                }`}>
                  {STAGE_CONFIG[stage].label}
                </span>
                {index < stages.length - 1 && (
                  <div className="absolute h-0.5 bg-border w-full" style={{ zIndex: -1 }} />
                )}
              </div>
            ))}
          </div>

          {/* Additional Info */}
          {isLost && (
            <div className="flex items-center gap-2 text-sm text-destructive">
              <XCircle className="h-4 w-4" />
              <span>Oportunidad marcada como perdida</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
