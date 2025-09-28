/**
 * ZADIA OS - Leads Header Component
 * 
 * Header section with title, description, and action buttons
 */

import { Button } from '@/components/ui/button';
import { TrendingUp, Plus } from 'lucide-react';

interface LeadsHeaderProps {
  onRefresh: () => void;
  onCreateLead: () => void;
  loading?: boolean;
}

export function LeadsHeader({ onRefresh, onCreateLead, loading = false }: LeadsHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold">Pipeline de Leads</h1>
        <p className="text-muted-foreground">
          Gestiona y califica prospectos de ventas
        </p>
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={onRefresh}
          disabled={loading}
        >
          <TrendingUp className="h-4 w-4 mr-2" />
          Actualizar
        </Button>
        <Button onClick={onCreateLead}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Lead
        </Button>
      </div>
    </div>
  );
}