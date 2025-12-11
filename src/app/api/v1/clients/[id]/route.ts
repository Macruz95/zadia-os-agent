/**
 * ZADIA OS - Public API: Client by ID
 * 
 * Get, update, delete individual client
 */

import { NextRequest } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { 
  validateApiRequest, 
  createApiResponse, 
  createApiError 
} from '../../middleware';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/v1/clients/[id]
export async function GET(request: NextRequest, { params }: RouteParams) {
  const validation = await validateApiRequest(request, 'clients:read');
  if (!validation.success) return validation.response;
  
  const { tenantId } = validation.context;
  const { id } = await params;
  
  try {
    const docSnap = await adminDb.collection('clients').doc(id).get();
    
    if (!docSnap.exists) {
      return createApiError('Client not found', 404);
    }
    
    const client = docSnap.data();
    if (!client) {
      return createApiError('Client not found', 404);
    }
    
    // Verify tenant ownership
    if (client.tenantId !== tenantId) {
      return createApiError('Client not found', 404);
    }
    
    return createApiResponse({
      id: docSnap.id,
      ...client,
      createdAt: client.createdAt?.toDate?.()?.toISOString?.() ?? null,
      updatedAt: client.updatedAt?.toDate?.()?.toISOString?.() ?? null,
    });
  } catch {
    return createApiError('Failed to fetch client', 500);
  }
}

// PUT /api/v1/clients/[id]
export async function PUT(request: NextRequest, { params }: RouteParams) {
  const validation = await validateApiRequest(request, 'clients:write');
  if (!validation.success) return validation.response;
  
  const { tenantId } = validation.context;
  const { id } = await params;
  
  try {
    const docRef = adminDb.collection('clients').doc(id);
    const docSnap = await docRef.get();
    
    if (!docSnap.exists) {
      return createApiError('Client not found', 404);
    }
    
    const client = docSnap.data();
    if (!client) {
      return createApiError('Client not found', 404);
    }
    
    if (client.tenantId !== tenantId) {
      return createApiError('Client not found', 404);
    }
    
    const body = await request.json();
    
    // Only allow updating certain fields
    const allowedFields = [
      'name', 'email', 'phone', 'company', 'address',
      'city', 'state', 'country', 'postalCode', 'taxId',
      'notes', 'tags', 'status'
    ];
    
    const updates: Record<string, unknown> = {
      updatedAt: FieldValue.serverTimestamp(),
    };
    
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates[field] = body[field];
      }
    }
    
    await docRef.update(updates);

    const updatedSnap = await docRef.get();
    const updated = updatedSnap.data();
    
    return createApiResponse({
      id: updatedSnap.id,
      ...updated,
      createdAt: updated?.createdAt?.toDate?.()?.toISOString?.() ?? null,
      updatedAt: updated?.updatedAt?.toDate?.()?.toISOString?.() ?? null,
    });
  } catch {
    return createApiError('Failed to update client', 500);
  }
}

// DELETE /api/v1/clients/[id]
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const validation = await validateApiRequest(request, 'clients:write');
  if (!validation.success) return validation.response;
  
  const { tenantId } = validation.context;
  const { id } = await params;
  
  try {
    const docRef = adminDb.collection('clients').doc(id);
    const docSnap = await docRef.get();
    
    if (!docSnap.exists) {
      return createApiError('Client not found', 404);
    }
    
    const client = docSnap.data();
    if (!client) {
      return createApiError('Client not found', 404);
    }
    
    if (client.tenantId !== tenantId) {
      return createApiError('Client not found', 404);
    }
    
    await docRef.delete();
    
    return createApiResponse({ deleted: true });
  } catch {
    return createApiError('Failed to delete client', 500);
  }
}
