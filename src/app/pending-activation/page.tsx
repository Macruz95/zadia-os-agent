/**
 * ZADIA OS - Pending Activation Page
 * 
 * Shown when user is authenticated but doesn't have custom claims (role)
 * Provides instructions to contact admin
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Mail, LogOut } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function PendingActivationPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  
  // Redirect if user has role
  useEffect(() => {
    if (user?.role) {
      router.push('/dashboard');
    }
  }, [user, router]);
  
  const handleLogout = async () => {
    await logout();
    router.push('/');
  };
  
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-yellow-500/10 flex items-center justify-center">
            <Clock className="h-6 w-6 text-yellow-600" />
          </div>
          <CardTitle className="text-2xl">
            Activación Pendiente
          </CardTitle>
          <CardDescription>
            Tu cuenta necesita ser activada por un administrador
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <Alert>
            <AlertDescription>
              Tu cuenta ha sido creada exitosamente, pero aún no tiene los permisos necesarios para acceder al sistema.
            </AlertDescription>
          </Alert>
          
          <div className="rounded-lg bg-muted p-4">
            <p className="text-sm font-medium mb-2">Usuario registrado:</p>
            <p className="text-sm text-muted-foreground break-all">
              {user?.email || 'No disponible'}
            </p>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm font-medium">Próximos pasos:</p>
            <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground ml-2">
              <li>Contacta al administrador del sistema</li>
              <li>Proporciona tu correo electrónico</li>
              <li>Espera a que el administrador active tu cuenta</li>
              <li>Cierra sesión y vuelve a iniciar sesión</li>
            </ol>
          </div>
          
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
            <div className="flex items-start gap-2">
              <Mail className="h-4 w-4 mt-0.5 text-primary" />
              <div className="text-sm">
                <p className="font-medium mb-1">Contacto del Administrador:</p>
                <p className="text-muted-foreground">
                  Envía un correo al administrador del sistema solicitando la activación de tu cuenta.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
        
        <CardFooter>
          <Button
            variant="outline"
            className="w-full"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Cerrar Sesión
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
