/**
 * ZADIA OS - Unauthorized Access Page
 * 
 * Displayed when user tries to access a route without proper permissions
 */

'use client';

import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, ArrowLeft, Home } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function UnauthorizedPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle className="text-2xl">
            {t('errors.unauthorized.title', 'Acceso No Autorizado')}
          </CardTitle>
          <CardDescription>
            {t('errors.unauthorized.description', 'No tienes permiso para acceder a esta página')}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted p-4">
            <p className="text-sm text-muted-foreground">
              {user ? (
                t('errors.unauthorized.authenticated', 'Has iniciado sesión pero no tienes permisos suficientes')
              ) : (
                t('errors.unauthorized.notAuthenticated', 'No has iniciado sesión')
              )}
            </p>
          </div>
          
          <div className="text-sm text-muted-foreground">
            <p className="mb-2 font-medium">
              {t('errors.unauthorized.possibleReasons', 'Posibles razones')}:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>{t('errors.unauthorized.reason1', 'Esta página requiere permisos especiales')}</li>
              <li>{t('errors.unauthorized.reason2', 'Tu rol no tiene acceso a este módulo')}</li>
              <li>{t('errors.unauthorized.reason3', 'La sesión puede haber expirado')}</li>
            </ul>
          </div>
          
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
            <p className="text-sm">
              {t('errors.unauthorized.contactAdmin', 'Si crees que deberías tener acceso, contacta a tu administrador del sistema.')}
            </p>
          </div>
        </CardContent>
        
        <CardFooter className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => router.back()}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('common.goBack', 'Volver')}
          </Button>
          <Button
            className="flex-1"
            onClick={() => router.push('/dashboard')}
          >
            <Home className="mr-2 h-4 w-4" />
            {t('common.goHome', 'Inicio')}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
