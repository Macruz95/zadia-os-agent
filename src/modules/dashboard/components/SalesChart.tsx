'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { SalesChartData } from '../types/analytics.types';

interface SalesChartProps {
  data: SalesChartData[];
  title?: string;
  showLegend?: boolean;
  height?: number;
}

/**
 * Custom tooltip for the sales chart
 */
function CustomTooltip({ 
  active, 
  payload, 
  label 
}: { 
  active?: boolean; 
  payload?: Array<{ name: string; value: number; color: string }>; 
  label?: string 
}) {
  if (!active || !payload) return null;

  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-3 shadow-lg">
      <p className="text-sm text-zinc-400 mb-2">{label}</p>
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center gap-2 text-sm">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-zinc-300">{entry.name}:</span>
          <span className="text-white font-medium">
            {entry.name === 'Ingresos' 
              ? `$${entry.value.toLocaleString()}` 
              : entry.value.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
}

/**
 * Sales Chart component using Recharts
 * Displays revenue and orders over time
 */
export function SalesChart({
  data,
  title = 'Ventas',
  showLegend = true,
  height = 350,
}: SalesChartProps) {
  // Transform data for chart
  const chartData = data.map(item => ({
    date: formatDateLabel(item.date),
    Ingresos: item.revenue,
    Ordenes: item.orders,
  }));

  return (
    <Card className="bg-zinc-900/50 border-zinc-800">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-white">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="ordersGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
            <XAxis
              dataKey="date"
              stroke="#71717a"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#71717a"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            {showLegend && (
              <Legend
                wrapperStyle={{
                  paddingTop: '20px',
                }}
              />
            )}
            <Area
              type="monotone"
              dataKey="Ingresos"
              stroke="#3b82f6"
              strokeWidth={2}
              fill="url(#revenueGradient)"
            />
            <Area
              type="monotone"
              dataKey="Ordenes"
              stroke="#10b981"
              strokeWidth={2}
              fill="url(#ordersGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

/**
 * Format date for chart labels
 */
function formatDateLabel(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('es-MX', {
    month: 'short',
    day: 'numeric',
  });
}
