# Módulo de Dashboard

## Descripción
El módulo de Dashboard proporciona análisis, métricas y visualizaciones de KPIs para la toma de decisiones empresariales.

## Estructura

```
dashboard/
├── components/         # Componentes de UI
│   ├── DashboardCard.tsx
│   ├── KPIWidget.tsx
│   ├── RevenueChart.tsx
│   ├── SalesChart.tsx
│   └── ...
├── hooks/              # Hooks de React
│   ├── use-dashboard.ts
│   ├── use-analytics.ts
│   └── ...
├── services/           # Servicios de análisis
│   ├── analytics.service.ts
│   └── dashboard-revenue.service.ts
├── types/              # Tipos TypeScript
│   └── dashboard.types.ts
└── validations/        # Esquemas Zod
    └── dashboard.schema.ts
```

## Características

### Métricas de Ventas
- Total de ventas por período
- Leads y oportunidades activas
- Tasa de conversión
- Valor promedio de cotización

### Métricas Financieras
- Ingresos totales
- Facturas pendientes
- Pagos recibidos
- Flujo de caja

### Métricas de Proyectos
- Proyectos activos
- Tareas completadas
- Horas trabajadas
- Presupuesto vs real

### Métricas de Inventario
- Productos en stock
- Alertas de inventario bajo
- Movimientos recientes
- Valor total de inventario

### Métricas de HR
- Empleados activos
- Horas trabajadas
- Préstamos pendientes
- Costo laboral

## Visualizaciones

### Gráficos Disponibles
- Líneas de tendencia (ventas, ingresos)
- Barras comparativas
- Gráficos de pastel (distribución)
- Sparklines (minigráficos)

### Períodos de Análisis
- Hoy
- Esta semana
- Este mes
- Este trimestre
- Este año
- Personalizado

## Uso

```typescript
import { useDashboard } from '@/modules/dashboard/hooks/use-dashboard';
import { AnalyticsService } from '@/modules/dashboard/services/analytics.service';

// En un componente
function DashboardPage() {
  const { 
    salesMetrics, 
    revenueMetrics, 
    projectMetrics, 
    loading 
  } = useDashboard();
  
  return (
    <div>
      <KPIWidget title="Ventas" value={salesMetrics.total} />
      <RevenueChart data={revenueMetrics.monthlyData} />
    </div>
  );
}

// Obtener análisis específico
const salesAnalysis = await AnalyticsService.getSalesAnalytics(
  tenantId, 
  'month'
);
```

## Servicios de Análisis

### AnalyticsService
- `getSalesAnalytics(tenantId, period)` - Métricas de ventas
- `getRevenueAnalytics(tenantId, period)` - Métricas de ingresos
- `getProjectAnalytics(tenantId, period)` - Métricas de proyectos
- `getInventoryAnalytics(tenantId)` - Métricas de inventario

### DashboardRevenueService
- `getMonthlyRevenue(tenantId)` - Ingresos mensuales
- `getRevenueByClient(tenantId)` - Ingresos por cliente
- `getRevenueTrend(tenantId, months)` - Tendencia de ingresos

## Optimización
- Las métricas se calculan bajo demanda
- Se recomienda usar el sistema de caché (`query-cache.ts`)
- Evitar cálculos complejos en renders frecuentes

## Notas de Implementación
- Todas las consultas filtran por `tenantId`
- Los períodos se calculan con `date-fns`
- Los gráficos usan `Recharts` para visualización
