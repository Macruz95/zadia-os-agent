'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export function UserProfileCard() {
  const { user, loading } = useAuth();
  const { t, i18n } = useTranslation();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </CardContent>
      </Card>
    );
  }

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error</CardTitle>
          <CardDescription>No se pudo cargar la información del usuario</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const formatDate = (date: Date) => {
    return format(date, 'PPP', { 
      locale: i18n.language === 'es' ? es : undefined 
    });
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'destructive' as const;
      case 'manager':
        return 'default' as const;
      case 'user':
        return 'secondary' as const;
      default:
        return 'outline' as const;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('dashboard.userProfile')}</CardTitle>
        <CardDescription>Información de tu cuenta en ZADIA OS</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Nombre</p>
            <p className="text-base">{user.displayName}</p>
          </div>
          
          <div>
            <p className="text-sm font-medium text-muted-foreground">Email</p>
            <p className="text-base">{user.email}</p>
          </div>
          
          <div>
            <p className="text-sm font-medium text-muted-foreground">Rol</p>
            <Badge variant={getRoleBadgeVariant(user.role)}>
              {t(`auth.roles.${user.role}`)}
            </Badge>
          </div>
          
          <div>
            <p className="text-sm font-medium text-muted-foreground">Idioma</p>
            <p className="text-base">{user.language === 'es' ? 'Español' : 'English'}</p>
          </div>
          
          {user.organization && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">{t('userProfile.fields.organization')}</p>
              <p className="text-base">{user.organization}</p>
            </div>
          )}
          
          {user.objective && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">{t('userProfile.fields.objective')}</p>
              <p className="text-base">{t(`auth.objectives.${user.objective}`)}</p>
            </div>
          )}
          
          <div>
            <p className="text-sm font-medium text-muted-foreground">Cuenta creada</p>
            <p className="text-base">{formatDate(user.createdAt)}</p>
          </div>
          
          <div>
            <p className="text-sm font-medium text-muted-foreground">Último acceso</p>
            <p className="text-base">{formatDate(user.lastLogin)}</p>
          </div>
          
          <div>
            <p className="text-sm font-medium text-muted-foreground">Estado</p>
            <Badge variant={user.isActive ? 'default' : 'secondary'}>
              {user.isActive ? 'Activo' : 'Inactivo'}
            </Badge>
          </div>
          
          <div>
            <p className="text-sm font-medium text-muted-foreground">ID de Usuario</p>
            <p className="text-xs font-mono bg-muted p-2 rounded break-all">
              {user.uid}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
