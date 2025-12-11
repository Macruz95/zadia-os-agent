/**
 * ZADIA OS - Public API: Invoices
 * 
 * CRUD operations for invoices via public API
 */

import { NextRequest } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
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
    let queryRef = adminDb.collection('invoices')
      .where('tenantId', '==', tenantId)
      .orderBy('createdAt', 'desc')
      .limit(pageSize);

    if (status) {
      queryRef = queryRef.where('status', '==', status);
    }

    if (clientId) {
      queryRef = queryRef.where('clientId', '==', clientId);
    }

    if (cursor) {
      const cursorDoc = await adminDb.collection('invoices').doc(cursor).get();
      if (cursorDoc.exists) {
        queryRef = queryRef.startAfter(cursorDoc);
      }
    }

    const snapshot = await queryRef.get();

    const invoices = snapshot.docs.map(d => {
      const data = d.data();
      return {
        id: d.id,
        ...data,
        issueDate: data.issueDate?.toDate?.()?.toISOString?.() ?? null,
        dueDate: data.dueDate?.toDate?.()?.toISOString?.() ?? null,
        paidAt: data.paidAt?.toDate?.()?.toISOString?.() ?? null,
        createdAt: data.createdAt?.toDate?.()?.toISOString?.() ?? null,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString?.() ?? null,
      };
    });
    
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
    const clientDoc = await adminDb.collection('clients').doc(body.clientId).get();
    if (!clientDoc.exists) {
      return createApiError('Client not found', 404);
    }

    const client = clientDoc.data();
    if (client?.tenantId !== tenantId) {
      return createApiError('Client not found', 404);
    }
    
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

    const issueDate = body.issueDate ? new Date(body.issueDate) : new Date();
    const dueDate = body.dueDate
      ? new Date(body.dueDate)
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

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
      issueDate,
      dueDate,
      notes: body.notes || null,
      source: 'api',
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    const docRef = await adminDb.collection('invoices').add(invoiceData);
    
    return createApiResponse({
      id: docRef.id,
      ...invoiceData,
      issueDate: issueDate.toISOString(),
      dueDate: dueDate.toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }, 201);
  } catch {
    return createApiError('Failed to create invoice', 500);
  }
}
