/**
 * ZADIA OS - Public API Middleware
 * 
 * Validates API keys and rate limits for public API
 * Uses Firebase Admin SDK for secure server-side operations
 */

import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import crypto from 'crypto';

export type ApiPermission = 
  | 'clients:read' 
  | 'clients:write' 
  | 'invoices:read' 
  | 'invoices:write'
  | 'projects:read'
  | 'projects:write'
  | 'inventory:read'
  | 'inventory:write'
  | '*';

interface ApiKeyData {
  id: string;
  tenantId: string;
  name: string;
  permissions: ApiPermission[];
  rateLimit: number;
  status: 'active' | 'revoked';
  lastUsed?: Date;
}

// Simple in-memory rate limiter (use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

export interface ApiContext {
  tenantId: string;
  apiKeyId: string;
  permissions: ApiPermission[];
}

/**
 * Hash API key for secure comparison
 */
function hashApiKey(key: string): string {
  return crypto.createHash('sha256').update(key).digest('hex');
}

/**
 * Validate API key using Firebase Admin SDK
 */
async function validateApiKeyWithAdmin(apiKey: string): Promise<ApiKeyData | null> {
  try {
    // Hash the key for lookup
    const hashedKey = hashApiKey(apiKey);
    
    // Query by hashed key
    const snapshot = await adminDb.collection('apiKeys')
      .where('hashedKey', '==', hashedKey)
      .where('status', '==', 'active')
      .limit(1)
      .get();
    
    if (snapshot.empty) {
      return null;
    }
    
    const doc = snapshot.docs[0];
    const data = doc.data();
    
    // Update last used timestamp
    await doc.ref.update({ 
      lastUsed: new Date(),
      usageCount: (data.usageCount || 0) + 1,
    });
    
    return {
      id: doc.id,
      tenantId: data.tenantId,
      name: data.name,
      permissions: data.permissions || [],
      rateLimit: data.rateLimit || 100,
      status: data.status,
    };
  } catch {
    return null;
  }
}

/**
 * Check if API key has required permission
 */
function hasPermission(keyData: ApiKeyData, required: ApiPermission): boolean {
  if (keyData.permissions.includes('*')) return true;
  return keyData.permissions.includes(required);
}

/**
 * Validate API request and return context
 */
export async function validateApiRequest(
  request: NextRequest,
  requiredPermission: ApiPermission
): Promise<{ success: true; context: ApiContext } | { success: false; response: NextResponse }> {
  // Get API key from header
  const authHeader = request.headers.get('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      success: false,
      response: NextResponse.json(
        { 
          error: 'Unauthorized',
          message: 'Missing or invalid Authorization header. Use: Bearer YOUR_API_KEY',
        },
        { status: 401 }
      ),
    };
  }
  
  const apiKey = authHeader.substring(7); // Remove "Bearer "
  
  // Validate API key using Admin SDK
  const keyData = await validateApiKeyWithAdmin(apiKey);
  
  if (!keyData) {
    return {
      success: false,
      response: NextResponse.json(
        { 
          error: 'Unauthorized',
          message: 'Invalid or expired API key',
        },
        { status: 401 }
      ),
    };
  }
  
  // Check permission
  if (!hasPermission(keyData, requiredPermission)) {
    return {
      success: false,
      response: NextResponse.json(
        { 
          error: 'Forbidden',
          message: `Missing required permission: ${requiredPermission}`,
        },
        { status: 403 }
      ),
    };
  }
  
  // Check rate limit
  const rateLimitKey = keyData.id;
  const now = Date.now();
  const windowMs = 60000; // 1 minute
  
  const current = rateLimitStore.get(rateLimitKey);
  
  if (current && current.resetAt > now) {
    if (current.count >= keyData.rateLimit) {
      return {
        success: false,
        response: NextResponse.json(
          { 
            error: 'Too Many Requests',
            message: `Rate limit exceeded. Limit: ${keyData.rateLimit} requests per minute`,
            retryAfter: Math.ceil((current.resetAt - now) / 1000),
          },
          { 
            status: 429,
            headers: {
              'Retry-After': String(Math.ceil((current.resetAt - now) / 1000)),
              'X-RateLimit-Limit': String(keyData.rateLimit),
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': String(Math.ceil(current.resetAt / 1000)),
            },
          }
        ),
      };
    }
    current.count++;
  } else {
    rateLimitStore.set(rateLimitKey, { count: 1, resetAt: now + windowMs });
  }
  
  return {
    success: true,
    context: {
      tenantId: keyData.tenantId,
      apiKeyId: keyData.id,
      permissions: keyData.permissions,
    },
  };
}

/**
 * Create a success response with standard headers
 */
export function createApiResponse(
  data: unknown,
  status: number = 200
): NextResponse {
  return NextResponse.json(
    { success: true, data },
    { 
      status,
      headers: {
        'Content-Type': 'application/json',
        'X-API-Version': '1.0',
      },
    }
  );
}

/**
 * Create an error response
 */
export function createApiError(
  message: string,
  status: number = 400,
  details?: unknown
): NextResponse {
  return NextResponse.json(
    { 
      success: false, 
      error: message,
      details,
    },
    { status }
  );
}
