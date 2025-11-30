/**
 * ZADIA OS - Settings Page
 * 
 * Organization and user settings management
 * REGLA 2: ShadCN UI + Lucide icons
 * REGLA 5: < 200 líneas
 */

'use client';

import { useState } from 'react';
import { useTenant } from '@/contexts/TenantContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { PermissionGate } from '@/modules/permissions/components/PermissionGate';
import { TeamMembersCard } from '@/modules/tenants/components/TeamMembersCard';
import { 
  Settings, Building2, Users, Shield, Bell, 
  CreditCard, Globe, Palette, Lock
} from 'lucide-react';

function SettingsLoading() {
  return (
    <div className="p-6 space-y-6">
      <Skeleton className="h-8 w-48" />
      <div className="grid gap-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const { tenant, membership, loading, isAdmin } = useTenant();
  const [activeTab, setActiveTab] = useState('organization');

  if (loading) {
    return <SettingsLoading />;
  }

  const planColors = {
    free: 'bg-gray-500/20 text-gray-400',
    pro: 'bg-blue-500/20 text-blue-400',
    enterprise: 'bg-purple-500/20 text-purple-400',
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center">
          <Settings className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Configuración</h1>
          <p className="text-sm text-gray-500">
            Gestiona tu organización y preferencias
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-gray-800/50 border border-gray-700/50">
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
          <PermissionGate module="settings" action="manage">
            <TabsTrigger value="roles" className="data-[state=active]:bg-gray-700">
              <Shield className="h-4 w-4 mr-2" />
              Roles
            </TabsTrigger>
          </PermissionGate>
          <TabsTrigger value="notifications" className="data-[state=active]:bg-gray-700">
            <Bell className="h-4 w-4 mr-2" />
            Notificaciones
          </TabsTrigger>
        </TabsList>

        {/* Organization Tab */}
        <TabsContent value="organization" className="mt-6 space-y-6">
          <Card className="bg-gray-800/30 border-gray-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Información de la Organización
              </CardTitle>
              <CardDescription>
                Datos generales de tu empresa
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400">Nombre</label>
                  <p className="text-white font-medium">{tenant?.name || 'Sin nombre'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Plan</label>
                  <div className="mt-1">
                    <Badge className={planColors[tenant?.plan || 'free']}>
                      {tenant?.plan?.toUpperCase() || 'FREE'}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Tu rol</label>
                  <p className="text-white font-medium capitalize">{membership?.role || 'Sin rol'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Zona horaria</label>
                  <p className="text-white font-medium">{tenant?.settings?.timezone || 'UTC'}</p>
                </div>
              </div>

              <PermissionGate module="settings" action="manage">
                <div className="pt-4 border-t border-gray-700/50">
                  <Button variant="outline" className="border-gray-600 hover:bg-gray-700">
                    <Palette className="h-4 w-4 mr-2" />
                    Editar información
                  </Button>
                </div>
              </PermissionGate>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/30 border-gray-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Preferencias Regionales
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm text-gray-400">Moneda</label>
                <p className="text-white font-medium">{tenant?.settings?.currency || 'USD'}</p>
              </div>
              <div>
                <label className="text-sm text-gray-400">Idioma</label>
                <p className="text-white font-medium">{tenant?.settings?.language || 'es'}</p>
              </div>
              <div>
                <label className="text-sm text-gray-400">Formato de fecha</label>
                <p className="text-white font-medium">{tenant?.settings?.dateFormat || 'DD/MM/YYYY'}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Team Tab */}
        <TabsContent value="team" className="mt-6">
          <TeamMembersCard canManage={isAdmin} />
        </TabsContent>

        {/* Roles Tab */}
        <TabsContent value="roles" className="mt-6">
          <Card className="bg-gray-800/30 border-gray-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Roles y Permisos
              </CardTitle>
              <CardDescription>
                Configura los roles y permisos de acceso
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {['owner', 'admin', 'sales', 'accountant', 'hr', 'operations', 'viewer'].map((role) => (
                  <div 
                    key={role}
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-900/50 border border-gray-700/30"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center">
                        <Lock className="h-4 w-4 text-cyan-400" />
                      </div>
                      <div>
                        <p className="text-white font-medium capitalize">{role}</p>
                        <p className="text-xs text-gray-500">Rol del sistema</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="border-gray-600 text-gray-400">
                      Sistema
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="mt-6">
          <Card className="bg-gray-800/30 border-gray-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Preferencias de Notificaciones
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Configuración de notificaciones próximamente</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Billing Section - Only for admins */}
      <PermissionGate module="settings" action="manage">
        <Card className="bg-gray-800/30 border-gray-700/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Facturación y Plan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400">Plan actual</p>
                <p className="text-2xl font-bold text-white capitalize">{tenant?.plan || 'Free'}</p>
              </div>
              <Button className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600">
                Actualizar plan
              </Button>
            </div>
          </CardContent>
        </Card>
      </PermissionGate>
    </div>
  );
}
