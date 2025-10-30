/**
 * ZADIA OS - Sparkline Component
 * 
 * Reusable mini-chart for KPI trends using react-sparklines
 * Rule #2: ShadCN UI + Lucide Icons
 * Rule #4: Modular architecture
 * Rule #5: Max 200 lines
 */

'use client';

import { Sparklines, SparklinesLine } from 'react-sparklines';
import type { KPITrendDirection } from '../types/kpi-thresholds.types';

interface SparklineChartProps {
  data: number[];
  color?: string;
  trend?: KPITrendDirection;
  height?: number;
  width?: number;
}

/**
 * Sparkline chart component
 * Renders a mini line chart for KPI trends
 */
export function SparklineChart({ 
  data, 
  color,
  trend = 'stable',
  height = 40,
  width = 100
}: SparklineChartProps) {
  // Don't render if no data
  if (!data || data.length === 0) {
    return null;
  }

  // Determine line color based on trend if not specified
  const lineColor = color || getTrendColor(trend);

  return (
    <div className="flex items-center justify-center">
      <Sparklines data={data} width={width} height={height}>
        <SparklinesLine 
          color={lineColor} 
          style={{ 
            strokeWidth: 2,
            fill: 'none'
          }} 
        />
      </Sparklines>
    </div>
  );
}

/**
 * Get color for trend direction
 */
function getTrendColor(trend: KPITrendDirection): string {
  switch (trend) {
    case 'up':
      return '#10b981'; // green-500
    case 'down':
      return '#ef4444'; // red-500
    case 'stable':
      return '#6b7280'; // gray-500
  }
}
