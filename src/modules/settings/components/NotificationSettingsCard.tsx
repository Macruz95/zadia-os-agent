/**
 * ZADIA OS - Notification Settings Card
 * 
 * Comprehensive notification preferences management
 * REGLA 1: Real Firebase data
 * REGLA 2: ShadCN UI + Lucide icons
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Bell, 
  Mail, 
  Smartphone, 
  MessageSquare,
  BellRing,
  BellOff,
  Clock,
  Calendar,
  DollarSign,
  Users,
  Package,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Save,
  Loader2,
  Volume2,
  VolumeX,
  Monitor
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useTenant } from '@/contexts/TenantContext';
import { 
  getNotificationPreferences, 
  updateNotificationPreferences
} from '@/services/settings.service';
import { logger } from '@/lib/logger';

interface NotificationCategory {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  email: boolean;
  push: boolean;
  inApp: boolean;
}

const defaultCategories: NotificationCategory[] = [
  {
    id: 'sales',
    label: 'Ventas y CRM',
    description: 'Nuevos leads, oportunidades, cotizaciones',
    icon: <DollarSign className="h-4 w-4" />,
    email: true,
    push: true,
    inApp: true,
  },
  {
    id: 'invoices',
    label: 'Facturación',
    description: 'Facturas, pagos, vencimientos',
    icon: <FileText className="h-4 w-4" />,
    email: true,
    push: true,
    inApp: true,
  },
  {
    id: 'projects',
    label: 'Proyectos',
    description: 'Tareas, hitos, actualizaciones',
    icon: <Calendar className="h-4 w-4" />,
    email: true,
    push: false,
    inApp: true,
  },
  {
    id: 'inventory',
    label: 'Inventario',
    description: 'Stock bajo, movimientos, alertas',
    icon: <Package className="h-4 w-4" />,
    email: true,
    push: true,
    inApp: true,
  },
  {
    id: 'team',
    label: 'Equipo',
    description: 'Nuevos miembros, menciones, asignaciones',
    icon: <Users className="h-4 w-4" />,
    email: false,
    push: true,
    inApp: true,
  },
  {
    id: 'system',
    label: 'Sistema',
    description: 'Actualizaciones, mantenimiento, seguridad',
    icon: <AlertTriangle className="h-4 w-4" />,
    email: true,
    push: false,
    inApp: true,
  },
];

export function NotificationSettingsCard() {
  const { user } = useAuth();
  const { tenant } = useTenant();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [categories, setCategories] = useState<NotificationCategory[]>(defaultCategories);
  
  // Global settings
  const [globalSettings, setGlobalSettings] = useState({
    enableAll: true,
    soundEnabled: true,
    quietHoursEnabled: false,
    quietHoursStart: '22:00',
    quietHoursEnd: '08:00',
    digestFrequency: 'instant' as 'instant' | 'hourly' | 'daily' | 'weekly' | 'never',
    desktopNotifications: true,
  });

  // Load preferences from Firebase on mount
  useEffect(() => {
    async function loadPreferences() {
      if (!tenant?.id || !user?.uid) {
        setIsLoading(false);
        return;
      }
      
      try {
        const preferences = await getNotificationPreferences(tenant.id, user.uid);
        
        if (preferences) {
          // Load global settings
          setGlobalSettings({
            enableAll: preferences.enableAll ?? true,
            soundEnabled: preferences.soundEnabled ?? true,
            quietHoursEnabled: preferences.quietHoursEnabled ?? false,
            quietHoursStart: preferences.quietHoursStart ?? '22:00',
            quietHoursEnd: preferences.quietHoursEnd ?? '08:00',
            digestFrequency: preferences.digestFrequency ?? 'instant',
            desktopNotifications: preferences.desktopNotifications ?? true,
          });
          
          // Load category preferences
          if (preferences.categories) {
            setCategories(prev => 
              prev.map(cat => ({
                ...cat,
                email: preferences.categories?.[cat.id]?.email ?? cat.email,
                push: preferences.categories?.[cat.id]?.push ?? cat.push,
                inApp: preferences.categories?.[cat.id]?.inApp ?? cat.inApp,
              }))
            );
          }
        }
        logger.info('Notification preferences loaded');
      } catch (err) {
        logger.error('Error loading notification preferences', err instanceof Error ? err : undefined);
        toast.error('Error al cargar las preferencias');
      } finally {
        setIsLoading(false);
      }
    }
    
    loadPreferences();
  }, [tenant?.id, user?.uid]);

  const handleCategoryChange = (
    categoryId: string, 
    channel: 'email' | 'push' | 'inApp', 
    value: boolean
  ) => {
    setCategories(prev => 
      prev.map(cat => 
        cat.id === categoryId 
          ? { ...cat, [channel]: value }
          : cat
      )
    );
  };

  const handleSave = async () => {
    if (!tenant?.id || !user?.uid) {
      toast.error('Sesión no válida');
      return;
    }
    
    setIsSaving(true);
    try {
      // Convert categories to object format for Firestore
      const categoriesObj: { [key: string]: { email: boolean; push: boolean; inApp: boolean } } = {};
      categories.forEach(cat => {
        categoriesObj[cat.id] = {
          email: cat.email,
          push: cat.push,
          inApp: cat.inApp,
        };
      });
      
      await updateNotificationPreferences(tenant.id, user.uid, {
        ...globalSettings,
        categories: categoriesObj,
      });
      
      logger.info('Notification preferences saved');
      toast.success('Preferencias de notificaciones guardadas');
    } catch (err) {
      logger.error('Error saving notification preferences', err instanceof Error ? err : undefined);
      toast.error('Error al guardar las preferencias');
    } finally {
      setIsSaving(false);
    }
  };

  const enableAllNotifications = () => {
    setCategories(prev => 
      prev.map(cat => ({ ...cat, email: true, push: true, inApp: true }))
    );
    setGlobalSettings(prev => ({ ...prev, enableAll: true }));
  };

  const disableAllNotifications = () => {
    setCategories(prev => 
      prev.map(cat => ({ ...cat, email: false, push: false, inApp: false }))
    );
    setGlobalSettings(prev => ({ ...prev, enableAll: false }));
  };

  return (
    <div className="space-y-6">
      {/* Loading State */}
      {isLoading && (
        <div className="space-y-4">
          <Skeleton className="h-[200px] w-full bg-gray-700/50" />
          <Skeleton className="h-[300px] w-full bg-gray-700/50" />
        </div>
      )}
      
      {!isLoading && (
        <>
      {/* Global Controls */}
      <Card className="bg-gray-800/30 border-gray-700/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-600 to-orange-700 flex items-center justify-center">
                <Bell className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-white">Preferencias de Notificaciones</CardTitle>
                <CardDescription>Configura cómo y cuándo recibir notificaciones</CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={disableAllNotifications}
                className="border-gray-600 hover:bg-gray-700"
              >
                <BellOff className="h-4 w-4 mr-2" />
                Silenciar todo
              </Button>
              <Button 
                size="sm"
                onClick={enableAllNotifications}
                className="bg-cyan-600 hover:bg-cyan-700"
              >
                <BellRing className="h-4 w-4 mr-2" />
                Activar todo
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Quick Settings */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-gray-900/30 border border-gray-700/30">
              <div className="flex items-center gap-3">
                {globalSettings.soundEnabled ? (
                  <Volume2 className="h-5 w-5 text-cyan-400" />
                ) : (
                  <VolumeX className="h-5 w-5 text-gray-500" />
                )}
                <div>
                  <p className="text-white font-medium text-sm">Sonidos</p>
                  <p className="text-xs text-gray-500">Alertas sonoras</p>
                </div>
              </div>
              <Switch
                checked={globalSettings.soundEnabled}
                onCheckedChange={(v) => setGlobalSettings(prev => ({ ...prev, soundEnabled: v }))}
              />
            </div>
            
            <div className="flex items-center justify-between p-4 rounded-lg bg-gray-900/30 border border-gray-700/30">
              <div className="flex items-center gap-3">
                <Monitor className={`h-5 w-5 ${globalSettings.desktopNotifications ? 'text-cyan-400' : 'text-gray-500'}`} />
                <div>
                  <p className="text-white font-medium text-sm">Escritorio</p>
                  <p className="text-xs text-gray-500">Notificaciones del navegador</p>
                </div>
              </div>
              <Switch
                checked={globalSettings.desktopNotifications}
                onCheckedChange={(v) => setGlobalSettings(prev => ({ ...prev, desktopNotifications: v }))}
              />
            </div>
            
            <div className="flex items-center justify-between p-4 rounded-lg bg-gray-900/30 border border-gray-700/30">
              <div className="flex items-center gap-3">
                <Clock className={`h-5 w-5 ${globalSettings.quietHoursEnabled ? 'text-cyan-400' : 'text-gray-500'}`} />
                <div>
                  <p className="text-white font-medium text-sm">Horas silenciosas</p>
                  <p className="text-xs text-gray-500">{globalSettings.quietHoursStart} - {globalSettings.quietHoursEnd}</p>
                </div>
              </div>
              <Switch
                checked={globalSettings.quietHoursEnabled}
                onCheckedChange={(v) => setGlobalSettings(prev => ({ ...prev, quietHoursEnabled: v }))}
              />
            </div>
          </div>

          {/* Digest Frequency */}
          <div className="p-4 rounded-lg bg-gray-900/30 border border-gray-700/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-cyan-400" />
                <div>
                  <p className="text-white font-medium">Resumen por Email</p>
                  <p className="text-sm text-gray-500">Frecuencia de envío de resumen de actividad</p>
                </div>
              </div>
              <Select 
                value={globalSettings.digestFrequency}
                onValueChange={(v) => setGlobalSettings(prev => ({ 
                  ...prev, 
                  digestFrequency: v as 'instant' | 'hourly' | 'daily' | 'weekly' | 'never' 
                }))}
              >
                <SelectTrigger className="w-40 bg-gray-800 border-gray-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="instant">Inmediato</SelectItem>
                  <SelectItem value="hourly">Cada hora</SelectItem>
                  <SelectItem value="daily">Diario</SelectItem>
                  <SelectItem value="weekly">Semanal</SelectItem>
                  <SelectItem value="never">Nunca</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Categories */}
      <Card className="bg-gray-800/30 border-gray-700/50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center">
              <MessageSquare className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-white">Categorías de Notificaciones</CardTitle>
              <CardDescription>Personaliza las notificaciones por módulo</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Header */}
          <div className="grid grid-cols-[1fr,80px,80px,80px] gap-4 mb-4 px-4">
            <div className="text-sm font-medium text-gray-400">Categoría</div>
            <div className="text-sm font-medium text-gray-400 text-center flex items-center justify-center gap-1">
              <Mail className="h-3.5 w-3.5" />
              Email
            </div>
            <div className="text-sm font-medium text-gray-400 text-center flex items-center justify-center gap-1">
              <Smartphone className="h-3.5 w-3.5" />
              Push
            </div>
            <div className="text-sm font-medium text-gray-400 text-center flex items-center justify-center gap-1">
              <Bell className="h-3.5 w-3.5" />
              In-App
            </div>
          </div>
          
          <Separator className="bg-gray-700 mb-4" />
          
          {/* Categories */}
          <div className="space-y-2">
            {categories.map((category) => (
              <div 
                key={category.id}
                className="grid grid-cols-[1fr,80px,80px,80px] gap-4 items-center p-4 rounded-lg bg-gray-900/30 border border-gray-700/30 hover:border-gray-600/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-cyan-400">
                    {category.icon}
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">{category.label}</p>
                    <p className="text-xs text-gray-500">{category.description}</p>
                  </div>
                </div>
                
                <div className="flex justify-center">
                  <Switch
                    checked={category.email}
                    onCheckedChange={(v) => handleCategoryChange(category.id, 'email', v)}
                  />
                </div>
                
                <div className="flex justify-center">
                  <Switch
                    checked={category.push}
                    onCheckedChange={(v) => handleCategoryChange(category.id, 'push', v)}
                  />
                </div>
                
                <div className="flex justify-center">
                  <Switch
                    checked={category.inApp}
                    onCheckedChange={(v) => handleCategoryChange(category.id, 'inApp', v)}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Push Notification Status */}
      <Card className="bg-gray-800/30 border-gray-700/50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-600 to-emerald-700 flex items-center justify-center">
              <Smartphone className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-white">Notificaciones Push</CardTitle>
              <CardDescription>Estado de las notificaciones en tus dispositivos</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 rounded-lg bg-gray-900/30 border border-gray-700/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center">
                  <Monitor className="h-5 w-5 text-gray-400" />
                </div>
                <div>
                  <p className="text-white font-medium">Este navegador</p>
                  <p className="text-xs text-gray-500">Chrome en Windows</p>
                </div>
              </div>
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Activo
              </Badge>
            </div>
            
            <div className="text-center py-4">
              <Button 
                variant="outline" 
                className="border-gray-600 hover:bg-gray-700"
              >
                <Smartphone className="h-4 w-4 mr-2" />
                Registrar nuevo dispositivo
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button 
          onClick={handleSave}
          disabled={isSaving}
          className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Guardar preferencias
            </>
          )}
        </Button>
      </div>
        </>
      )}
    </div>
  );
}
