/**
 * ZADIA OS - AI Insights Panel
 * 
 * Displays AI-generated insights from the Financial Insights Agent
 * Part of "El Consejero Digital" (The Digital Advisor)
 */

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, TrendingUp, AlertTriangle, Lightbulb, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface AIInsightsPanelProps {
  insights: string[];
  healthScore: number;
  loading: boolean;
  error: string | null;
}

export function AIInsightsPanel({ insights, healthScore, loading, error }: AIInsightsPanelProps) {
  if (error) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600" />
            <CardTitle>Consejero Digital</CardTitle>
          </div>
          <CardDescription>
            Insights estratégicos impulsados por IA
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600 animate-pulse" />
            <CardTitle>Consejero Digital</CardTitle>
          </div>
          <CardDescription>
            Analizando datos con IA...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-white dark:from-purple-950/20 dark:to-background">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600" />
            <CardTitle>Consejero Digital</CardTitle>
          </div>
          <HealthScoreBadge score={healthScore} />
        </div>
        <CardDescription>
          Insights estratégicos impulsados por IA
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {insights.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No hay suficientes datos para generar insights
          </p>
        ) : (
          <div className="space-y-3">
            {insights.map((insight, index) => (
              <InsightCard key={index} insight={insight} index={index} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Health Score Badge Component
 */
function HealthScoreBadge({ score }: { score: number }) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100';
    if (score >= 40) return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100';
    return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excelente';
    if (score >= 60) return 'Buena';
    if (score >= 40) return 'Regular';
    return 'Crítica';
  };

  return (
    <Badge variant="outline" className={getScoreColor(score)}>
      Salud: {score}/100 - {getScoreLabel(score)}
    </Badge>
  );
}

/**
 * Individual Insight Card
 */
function InsightCard({ insight, index }: { insight: string; index: number }) {
  const getIcon = (index: number) => {
    if (index === 0) return <TrendingUp className="h-4 w-4" />;
    if (index === 1) return <AlertTriangle className="h-4 w-4" />;
    return <Lightbulb className="h-4 w-4" />;
  };

  const getIconColor = (index: number) => {
    if (index === 0) return 'text-blue-600';
    if (index === 1) return 'text-orange-600';
    return 'text-purple-600';
  };

  return (
    <div className="flex gap-3 p-3 rounded-lg bg-white dark:bg-slate-900 border border-purple-100 dark:border-purple-900">
      <div className={`flex-shrink-0 ${getIconColor(index)}`}>
        {getIcon(index)}
      </div>
      <p className="text-sm leading-relaxed">{insight}</p>
    </div>
  );
}
