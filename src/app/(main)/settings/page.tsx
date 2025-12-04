/**
 * ZADIA OS - Settings Page
 * 
 * Complete organization and user settings management
 * REGLA 2: ShadCN UI + Lucide icons
 * REGLA 5: < 200 líneas
 */

'use client';

import { useState } from 'react';
import { useTenant } from '@/contexts/TenantContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { PermissionGate } from '@/modules/permissions/components/PermissionGate';
import { TeamMembersCard } from '@/modules/tenants/components/TeamMembersCard';
import { OrganizationSettingsCard } from '@/modules/settings/components/OrganizationSettingsCard';
import { NotificationSettingsCard } from '@/modules/settings/components/NotificationSettingsCard';
import { SecuritySettingsCard } from '@/modules/settings/components/SecuritySettingsCard';
import { IntegrationsSettingsCard } from '@/modules/settings/components/IntegrationsSettingsCard';
import { AuditLogsCard } from '@/modules/settings/components/AuditLogsCard';
import { 
  Settings, Building2, Users, Shield, Bell, 
  History, Plug, Lock
} from 'lucide-react';

function SettingsLoading() {
  return (
    <div className="p-6 space-y-6">
      <Skeleton className="h-8 w-48" />
      <div className="grid gap-6">
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const { loading, isAdmin } = useTenant();
  const [activeTab, setActiveTab] = useState('organization');

  if (loading) {
    return <SettingsLoading />;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center">
          <Settings className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Configuración</h1>
          <p className="text-sm text-gray-500">
            Gestiona tu organización, seguridad e integraciones
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-gray-800/50 border border-gray-700/50 flex-wrap h-auto p-1 gap-1">
          <TabsTrigger value="organization" className="data-[state=active]:bg-gray-700">
            <Building2 className="h-4 w-4 mr-2" />
            Organización
          </TabsTrigger>
          <PermissionGate module="settings" action="manage">
            <TabsTrigger value="team" className="data-[state=active]:bg-gray-700">
              <Users className="h-4 w-4 mr-2" />
              Equipo
            </TabsTrigger>
          </PermissionGate>
          <TabsTrigger value="notifications" className="data-[state=active]:bg-gray-700">
            <Bell className="h-4 w-4 mr-2" />
            Notificaciones
          </TabsTrigger>
          <TabsTrigger value="security" className="data-[state=active]:bg-gray-700">
            <Lock className="h-4 w-4 mr-2" />
            Seguridad
          </TabsTrigger>
          <PermissionGate module="settings" action="manage">
            <TabsTrigger value="integrations" className="data-[state=active]:bg-gray-700">
              <Plug className="h-4 w-4 mr-2" />
              Integraciones
            </TabsTrigger>
          </PermissionGate>
          <PermissionGate module="settings" action="manage">
            <TabsTrigger value="roles" className="data-[state=active]:bg-gray-700">
              <Shield className="h-4 w-4 mr-2" />
              Roles
            </TabsTrigger>
          </PermissionGate>
          <PermissionGate module="settings" action="manage">
            <TabsTrigger value="audit" className="data-[state=active]:bg-gray-700">
              <History className="h-4 w-4 mr-2" />
              Auditoría
            </TabsTrigger>
          </PermissionGate>
        </TabsList>

        {/* Organization Tab */}
        <TabsContent value="organization" className="mt-6">
          <OrganizationSettingsCard />
        </TabsContent>

        {/* Team Tab */}
        <TabsContent value="team" className="mt-6">
          <TeamMembersCard canManage={isAdmin} />
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="mt-6">
          <NotificationSettingsCard />
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="mt-6">
          <SecuritySettingsCard />
        </TabsContent>

        {/* Integrations Tab */}
        <TabsContent value="integrations" className="mt-6">
          <IntegrationsSettingsCard />
        </TabsContent>

        {/* Roles Tab */}
        <TabsContent value="roles" className="mt-6">
          <RolesSettingsCard />
        </TabsContent>

        {/* Audit Tab */}
        <TabsContent value="audit" className="mt-6">
          <AuditLogsCard />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Roles Card Component (inline for simplicity)
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Edit2, Trash2, Check } from 'lucide-react';

const SYSTEM_ROLES = [
  { 
    id: 'owner', 
    name: 'Propietario', 
    description: 'Acceso total al sistema', 
    permissions: ['all'],
    isSystem: true,
    color: 'bg-amber-500/20 text-amber-400 border-amber-500/30'
  },
  { 
    id: 'admin', 
    name: 'Administrador', 
    description: 'Gestión de usuarios y configuración', 
    permissions: ['settings', 'users', 'roles'],
    isSystem: true,
    color: 'bg-purple-500/20 text-purple-400 border-purple-500/30'
  },
  { 
    id: 'sales', 
    name: 'Ventas', 
    description: 'CRM, leads, oportunidades, cotizaciones', 
    permissions: ['crm', 'sales', 'quotes'],
    isSystem: true,
    color: 'bg-green-500/20 text-green-400 border-green-500/30'
  },
  { 
    id: 'accountant', 
    name: 'Contabilidad', 
    description: 'Facturas, pagos, reportes financieros', 
    permissions: ['finance', 'invoices', 'payments', 'reports'],
    isSystem: true,
    color: 'bg-blue-500/20 text-blue-400 border-blue-500/30'
  },
  { 
    id: 'hr', 
    name: 'Recursos Humanos', 
    description: 'Empleados, nómina, asistencia', 
    permissions: ['hr', 'employees', 'payroll'],
    isSystem: true,
    color: 'bg-pink-500/20 text-pink-400 border-pink-500/30'
  },
  { 
    id: 'operations', 
    name: 'Operaciones', 
    description: 'Proyectos, inventario, órdenes de trabajo', 
    permissions: ['projects', 'inventory', 'work-orders'],
    isSystem: true,
    color: 'bg-orange-500/20 text-orange-400 border-orange-500/30'
  },
  { 
    id: 'viewer', 
    name: 'Solo Lectura', 
    description: 'Visualización sin edición', 
    permissions: ['read'],
    isSystem: true,
    color: 'bg-gray-500/20 text-gray-400 border-gray-500/30'
  },
];

function RolesSettingsCard() {
  return (
    <Card className="bg-gray-800/30 border-gray-700/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-700 flex items-center justify-center">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-white">Roles y Permisos</CardTitle>
              <CardDescription>
                Configura los roles y permisos de acceso al sistema
              </CardDescription>
            </div>
          </div>
          <Button className="bg-cyan-600 hover:bg-cyan-700">
            <Plus className="h-4 w-4 mr-2" />
            Crear Rol
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {SYSTEM_ROLES.map((role) => (
            <div 
              key={role.id}
              className="flex items-center justify-between p-4 rounded-lg bg-gray-900/50 border border-gray-700/30 hover:border-gray-600/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-cyan-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-white font-medium">{role.name}</p>
                    {role.isSystem && (
                      <Badge variant="outline" className="border-gray-600 text-gray-400 text-xs">
                        Sistema
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">{role.description}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {role.permissions.slice(0, 4).map((perm) => (
                      <span 
                        key={perm} 
                        className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-gray-800 text-gray-400"
                      >
                        <Check className="h-3 w-3 text-green-400" />
                        {perm}
                      </span>
                    ))}
                    {role.permissions.length > 4 && (
                      <span className="text-xs text-gray-500">
                        +{role.permissions.length - 4} más
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={role.color}>
                  {role.name}
                </Badge>
                {!role.isSystem && (
                  <>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-white">
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-300">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
