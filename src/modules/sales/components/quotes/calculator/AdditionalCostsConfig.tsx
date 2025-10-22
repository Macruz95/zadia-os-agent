/**
 * ZADIA OS - Additional Costs Configuration
 * 
 * Component for configuring additional production costs
 * Rule #2: ShadCN UI + Lucide React icons only
 * Rule #5: Max 200 lines per file
 * 
 * @module AdditionalCostsConfig
 */

'use client';

import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Settings, Truck, DollarSign } from 'lucide-react';
import type { AdditionalCostsConfig as Config } from '../../../types/calculator.types';

interface AdditionalCostsConfigProps {
  /** Current configuration */
  config: Config;
  
  /** Callback when configuration changes */
  onChange: (config: Partial<Config>) => void;
  
  /** Base cost for percentage calculations */
  baseCost: number;
  
  /** Calculated additional costs total */
  total: number;
}

/**
 * Additional costs configuration component
 * Allows toggling and configuring various additional production costs
 */
export function AdditionalCostsConfig({
  config,
  onChange,
  baseCost,
  total,
}: AdditionalCostsConfigProps) {
  const calculateAmount = (rate: number, enabled: boolean) => {
    if (!enabled) return 0;
    return baseCost * (rate / 100);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <Settings className="w-5 h-5 mr-2 text-yellow-600" />
          Costos Adicionales
        </CardTitle>
        <CardDescription>
          Configure los costos indirectos de producción
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Tool Wear */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="toolWear"
                checked={config.toolWear}
                onCheckedChange={(checked) =>
                  onChange({ toolWear: checked as boolean })
                }
              />
              <Label
                htmlFor="toolWear"
                className="text-sm font-medium cursor-pointer"
              >
                <div className="flex items-center">
                  <Package className="w-4 h-4 mr-2 text-gray-500" />
                  Desgaste de herramientas
                </div>
              </Label>
            </div>
            <div className="text-sm text-gray-600 font-medium">
              ${calculateAmount(config.toolWearRate, config.toolWear).toFixed(2)}
            </div>
          </div>
          {config.toolWear && (
            <div className="ml-6 flex items-center gap-2">
              <Input
                type="number"
                value={config.toolWearRate}
                onChange={(e) =>
                  onChange({ toolWearRate: parseFloat(e.target.value) || 0 })
                }
                min="0"
                max="100"
                step="0.1"
                className="w-20 text-sm"
              />
              <span className="text-sm text-gray-500">% del costo base</span>
            </div>
          )}
        </div>

        {/* Maintenance */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="maintenance"
                checked={config.maintenance}
                onCheckedChange={(checked) =>
                  onChange({ maintenance: checked as boolean })
                }
              />
              <Label
                htmlFor="maintenance"
                className="text-sm font-medium cursor-pointer"
              >
                <div className="flex items-center">
                  <Settings className="w-4 h-4 mr-2 text-gray-500" />
                  Mantenimiento del taller
                </div>
              </Label>
            </div>
            <div className="text-sm text-gray-600 font-medium">
              ${calculateAmount(config.maintenanceRate, config.maintenance).toFixed(2)}
            </div>
          </div>
          {config.maintenance && (
            <div className="ml-6 flex items-center gap-2">
              <Input
                type="number"
                value={config.maintenanceRate}
                onChange={(e) =>
                  onChange({ maintenanceRate: parseFloat(e.target.value) || 0 })
                }
                min="0"
                max="100"
                step="0.1"
                className="w-20 text-sm"
              />
              <span className="text-sm text-gray-500">% del costo base</span>
            </div>
          )}
        </div>

        {/* Logistics */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="logistics"
                checked={config.logistics}
                onCheckedChange={(checked) =>
                  onChange({ logistics: checked as boolean })
                }
              />
              <Label
                htmlFor="logistics"
                className="text-sm font-medium cursor-pointer"
              >
                <div className="flex items-center">
                  <Truck className="w-4 h-4 mr-2 text-gray-500" />
                  Logística y transporte
                </div>
              </Label>
            </div>
            <div className="text-sm text-gray-600 font-medium">
              ${calculateAmount(config.logisticsRate, config.logistics).toFixed(2)}
            </div>
          </div>
          {config.logistics && (
            <div className="ml-6 flex items-center gap-2">
              <Input
                type="number"
                value={config.logisticsRate}
                onChange={(e) =>
                  onChange({ logisticsRate: parseFloat(e.target.value) || 0 })
                }
                min="0"
                max="100"
                step="0.1"
                className="w-20 text-sm"
              />
              <span className="text-sm text-gray-500">% del costo base</span>
            </div>
          )}
        </div>

        {/* Fixed Increment */}
        <div className="space-y-2 pt-2 border-t">
          <Label htmlFor="fixedIncrement" className="text-sm font-medium">
            <div className="flex items-center">
              <DollarSign className="w-4 h-4 mr-2 text-gray-500" />
              Incremento adicional (valor fijo)
            </div>
          </Label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">$</span>
            <Input
              id="fixedIncrement"
              type="number"
              value={config.fixedIncrement}
              onChange={(e) =>
                onChange({ fixedIncrement: parseFloat(e.target.value) || 0 })
              }
              min="0"
              step="0.01"
              className="w-32 text-sm"
              placeholder="0.00"
            />
          </div>
        </div>

        {/* Total */}
        <div className="pt-4 border-t">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-gray-700">
              Total Costos Adicionales:
            </span>
            <span className="text-lg font-bold text-yellow-700">
              ${total.toFixed(2)}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {baseCost > 0
              ? `${((total / baseCost) * 100).toFixed(1)}% del costo base`
              : 'Ingrese costos primarios para calcular'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
