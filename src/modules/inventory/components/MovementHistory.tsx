'use client';

import { useEffect, useState } from 'react';
import { Table, TableBody } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { InventoryMovement } from '../types';
import { InventoryMovementsService } from '../services/entities/inventory-movements-entity.service';
import { MovementRow } from './movement-history/MovementRow';
import { MovementTableHeader } from './movement-history/MovementTableHeader';
import { MovementHistoryStates } from './movement-history/MovementHistoryStates';
import { logger } from '@/lib/logger';

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
          data = await InventoryMovementsService.getRecentMovements(limit);
        } else if (itemId) {
          data = await InventoryMovementsService.getMovementsByItem(itemId, itemType, limit);
        } else {
          data = [];
        }
        
        setMovements(data);
      } catch (error) {
        logger.error('Movement history loading failed', error as Error, {
          component: 'MovementHistory',
          metadata: { itemId, itemType }
        });
        const errorMessage = error instanceof Error ? error.message : 'Error al cargar movimientos';
        // Don't set error for "no movements found" cases
        if (!errorMessage.includes('No movements') && !errorMessage.includes('not found')) {
          setError(errorMessage);
        } else {
          setMovements([]);
        }
      } finally {
        setLoading(false);
      }
    };

    loadMovements();
  }, [itemId, itemType, showAll, limit]);

  const isEmpty = movements.length === 0;
  const showItemInfo = showAll || !itemId;

  // Show loading, error, or empty states
  if (loading || error || isEmpty) {
    return <MovementHistoryStates loading={loading} error={error} isEmpty={isEmpty} />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {showAll ? 'Movimientos Recientes' : 'Historial de Movimientos'}
          <span className="text-sm font-normal text-muted-foreground ml-2">
            ({movements.length} registros)
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <MovementTableHeader showItemInfo={showItemInfo} />
          <TableBody>
            {movements.map((movement) => (
              <MovementRow
                key={movement.id}
                movement={movement}
                showItemInfo={showItemInfo}
              />
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}