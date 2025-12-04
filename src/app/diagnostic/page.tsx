/**
 * Página de diagnóstico temporal
 * Para verificar estado de autenticación y custom claims
 */

'use client';

import { useEffect, useState } from 'react';
import { auth } from '@/lib/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, RefreshCw } from 'lucide-react';

interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
}

interface CustomClaims {
  [key: string]: unknown;
}

export default function DiagnosticPage() {
  const [user, setUser] = useState<User | null>(null);
  const [claims, setClaims] = useState<CustomClaims | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName
        });
        
        try {
          const tokenResult = await firebaseUser.getIdTokenResult();
          setClaims(tokenResult.claims);
        } catch {
          // Error de token - ignorar silenciosamente
        }
      } else {
        setUser(null);
        setClaims(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleRefreshToken = async () => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      try {
        await currentUser.getIdToken(true);
        const tokenResult = await currentUser.getIdTokenResult();
        setClaims(tokenResult.claims);
        alert('✅ Token actualizado. Recarga la página.');
      } catch {
        alert('❌ Error al actualizar token');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full">
          <CardHeader>
            <CardTitle>Cargando...</CardTitle>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full">
        <CardHeader>
          <CardTitle>🔍 Diagnóstico de Sistema</CardTitle>
          <CardDescription>
            Verificación de autenticación y permisos
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Estado de Autenticación */}
          <div className="space-y-2">
            <h3 className="font-semibold flex items-center gap-2">
              {user ? (
                <>
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  Usuario Autenticado
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5 text-red-500" />
                  No Autenticado
                </>
              )}
            </h3>
            {user && (
              <div className="bg-muted p-4 rounded-lg space-y-1 font-mono text-sm">
                <div><strong>UID:</strong> {user.uid}</div>
                <div><strong>Email:</strong> {user.email}</div>
                <div><strong>Nombre:</strong> {user.displayName || 'N/A'}</div>
              </div>
            )}
          </div>

          {/* Custom Claims */}
          <div className="space-y-2">
            <h3 className="font-semibold flex items-center gap-2">
              {claims?.role ? (
                <>
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  Custom Claims Presentes
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5 text-red-500" />
                  Custom Claims Faltantes
                </>
              )}
            </h3>
            {claims ? (
              <div className="bg-muted p-4 rounded-lg">
                <pre className="text-xs overflow-auto">
                  {JSON.stringify(claims, null, 2)}
                </pre>
              </div>
            ) : (
              <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                <p className="text-sm text-red-900">
                  ❌ No se pudieron cargar los custom claims
                </p>
              </div>
            )}
          </div>

          {/* Estado de Custom Claims */}
          <div className="space-y-2">
            <h3 className="font-semibold">Custom Claims:</h3>
            {claims && Object.keys(claims).length > 0 ? (
              <div className="bg-gray-50 p-3 rounded-lg">
                <pre className="text-sm">
                  {JSON.stringify(claims, null, 2)}
                </pre>
              </div>
            ) : (
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                <p className="text-sm font-semibold text-blue-900 mb-2">
                  ℹ️ No hay custom claims configurados
                </p>
                <p className="text-sm text-blue-800">
                  Esto es normal. Los custom claims son opcionales.
                </p>
              </div>
            )}
          </div>

          {/* Acciones */}
          <div className="flex gap-2">
            <Button onClick={handleRefreshToken} disabled={!user}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Actualizar Token
            </Button>
            <Button variant="outline" onClick={() => window.location.href = '/'}>
              Ir al Inicio
            </Button>
          </div>

          {/* Link a Firebase Console */}
          {user && !claims?.role && (
            <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg">
              <p className="text-sm font-semibold mb-2">🔗 Link directo:</p>
              <a 
                href="https://console.firebase.google.com/project/zadia-os-885k8/authentication/users"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline break-all"
              >
                https://console.firebase.google.com/project/zadia-os-885k8/authentication/users
              </a>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
