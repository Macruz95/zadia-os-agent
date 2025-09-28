import { Button } from '@/components/ui/button';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { Filter } from 'lucide-react';

interface LeadsTableHeaderProps {
  totalCount: number;
}

export function LeadsTableHeader({ totalCount }: LeadsTableHeaderProps) {
  return (
    <CardHeader>
      <div className="flex items-center justify-between">
        <CardTitle>Leads ({totalCount})</CardTitle>
        <Button variant="outline" size="sm">
          <Filter className="h-4 w-4 mr-2" />
          Filtros avanzados
        </Button>
      </div>
    </CardHeader>
  );
}