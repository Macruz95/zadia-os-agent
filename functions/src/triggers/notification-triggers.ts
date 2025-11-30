import * as functions from 'firebase-functions/v2';
import * as admin from 'firebase-admin';

const db = admin.firestore();

interface NotificationData {
  userId: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'action';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  actionUrl?: string;
  actionLabel?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Create a notification in Firestore
 */
async function createNotification(data: NotificationData): Promise<void> {
  await db.collection('notifications').add({
    ...data,
    read: false,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });
}

/**
 * Trigger: Notify when invoice is overdue
 * Runs daily at 9 AM to check for overdue invoices
 */
export const notifyOverdueInvoices = functions.scheduler.onSchedule(
  {
    schedule: '0 9 * * *', // Every day at 9 AM
    timeZone: 'America/Mexico_City',
  },
  async () => {
    const now = new Date();
    
    // Get overdue invoices
    const overdueSnapshot = await db
      .collection('invoices')
      .where('status', '==', 'pending')
      .where('dueDate', '<', admin.firestore.Timestamp.fromDate(now))
      .get();

    for (const invoiceDoc of overdueSnapshot.docs) {
      const invoice = invoiceDoc.data();
      const userId = invoice.userId || invoice.createdBy;
      
      if (!userId) continue;

      await createNotification({
        userId,
        type: 'warning',
        priority: 'high',
        title: 'Factura vencida',
        message: `La factura #${invoice.invoiceNumber || invoiceDoc.id.slice(-6)} esta vencida. Total: $${invoice.total?.toLocaleString() || 0}`,
        actionUrl: `/finance/invoices/${invoiceDoc.id}`,
        actionLabel: 'Ver factura',
        metadata: {
          invoiceId: invoiceDoc.id,
          total: invoice.total,
        },
      });
    }

    console.log(`Processed ${overdueSnapshot.size} overdue invoices`);
  }
);

/**
 * Trigger: Notify when inventory is low
 * Runs daily at 8 AM to check inventory levels
 */
export const notifyLowInventory = functions.scheduler.onSchedule(
  {
    schedule: '0 8 * * *', // Every day at 8 AM
    timeZone: 'America/Mexico_City',
  },
  async () => {
    // Check raw materials
    const materialsSnapshot = await db.collection('raw-materials').get();
    
    for (const materialDoc of materialsSnapshot.docs) {
      const material = materialDoc.data();
      const currentStock = material.quantity || 0;
      const minStock = material.minStock || material.minimumStock || 0;
      
      if (currentStock <= minStock && minStock > 0) {
        const userId = material.userId || material.createdBy;
        if (!userId) continue;

        await createNotification({
          userId,
          type: 'warning',
          priority: currentStock === 0 ? 'critical' : 'high',
          title: currentStock === 0 ? 'Sin stock' : 'Stock bajo',
          message: `${material.name}: ${currentStock} unidades (minimo: ${minStock})`,
          actionUrl: `/inventory`,
          actionLabel: 'Ver inventario',
          metadata: {
            materialId: materialDoc.id,
            currentStock,
            minStock,
          },
        });
      }
    }

    // Check finished products
    const productsSnapshot = await db.collection('finished-products').get();
    
    for (const productDoc of productsSnapshot.docs) {
      const product = productDoc.data();
      const currentStock = product.quantity || 0;
      const minStock = product.minStock || product.minimumStock || 0;
      
      if (currentStock <= minStock && minStock > 0) {
        const userId = product.userId || product.createdBy;
        if (!userId) continue;

        await createNotification({
          userId,
          type: 'warning',
          priority: currentStock === 0 ? 'critical' : 'high',
          title: currentStock === 0 ? 'Sin stock' : 'Stock bajo',
          message: `${product.name}: ${currentStock} unidades (minimo: ${minStock})`,
          actionUrl: `/inventory`,
          actionLabel: 'Ver inventario',
          metadata: {
            productId: productDoc.id,
            currentStock,
            minStock,
          },
        });
      }
    }

    console.log('Low inventory check completed');
  }
);

/**
 * Trigger: Notify when a new lead is assigned
 */
export const notifyLeadAssigned = functions.firestore.onDocumentUpdated(
  'leads/{leadId}',
  async (event) => {
    const beforeData = event.data?.before.data();
    const afterData = event.data?.after.data();
    
    if (!beforeData || !afterData) return;
    
    // Check if assignedTo changed
    if (beforeData.assignedTo !== afterData.assignedTo && afterData.assignedTo) {
      await createNotification({
        userId: afterData.assignedTo,
        type: 'info',
        priority: 'medium',
        title: 'Nuevo lead asignado',
        message: `Se te ha asignado el lead: ${afterData.name || afterData.companyName || 'Sin nombre'}`,
        actionUrl: `/sales/leads/${event.params.leadId}`,
        actionLabel: 'Ver lead',
        metadata: {
          leadId: event.params.leadId,
        },
      });
    }
  }
);

/**
 * Trigger: Notify when project milestone is due soon
 */
export const notifyUpcomingMilestones = functions.scheduler.onSchedule(
  {
    schedule: '0 7 * * *', // Every day at 7 AM
    timeZone: 'America/Mexico_City',
  },
  async () => {
    const now = new Date();
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    
    const projectsSnapshot = await db.collection('projects').get();
    
    for (const projectDoc of projectsSnapshot.docs) {
      const project = projectDoc.data();
      const milestones = project.milestones || [];
      
      for (const milestone of milestones) {
        if (milestone.status === 'completed') continue;
        
        const dueDate = milestone.dueDate?.toDate?.() || new Date(milestone.dueDate);
        
        if (dueDate >= now && dueDate <= threeDaysFromNow) {
          const userId = project.managerId || project.userId || project.createdBy;
          if (!userId) continue;

          await createNotification({
            userId,
            type: 'action',
            priority: 'high',
            title: 'Hito proximo a vencer',
            message: `"${milestone.name}" en proyecto "${project.name}" vence en ${Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))} dias`,
            actionUrl: `/projects/${projectDoc.id}`,
            actionLabel: 'Ver proyecto',
            metadata: {
              projectId: projectDoc.id,
              milestoneName: milestone.name,
              dueDate: dueDate.toISOString(),
            },
          });
        }
      }
    }

    console.log('Milestone check completed');
  }
);

/**
 * Trigger: Notify when payment is received
 */
export const notifyPaymentReceived = functions.firestore.onDocumentCreated(
  'payments/{paymentId}',
  async (event) => {
    const payment = event.data?.data();
    if (!payment) return;

    const userId = payment.userId || payment.createdBy;
    if (!userId) return;

    // Get invoice details
    const invoiceRef = db.collection('invoices').doc(payment.invoiceId);
    const invoiceDoc = await invoiceRef.get();
    const invoice = invoiceDoc.exists ? invoiceDoc.data() : null;

    await createNotification({
      userId,
      type: 'success',
      priority: 'medium',
      title: 'Pago recibido',
      message: `Se recibio un pago de $${payment.amount?.toLocaleString() || 0} para la factura #${invoice?.invoiceNumber || payment.invoiceId.slice(-6)}`,
      actionUrl: `/finance/invoices/${payment.invoiceId}`,
      actionLabel: 'Ver factura',
      metadata: {
        paymentId: event.params.paymentId,
        invoiceId: payment.invoiceId,
        amount: payment.amount,
      },
    });
  }
);

/**
 * Trigger: Notify when quote is approved/rejected
 */
export const notifyQuoteStatusChange = functions.firestore.onDocumentUpdated(
  'quotes/{quoteId}',
  async (event) => {
    const beforeData = event.data?.before.data();
    const afterData = event.data?.after.data();
    
    if (!beforeData || !afterData) return;
    
    // Check if status changed to approved or rejected
    if (beforeData.status !== afterData.status) {
      const userId = afterData.userId || afterData.createdBy;
      if (!userId) return;

      if (afterData.status === 'approved') {
        await createNotification({
          userId,
          type: 'success',
          priority: 'high',
          title: 'Cotizacion aprobada',
          message: `La cotizacion #${afterData.quoteNumber || event.params.quoteId.slice(-6)} ha sido aprobada`,
          actionUrl: `/sales/quotes/${event.params.quoteId}`,
          actionLabel: 'Ver cotizacion',
          metadata: {
            quoteId: event.params.quoteId,
            total: afterData.total,
          },
        });
      } else if (afterData.status === 'rejected') {
        await createNotification({
          userId,
          type: 'error',
          priority: 'high',
          title: 'Cotizacion rechazada',
          message: `La cotizacion #${afterData.quoteNumber || event.params.quoteId.slice(-6)} ha sido rechazada`,
          actionUrl: `/sales/quotes/${event.params.quoteId}`,
          actionLabel: 'Ver cotizacion',
          metadata: {
            quoteId: event.params.quoteId,
          },
        });
      }
    }
  }
);
