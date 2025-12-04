/**
 * ZADIA OS - Public API: Clients
 * 
 * CRUD operations for clients via public API
 * Uses Firebase Admin SDK for secure server-side operations
 */

import { NextRequest } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { 
  validateApiRequest, 
  createApiResponse, 
  createApiError 
} from '../middleware';

// GET /api/v1/clients - List clients
export async function GET(request: NextRequest) {
  const validation = await validateApiRequest(request, 'clients:read');
  if (!validation.success) return validation.response;
  
  const { tenantId } = validation.context;
  const { searchParams } = new URL(request.url);
  
  const pageSize = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
  const cursor = searchParams.get('cursor');
  const search = searchParams.get('search');
  
  try {
    let query = adminDb.collection('clients')
      .where('tenantId', '==', tenantId)
      .orderBy('createdAt', 'desc')
      .limit(pageSize);
    
    if (cursor) {
      const cursorDoc = await adminDb.collection('clients').doc(cursor).get();
      if (cursorDoc.exists) {
        query = query.startAfter(cursorDoc);
      }
    }
    
    const snapshot = await query.get();
    
    let clients = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        company: data.company || '',
        status: data.status || 'active',
        tenantId: data.tenantId,
        createdAt: data.createdAt?.toDate?.()?.toISOString(),
        updatedAt: data.updatedAt?.toDate?.()?.toISOString(),
      };
    });
    
    // Simple search filter (in production, use Algolia/Elasticsearch)
    if (search) {
      const searchLower = search.toLowerCase();
      clients = clients.filter(c => 
        c.name?.toLowerCase().includes(searchLower) ||
        c.email?.toLowerCase().includes(searchLower)
      );
    }
    
    const nextCursor = snapshot.docs.length === pageSize 
      ? snapshot.docs[snapshot.docs.length - 1].id 
      : null;
    
    return createApiResponse({
      clients,
      pagination: {
        hasMore: !!nextCursor,
        nextCursor,
        count: clients.length,
      },
    });
  } catch {
    return createApiError('Failed to fetch clients', 500);
  }
}

// POST /api/v1/clients - Create client
export async function POST(request: NextRequest) {
  const validation = await validateApiRequest(request, 'clients:write');
  if (!validation.success) return validation.response;
  
  const { tenantId } = validation.context;
  
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.name) {
      return createApiError('Name is required', 400);
    }
    
    if (!body.email) {
      return createApiError('Email is required', 400);
    }
    
    // Check for duplicate email using Admin SDK
    const existingQuery = await adminDb.collection('clients')
      .where('tenantId', '==', tenantId)
      .where('email', '==', body.email)
      .limit(1)
      .get();
    
    if (!existingQuery.empty) {
      return createApiError('A client with this email already exists', 409);
    }
    
    const now = FieldValue.serverTimestamp();
    const clientData = {
      tenantId,
      name: body.name,
      email: body.email,
      phone: body.phone || null,
      company: body.company || null,
      address: body.address || null,
      city: body.city || null,
      state: body.state || null,
      country: body.country || null,
      postalCode: body.postalCode || null,
      taxId: body.taxId || null,
      notes: body.notes || null,
      tags: body.tags || [],
      status: 'active',
      source: 'api',
      createdAt: now,
      updatedAt: now,
    };
    
    const docRef = await adminDb.collection('clients').add(clientData);
    
    return createApiResponse({
      id: docRef.id,
      ...clientData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }, 201);
  } catch {
    return createApiError('Failed to create client', 500);
  }
}
