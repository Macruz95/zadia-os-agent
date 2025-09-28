/**
 * ZADIA OS - Leads Filters Component
 * 
 * Provides filtering and search functionality for leads
 */

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search } from 'lucide-react';
import { LeadStatus, LeadSource, LeadPriority } from '../../types/sales.types';

interface LeadsFiltersProps {
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  statusFilter: LeadStatus | 'all';
  onStatusFilterChange: (status: LeadStatus | 'all') => void;
  sourceFilter: LeadSource | 'all';
  onSourceFilterChange: (source: LeadSource | 'all') => void;
  priorityFilter: LeadPriority | 'all';
  onPriorityFilterChange: (priority: LeadPriority | 'all') => void;
  onSearch: () => void;
  loading?: boolean;
}

export function LeadsFilters({
  searchQuery,
  onSearchQueryChange,
  statusFilter,
  onStatusFilterChange,
  sourceFilter,
  onSourceFilterChange,
  priorityFilter,
  onPriorityFilterChange,
  onSearch,
  loading = false
}: LeadsFiltersProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Filtros</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <Input
              placeholder="Buscar por nombre, email, empresa..."
              value={searchQuery}
              onChange={(e) => onSearchQueryChange(e.target.value)}
              className="w-full"
            />
          </div>

          <Select value={statusFilter} onValueChange={onStatusFilterChange}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="new">Nuevo</SelectItem>
              <SelectItem value="contacted">Contactado</SelectItem>
              <SelectItem value="qualifying">Calificando</SelectItem>
              <SelectItem value="disqualified">Descalificado</SelectItem>
              <SelectItem value="converted">Convertido</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sourceFilter} onValueChange={onSourceFilterChange}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Fuente" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="web">Web</SelectItem>
              <SelectItem value="referral">Referido</SelectItem>
              <SelectItem value="event">Evento</SelectItem>
              <SelectItem value="cold-call">Llamada</SelectItem>
              <SelectItem value="imported">Importado</SelectItem>
            </SelectContent>
          </Select>

          <Select value={priorityFilter} onValueChange={onPriorityFilterChange}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Prioridad" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="hot">Caliente</SelectItem>
              <SelectItem value="warm">Tibio</SelectItem>
              <SelectItem value="cold">Frío</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={onSearch} disabled={loading}>
            <Search className="h-4 w-4 mr-2" />
            Buscar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}