'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Package, 
  TrendingUp, 
  AlertTriangle, 
  DollarSign,
  Activity,
  BarChart3
} from 'lucide-react';
import { InventoryKPIs } from '../../types/inventory-extended.types';

interface InventoryKPIsCardProps {
  kpis?: InventoryKPIs;
  loading?: boolean;
}

export function InventoryKPIsCard({ kpis, loading }: InventoryKPIsCardProps) {
  if (loading || !kpis) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            KPIs de Inventario
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-2 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate percentages for progress bars
  const totalItems = kpis.totalRawMaterials + kpis.totalFinishedProducts;
  const rawMaterialsPercentage = totalItems > 0 ? (kpis.totalRawMaterials / totalItems) * 100 : 0;
  const lowStockPercentage = totalItems > 0 ? (kpis.lowStockItems / totalItems) * 100 : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          KPIs de Inventario
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Total Items Overview */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 border rounded-lg">
            <Package className="h-6 w-6 mx-auto mb-2 text-blue-500" />
            <div className="text-2xl font-bold">{kpis.totalRawMaterials}</div>
            <p className="text-sm text-muted-foreground">Materias Primas</p>
          </div>
          <div className="text-center p-4 border rounded-lg">
            <Package className="h-6 w-6 mx-auto mb-2 text-green-500" />
            <div className="text-2xl font-bold">{kpis.totalFinishedProducts}</div>
            <p className="text-sm text-muted-foreground">Productos Terminados</p>
          </div>
        </div>

        {/* Inventory Value */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              Valor Total del Inventario
            </span>
            <Badge variant="secondary" className="font-mono">
              ${kpis.totalInventoryValue.toLocaleString('es-ES', { 
                minimumFractionDigits: 2,
                maximumFractionDigits: 2 
              })}
            </Badge>
          </div>
        </div>

        {/* Stock Distribution */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Distribución de Inventario</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Materias Primas</span>
              <span>{rawMaterialsPercentage.toFixed(1)}%</span>
            </div>
            <Progress value={rawMaterialsPercentage} className="h-2" />
          </div>
        </div>

        {/* Stock Alerts */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              Alertas de Stock
            </span>
            <Badge 
              variant={kpis.lowStockItems > 0 ? "destructive" : "secondary"}
              className="font-mono"
            >
              {kpis.lowStockItems}
            </Badge>
          </div>
          {totalItems > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Ítems con stock bajo</span>
                <span>{lowStockPercentage.toFixed(1)}%</span>
              </div>
              <Progress 
                value={lowStockPercentage} 
                className="h-2"
                // Red color for high percentage of low stock
                style={{ 
                  backgroundColor: lowStockPercentage > 20 ? '#fee2e2' : '#f3f4f6' 
                }}
              />
            </div>
          )}
        </div>

        {/* Top Moving Items */}
        {kpis.topMovingItems.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4 text-blue-500" />
              Ítems Más Activos (30 días)
            </h4>
            <div className="space-y-2">
              {kpis.topMovingItems.slice(0, 3).map((item, index) => (
                <div key={item.itemId} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs flex items-center justify-center font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-sm font-medium truncate">{item.itemName}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.itemType === 'raw-material' ? 'Materia Prima' : 'Producto Terminado'}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {item.movementCount} mov.
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Activity Indicator */}
        {kpis.recentMovements.length > 0 && (
          <div className="pt-2 border-t">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                Actividad Reciente
              </span>
              <Badge variant="outline">
                {kpis.recentMovements.length} movimientos
              </Badge>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}