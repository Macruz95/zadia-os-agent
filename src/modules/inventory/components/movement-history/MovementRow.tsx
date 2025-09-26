'use client';

import { Badge } from '@/components/ui/badge';
import { TableCell, TableRow } from '@/components/ui/table';
import { ArrowUp, ArrowDown, RotateCcw, Minus, Package, ShoppingCart, Undo } from 'lucide-react';
import { InventoryMovement } from '../../types';

interface MovementRowProps {
  movement: InventoryMovement;
  showItemInfo?: boolean;
}

export function MovementRow({ movement, showItemInfo = false }: MovementRowProps) {
  const getMovementIcon = (movementType: string) => {
    switch (movementType) {
      case 'Entrada':
        return { icon: ArrowUp, className: 'text-green-600' };
      case 'Salida':
        return { icon: ArrowDown, className: 'text-red-600' };
      case 'Ajuste':
        return { icon: RotateCcw, className: 'text-blue-600' };
      case 'Merma':
        return { icon: Minus, className: 'text-orange-600' };
      case 'Produccion':
        return { icon: Package, className: 'text-purple-600' };
      case 'Venta':
        return { icon: ShoppingCart, className: 'text-indigo-600' };
      case 'Devolucion':
        return { icon: Undo, className: 'text-yellow-600' };
      default:
        return { icon: RotateCcw, className: 'text-gray-600' };
    }
  };

  const getMovementBadgeVariant = (movementType: string) => {
    switch (movementType) {
      case 'Entrada':
      case 'Devolucion':
        return 'default' as const;
      case 'Salida':
      case 'Merma':
      case 'Venta':
        return 'destructive' as const;
      case 'Ajuste':
        return 'secondary' as const;
      case 'Produccion':
        return 'outline' as const;
      default:
        return 'secondary' as const;
    }
  };

  const formatQuantityChange = (movement: InventoryMovement) => {
    switch (movement.movementType) {
      case 'Entrada':
      case 'Devolucion':
        return `+${movement.quantity}`;
      case 'Salida':
      case 'Merma':
      case 'Venta':
        return `-${movement.quantity}`;
      case 'Produccion':
        return movement.itemType === 'raw-material' ? `-${movement.quantity}` : `+${movement.quantity}`;
      case 'Ajuste':
        return `=${movement.quantity}`;
      default:
        return movement.quantity.toString();
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const { icon: IconComponent, className } = getMovementIcon(movement.movementType);
  const quantityChange = formatQuantityChange(movement);

  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-2">
          <IconComponent className={`h-4 w-4 ${className}`} />
          <Badge variant={getMovementBadgeVariant(movement.movementType)}>
            {movement.movementType}
          </Badge>
        </div>
      </TableCell>
      {showItemInfo && (
        <>
          <TableCell className="font-medium">{movement.itemName}</TableCell>
          <TableCell>
            <Badge variant="outline">{movement.itemSku}</Badge>
          </TableCell>
        </>
      )}
      <TableCell className="text-right">
        <span className={
          quantityChange.startsWith('+') ? 'text-green-600' :
          quantityChange.startsWith('-') ? 'text-red-600' :
          'text-blue-600'
        }>
          {quantityChange}
        </span>
      </TableCell>
      <TableCell className="text-right">
        {movement.newStock}
      </TableCell>
      <TableCell>{movement.reason || '-'}</TableCell>
      <TableCell>{movement.performedBy}</TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {formatDate(movement.performedAt)}
      </TableCell>
    </TableRow>
  );
}