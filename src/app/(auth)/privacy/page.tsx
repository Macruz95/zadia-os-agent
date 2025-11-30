'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Shield, Database, Eye, Lock, Bell, Trash2 } from 'lucide-react';

/**
 * Privacy Policy Page
 * Basic privacy policy for ZADIA OS
 */
export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/register">
            <Button variant="ghost" className="text-gray-400 hover:text-white mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al registro
            </Button>
          </Link>
          <h1 className="text-4xl font-bold text-white mb-2">Política de Privacidad</h1>
          <p className="text-gray-400">Última actualización: 30 de Noviembre, 2025</p>
        </div>

        {/* Content */}
        <div className="space-y-6">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Shield className="w-5 h-5 text-cyan-400" />
                Introducción
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-3">
              <p>
                En ZADIA OS, nos tomamos muy en serio la privacidad de nuestros usuarios. 
                Esta Política de Privacidad describe cómo recopilamos, usamos, almacenamos 
                y protegemos su información personal cuando utiliza nuestra plataforma.
              </p>
              <p>
                Al utilizar ZADIA OS, usted acepta las prácticas descritas en esta política.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Database className="w-5 h-5 text-cyan-400" />
                Información que Recopilamos
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-3">
              <p><strong className="text-white">Información de cuenta:</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Nombre completo</li>
                <li>Dirección de correo electrónico</li>
                <li>Contraseña (encriptada)</li>
                <li>Nombre de empresa (opcional)</li>
              </ul>
              
              <p className="mt-4"><strong className="text-white">Información de uso:</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Datos de clientes, proyectos, inventario que usted ingrese</li>
                <li>Registros de actividad dentro de la plataforma</li>
                <li>Preferencias de configuración</li>
              </ul>

              <p className="mt-4"><strong className="text-white">Información técnica:</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Dirección IP</li>
                <li>Tipo de navegador y dispositivo</li>
                <li>Páginas visitadas y tiempo de uso</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Eye className="w-5 h-5 text-cyan-400" />
                Cómo Usamos su Información
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-3">
              <p>Utilizamos su información para:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Proporcionar y mantener el servicio ZADIA OS</li>
                <li>Personalizar su experiencia de usuario</li>
                <li>Procesar sus transacciones y gestionar su cuenta</li>
                <li>Enviar actualizaciones importantes sobre el servicio</li>
                <li>Mejorar nuestros productos y servicios</li>
                <li>Proporcionar soporte técnico</li>
                <li>Detectar y prevenir fraudes o abusos</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Lock className="w-5 h-5 text-cyan-400" />
                Seguridad de los Datos
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-3">
              <p>
                Implementamos medidas de seguridad técnicas y organizativas para proteger 
                su información, incluyendo:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Encriptación de datos en tránsito (HTTPS/TLS)</li>
                <li>Encriptación de contraseñas con algoritmos seguros</li>
                <li>Almacenamiento en servidores seguros de Google Cloud (Firebase)</li>
                <li>Control de acceso basado en roles</li>
                <li>Monitoreo continuo de seguridad</li>
                <li>Backups automáticos de datos</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Bell className="w-5 h-5 text-cyan-400" />
                Cookies y Tecnologías Similares
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-3">
              <p>
                Utilizamos cookies y tecnologías similares para:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Mantener su sesión iniciada</li>
                <li>Recordar sus preferencias</li>
                <li>Analizar el uso del servicio (Google Analytics)</li>
                <li>Mejorar el rendimiento de la plataforma</li>
              </ul>
              <p className="mt-2">
                Puede configurar su navegador para rechazar cookies, aunque esto puede 
                afectar la funcionalidad del servicio.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Trash2 className="w-5 h-5 text-cyan-400" />
                Sus Derechos
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-3">
              <p>Usted tiene derecho a:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li><strong>Acceso:</strong> Solicitar una copia de sus datos personales</li>
                <li><strong>Rectificación:</strong> Corregir datos inexactos o incompletos</li>
                <li><strong>Eliminación:</strong> Solicitar la eliminación de sus datos</li>
                <li><strong>Portabilidad:</strong> Recibir sus datos en formato estructurado</li>
                <li><strong>Oposición:</strong> Oponerse al procesamiento de sus datos</li>
              </ul>
              <p className="mt-2">
                Para ejercer estos derechos, contacte a: <span className="text-cyan-400">privacidad@zadia.app</span>
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Contacto</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300">
              <p>
                Si tiene preguntas sobre esta Política de Privacidad o sobre cómo 
                manejamos sus datos, puede contactarnos en:
              </p>
              <p className="mt-2 text-cyan-400">privacidad@zadia.app</p>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <Link href="/terms">
            <Button variant="outline" className="border-gray-600 text-gray-300 hover:text-white">
              Ver Términos de Servicio
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
