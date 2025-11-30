'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from 'recharts';
import { CashFlowData } from '../types/analytics.types';

interface CashFlowChartProps {
  data: CashFlowData[];
  title?: string;
  height?: number;
}

const COLORS = {
  income: '#22c55e',
  expenses: '#ef4444',
  balance: '#3b82f6',
};

/**
 * Custom tooltip for cash flow chart
 */
function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; dataKey: string }>;
  label?: string;
}) {
  if (!active || !payload) return null;

  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-3 shadow-lg">
      <p className="text-sm text-zinc-400 mb-2">{label}</p>
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center gap-2 text-sm">
          <div
            className="w-3 h-3 rounded-full"
            style={{
              backgroundColor:
                entry.dataKey === 'income'
                  ? COLORS.income
                  : entry.dataKey === 'expenses'
                  ? COLORS.expenses
                  : COLORS.balance,
            }}
          />
          <span className="text-zinc-300">
            {entry.dataKey === 'income'
              ? 'Ingresos'
              : entry.dataKey === 'expenses'
              ? 'Gastos'
              : 'Balance'}
            :
          </span>
          <span className="text-white font-medium">
            ${entry.value.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
}

/**
 * Cash Flow Chart component
 * Displays income, expenses and balance over time
 */
export function CashFlowChart({
  data,
  title = 'Flujo de Caja',
  height = 300,
}: CashFlowChartProps) {
  // Transform data for chart
  const chartData = data.map(item => ({
    date: formatDateLabel(item.date),
    income: item.income,
    expenses: item.expenses,
    balance: item.balance,
  }));

  return (
    <Card className="bg-zinc-900/50 border-zinc-800">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold text-white">
          {title}
        </CardTitle>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.income }} />
            <span className="text-zinc-400">Ingresos</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.expenses }} />
            <span className="text-zinc-400">Gastos</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <BarChart data={chartData} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
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
            <Bar dataKey="income" radius={[4, 4, 0, 0]}>
              {chartData.map((_, index) => (
                <Cell key={`income-${index}`} fill={COLORS.income} />
              ))}
            </Bar>
            <Bar dataKey="expenses" radius={[4, 4, 0, 0]}>
              {chartData.map((_, index) => (
                <Cell key={`expenses-${index}`} fill={COLORS.expenses} />
              ))}
            </Bar>
          </BarChart>
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
