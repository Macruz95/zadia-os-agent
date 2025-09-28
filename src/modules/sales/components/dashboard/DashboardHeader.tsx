import { Button } from '@/components/ui/button';

interface DashboardHeaderProps {
  onViewAnalytics: () => void;
  onGoToSales: () => void;
}

export function DashboardHeader({ onViewAnalytics, onGoToSales }: DashboardHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold">Dashboard Ejecutivo</h1>
        <p className="text-muted-foreground">
          Resumen ejecutivo de performance de ventas
        </p>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" onClick={onViewAnalytics}>
          Ver Analytics Completo
        </Button>
        <Button onClick={onGoToSales}>
          Ir a Ventas
        </Button>
      </div>
    </div>
  );
}