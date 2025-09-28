import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users } from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { COLORS } from './AnalyticsConstants';

interface SourcesTabProps {
  leadsBySource: Array<{
    source: string;
    count: number;
    percentage: number;
  }>;
}

export function SourcesTab({ leadsBySource }: SourcesTabProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Lead Sources Pie Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Fuentes de Leads
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={leadsBySource}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ source, percentage }) => `${source} ${percentage}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {leadsBySource.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Sources Details */}
      <Card>
        <CardHeader>
          <CardTitle>Detalle por Fuente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {leadsBySource.map((source, index) => (
              <div key={source.source} className="flex items-center justify-between p-3 rounded border">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: COLORS[index] }}
                  />
                  <span className="font-medium">{source.source}</span>
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant="outline">{source.count} leads</Badge>
                  <span className="font-medium">{source.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}