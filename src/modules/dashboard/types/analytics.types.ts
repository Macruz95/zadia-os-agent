/**
 * ZADIA OS - Dashboard Analytics Types
 * Types for KPIs, charts and analytics data
 */

// ============================================
// Time Period Types
// ============================================
export type TimePeriod = 'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom';

export interface DateRange {
  start: Date;
  end: Date;
}

// ============================================
// KPI Types
// ============================================
export interface KPIValue {
  current: number;
  previous: number;
  change: number;
  changePercent: number;
  trend: 'up' | 'down' | 'stable';
}

export interface KPICard {
  id: string;
  title: string;
  value: KPIValue;
  format: 'number' | 'currency' | 'percent';
  icon: string;
  color: 'green' | 'red' | 'blue' | 'yellow' | 'purple';
}

// ============================================
// Sales Analytics
// ============================================
export interface SalesMetrics {
  totalRevenue: KPIValue;
  totalOrders: KPIValue;
  averageOrderValue: KPIValue;
  conversionRate: KPIValue;
  newClients: KPIValue;
}

export interface SalesChartData {
  date: string;
  revenue: number;
  orders: number;
  clients: number;
}

export interface TopProduct {
  id: string;
  name: string;
  quantity: number;
  revenue: number;
  growth: number;
}

export interface TopClient {
  id: string;
  name: string;
  totalPurchases: number;
  orderCount: number;
  lastOrder: Date;
}

// ============================================
// Finance Analytics
// ============================================
export interface FinanceMetrics {
  totalIncome: KPIValue;
  totalExpenses: KPIValue;
  netProfit: KPIValue;
  pendingInvoices: KPIValue;
  overduePayments: KPIValue;
}

export interface CashFlowData {
  date: string;
  income: number;
  expenses: number;
  balance: number;
}

export interface InvoiceStatus {
  status: 'paid' | 'pending' | 'overdue' | 'cancelled';
  count: number;
  amount: number;
}

// ============================================
// Inventory Analytics
// ============================================
export interface InventoryMetrics {
  totalProducts: KPIValue;
  lowStockItems: KPIValue;
  outOfStockItems: KPIValue;
  inventoryValue: KPIValue;
  turnoverRate: KPIValue;
}

export interface StockLevel {
  id: string;
  name: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  status: 'normal' | 'low' | 'critical' | 'out';
}

// ============================================
// HR Analytics
// ============================================
export interface HRMetrics {
  totalEmployees: KPIValue;
  activeEmployees: KPIValue;
  monthlyPayroll: KPIValue;
  pendingRequests: KPIValue;
  avgAttendance: KPIValue;
}

export interface DepartmentStats {
  department: string;
  employees: number;
  avgSalary: number;
  attendance: number;
}

// ============================================
// Project Analytics
// ============================================
export interface ProjectMetrics {
  activeProjects: KPIValue;
  completedProjects: KPIValue;
  onTimeDelivery: KPIValue;
  avgCompletionTime: KPIValue;
  clientSatisfaction: KPIValue;
}

export interface ProjectStatus {
  status: 'planning' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled';
  count: number;
  totalBudget: number;
}

// ============================================
// Dashboard Overview
// ============================================
export interface DashboardOverview {
  sales: SalesMetrics;
  finance: FinanceMetrics;
  inventory: InventoryMetrics;
  projects: ProjectMetrics;
  lastUpdated: Date;
}

// ============================================
// Widget Configuration
// ============================================
export type WidgetType = 
  | 'kpi-card'
  | 'line-chart'
  | 'bar-chart'
  | 'pie-chart'
  | 'table'
  | 'list'
  | 'progress';

export interface WidgetConfig {
  id: string;
  type: WidgetType;
  title: string;
  dataSource: string;
  size: 'small' | 'medium' | 'large';
  position: { row: number; col: number };
  refreshInterval?: number; // seconds
}

export interface DashboardLayout {
  widgets: WidgetConfig[];
  columns: number;
  rows: number;
}
