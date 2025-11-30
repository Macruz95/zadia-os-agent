import {
  collection,
  getDocs,
  query,
  where,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { logger } from '@/lib/logger';
import {
  KPIValue,
  SalesMetrics,
  SalesChartData,
  TopClient,
  DateRange,
} from '../types/analytics.types';

/**
 * Calculate KPI value with change
 */
function calculateKPI(current: number, previous: number): KPIValue {
  const change = current - previous;
  const changePercent = previous > 0 ? ((change / previous) * 100) : 0;
  
  return {
    current,
    previous,
    change,
    changePercent: Math.round(changePercent * 100) / 100,
    trend: change > 0 ? 'up' : change < 0 ? 'down' : 'stable',
  };
}

/**
 * Get date range for a period
 */
function getDateRange(period: string): DateRange {
  const end = new Date();
  const start = new Date();
  
  switch (period) {
    case 'today':
      start.setHours(0, 0, 0, 0);
      break;
    case 'week':
      start.setDate(start.getDate() - 7);
      break;
    case 'month':
      start.setMonth(start.getMonth() - 1);
      break;
    case 'quarter':
      start.setMonth(start.getMonth() - 3);
      break;
    case 'year':
      start.setFullYear(start.getFullYear() - 1);
      break;
    default:
      start.setMonth(start.getMonth() - 1);
  }
  
  return { start, end };
}

/**
 * Get previous period date range for comparison
 */
function getPreviousPeriodRange(period: string): DateRange {
  const current = getDateRange(period);
  const duration = current.end.getTime() - current.start.getTime();
  
  return {
    start: new Date(current.start.getTime() - duration),
    end: new Date(current.start.getTime()),
  };
}

/**
 * Get sales metrics for a period
 */
export async function getSalesMetrics(
  tenantId: string,
  period: string = 'month'
): Promise<SalesMetrics> {
  try {
    const currentRange = getDateRange(period);
    const previousRange = getPreviousPeriodRange(period);
    
    // Get current period data
    const currentInvoices = await getInvoicesInRange(tenantId, currentRange);
    const previousInvoices = await getInvoicesInRange(tenantId, previousRange);
    
    const currentOrders = await getOrdersInRange(tenantId, currentRange);
    const previousOrders = await getOrdersInRange(tenantId, previousRange);
    
    const currentClients = await getNewClientsInRange(tenantId, currentRange);
    const previousClients = await getNewClientsInRange(tenantId, previousRange);
    
    // Calculate metrics
    const currentRevenue = currentInvoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
    const previousRevenue = previousInvoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
    
    const currentOrderCount = currentOrders.length;
    const previousOrderCount = previousOrders.length;
    
    const currentAOV = currentOrderCount > 0 ? currentRevenue / currentOrderCount : 0;
    const previousAOV = previousOrderCount > 0 ? previousRevenue / previousOrderCount : 0;
    
    return {
      totalRevenue: calculateKPI(currentRevenue, previousRevenue),
      totalOrders: calculateKPI(currentOrderCount, previousOrderCount),
      averageOrderValue: calculateKPI(currentAOV, previousAOV),
      conversionRate: calculateKPI(0, 0), // Requires lead tracking
      newClients: calculateKPI(currentClients.length, previousClients.length),
    };
  } catch (error) {
    logger.error('Error getting sales metrics', error instanceof Error ? error : undefined);
    throw error;
  }
}

/**
 * Get sales chart data for a period
 */
export async function getSalesChartData(
  tenantId: string,
  period: string = 'month'
): Promise<SalesChartData[]> {
  try {
    const range = getDateRange(period);
    const invoices = await getInvoicesInRange(tenantId, range);
    const orders = await getOrdersInRange(tenantId, range);
    
    // Group by date
    const dataByDate = new Map<string, { revenue: number; orders: number; clients: Set<string> }>();
    
    invoices.forEach(inv => {
      const date = formatDate(inv.createdAt);
      const existing = dataByDate.get(date) || { revenue: 0, orders: 0, clients: new Set() };
      existing.revenue += inv.total || 0;
      if (inv.clientId) existing.clients.add(inv.clientId);
      dataByDate.set(date, existing);
    });
    
    orders.forEach(order => {
      const date = formatDate(order.createdAt);
      const existing = dataByDate.get(date) || { revenue: 0, orders: 0, clients: new Set() };
      existing.orders += 1;
      dataByDate.set(date, existing);
    });
    
    // Convert to array
    const result: SalesChartData[] = [];
    const sortedDates = Array.from(dataByDate.keys()).sort();
    
    sortedDates.forEach(date => {
      const data = dataByDate.get(date)!;
      result.push({
        date,
        revenue: data.revenue,
        orders: data.orders,
        clients: data.clients.size,
      });
    });
    
    return result;
  } catch (error) {
    logger.error('Error getting sales chart data', error instanceof Error ? error : undefined);
    throw error;
  }
}

/**
 * Get top clients by revenue
 */
export async function getTopClients(
  tenantId: string,
  limit: number = 10
): Promise<TopClient[]> {
  try {
    const range = getDateRange('year');
    const invoices = await getInvoicesInRange(tenantId, range);
    
    // Aggregate by client
    const clientStats = new Map<string, { total: number; orders: number; lastOrder: Date }>();
    
    invoices.forEach(inv => {
      if (!inv.clientId) return;
      
      const existing = clientStats.get(inv.clientId) || {
        total: 0,
        orders: 0,
        lastOrder: new Date(0),
      };
      
      existing.total += inv.total || 0;
      existing.orders += 1;
      
      const invDate = inv.createdAt instanceof Timestamp ? inv.createdAt.toDate() : inv.createdAt;
      if (invDate > existing.lastOrder) {
        existing.lastOrder = invDate;
      }
      
      clientStats.set(inv.clientId, existing);
    });
    
    // Get client names
    const clientsRef = collection(db, 'clients');
    const clientsQuery = tenantId
      ? query(clientsRef, where('tenantId', '==', tenantId))
      : clientsRef;
    const clientsSnapshot = await getDocs(clientsQuery);
    
    const clientNames = new Map<string, string>();
    clientsSnapshot.docs.forEach(doc => {
      const data = doc.data();
      clientNames.set(doc.id, data.name || data.companyName || 'Unknown');
    });
    
    // Create result
    const result: TopClient[] = [];
    
    clientStats.forEach((stats, clientId) => {
      result.push({
        id: clientId,
        name: clientNames.get(clientId) || 'Unknown',
        totalPurchases: stats.total,
        orderCount: stats.orders,
        lastOrder: stats.lastOrder,
      });
    });
    
    // Sort by total purchases
    result.sort((a, b) => b.totalPurchases - a.totalPurchases);
    
    return result.slice(0, limit);
  } catch (error) {
    logger.error('Error getting top clients', error instanceof Error ? error : undefined);
    throw error;
  }
}

// ============================================
// Helper Functions
// ============================================

interface InvoiceData {
  total: number;
  clientId?: string;
  createdAt: Timestamp | Date;
}

interface OrderData {
  createdAt: Timestamp | Date;
}

async function getInvoicesInRange(
  tenantId: string,
  range: DateRange
): Promise<InvoiceData[]> {
  const invoicesRef = collection(db, 'invoices');
  const q = tenantId
    ? query(
        invoicesRef,
        where('tenantId', '==', tenantId),
        where('createdAt', '>=', Timestamp.fromDate(range.start)),
        where('createdAt', '<=', Timestamp.fromDate(range.end))
      )
    : query(
        invoicesRef,
        where('createdAt', '>=', Timestamp.fromDate(range.start)),
        where('createdAt', '<=', Timestamp.fromDate(range.end))
      );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data() as InvoiceData);
}

