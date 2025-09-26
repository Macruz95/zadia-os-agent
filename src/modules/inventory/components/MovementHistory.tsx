'use client';

import { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowUp, ArrowDown, RotateCcw, Minus, Package, ShoppingCart, Undo } from 'lucide-react';
import { InventoryMovement } from '../types';
import { getMovementsByItem, getRecentMovements } from '../services/inventory.service';

interface MovementHistoryProps {
  itemId?: string;
  itemType?: 'raw-material' | 'finished-product';
  showAll?: boolean;
  limit?: number;
}

export function MovementHistory({ 
  itemId, 
  itemType, 
  showAll = false,  
  limit = 20 
}: MovementHistoryProps) {
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadMovements = async () => {
      setLoading(true);
      setError(null);
      
      try {
        let data: InventoryMovement[];
        
        if (showAll) {
          data = await getRecentMovements(limit);
        } else if (itemId) {
          data = await getMovementsByItem(itemId, itemType, limit);
        } else {
          data = [];
        }
        
        setMovements(data);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Error al cargar movimientos');
      } finally {
        setLoading(false);
      }
    };

    loadMovements();
  }, [itemId, itemType, showAll, limit]);

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
        return 'default';
      case 'Salida':
      case 'Merma':
      case 'Venta':
        return 'destructive';
      case 'Ajuste':
        return 'secondary';
      case 'Produccion':
        return 'outline';
      default:
        return 'secondary';
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
      case 'Produccion':
        return `-${movement.quantity}`;
      case 'Ajuste':
        return `${movement.previousStock} → ${movement.newStock}`;
      default:
        return movement.quantity.toString();
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-4">Cargando historial de movimientos...</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-4 text-red-600">
            Error: {error}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (movements.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8 text-muted-foreground">
            <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-lg font-semibold mb-2">Sin movimientos</h3>
            <p>No hay movimientos de inventario para mostrar.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          Historial de Movimientos ({movements.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              {showAll && (
                <>
                  <TableHead>Ítem</TableHead>
                  <TableHead>SKU</TableHead>
                </>
              )}
              <TableHead>Tipo</TableHead>
              <TableHead>Cantidad</TableHead>
              <TableHead>Stock Anterior</TableHead>
              <TableHead>Stock Nuevo</TableHead>
              <TableHead>Motivo</TableHead>
              <TableHead>Realizado Por</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {movements.map((movement) => {
              const { icon: MovementIcon, className } = getMovementIcon(movement.movementType);
              
              return (
                <TableRow key={movement.id}>
                  <TableCell className="text-sm">
                    {new Date(movement.performedAt).toLocaleString('es-ES', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </TableCell>
                  {showAll && (
                    <>
                      <TableCell className="font-medium">{movement.itemName}</TableCell>
                      <TableCell className="font-mono text-sm">{movement.itemSku}</TableCell>
                    </>
                  )}
                  <TableCell>
                    <Badge 
                      variant={getMovementBadgeVariant(movement.movementType)}
                      className="flex items-center gap-1 w-fit"
                    >
                      <MovementIcon className={`h-3 w-3 ${className}`} />
                      {movement.movementType}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center font-medium">
                    <span className={
                      movement.movementType === 'Entrada' || movement.movementType === 'Devolucion'
                        ? 'text-green-600' 
                        : movement.movementType === 'Ajuste'
                        ? 'text-blue-600'
                        : 'text-red-600'
                    }>
                      {formatQuantityChange(movement)}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">{movement.previousStock}</TableCell>
                  <TableCell className="text-center font-medium">{movement.newStock}</TableCell>
                  <TableCell className="max-w-xs truncate">
                    {movement.reason || '-'}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {movement.performedBy}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}