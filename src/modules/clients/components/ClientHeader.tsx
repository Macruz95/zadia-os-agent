'use client';

import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ClientHeaderProps {
  onCreateClient?: () => void;
}

export function ClientHeader({ onCreateClient }: ClientHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold">Directorio de Clientes</h1>
        <p className="text-muted-foreground">
          Gestiona y busca en tu base de clientes
        </p>
      </div>
      <Button onClick={onCreateClient} className="gap-2">
        <Plus className="h-4 w-4" />
        Nuevo Cliente
      </Button>
    </div>
  );
}