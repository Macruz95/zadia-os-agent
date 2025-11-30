/**
 * ZADIA OS - Public API: Client by ID
 * 
 * Get, update, delete individual client
 */

import { NextRequest } from 'next/server';
import { 
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
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
    const docRef = doc(db, 'clients', id);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return createApiError('Client not found', 404);
    }
    
    const client = docSnap.data();
    
    // Verify tenant ownership
    if (client.tenantId !== tenantId) {
      return createApiError('Client not found', 404);
    }
    
    return createApiResponse({
      id: docSnap.id,
      ...client,
      createdAt: client.createdAt?.toDate?.()?.toISOString(),
      updatedAt: client.updatedAt?.toDate?.()?.toISOString(),
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
    const docRef = doc(db, 'clients', id);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return createApiError('Client not found', 404);
    }
    
    const client = docSnap.data();
    
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
      updatedAt: Timestamp.now(),
    };
    
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates[field] = body[field];
      }
    }
    
    await updateDoc(docRef, updates);
    
    const updatedSnap = await getDoc(docRef);
    const updated = updatedSnap.data();
    
    return createApiResponse({
      id: updatedSnap.id,
      ...updated,
      createdAt: updated?.createdAt?.toDate?.()?.toISOString(),
      updatedAt: updated?.updatedAt?.toDate?.()?.toISOString(),
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
    const docRef = doc(db, 'clients', id);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return createApiError('Client not found', 404);
    }
    
    const client = docSnap.data();
    
    if (client.tenantId !== tenantId) {
      return createApiError('Client not found', 404);
    }
    
    await deleteDoc(docRef);
    
    return createApiResponse({ deleted: true });
  } catch {
    return createApiError('Failed to delete client', 500);
  }
}
