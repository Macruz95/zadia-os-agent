/**
 * ZADIA OS - KPI Sparkline Component
 * 
 * Mini chart showing KPI trends (30-day historical data)
 * Rule #2: ShadCN UI + Lucide icons only
 * Rule #4: Modular architecture
 */

import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import type { KPITrendDirection } from '../types/kpi-thresholds.types';

export interface KPISparklineProps {
  data: number[];
  color: string;
  direction: KPITrendDirection;
  changePercentage: number;
  height?: number;
  showTrendIndicator?: boolean;
}

export function KPISparkline({
  data,
  color,
  direction,
  changePercentage,
  height = 40,
  showTrendIndicator = true,
}: KPISparklineProps) {
  // Convert data to recharts format
  const chartData = data.map((value, index) => ({
    index,
    value,
  }));

  // Get trend icon
  const getTrendIcon = () => {
    switch (direction) {
      case 'up':
        return <TrendingUp className="w-4 h-4" />;
      case 'down':
        return <TrendingDown className="w-4 h-4" />;
      default:
        return <Minus className="w-4 h-4" />;
    }
  };

  // Get trend color class
  const getTrendColorClass = () => {
    switch (direction) {
      case 'up':
        return 'text-green-600 dark:text-green-400';
      case 'down':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-500 dark:text-gray-400';
    }
  };

  // Format percentage
  const formattedPercentage = Math.abs(changePercentage).toFixed(1);

  return (
    <div className="flex items-center gap-2">
      {/* Sparkline Chart */}
      <div className="flex-1">
        {data.length > 1 ? (
          <ResponsiveContainer width="100%" height={height}>
            <LineChart data={chartData}>
              <Line
                type="monotone"
                dataKey="value"
                stroke={color}
                strokeWidth={2}
                dot={false}
                animationDuration={300}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div 
            className="flex items-center justify-center text-xs text-muted-foreground"
            style={{ height }}
          >
            Sin datos
          </div>
        )}
      </div>

      {/* Trend Indicator */}
      {showTrendIndicator && data.length > 1 && (
        <div className={`flex items-center gap-1 text-xs font-medium ${getTrendColorClass()}`}>
          {getTrendIcon()}
          <span>{formattedPercentage}%</span>
        </div>
      )}
    </div>
  );
}