async function getOrdersInRange(
  tenantId: string,
  range: DateRange
): Promise<OrderData[]> {
  const ordersRef = collection(db, 'orders');
  const q = tenantId
    ? query(
        ordersRef,
        where('tenantId', '==', tenantId),
        where('createdAt', '>=', Timestamp.fromDate(range.start)),
        where('createdAt', '<=', Timestamp.fromDate(range.end))
      )
    : query(
        ordersRef,
        where('createdAt', '>=', Timestamp.fromDate(range.start)),
        where('createdAt', '<=', Timestamp.fromDate(range.end))
      );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data() as OrderData);
}

async function getNewClientsInRange(
  tenantId: string,
  range: DateRange
): Promise<unknown[]> {
  const clientsRef = collection(db, 'clients');
  const q = tenantId
    ? query(
        clientsRef,
        where('tenantId', '==', tenantId),
        where('createdAt', '>=', Timestamp.fromDate(range.start)),
        where('createdAt', '<=', Timestamp.fromDate(range.end))
      )
    : query(
        clientsRef,
        where('createdAt', '>=', Timestamp.fromDate(range.start)),
        where('createdAt', '<=', Timestamp.fromDate(range.end))
      );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data());
}

function formatDate(date: Timestamp | Date): string {
  const d = date instanceof Timestamp ? date.toDate() : date;
  return d.toISOString().split('T')[0];
}
