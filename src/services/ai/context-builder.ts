/**
 * ZADIA OS - AI Context Builder
 * 
 * Builds system context from Firebase data for AI assistant
 * Rule #1: Real data from Firebase
 */

import { 
  collection, 
  getDocs, 
  query, 
  limit 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { logger } from '@/lib/logger';
import type { SystemContext } from '@/types/ai-assistant.types';

/**
 * Fetch clients data for AI context
 */
async function fetchClientsContext() {
  try {
    const clientsQuery = query(collection(db, 'clients'), limit(20));
    const clientsSnap = await getDocs(clientsQuery);
    const clientsDocs = clientsSnap.docs.sort((a, b) => {
      const aDate = a.data().createdAt?.toDate() || new Date(0);
      const bDate = b.data().createdAt?.toDate() || new Date(0);
      return bDate.getTime() - aDate.getTime();
    }).slice(0, 5);
    
    return {
      recentClients: clientsDocs.map(doc => ({
        id: doc.id,
        name: doc.data().name || 'Sin nombre',
      })),
      totalClients: clientsSnap.size
    };
  } catch (error) {
    logger.error('Error fetching clients for AI context', error as Error);
    return { recentClients: [], totalClients: 0 };
  }
}

/**
 * Fetch projects data for AI context
 */
async function fetchProjectsContext() {
  try {
    const projectsQuery = query(collection(db, 'projects'), limit(20));
    const projectsSnap = await getDocs(projectsQuery);
    const projectsDocs = projectsSnap.docs.sort((a, b) => {
      const aDate = a.data().createdAt?.toDate() || new Date(0);
      const bDate = b.data().createdAt?.toDate() || new Date(0);
      return bDate.getTime() - aDate.getTime();
    }).slice(0, 5);
    
    return {
      recentProjects: projectsDocs.map(doc => ({
        id: doc.id,
        name: doc.data().name || 'Sin nombre',
        status: doc.data().status || 'unknown',
      })),
      activeProjects: projectsSnap.docs.filter(d => 
        ['planning', 'in-progress'].includes(d.data().status)
      ).length
    };
  } catch (error) {
    logger.error('Error fetching projects for AI context', error as Error);
    return { recentProjects: [], activeProjects: 0 };
  }
}

/**
 * Fetch invoices data for AI context
 */
async function fetchInvoicesContext() {
  try {
    const invoicesQuery = query(collection(db, 'invoices'), limit(20));
    const invoicesSnap = await getDocs(invoicesQuery);
    const invoicesDocs = invoicesSnap.docs.sort((a, b) => {
      const aDate = a.data().createdAt?.toDate() || new Date(0);
      const bDate = b.data().createdAt?.toDate() || new Date(0);
      return bDate.getTime() - aDate.getTime();
    }).slice(0, 5);
    
    const paidInvoices = invoicesSnap.docs.filter(d => d.data().status === 'paid');
    
    return {
      recentInvoices: invoicesDocs.map(doc => ({
        id: doc.id,
        total: doc.data().total || 0,
        status: doc.data().status || 'unknown',
      })),
      monthlyRevenue: paidInvoices.reduce((sum, d) => sum + (d.data().total || 0), 0)
    };
  } catch (error) {
    logger.error('Error fetching invoices for AI context', error as Error);
    return { recentInvoices: [], monthlyRevenue: 0 };
  }
}

/**
 * Fetch sales data (leads, opportunities, quotes)
 */
async function fetchSalesContext() {
  try {
    const [leadsSnap, opportunitiesSnap, quotesSnap] = await Promise.all([
      getDocs(query(collection(db, 'leads'), limit(20))),
      getDocs(query(collection(db, 'opportunities'), limit(20))),
      getDocs(query(collection(db, 'quotes'), limit(20)))
    ]);

    return {
      activeLeads: leadsSnap.docs.filter(d => 
        ['new', 'contacted', 'qualified'].includes(d.data().status)
      ).length,
      activeOpportunities: opportunitiesSnap.docs.filter(d => 
        ['qualification', 'proposal', 'negotiation'].includes(d.data().stage)
      ).length,
      activeQuotes: quotesSnap.docs.filter(d => 
        ['draft', 'sent'].includes(d.data().status)
      ).length
    };
  } catch (error) {
    logger.error('Error fetching sales for AI context', error as Error);
    return { activeLeads: 0, activeOpportunities: 0, activeQuotes: 0 };
  }
}

/**
 * Fetch operations data (orders, work orders)
 */
async function fetchOperationsContext() {
  try {
    const [ordersSnap, workOrdersSnap] = await Promise.all([
      getDocs(query(collection(db, 'orders'), limit(20))),
      getDocs(query(collection(db, 'workOrders'), limit(20)))
    ]);

    return {
      pendingOrders: ordersSnap.docs.filter(d => 
        ['pending', 'processing'].includes(d.data().status)
      ).length,
      totalOrders: ordersSnap.size,
      activeWorkOrders: workOrdersSnap.docs.filter(d => 
        ['pending', 'in-progress'].includes(d.data().status)
      ).length
    };
  } catch (error) {
    logger.error('Error fetching operations for AI context', error as Error);
    return { pendingOrders: 0, totalOrders: 0, activeWorkOrders: 0 };
  }
}

/**
 * Fetch inventory data
 */
async function fetchInventoryContext() {
  try {
    const [rawMaterialsSnap, finishedProductsSnap] = await Promise.all([
      getDocs(query(collection(db, 'raw-materials'), limit(50))),
      getDocs(query(collection(db, 'finished-products'), limit(50)))
    ]);

    const lowStockMaterials = rawMaterialsSnap.docs.filter(d => {
      const data = d.data();
      return (data.currentStock || 0) <= (data.minimumStock || 0);
    });

    return {
      lowStockItems: lowStockMaterials.length,
      totalRawMaterials: rawMaterialsSnap.size,
      totalFinishedProducts: finishedProductsSnap.size
    };
  } catch (error) {
    logger.error('Error fetching inventory for AI context', error as Error);
    return { lowStockItems: 0, totalRawMaterials: 0, totalFinishedProducts: 0 };
  }
}

/**
 * Build complete system context from Firebase data
 */
export async function buildSystemContext(userId: string): Promise<SystemContext> {
  try {
    const context: SystemContext = {
      userId,
      timestamp: new Date(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };

    // Fetch all data in parallel for performance
    const [clients, projects, invoices, sales, operations, inventory] = await Promise.all([
      fetchClientsContext(),
      fetchProjectsContext(),
      fetchInvoicesContext(),
      fetchSalesContext(),
      fetchOperationsContext(),
      fetchInventoryContext()
    ]);

    // Merge all context data
    return {
      ...context,
      ...clients,
      ...projects,
      ...invoices,
      ...sales,
      ...operations,
      ...inventory
    };
  } catch (error) {
    logger.error('Error building system context', error as Error);
    return {
      userId,
      timestamp: new Date(),
    };
  }
}
