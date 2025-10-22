import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Filter } from 'lucide-react';
import { OpportunityStatus, OpportunityPriority } from '../../types/sales.types';

interface KanbanHeaderProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: OpportunityStatus | 'all';
  onStatusFilterChange: (value: OpportunityStatus | 'all') => void;
  priorityFilter: OpportunityPriority | 'all';
  onPriorityFilterChange: (value: OpportunityPriority | 'all') => void;
  onNewOpportunity: () => void;
}

export function KanbanHeader({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  priorityFilter,
  onPriorityFilterChange,
  onNewOpportunity,
}: KanbanHeaderProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-3xl font-bold">Pipeline de Oportunidades</h1>
        <p className="text-muted-foreground">
          Gestiona tu pipeline de ventas visual
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Input
          placeholder="Buscar oportunidades..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-64"
        />
        
        <Select value={statusFilter} onValueChange={onStatusFilterChange}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="active">Activo</SelectItem>
            <SelectItem value="won">Ganado</SelectItem>
            <SelectItem value="lost">Perdido</SelectItem>
          </SelectContent>
        </Select>

        <Select value={priorityFilter} onValueChange={onPriorityFilterChange}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Prioridad" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="high">Alta</SelectItem>
            <SelectItem value="medium">Media</SelectItem>
            <SelectItem value="low">Baja</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Más filtros
        </Button>
        
        <Button onClick={onNewOpportunity}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Oportunidad
        </Button>
      </div>
    </div>
  );
}