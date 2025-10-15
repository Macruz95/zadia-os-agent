/**
 * ZADIA OS - Lead Metrics Component
 * 
 * Displays lead score and performance metrics
 */

'use client';

import { TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lead } from '../../../types/sales.types';

interface LeadMetricsProps {
  lead: Lead;
}

export function LeadMetrics({ lead }: LeadMetricsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Puntuación
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center">
          <div className="text-3xl font-bold text-primary">
            {lead.score || 0}
          </div>
          <p className="text-sm text-muted-foreground">Puntos</p>
        </div>
      </CardContent>
    </Card>
  );
}
