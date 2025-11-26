/**
 * ZADIA OS - RICE-Z Score Component
 * Visualización del score RICE-Z
 */

'use client';

import { TrendingUp, Users, Target, CheckCircle2, Zap, AlertCircle, DollarSign, Link2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { RICEZScore } from '../types/tasks.types';

interface RICEZScoreProps {
  score: RICEZScore;
  showDetails?: boolean;
  compact?: boolean;
}

export function RICEZScore({ score, showDetails = true, compact = false }: RICEZScoreProps) {
  const riceAvg = (score.rice.reach + score.rice.impact + score.rice.confidence + (100 - score.rice.effort)) / 4;
  const zadiaAvg = (score.z.strategicValue + score.z.urgency + score.z.dependencies + score.z.roi) / 4;

  const getScoreColor = (value: number) => {
    if (value >= 80) return 'text-green-400';
    if (value >= 60) return 'text-cyan-400';
    if (value >= 40) return 'text-yellow-400';
    return 'text-orange-400';
  };

  const getScoreBgColor = (value: number) => {
    if (value >= 80) return 'bg-green-500/20 border-green-500/30';
    if (value >= 60) return 'bg-cyan-500/20 border-cyan-500/30';
    if (value >= 40) return 'bg-yellow-500/20 border-yellow-500/30';
    return 'bg-orange-500/20 border-orange-500/30';
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div className={cn(
          "px-3 py-1 rounded-lg border text-sm font-semibold",
          getScoreBgColor(score.total),
          getScoreColor(score.total)
        )}>
          {score.total.toFixed(1)}
        </div>
        {score.rank > 0 && (
          <Badge variant="outline" className="text-xs bg-gray-500/20 text-gray-400 border-gray-500/30">
            #{score.rank}
          </Badge>
        )}
      </div>
    );
  }

  return (
    <Card className="bg-[#161b22] border-gray-800/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-cyan-400" />
              Score RICE-Z
            </CardTitle>
            <CardDescription className="text-gray-400">
              Priorización inteligente
            </CardDescription>
          </div>
          <div className={cn(
            "px-4 py-2 rounded-lg border text-2xl font-bold",
            getScoreBgColor(score.total),
            getScoreColor(score.total)
          )}>
            {score.total.toFixed(1)}
          </div>
        </div>
      </CardHeader>

      {showDetails && (
        <CardContent className="space-y-6">
          {/* RICE Score */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-white">RICE Score</h3>
              <span className={cn("text-sm font-medium", getScoreColor(riceAvg))}>
                {riceAvg.toFixed(1)} / 100
              </span>
            </div>
            <div className="space-y-3">
              <ScoreItem
                icon={Users}
                label="Reach"
                value={score.rice.reach}
                description="Cuántas personas afecta"
              />
              <ScoreItem
                icon={Target}
                label="Impact"
                value={score.rice.impact}
                description="Qué tan grande es el impacto"
              />
              <ScoreItem
                icon={CheckCircle2}
                label="Confidence"
                value={score.rice.confidence}
                description="Qué tan seguro estamos"
              />
              <ScoreItem
                icon={AlertCircle}
                label="Effort"
                value={100 - score.rice.effort}
                description="Esfuerzo requerido (inverso)"
                inverse
              />
            </div>
          </div>

          {/* ZADIA Score */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Zap className="h-4 w-4 text-cyan-400" />
                ZADIA Score
              </h3>
              <span className={cn("text-sm font-medium", getScoreColor(zadiaAvg))}>
                {zadiaAvg.toFixed(1)} / 100
              </span>
            </div>
            <div className="space-y-3">
              <ScoreItem
                icon={TrendingUp}
                label="Strategic Value"
                value={score.z.strategicValue}
                description="Valor estratégico para el negocio"
              />
              <ScoreItem
                icon={AlertCircle}
                label="Urgency"
                value={score.z.urgency}
                description="Urgencia real"
              />
              <ScoreItem
                icon={Link2}
                label="Dependencies"
                value={score.z.dependencies}
                description="Dependencias críticas"
              />
              <ScoreItem
                icon={DollarSign}
                label="ROI"
                value={score.z.roi}
                description="Retorno de inversión estimado"
              />
            </div>
          </div>

          {/* Ranking */}
          {score.rank > 0 && (
            <div className="pt-4 border-t border-gray-800/50">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Ranking Global</span>
                <Badge variant="outline" className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
                  #{score.rank}
                </Badge>
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}

interface ScoreItemProps {
  icon: React.ElementType;
  label: string;
  value: number;
  description: string;
  inverse?: boolean;
}

function ScoreItem({ icon: Icon, label, value, description }: ScoreItemProps) {
  const getColor = (val: number) => {
    if (val >= 80) return 'text-green-400';
    if (val >= 60) return 'text-cyan-400';
    if (val >= 40) return 'text-yellow-400';
    return 'text-orange-400';
  };

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <Icon className="h-3.5 w-3.5 text-gray-400" />
          <span className="text-gray-300">{label}</span>
        </div>
        <span className={cn("font-medium", getColor(value))}>
          {value.toFixed(0)}
        </span>
      </div>
      <Progress value={value} className="h-1.5" />
      <p className="text-xs text-gray-500">{description}</p>
    </div>
  );
}

