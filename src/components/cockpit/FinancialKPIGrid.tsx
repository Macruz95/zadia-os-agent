/**
 * Financial KPI Grid
 * 
 * Grid de KPIs financieros con sparklines
 * REGLA 1: DATOS REALES de Firebase
 * REGLA 2: ShadCN UI + Lucide icons
 * REGLA 5: < 100 líneas
 */

'use client';

import { DollarSign, TrendingUp, TrendingDown, Receipt } from 'lucide-react';
import { KPICard } from './KPICard';

interface FinancialKPIGridProps {
  revenue: number;
  expenses: number;
  profit: number;
  pendingInvoices: number;
  revenueHistory?: number[];
  expensesHistory?: number[];
  profitHistory?: number[];
  loading?: boolean;
  className?: string;
}

export function FinancialKPIGrid({
  revenue,
  expenses,
  profit,
  pendingInvoices,
  revenueHistory = [],
  expensesHistory = [],
  profitHistory = [],
  loading = false,
  className,
}: FinancialKPIGridProps) {
  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`;
    }
    return `$${value.toLocaleString()}`;
  };

  // Calculate trends from history
  const calculateTrend = (history: number[]) => {
    if (history.length < 2) return 0;
    const current = history[history.length - 1];
    const previous = history[history.length - 2];
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  const revenueTrend = calculateTrend(revenueHistory);
  const expensesTrend = calculateTrend(expensesHistory);
  const profitTrend = calculateTrend(profitHistory);

  // Generate AI insights based on data
  const getRevenueInsight = () => {
    if (revenueTrend > 10) return "Excelente crecimiento. Considera reinvertir en áreas de alto rendimiento.";
    if (revenueTrend < -10) return "Tendencia negativa detectada. Revisa el pipeline de ventas y oportunidades activas.";
    if (revenue === 0) return "Sin ingresos registrados este período. Verifica las facturas pendientes de registro.";
    return "Rendimiento estable. Monitorea las oportunidades para mantener el crecimiento.";
  };

  const getExpensesInsight = () => {
    if (expensesTrend > 20) return "Incremento significativo en gastos. Revisa las categorías principales.";
    if (expenses > revenue * 0.8) return "Los gastos representan más del 80% de los ingresos. Considera optimizar costos.";
    return "Gastos dentro de rangos normales.";
  };

  const getProfitInsight = () => {
    const margin = revenue > 0 ? (profit / revenue) * 100 : 0;
    if (margin > 30) return `Margen de ${margin.toFixed(1)}% - Excelente rentabilidad.`;
    if (margin < 10 && margin > 0) return `Margen de ${margin.toFixed(1)}% - Considera estrategias para mejorar rentabilidad.`;
    if (profit < 0) return "Operando con pérdidas. Requiere atención inmediata.";
    return `Margen de ${margin.toFixed(1)}% - Rentabilidad saludable.`;
  };

  return (
    <div className={className}>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Ingresos"
          value={formatCurrency(revenue)}
          icon={DollarSign}
          variant="success"
          trend={revenueTrend}
          trendData={revenueHistory.length > 0 ? revenueHistory : undefined}
          trendLabel="vs mes ant."
          aiInsight={getRevenueInsight()}
          tooltipDetails={[
            { label: "Total período", value: `$${revenue.toLocaleString()}` },
            { label: "Promedio mensual", value: formatCurrency(revenue / Math.max(revenueHistory.length, 1)) },
          ]}
          loading={loading}
        />
        
        <KPICard
          title="Egresos"
          value={formatCurrency(expenses)}
          icon={TrendingDown}
          variant="danger"
          trend={expensesTrend}
          trendData={expensesHistory.length > 0 ? expensesHistory : undefined}
          trendLabel="vs mes ant."
          aiInsight={getExpensesInsight()}
          tooltipDetails={[
            { label: "Total período", value: `$${expenses.toLocaleString()}` },
            { label: "% de ingresos", value: revenue > 0 ? `${((expenses / revenue) * 100).toFixed(1)}%` : "N/A" },
          ]}
          loading={loading}
        />
        
        <KPICard
          title="Beneficio Neto"
          value={formatCurrency(profit)}
          icon={profit >= 0 ? TrendingUp : TrendingDown}
          variant={profit >= 0 ? 'success' : 'danger'}
          trend={profitTrend}
          trendData={profitHistory.length > 0 ? profitHistory : undefined}
          trendLabel="vs mes ant."
          aiInsight={getProfitInsight()}
          tooltipDetails={[
            { label: "Margen neto", value: revenue > 0 ? `${((profit / revenue) * 100).toFixed(1)}%` : "N/A" },
            { label: "Ingresos - Egresos", value: `$${revenue.toLocaleString()} - $${expenses.toLocaleString()}` },
          ]}
          loading={loading}
        />
        
        <KPICard
          title="Facturas Pendientes"
          value={pendingInvoices.toString()}
          subtitle="por cobrar"
          icon={Receipt}
          variant={pendingInvoices > 5 ? 'warning' : 'info'}
          aiInsight={
            pendingInvoices > 10 
              ? "Alto volumen de facturas pendientes. Considera enviar recordatorios de cobro."
              : pendingInvoices > 0
                ? "Facturas pendientes dentro de rangos normales."
                : "Sin facturas pendientes. Excelente gestión de cobros."
          }
          loading={loading}
        />
      </div>
    </div>
  );
}

