import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Opportunity } from '@/modules/sales/types/sales.types';

interface QuoteOpportunitySelectorProps {
  opportunities: Opportunity[];
  selectedOpportunityId?: string;
  loading: boolean;
  onOpportunityChange: (opportunityId: string) => void;
}

export function QuoteOpportunitySelector({
  opportunities,
  selectedOpportunityId,
  loading,
  onOpportunityChange,
}: QuoteOpportunitySelectorProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="opportunity-select">Oportunidad *</Label>
      <Select value={selectedOpportunityId} onValueChange={onOpportunityChange}>
        <SelectTrigger id="opportunity-select">
          <SelectValue placeholder="Seleccionar oportunidad..." />
        </SelectTrigger>
        <SelectContent>
          {loading ? (
            <div className="p-2 text-sm text-muted-foreground">Cargando...</div>
          ) : opportunities.length === 0 ? (
            <div className="p-2 text-sm text-muted-foreground">
              No hay oportunidades disponibles
            </div>
          ) : (
            opportunities.map((opp) => (
              <SelectItem key={opp.id} value={opp.id}>
                <div className="flex items-center gap-2">
                  <span>{opp.name}</span>
                  <Badge variant="outline" className="text-xs">
                    {opp.stage}
                  </Badge>
                </div>
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
    </div>
  );
}