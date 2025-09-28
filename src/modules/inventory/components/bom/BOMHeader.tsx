/**
 * ZADIA OS - BOM Header Component
 * 
 * Header section for BOM builder with product information
 */

import { CardHeader, CardTitle } from '@/components/ui/card';
import { Package } from 'lucide-react';

interface BOMHeaderProps {
  finishedProductName: string;
}

export function BOMHeader({ finishedProductName }: BOMHeaderProps) {
  return (
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Package className="h-5 w-5" />
        Lista de Materiales (BOM)
      </CardTitle>
      <p className="text-sm text-muted-foreground">
        Producto: {finishedProductName}
      </p>
    </CardHeader>
  );
}