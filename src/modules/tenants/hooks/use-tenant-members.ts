'use client';

import { useState, useEffect, useCallback } from 'react';
import { logger } from '@/lib/logger';
import { TenantMember, TenantInvitation, TenantRole, InviteMemberData } from '../types';
import {
  getTenantMembers,
  getPendingInvitations,
  createInvitation,
  updateMemberRole,
  removeTenantMember,
  cancelInvitation,
} from '../services/tenant-member.service';
import { useAuth } from '@/contexts/AuthContext';

interface UseTenantMembersReturn {
  members: TenantMember[];
  invitations: TenantInvitation[];
  loading: boolean;
  error: string | null;
  inviteMember: (data: InviteMemberData) => Promise<TenantInvitation>;
  updateRole: (userId: string, role: TenantRole) => Promise<void>;
  removeMember: (userId: string) => Promise<void>;
  cancelMemberInvitation: (invitationId: string) => Promise<void>;
  refreshMembers: () => Promise<void>;
}

/**
 * Hook for managing tenant members
 */
export function useTenantMembers(tenantId: string | null): UseTenantMembersReturn {
  const { user } = useAuth();
  const [members, setMembers] = useState<TenantMember[]>([]);
  const [invitations, setInvitations] = useState<TenantInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load members and invitations
  const loadMembers = useCallback(async () => {
    if (!tenantId) {
      setMembers([]);
      setInvitations([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const [membersData, invitationsData] = await Promise.all([
        getTenantMembers(tenantId),
        getPendingInvitations(tenantId),
      ]);
      
      setMembers(membersData);
      setInvitations(invitationsData);
    } catch (err) {
      setError('Error loading members');
      logger.error('Error loading members', err instanceof Error ? err : undefined);
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  // Initial load
  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  // Invite member
  const inviteMember = useCallback(async (data: InviteMemberData): Promise<TenantInvitation> => {
    if (!tenantId || !user) {
      throw new Error('Invalid state');
    }

    const invitation = await createInvitation(
      tenantId,
      data,
      user.uid,
      user.displayName
    );
    
    await loadMembers();
    
    return invitation;
  }, [tenantId, user, loadMembers]);

  // Update role
  const updateRole = useCallback(async (userId: string, role: TenantRole): Promise<void> => {
    if (!tenantId) {
      throw new Error('No tenant selected');
    }

    await updateMemberRole(tenantId, userId, role);
    await loadMembers();
  }, [tenantId, loadMembers]);

  // Remove member
  const removeMember = useCallback(async (userId: string): Promise<void> => {
    if (!tenantId) {
      throw new Error('No tenant selected');
    }

    await removeTenantMember(tenantId, userId);
    await loadMembers();
  }, [tenantId, loadMembers]);

  // Cancel invitation
  const cancelMemberInvitation = useCallback(async (invitationId: string): Promise<void> => {
    await cancelInvitation(invitationId);
    await loadMembers();
  }, [loadMembers]);

  return {
    members,
    invitations,
    loading,
    error,
    inviteMember,
    updateRole,
    removeMember,
    cancelMemberInvitation,
    refreshMembers: loadMembers,
  };
}
