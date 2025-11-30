/**
 * ZADIA OS - Team Members Card
 * 
 * Displays and manages team members for a tenant
 * REGLA 2: ShadCN UI + Lucide icons
 * REGLA 5: < 200 líneas
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Users, UserPlus, MoreVertical, Shield, 
  Mail, Trash2, Crown, AlertCircle 
} from 'lucide-react';
import { useTenant } from '@/contexts/TenantContext';
import { getTenantMembers } from '@/modules/tenants/services/tenant-member.service';
import type { TenantMember } from '@/modules/tenants/types/tenant.types';
import { InviteMemberDialog } from './InviteMemberDialog';

const ROLE_LABELS: Record<string, string> = {
  owner: 'Propietario',
  admin: 'Administrador',
  manager: 'Gerente',
  member: 'Miembro',
  viewer: 'Solo lectura',
};

const ROLE_COLORS: Record<string, string> = {
  owner: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  admin: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  manager: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  member: 'bg-green-500/20 text-green-400 border-green-500/30',
  viewer: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
};

interface TeamMembersCardProps {
  canManage?: boolean;
}

export function TeamMembersCard({ canManage = false }: TeamMembersCardProps) {
  const { tenant, membership } = useTenant();
  const [members, setMembers] = useState<TenantMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInviteDialog, setShowInviteDialog] = useState(false);

  useEffect(() => {
    async function loadMembers() {
      if (!tenant?.id) {
        setLoading(false);
        return;
      }

      try {
        const tenantMembers = await getTenantMembers(tenant.id);
        setMembers(tenantMembers);
      } catch (error) {
        console.error('Failed to load members:', error);
      } finally {
        setLoading(false);
      }
    }

    loadMembers();
  }, [tenant?.id]);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <Card className="bg-gray-800/30 border-gray-700/50">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48 mt-1" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="bg-gray-800/30 border-gray-700/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white flex items-center gap-2">
                <Users className="h-5 w-5" />
                Miembros del Equipo
              </CardTitle>
              <CardDescription>
                {members.length} miembro{members.length !== 1 ? 's' : ''} en la organización
              </CardDescription>
            </div>
            {canManage && (
              <Button 
                onClick={() => setShowInviteDialog(true)}
                className="bg-cyan-600 hover:bg-cyan-700"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Invitar
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {members.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay miembros en este equipo</p>
              {canManage && (
                <Button 
                  variant="outline" 
                  className="mt-4 border-gray-600"
                  onClick={() => setShowInviteDialog(true)}
                >
                  Invitar primer miembro
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {members.map((member) => (
                <div 
                  key={member.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-gray-900/50 border border-gray-700/30 hover:border-gray-600/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 text-cyan-400">
                        {getInitials(member.displayName)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-white font-medium">{member.displayName}</p>
                        {member.role === 'owner' && (
                          <Crown className="h-4 w-4 text-amber-400" />
                        )}
                      </div>
                      <p className="text-sm text-gray-500">{member.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Badge 
                      variant="outline" 
                      className={ROLE_COLORS[member.role] || ROLE_COLORS.member}
                    >
                      {ROLE_LABELS[member.role] || member.role}
                    </Badge>
                    
                    {canManage && member.userId !== membership?.userId && member.role !== 'owner' && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4 text-gray-400" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent 
                          align="end" 
                          className="bg-gray-800 border-gray-700"
                        >
                          <DropdownMenuItem className="text-gray-300 hover:text-white">
                            <Shield className="h-4 w-4 mr-2" />
                            Cambiar rol
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-gray-300 hover:text-white">
                            <Mail className="h-4 w-4 mr-2" />
                            Enviar mensaje
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-gray-700" />
                          <DropdownMenuItem className="text-red-400 hover:text-red-300">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Remover
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <InviteMemberDialog 
        open={showInviteDialog} 
        onOpenChange={setShowInviteDialog}
        onInviteSent={() => {
          // Reload members after invite
          if (tenant?.id) {
            getTenantMembers(tenant.id).then(setMembers);
          }
        }}
      />
    </>
  );
}
