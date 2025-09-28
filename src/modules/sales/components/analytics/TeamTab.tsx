import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users } from 'lucide-react';
import { formatCurrency } from './AnalyticsConstants';

interface TeamTabProps {
  salesPerformance: Array<{
    name: string;
    deals: number;
    revenue: number;
    progress: number;
  }>;
}

export function TeamTab({ salesPerformance }: TeamTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Performance del Equipo
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {salesPerformance.map((person, index) => (
            <div key={person.name} className="p-4 rounded border">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium">{person.name}</h4>
                <Badge variant="outline">
                  Top {index + 1}
                </Badge>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Deals Cerrados</p>
                  <p className="font-medium text-lg">{person.deals}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Ingresos</p>
                  <p className="font-medium text-lg">{formatCurrency(person.revenue)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Conversión</p>
                  <p className="font-medium text-lg">{person.progress.toFixed(1)}%</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}