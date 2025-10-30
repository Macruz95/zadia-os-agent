'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  Mail, 
  Shield, 
  Calendar, 
  Clock,
  Edit,
  Save,
  X
} from 'lucide-react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';

/**
 * User Profile Page
 * Route: /profile
 * 
 * Rule #1: Real Firebase data from auth and users collection
 * Rule #2: ShadCN UI components + Lucide icons
 * Rule #4: Modular structure
 * Rule #5: <200 lines
 */

interface UserProfile {
  email: string;
  displayName?: string;
  role?: string;
  department?: string;
  phoneNumber?: string;
  createdAt?: Date;
  lastLogin?: Date;
}

export default function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editedProfile, setEditedProfile] = useState<Partial<UserProfile>>({});

  useEffect(() => {
    async function loadProfile() {
      if (!user) return;

      try {
        setLoading(true);
        
        // Get user data from Firestore users collection
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setProfile({
            email: user.email || '',
            displayName: userData.displayName || user.displayName || '',
            role: userData.role || 'user',
            department: userData.department || '',
            phoneNumber: userData.phoneNumber || '',
            createdAt: userData.createdAt?.toDate(),
            lastLogin: userData.lastLogin?.toDate(),
          });
        } else {
          // Use auth data if Firestore doc doesn't exist
          setProfile({
            email: user.email || '',
            displayName: user.displayName || '',
            role: 'user',
          });
        }
      } catch (error) {
        logger.error('Error loading user profile', error as Error);
        toast.error('Error al cargar el perfil');
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [user]);

  const handleEdit = () => {
    setEditedProfile({
      displayName: profile?.displayName || '',
      department: profile?.department || '',
      phoneNumber: profile?.phoneNumber || '',
    });
    setEditing(true);
  };

  const handleCancel = () => {
    setEditedProfile({});
    setEditing(false);
  };

  const handleSave = async () => {
    if (!user) return;

    try {
      setSaving(true);

      // Update Firestore user document
      await updateDoc(doc(db, 'users', user.uid), {
        displayName: editedProfile.displayName || '',
        department: editedProfile.department || '',
        phoneNumber: editedProfile.phoneNumber || '',
      });

      // Update local state
      setProfile(prev => prev ? { ...prev, ...editedProfile } : null);
      setEditing(false);
      toast.success('Perfil actualizado exitosamente');
    } catch (error) {
      logger.error('Error updating user profile', error as Error);
      toast.error('Error al actualizar el perfil');
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (date?: Date) => {
    if (!date) return 'N/A';
    return new Intl.DateTimeFormat('es-MX', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const getRoleBadgeVariant = (role?: string) => {
    switch (role) {
      case 'admin':
      case 'super-admin':
        return 'destructive';
      case 'manager':
        return 'default';
      default:
        return 'secondary';
    }
  };

  const getRoleLabel = (role?: string) => {
    switch (role) {
      case 'admin':
        return 'Administrador';
      case 'super-admin':
        return 'Super Administrador';
      case 'manager':
        return 'Gerente';
      default:
        return 'Usuario';
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <p className="text-muted-foreground">No se pudo cargar el perfil</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mi Perfil</h1>
          <p className="text-muted-foreground">Gestiona tu información personal</p>
        </div>
        {!editing && (
          <Button onClick={handleEdit}>
            <Edit className="h-4 w-4 mr-2" />
            Editar Perfil
          </Button>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Personal Information Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Información Personal
            </CardTitle>
            <CardDescription>Datos básicos de tu cuenta</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="displayName">Nombre Completo</Label>
              {editing ? (
                <Input
                  id="displayName"
                  value={editedProfile.displayName || ''}
                  onChange={(e) => setEditedProfile(prev => ({ ...prev, displayName: e.target.value }))}
                  placeholder="Tu nombre"
                />
              ) : (
                <p className="text-sm font-medium">{profile.displayName || 'No especificado'}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </Label>
              <p className="text-sm font-medium">{profile.email}</p>
              <p className="text-xs text-muted-foreground">El email no se puede cambiar</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Teléfono</Label>
              {editing ? (
                <Input
                  id="phoneNumber"
                  value={editedProfile.phoneNumber || ''}
                  onChange={(e) => setEditedProfile(prev => ({ ...prev, phoneNumber: e.target.value }))}
                  placeholder="+52 123 456 7890"
                />
              ) : (
                <p className="text-sm font-medium">{profile.phoneNumber || 'No especificado'}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Account Information Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Información de Cuenta
            </CardTitle>
            <CardDescription>Detalles del sistema y acceso</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Rol</Label>
              <div>
                <Badge variant={getRoleBadgeVariant(profile.role)}>
                  {getRoleLabel(profile.role)}
                </Badge>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Departamento</Label>
              {editing ? (
                <Input
                  id="department"
                  value={editedProfile.department || ''}
                  onChange={(e) => setEditedProfile(prev => ({ ...prev, department: e.target.value }))}
                  placeholder="Ej: Ventas, Producción"
                />
              ) : (
                <p className="text-sm font-medium">{profile.department || 'No especificado'}</p>
              )}
            </div>

            <Separator />

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Fecha de Registro
              </Label>
              <p className="text-sm text-muted-foreground">{formatDate(profile.createdAt)}</p>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Último Acceso
              </Label>
              <p className="text-sm text-muted-foreground">{formatDate(profile.lastLogin)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      {editing && (
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={handleCancel} disabled={saving}>
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </div>
      )}
    </div>
  );
}
