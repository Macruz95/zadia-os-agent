import { StockAlertsCard } from './alerts/StockAlertsCard';
import { InventoryKPIsCard } from './dashboard/InventoryKPIsCard';
import { InventoryKPIs, InventoryAlert } from '../types/inventory-extended.types';

interface InventoryDashboardProps {
  kpis?: InventoryKPIs;
  kpisLoading: boolean;
  alerts: InventoryAlert[];
  onRefreshAlerts: () => void;
}

export function InventoryDashboard({ 
  kpis, 
  kpisLoading, 
  alerts, 
  onRefreshAlerts 
}: InventoryDashboardProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* KPIs */}
      <div className="lg:col-span-2">
        <InventoryKPIsCard kpis={kpis} loading={kpisLoading} />
      </div>

      {/* Stock Alerts */}
      <div>
        <StockAlertsCard alerts={alerts} onRefresh={onRefreshAlerts} />
      </div>
    </div>
  );
}