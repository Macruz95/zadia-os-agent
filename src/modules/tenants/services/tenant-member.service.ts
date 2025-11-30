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
  TenantMember,
  TenantInvitation,
  TenantRole,
  InviteMemberData,
} from '../types';
import { inviteMemberSchema } from '../schemas';
import { updateTenantUsage } from './tenant.service';

const MEMBERS_COLLECTION = 'tenantMembers';
const INVITATIONS_COLLECTION = 'tenantInvitations';

/**
 * Add a member to a tenant
 */
export async function addTenantMember(
  tenantId: string,
  userId: string,
  email: string,
  displayName: string,
  role: TenantRole,
  invitedBy: string
): Promise<TenantMember> {
  const memberRef = doc(db, MEMBERS_COLLECTION, `${tenantId}_${userId}`);
  const now = Timestamp.now();
  
  const member: TenantMember = {
    id: memberRef.id,
    tenantId,
    userId,
    email,
    displayName,
    role,
    permissions: [],
    joinedAt: now,
    invitedBy,
    isActive: true,
  };
  
  await setDoc(memberRef, member);
  
  // Update tenant usage
  await updateTenantUsage(tenantId, 'users', 1);
  
  logger.info('Member added to tenant', { tenantId, userId, role });
  
  return member;
}

/**
 * Get a tenant member
 */
export async function getTenantMember(
  tenantId: string,
  userId: string
): Promise<TenantMember | null> {
  const memberRef = doc(db, MEMBERS_COLLECTION, `${tenantId}_${userId}`);
  const docSnap = await getDoc(memberRef);
  
  if (!docSnap.exists()) {
    return null;
  }
  
  return docSnap.data() as TenantMember;
}

/**
 * Get all members of a tenant
 */
export async function getTenantMembers(tenantId: string): Promise<TenantMember[]> {
  const q = query(
    collection(db, MEMBERS_COLLECTION),
    where('tenantId', '==', tenantId),
    where('isActive', '==', true)
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data() as TenantMember);
}

/**
 * Get all tenants a user is a member of
 */
export async function getUserMemberships(userId: string): Promise<TenantMember[]> {
  const q = query(
    collection(db, MEMBERS_COLLECTION),
    where('userId', '==', userId),
    where('isActive', '==', true)
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data() as TenantMember);
}

/**
 * Update member role
 */
export async function updateMemberRole(
  tenantId: string,
  userId: string,
  role: TenantRole
): Promise<void> {
  const memberRef = doc(db, MEMBERS_COLLECTION, `${tenantId}_${userId}`);
  
  await updateDoc(memberRef, {
    role,
    updatedAt: serverTimestamp(),
  });
  
  logger.info('Member role updated', { tenantId, userId, role });
}

/**
 * Remove a member from a tenant
 */
export async function removeTenantMember(
  tenantId: string,
  userId: string
): Promise<void> {
  const memberRef = doc(db, MEMBERS_COLLECTION, `${tenantId}_${userId}`);
  
  await updateDoc(memberRef, {
    isActive: false,
    updatedAt: serverTimestamp(),
  });
  
  // Update tenant usage
  await updateTenantUsage(tenantId, 'users', -1);
  
  logger.info('Member removed from tenant', { tenantId, userId });
}

/**
 * Create an invitation
 */
export async function createInvitation(
  tenantId: string,
  data: InviteMemberData,
  invitedBy: string,
  invitedByName: string
): Promise<TenantInvitation> {
  const validated = inviteMemberSchema.parse(data);
  
  // Check if already a member
  const existingMember = await checkMemberByEmail(tenantId, validated.email);
  if (existingMember) {
    throw new Error('User is already a member of this tenant');
  }
  
  const invitationRef = doc(collection(db, INVITATIONS_COLLECTION));
  const now = Timestamp.now();
  const expiresAt = Timestamp.fromDate(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
  );
  
  const invitation: TenantInvitation = {
    id: invitationRef.id,
    tenantId,
    email: validated.email,
    role: validated.role,
    invitedBy,
    invitedByName,
    status: 'pending',
    createdAt: now,
    expiresAt,
  };
  
  await setDoc(invitationRef, invitation);
  
  logger.info('Invitation created', { tenantId, email: validated.email });
  
  return invitation;
}

/**
 * Check if email is already a member
 */
async function checkMemberByEmail(
  tenantId: string,
  email: string
): Promise<boolean> {
  const q = query(
    collection(db, MEMBERS_COLLECTION),
    where('tenantId', '==', tenantId),
    where('email', '==', email),
    where('isActive', '==', true)
  );
  
  const snapshot = await getDocs(q);
  return !snapshot.empty;
}

/**
 * Get pending invitations for a tenant
 */
export async function getPendingInvitations(
  tenantId: string
): Promise<TenantInvitation[]> {
  const q = query(
    collection(db, INVITATIONS_COLLECTION),
    where('tenantId', '==', tenantId),
    where('status', '==', 'pending')
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data() as TenantInvitation);
}

/**
 * Accept an invitation
 */
export async function acceptInvitation(
  invitationId: string,
  userId: string,
  displayName: string
): Promise<TenantMember> {
  const invitationRef = doc(db, INVITATIONS_COLLECTION, invitationId);
  const invitationSnap = await getDoc(invitationRef);
  
  if (!invitationSnap.exists()) {
    throw new Error('Invitation not found');
  }
  
  const invitation = invitationSnap.data() as TenantInvitation;
  
  if (invitation.status !== 'pending') {
    throw new Error('Invitation is no longer valid');
  }
  
  if (invitation.expiresAt.toDate() < new Date()) {
    throw new Error('Invitation has expired');
  }
  
  // Update invitation status
  await updateDoc(invitationRef, {
    status: 'accepted',
    acceptedAt: serverTimestamp(),
  });
  
  // Add member
  const member = await addTenantMember(
    invitation.tenantId,
    userId,
    invitation.email,
    displayName,
    invitation.role,
    invitation.invitedBy
  );
  
  logger.info('Invitation accepted', { invitationId, userId });
  
  return member;
}

/**
 * Cancel an invitation
 */
export async function cancelInvitation(invitationId: string): Promise<void> {
  const invitationRef = doc(db, INVITATIONS_COLLECTION, invitationId);
  
  await updateDoc(invitationRef, {
    status: 'cancelled',
  });
  
  logger.info('Invitation cancelled', { invitationId });
}
