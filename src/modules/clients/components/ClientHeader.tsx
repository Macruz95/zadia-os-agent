'use client';

import { Plus, LayoutGrid, Table } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

interface ClientHeaderProps {
  onCreateClient?: () => void;
  viewMode?: 'table' | 'cards';
  onViewModeChange?: (mode: 'table' | 'cards') => void;
}

export function ClientHeader({ onCreateClient, viewMode = 'table', onViewModeChange }: ClientHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold">Directorio de Clientes</h1>
        <p className="text-muted-foreground">
          Gestiona y busca en tu base de clientes
        </p>
      </div>
      <div className="flex items-center gap-3">
        {/* View Mode Toggle */}
        {onViewModeChange && (
          <ToggleGroup type="single" value={viewMode} onValueChange={(value) => value && onViewModeChange(value as 'table' | 'cards')}>
            <ToggleGroupItem value="table" aria-label="Vista de tabla">
              <Table className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="cards" aria-label="Vista de tarjetas">
              <LayoutGrid className="h-4 w-4" />
            </ToggleGroupItem>
          </ToggleGroup>
        )}
        <Button onClick={onCreateClient} className="gap-2">
          <Plus className="h-4 w-4" />
          Nuevo Cliente
        </Button>
      </div>
    </div>
  );
}