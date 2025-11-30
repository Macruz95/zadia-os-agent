/**
 * ZADIA OS - Public API: Invoices
 * 
 * CRUD operations for invoices via public API
 */

import { NextRequest } from 'next/server';
import { 
  collection, 
  query, 
  where, 
  getDocs,
  addDoc,
  Timestamp,
  limit,
  orderBy,
  startAfter,
  doc,
  getDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { 
  validateApiRequest, 
  createApiResponse, 
  createApiError 
} from '../middleware';

// GET /api/v1/invoices - List invoices
export async function GET(request: NextRequest) {
  const validation = await validateApiRequest(request, 'invoices:read');
  if (!validation.success) return validation.response;
  
  const { tenantId } = validation.context;
  const { searchParams } = new URL(request.url);
  
  const pageSize = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
  const cursor = searchParams.get('cursor');
  const status = searchParams.get('status');
  const clientId = searchParams.get('clientId');
  
  try {
    let q = query(
      collection(db, 'invoices'),
      where('tenantId', '==', tenantId),
      orderBy('createdAt', 'desc'),
      limit(pageSize)
    );
    
    if (status) {
      q = query(q, where('status', '==', status));
    }
    
    if (clientId) {
      q = query(q, where('clientId', '==', clientId));
    }
    
    if (cursor) {
      const cursorDoc = await getDoc(doc(db, 'invoices', cursor));
      if (cursorDoc.exists()) {
        q = query(q, startAfter(cursorDoc));
      }
    }
    
    const snapshot = await getDocs(q);
    
    const invoices = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      issueDate: doc.data().issueDate?.toDate?.()?.toISOString(),
      dueDate: doc.data().dueDate?.toDate?.()?.toISOString(),
      paidAt: doc.data().paidAt?.toDate?.()?.toISOString(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString(),
      updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString(),
    }));
    
    const nextCursor = snapshot.docs.length === pageSize 
      ? snapshot.docs[snapshot.docs.length - 1].id 
      : null;
    
    return createApiResponse({
      invoices,
      pagination: {
        hasMore: !!nextCursor,
        nextCursor,
        count: invoices.length,
      },
    });
  } catch {
    return createApiError('Failed to fetch invoices', 500);
  }
}

// POST /api/v1/invoices - Create invoice
export async function POST(request: NextRequest) {
  const validation = await validateApiRequest(request, 'invoices:write');
  if (!validation.success) return validation.response;
  
  const { tenantId } = validation.context;
  
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.clientId) {
      return createApiError('clientId is required', 400);
    }
    
    if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
      return createApiError('items array is required and must not be empty', 400);
    }
    
    // Verify client exists
    const clientDoc = await getDoc(doc(db, 'clients', body.clientId));
    if (!clientDoc.exists() || clientDoc.data().tenantId !== tenantId) {
      return createApiError('Client not found', 404);
    }
    
    const client = clientDoc.data();
    
    // Calculate totals
    const items = body.items.map((item: {
      description: string;
      quantity: number;
      unitPrice: number;
    }) => ({
      description: item.description,
      quantity: item.quantity || 1,
      unitPrice: item.unitPrice || 0,
      total: (item.quantity || 1) * (item.unitPrice || 0),
    }));
    
    const subtotal = items.reduce((sum: number, item: { total: number }) => sum + item.total, 0);
    const taxRate = body.taxRate || 0;
    const taxAmount = subtotal * (taxRate / 100);
    const discount = body.discount || 0;
    const total = subtotal + taxAmount - discount;
    
    // Generate invoice number
    const invoiceNumber = `INV-${Date.now().toString(36).toUpperCase()}`;
    
    const invoiceData = {
      tenantId,
      invoiceNumber,
      clientId: body.clientId,
      clientName: client.name,
      clientEmail: client.email,
      clientAddress: client.address || '',
      items,
      subtotal,
      taxRate,
      taxAmount,
      discount,
      total,
      currency: body.currency || 'USD',
      status: 'draft',
      issueDate: body.issueDate 
        ? Timestamp.fromDate(new Date(body.issueDate))
        : Timestamp.now(),
      dueDate: body.dueDate 
        ? Timestamp.fromDate(new Date(body.dueDate))
        : Timestamp.fromDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)), // 30 days
      notes: body.notes || null,
      source: 'api',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };
    
    const docRef = await addDoc(collection(db, 'invoices'), invoiceData);
    
    return createApiResponse({
      id: docRef.id,
      ...invoiceData,
      issueDate: new Date().toISOString(),
      dueDate: invoiceData.dueDate.toDate().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }, 201);
  } catch {
    return createApiError('Failed to create invoice', 500);
  }
}
