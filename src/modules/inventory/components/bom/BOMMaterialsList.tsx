/**
 * ZADIA OS - BOM Materials List Component
 * 
 * List of materials required for the BOM
 */

import { Badge } from '@/components/ui/badge';
import { BOMItem } from '../../types/inventory.types';

interface BOMMaterialsListProps {
  items: BOMItem[];
}

export function BOMMaterialsList({ items }: BOMMaterialsListProps) {
  return (
    <div>
      <h3 className="font-medium mb-3">Materiales Requeridos</h3>
      <div className="space-y-2">
        {items.map((item, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-3 border rounded"
          >
            <div>
              <p className="font-medium">{item.rawMaterialName}</p>
              <p className="text-sm text-muted-foreground">
                {item.quantity} {item.unitOfMeasure}
              </p>
            </div>
            <Badge variant="secondary">
              ${item.totalCost.toFixed(2)}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  );
}