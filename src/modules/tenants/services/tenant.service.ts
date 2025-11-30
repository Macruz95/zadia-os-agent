import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  Timestamp,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { logger } from '@/lib/logger';
import {
  Tenant,
  CreateTenantData,
  UpdateTenantData,
  DEFAULT_TENANT_SETTINGS,
  SubscriptionPlan,
} from '../types';
import { createTenantSchema, updateTenantSchema } from '../schemas';

const COLLECTION_NAME = 'tenants';

/**
 * Generate a URL-friendly slug from a name
 */
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 50);
}

/**
 * Check if a slug is already in use
 */
async function isSlugTaken(slug: string, excludeId?: string): Promise<boolean> {
  const q = query(collection(db, COLLECTION_NAME), where('slug', '==', slug));
  const snapshot = await getDocs(q);
  
  if (snapshot.empty) return false;
  if (excludeId && snapshot.docs[0].id === excludeId) return false;
  
  return true;
}

/**
 * Create a new tenant
 */
export async function createTenant(
  data: CreateTenantData,
  ownerId: string
): Promise<Tenant> {
  const validated = createTenantSchema.parse(data);
  
  // Generate unique slug
  let slug = validated.slug || generateSlug(validated.name);
  let counter = 0;
  
  while (await isSlugTaken(slug)) {
    counter++;
    slug = `${generateSlug(validated.name)}-${counter}`;
  }
  
  const tenantRef = doc(collection(db, COLLECTION_NAME));
  const now = Timestamp.now();
  
  const tenant: Tenant = {
    id: tenantRef.id,
    name: validated.name,
    slug,
    ownerId,
    plan: validated.plan || 'free',
    settings: {
      ...DEFAULT_TENANT_SETTINGS,
      ...validated.settings,
    },
    createdAt: now,
    updatedAt: now,
    isActive: true,
    usage: {
      users: 1,
      storage: 0,
      projects: 0,
      clients: 0,
    },
  };
  
  await setDoc(tenantRef, tenant);
  
  logger.info('Tenant created', { tenantId: tenant.id, ownerId });
  
  return tenant;
}

/**
 * Get a tenant by ID
 */
export async function getTenantById(tenantId: string): Promise<Tenant | null> {
  const docRef = doc(db, COLLECTION_NAME, tenantId);
  const docSnap = await getDoc(docRef);
  
  if (!docSnap.exists()) {
    return null;
  }
  
  return docSnap.data() as Tenant;
}

/**
 * Get a tenant by slug
 */
export async function getTenantBySlug(slug: string): Promise<Tenant | null> {
  const q = query(collection(db, COLLECTION_NAME), where('slug', '==', slug));
  const snapshot = await getDocs(q);
  
  if (snapshot.empty) {
    return null;
  }
  
  return snapshot.docs[0].data() as Tenant;
}

/**
 * Get all tenants for a user (as owner or member)
 */
export async function getUserTenants(userId: string): Promise<Tenant[]> {
  // Get tenants where user is owner
  const ownerQuery = query(
    collection(db, COLLECTION_NAME),
    where('ownerId', '==', userId),
    where('isActive', '==', true)
  );
  
  const ownerSnapshot = await getDocs(ownerQuery);
  const tenants = ownerSnapshot.docs.map(doc => doc.data() as Tenant);
  
  // Also get tenants where user is a member (will be implemented with TenantMember)
  // For now, just return owned tenants
  
  return tenants;
}

/**
 * Update a tenant
 */
export async function updateTenant(
  tenantId: string,
  data: UpdateTenantData
): Promise<void> {
  const validated = updateTenantSchema.parse(data);
  
  const docRef = doc(db, COLLECTION_NAME, tenantId);
  
  await updateDoc(docRef, {
    ...validated,
    updatedAt: serverTimestamp(),
  });
  
  logger.info('Tenant updated', { tenantId });
}

/**
 * Update tenant plan
 */
export async function updateTenantPlan(
  tenantId: string,
  plan: SubscriptionPlan
): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, tenantId);
  
  await updateDoc(docRef, {
    plan,
    updatedAt: serverTimestamp(),
  });
  
  logger.info('Tenant plan updated', { tenantId, plan });
}

/**
 * Deactivate a tenant (soft delete)
 */
export async function deactivateTenant(tenantId: string): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, tenantId);
  
  await updateDoc(docRef, {
    isActive: false,
    updatedAt: serverTimestamp(),
  });
  
  logger.info('Tenant deactivated', { tenantId });
}

/**
 * Delete a tenant permanently (use with caution)
 */
export async function deleteTenant(tenantId: string): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, tenantId);
  
  await deleteDoc(docRef);
  
  logger.warn('Tenant permanently deleted', { tenantId });
}

/**
 * Update tenant usage counters
 */
export async function updateTenantUsage(
  tenantId: string,
  field: 'users' | 'storage' | 'projects' | 'clients',
  delta: number
): Promise<void> {
  const tenant = await getTenantById(tenantId);
  
  if (!tenant) {
    throw new Error('Tenant not found');
  }
  
  const newValue = Math.max(0, tenant.usage[field] + delta);
  
  const docRef = doc(db, COLLECTION_NAME, tenantId);
  await updateDoc(docRef, {
    [`usage.${field}`]: newValue,
    updatedAt: serverTimestamp(),
  });
}
