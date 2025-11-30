/**
 * ZADIA OS - Project Status Chart
 * Gráfico de proyectos con estética cockpit
 * Rule #2: ShadCN UI + Lucide Icons
 */

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase } from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Label,
} from 'recharts';
import type { StatusDistribution } from '../hooks/use-dashboard-data';

interface ProjectStatusChartProps {
  data: StatusDistribution[];
}

const COLORS = {
  completed: '#10b981',
  in_progress: '#3b82f6',
  pending: '#f59e0b',
  cancelled: '#ef4444',
};

const STATUS_NAMES: Record<string, string> = {
  completed: 'Completados',
  in_progress: 'En Progreso',
  pending: 'Pendientes',
  cancelled: 'Cancelados',
};

export function ProjectStatusChart({ data }: ProjectStatusChartProps) {
  // Transformar datos para mostrar nombres legibles
  const chartData = data.map(item => ({
    ...item,
    displayName: STATUS_NAMES[item.name] || item.name,
    fill: COLORS[item.name as keyof typeof COLORS] || '#6b7280',
  }));

  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card className="bg-[#161b22] border-gray-800/50">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Briefcase className="h-4 w-4 text-amber-400" />
          <CardTitle className="text-gray-200 text-base">Estado de Proyectos</CardTitle>
        </div>
        <p className="text-xs text-gray-500">Distribución por estado</p>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center">
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={2}
                dataKey="value"
                nameKey="displayName"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
                <Label
                  content={() => (
                    <text
                      x="50%"
                      y="50%"
                      textAnchor="middle"
                      dominantBaseline="middle"
                    >
                      <tspan x="50%" dy="-0.2em" fill="#ffffff" fontSize="24" fontWeight="bold">
                        {total}
                      </tspan>
                      <tspan x="50%" dy="1.4em" fill="#6b7280" fontSize="11">
                        Total
                      </tspan>
                    </text>
                  )}
                />
              </Pie>
              <Legend 
                verticalAlign="bottom"
                align="center"
                layout="horizontal"
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ paddingTop: '10px' }}
                formatter={(value) => (
                  <span className="text-xs text-gray-400 mr-3">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
