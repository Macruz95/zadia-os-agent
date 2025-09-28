import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { formatCurrency, COLORS } from './AnalyticsConstants';

interface PipelineTabProps {
  pipelineByStage: Array<{
    stage: string;
    value: number;
    count: number;
  }>;
}

export function PipelineTab({ pipelineByStage }: PipelineTabProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Pipeline by Stage */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Pipeline por Etapa
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={pipelineByStage}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="stage" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(value as number)} />
              <Legend />
              <Bar dataKey="value" fill="#8884d8" name="Valor Total" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Pipeline Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Resumen del Pipeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pipelineByStage.map((stage, index) => (
              <div key={stage.stage} className="flex items-center justify-between p-3 rounded border">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: COLORS[index] }}
                  />
                  <div>
                    <p className="font-medium">{stage.stage}</p>
                    <p className="text-sm text-muted-foreground">
                      {stage.count} oportunidades
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">{formatCurrency(stage.value)}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatCurrency(stage.value / stage.count)} promedio
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}