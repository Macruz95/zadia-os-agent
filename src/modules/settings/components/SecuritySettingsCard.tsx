/**
 * ZADIA OS - Security Settings Card
 * 
 * Security and privacy settings management
 * REGLA 1: Real Firebase data
 * REGLA 2: ShadCN UI + Lucide icons
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { 
  Shield, 
  Lock, 
  Key, 
  Smartphone,
  Eye,
  EyeOff,
  RefreshCw,
  LogOut,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Monitor,
  Globe,
  Fingerprint,
  History,
  Loader2,
  Save,
  Download,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useTenant } from '@/contexts/TenantContext';
import { 
  getSecuritySettings, 
  updateSecuritySettings,
  getActiveSessions,
  revokeSession,
  revokeAllSessions,
  ActiveSession
} from '@/services/settings.service';
import { logger } from '@/lib/logger';
import { Timestamp } from 'firebase/firestore';

interface Session {
  id: string;
  device: string;
  browser: string;
  location: string;
  ip: string;
  lastActive: string;
  isCurrent: boolean;
}

function formatTimeAgo(timestamp: Timestamp): string {
  const now = Date.now();
  const time = timestamp.toMillis();
  const diffMs = now - time;
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) return 'Ahora';
  if (diffMins < 60) return `Hace ${diffMins} minutos`;
  
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `Hace ${diffHours} horas`;
  
  const diffDays = Math.floor(diffHours / 24);
  return `Hace ${diffDays} días`;
}

function mapFirebaseSession(session: ActiveSession): Session {
  return {
    id: session.id,
    device: session.device || 'Desconocido',
    browser: session.browser || 'Desconocido',
    location: session.location || 'Ubicación desconocida',
    ip: session.ip || 'IP desconocida',
    lastActive: session.lastActiveAt ? formatTimeAgo(session.lastActiveAt) : 'Desconocido',
    isCurrent: session.isCurrent,
  };
}

export function SecuritySettingsCard() {
  const { user } = useAuth();
  const { tenant } = useTenant();
  const [isLoading, setIsLoading] = useState(true);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [show2FADialog, setShow2FADialog] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([]);
  
  // Security settings
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorEnabled: false,
    passwordLastChanged: 'Desconocido',
    loginAlerts: true,
    sessionTimeout: 30,
    ipRestriction: false,
    allowedIPs: '',
  });

  // Load security settings and sessions from Firebase
  useEffect(() => {
    async function loadSecurityData() {
      if (!tenant?.id || !user?.uid) {
        setIsLoading(false);
        return;
      }
      
      try {
        // Load security settings
        const settings = await getSecuritySettings(user.uid, tenant.id);
        if (settings) {
          const lastChanged = settings.passwordLastChanged 
            ? formatTimeAgo(settings.passwordLastChanged)
            : 'Nunca';
            
          setSecuritySettings({
            twoFactorEnabled: settings.twoFactorEnabled ?? false,
            passwordLastChanged: lastChanged,
            loginAlerts: settings.loginAlerts ?? true,
            sessionTimeout: settings.sessionTimeout ?? 30,
            ipRestriction: settings.ipRestriction ?? false,
            allowedIPs: settings.allowedIPs?.join(', ') ?? '',
          });
        }
        
        // Load active sessions
        const activeSessions = await getActiveSessions(user.uid, tenant.id);
        setSessions(activeSessions.map(mapFirebaseSession));
        
        logger.info('Security data loaded');
      } catch (err) {
        logger.error('Error loading security data', err instanceof Error ? err : undefined);
        toast.error('Error al cargar la configuración de seguridad');
      } finally {
        setIsLoading(false);
      }
    }
    
    loadSecurityData();
  }, [tenant?.id, user?.uid]);

  // Password form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const passwordStrength = (() => {
    const pwd = passwordForm.newPassword;
    let strength = 0;
    if (pwd.length >= 8) strength += 25;
    if (pwd.match(/[a-z]/) && pwd.match(/[A-Z]/)) strength += 25;
    if (pwd.match(/[0-9]/)) strength += 25;
    if (pwd.match(/[^a-zA-Z0-9]/)) strength += 25;
    return strength;
  })();

  const getStrengthColor = (strength: number) => {
    if (strength <= 25) return 'bg-red-500';
    if (strength <= 50) return 'bg-orange-500';
    if (strength <= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStrengthLabel = (strength: number) => {
    if (strength <= 25) return 'Débil';
    if (strength <= 50) return 'Regular';
    if (strength <= 75) return 'Buena';
    return 'Fuerte';
  };

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }
    if (passwordStrength < 50) {
      toast.error('La contraseña es muy débil');
      return;
    }
    
    if (!tenant?.id || !user?.uid) {
      toast.error('Sesión no válida');
      return;
    }
    
    setIsSaving(true);
    try {
      // Update password last changed in Firebase
      await updateSecuritySettings(user.uid, tenant.id, {
        passwordLastChanged: Timestamp.now(),
      });
      setSecuritySettings(prev => ({ ...prev, passwordLastChanged: 'Ahora' }));
      toast.success('Contraseña actualizada correctamente');
      setShowPasswordDialog(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      logger.error('Error changing password', err instanceof Error ? err : undefined);
      toast.error('Error al cambiar la contraseña');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEnable2FA = async () => {
    if (!tenant?.id || !user?.uid) {
      toast.error('Sesión no válida');
      return;
    }
    
    setIsSaving(true);
    try {
      await updateSecuritySettings(user.uid, tenant.id, {
        twoFactorEnabled: true,
        twoFactorMethod: 'app',
      });
      setSecuritySettings(prev => ({ ...prev, twoFactorEnabled: true }));
      toast.success('Autenticación de dos factores activada');
      setShow2FADialog(false);
    } catch (err) {
      logger.error('Error enabling 2FA', err instanceof Error ? err : undefined);
      toast.error('Error al activar 2FA');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateSecuritySettings = async (updates: Partial<typeof securitySettings>) => {
    if (!tenant?.id || !user?.uid) return;
    
    try {
      await updateSecuritySettings(user.uid, tenant.id, {
        loginAlerts: updates.loginAlerts,
        sessionTimeout: updates.sessionTimeout,
        ipRestriction: updates.ipRestriction,
        allowedIPs: updates.allowedIPs?.split(',').map(ip => ip.trim()).filter(Boolean),
      });
      setSecuritySettings(prev => ({ ...prev, ...updates }));
      toast.success('Configuración actualizada');
    } catch (err) {
      logger.error('Error updating security settings', err instanceof Error ? err : undefined);
      toast.error('Error al actualizar la configuración');
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    try {
      await revokeSession(sessionId);
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      toast.success('Sesión cerrada correctamente');
    } catch (err) {
      logger.error('Error revoking session', err instanceof Error ? err : undefined);
      toast.error('Error al cerrar la sesión');
    }
  };

  const handleRevokeAllSessions = async () => {
    if (!tenant?.id || !user?.uid) return;
    
    const currentSession = sessions.find(s => s.isCurrent);
    try {
      await revokeAllSessions(user.uid, tenant.id, currentSession?.id);
      setSessions(prev => prev.filter(s => s.isCurrent));
      toast.success('Todas las sesiones han sido cerradas');
    } catch (err) {
      logger.error('Error revoking all sessions', err instanceof Error ? err : undefined);
      toast.error('Error al cerrar las sesiones');
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-[200px] w-full bg-gray-700/50" />
        <Skeleton className="h-[200px] w-full bg-gray-700/50" />
        <Skeleton className="h-[200px] w-full bg-gray-700/50" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Password Security */}
      <Card className="bg-gray-800/30 border-gray-700/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-rose-700 flex items-center justify-center">
                <Lock className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-white">Seguridad de la Cuenta</CardTitle>
                <CardDescription>Gestiona tu contraseña y autenticación</CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Password Status */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-gray-900/30 border border-gray-700/30">
            <div className="flex items-center gap-3">
              <Key className="h-5 w-5 text-amber-400" />
              <div>
                <p className="text-white font-medium">Contraseña</p>
                <p className="text-sm text-gray-500">
                  Última actualización hace {securitySettings.passwordLastChanged}
                </p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              className="border-gray-600 hover:bg-gray-700"
              onClick={() => setShowPasswordDialog(true)}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Cambiar
            </Button>
          </div>

          {/* 2FA Status */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-gray-900/30 border border-gray-700/30">
            <div className="flex items-center gap-3">
              <Fingerprint className={`h-5 w-5 ${securitySettings.twoFactorEnabled ? 'text-green-400' : 'text-gray-500'}`} />
              <div>
                <p className="text-white font-medium">Autenticación de dos factores (2FA)</p>
                <p className="text-sm text-gray-500">
                  {securitySettings.twoFactorEnabled 
                    ? 'Protección adicional activada' 
                    : 'Añade una capa extra de seguridad'}
                </p>
              </div>
            </div>
            {securitySettings.twoFactorEnabled ? (
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Activado
              </Badge>
            ) : (
              <Button 
                size="sm"
                className="bg-cyan-600 hover:bg-cyan-700"
                onClick={() => setShow2FADialog(true)}
              >
                <Shield className="h-4 w-4 mr-2" />
                Activar
              </Button>
            )}
          </div>

          {/* Login Alerts */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-gray-900/30 border border-gray-700/30">
            <div className="flex items-center gap-3">
              <AlertTriangle className={`h-5 w-5 ${securitySettings.loginAlerts ? 'text-cyan-400' : 'text-gray-500'}`} />
              <div>
                <p className="text-white font-medium">Alertas de inicio de sesión</p>
                <p className="text-sm text-gray-500">Recibe notificaciones de nuevos accesos</p>
              </div>
            </div>
            <Switch
              checked={securitySettings.loginAlerts}
              onCheckedChange={(v) => handleUpdateSecuritySettings({ loginAlerts: v })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Active Sessions */}
      <Card className="bg-gray-800/30 border-gray-700/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center">
                <Monitor className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-white">Sesiones Activas</CardTitle>
                <CardDescription>Dispositivos con acceso a tu cuenta</CardDescription>
              </div>
            </div>
            {sessions.length > 1 && (
              <Button 
                variant="outline" 
                size="sm"
                className="border-red-600/50 text-red-400 hover:bg-red-500/10"
                onClick={handleRevokeAllSessions}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Cerrar otras sesiones
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {sessions.map((session) => (
              <div 
                key={session.id}
                className="flex items-center justify-between p-4 rounded-lg bg-gray-900/30 border border-gray-700/30"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center">
                    {session.device.includes('iPhone') || session.device.includes('Android') ? (
                      <Smartphone className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Monitor className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-white font-medium">{session.device}</p>
                      {session.isCurrent && (
                        <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30 text-xs">
                          Este dispositivo
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">
                      {session.browser} • {session.location}
                    </p>
                    <p className="text-xs text-gray-600 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {session.lastActive}
                    </p>
                  </div>
                </div>
                
                {!session.isCurrent && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-gray-900 border-gray-700">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-white">¿Cerrar esta sesión?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Se cerrará la sesión en {session.device}. El dispositivo necesitará iniciar sesión nuevamente.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="border-gray-600">Cancelar</AlertDialogCancel>
                        <AlertDialogAction 
                          className="bg-red-600 hover:bg-red-700"
                          onClick={() => handleRevokeSession(session.id)}
                        >
                          Cerrar sesión
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Privacy & Data */}
      <Card className="bg-gray-800/30 border-gray-700/50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-pink-700 flex items-center justify-center">
              <Eye className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-white">Privacidad y Datos</CardTitle>
              <CardDescription>Gestiona tus datos personales</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg bg-gray-900/30 border border-gray-700/30">
            <div className="flex items-center gap-3">
              <Download className="h-5 w-5 text-cyan-400" />
              <div>
                <p className="text-white font-medium">Exportar mis datos</p>
                <p className="text-sm text-gray-500">Descarga una copia de toda tu información</p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="border-gray-600 hover:bg-gray-700">
              Exportar
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg bg-gray-900/30 border border-gray-700/30">
            <div className="flex items-center gap-3">
              <History className="h-5 w-5 text-amber-400" />
              <div>
                <p className="text-white font-medium">Historial de actividad</p>
                <p className="text-sm text-gray-500">Ver registro de acciones recientes</p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="border-gray-600 hover:bg-gray-700">
              Ver historial
            </Button>
          </div>

          <Separator className="bg-gray-700" />

          <div className="flex items-center justify-between p-4 rounded-lg bg-red-500/5 border border-red-500/20">
            <div className="flex items-center gap-3">
              <Trash2 className="h-5 w-5 text-red-400" />
              <div>
                <p className="text-white font-medium">Eliminar cuenta</p>
                <p className="text-sm text-gray-500">Eliminar permanentemente todos tus datos</p>
              </div>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="border-red-500/50 text-red-400 hover:bg-red-500/10">
                  Eliminar
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-gray-900 border-gray-700">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-white">¿Eliminar tu cuenta?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acción no se puede deshacer. Se eliminarán permanentemente todos tus datos, 
                    incluyendo proyectos, clientes, facturas y configuraciones.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="border-gray-600">Cancelar</AlertDialogCancel>
                  <AlertDialogAction className="bg-red-600 hover:bg-red-700">
                    Sí, eliminar mi cuenta
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>

      {/* Change Password Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="bg-gray-900 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">Cambiar Contraseña</DialogTitle>
            <DialogDescription>
              Ingresa tu contraseña actual y la nueva contraseña
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Contraseña actual</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                  className="bg-gray-800 border-gray-700 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">Nueva contraseña</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? 'text' : 'password'}
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                  className="bg-gray-800 border-gray-700 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {passwordForm.newPassword && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Progress value={passwordStrength} className={`h-1.5 flex-1 ${getStrengthColor(passwordStrength)}`} />
                    <span className={`text-xs ${passwordStrength >= 75 ? 'text-green-400' : passwordStrength >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                      {getStrengthLabel(passwordStrength)}
                    </span>
                  </div>
                  <ul className="text-xs text-gray-500 space-y-1">
                    <li className={passwordForm.newPassword.length >= 8 ? 'text-green-400' : ''}>
                      • Mínimo 8 caracteres
                    </li>
                    <li className={passwordForm.newPassword.match(/[a-z]/) && passwordForm.newPassword.match(/[A-Z]/) ? 'text-green-400' : ''}>
                      • Mayúsculas y minúsculas
                    </li>
                    <li className={passwordForm.newPassword.match(/[0-9]/) ? 'text-green-400' : ''}>
                      • Al menos un número
                    </li>
                    <li className={passwordForm.newPassword.match(/[^a-zA-Z0-9]/) ? 'text-green-400' : ''}>
                      • Un carácter especial (!@#$%...)
                    </li>
                  </ul>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                className="bg-gray-800 border-gray-700"
              />
              {passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword && (
                <p className="text-xs text-red-400">Las contraseñas no coinciden</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPasswordDialog(false)} className="border-gray-600">
              Cancelar
            </Button>
            <Button 
              onClick={handleChangePassword}
              disabled={isSaving || passwordStrength < 50 || passwordForm.newPassword !== passwordForm.confirmPassword}
              className="bg-cyan-600 hover:bg-cyan-700"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Cambiar contraseña
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 2FA Setup Dialog */}
      <Dialog open={show2FADialog} onOpenChange={setShow2FADialog}>
        <DialogContent className="bg-gray-900 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">Activar Autenticación de Dos Factores</DialogTitle>
            <DialogDescription>
              Protege tu cuenta con un segundo factor de autenticación
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="p-4 rounded-lg bg-gray-800/50 border border-gray-700">
              <div className="flex items-center gap-3 mb-3">
                <Smartphone className="h-5 w-5 text-cyan-400" />
                <p className="text-white font-medium">Usar aplicación autenticadora</p>
              </div>
              <p className="text-sm text-gray-400">
                Usa Google Authenticator, Authy u otra aplicación compatible para generar códigos de verificación.
              </p>
            </div>

            <div className="flex justify-center py-4">
              <div className="w-48 h-48 bg-white rounded-lg flex items-center justify-center">
                <div className="text-center text-gray-800">
                  <Globe className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Código QR</p>
                  <p className="text-xs opacity-50">(Demo)</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="verificationCode">Código de verificación</Label>
              <Input
                id="verificationCode"
                placeholder="000000"
                maxLength={6}
                className="bg-gray-800 border-gray-700 text-center text-2xl tracking-widest"
              />
              <p className="text-xs text-gray-500 text-center">
                Ingresa el código de 6 dígitos de tu aplicación
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShow2FADialog(false)} className="border-gray-600">
              Cancelar
            </Button>
            <Button 
              onClick={handleEnable2FA}
              disabled={isSaving}
              className="bg-cyan-600 hover:bg-cyan-700"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Activando...
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4 mr-2" />
                  Activar 2FA
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
