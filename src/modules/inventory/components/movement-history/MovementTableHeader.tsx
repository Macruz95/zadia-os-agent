'use client';

import { TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface MovementTableHeaderProps {
  showItemInfo?: boolean;
}

export function MovementTableHeader({ showItemInfo = false }: MovementTableHeaderProps) {
  return (
    <TableHeader>
      <TableRow>
        <TableHead>Tipo</TableHead>
        {showItemInfo && (
          <>
            <TableHead>Artículo</TableHead>
            <TableHead>SKU</TableHead>
          </>
        )}
        <TableHead className="text-right">Cantidad</TableHead>
        <TableHead className="text-right">Stock Final</TableHead>
        <TableHead>Motivo</TableHead>
        <TableHead>Realizado por</TableHead>
        <TableHead>Fecha</TableHead>
      </TableRow>
    </TableHeader>
  );
}