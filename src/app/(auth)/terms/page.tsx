'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, FileText, Shield, Users, AlertTriangle } from 'lucide-react';

/**
 * Terms of Service Page
 * Basic legal terms for ZADIA OS
 */
export default function TermsPage() {
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
          <h1 className="text-4xl font-bold text-white mb-2">Términos de Servicio</h1>
          <p className="text-gray-400">Última actualización: 30 de Noviembre, 2025</p>
        </div>

        {/* Content */}
        <div className="space-y-6">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <FileText className="w-5 h-5 text-cyan-400" />
                1. Aceptación de Términos
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-3">
              <p>
                Al acceder y utilizar ZADIA OS, usted acepta estar sujeto a estos Términos de Servicio 
                y todas las leyes y regulaciones aplicables. Si no está de acuerdo con alguno de estos 
                términos, no debe usar este servicio.
              </p>
              <p>
                ZADIA OS se reserva el derecho de modificar estos términos en cualquier momento. 
                Los cambios entrarán en vigor inmediatamente después de su publicación en el sitio.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Users className="w-5 h-5 text-cyan-400" />
                2. Uso del Servicio
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-3">
              <p>
                ZADIA OS es una plataforma de gestión empresarial (ERP) que proporciona herramientas 
                para la administración de negocios, incluyendo pero no limitado a:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Gestión de clientes y CRM</li>
                <li>Control de inventario y materiales</li>
                <li>Gestión de proyectos y órdenes de trabajo</li>
                <li>Facturación y finanzas</li>
                <li>Recursos humanos</li>
                <li>Asistente de inteligencia artificial</li>
              </ul>
              <p>
                El usuario se compromete a utilizar el servicio de manera ética y legal, 
                sin violar derechos de terceros ni las leyes aplicables.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Shield className="w-5 h-5 text-cyan-400" />
                3. Cuenta de Usuario
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-3">
              <p>
                Para acceder a ZADIA OS, debe crear una cuenta proporcionando información 
                precisa y completa. Usted es responsable de:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Mantener la confidencialidad de su contraseña</li>
                <li>Todas las actividades que ocurran bajo su cuenta</li>
                <li>Notificar inmediatamente cualquier uso no autorizado</li>
                <li>Mantener actualizada su información de contacto</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <AlertTriangle className="w-5 h-5 text-yellow-400" />
                4. Limitación de Responsabilidad
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-3">
              <p>
                ZADIA OS se proporciona "tal cual" y "según disponibilidad". No garantizamos que:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>El servicio será ininterrumpido o libre de errores</li>
                <li>Los resultados obtenidos serán precisos o confiables</li>
                <li>La calidad cumplirá con sus expectativas</li>
              </ul>
              <p>
                En ningún caso seremos responsables por daños indirectos, incidentales, 
                especiales o consecuentes que resulten del uso o la imposibilidad de uso del servicio.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <FileText className="w-5 h-5 text-cyan-400" />
                5. Propiedad Intelectual
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-3">
              <p>
                Todo el contenido, características y funcionalidad de ZADIA OS, incluyendo pero 
                no limitado a texto, gráficos, logos, iconos, imágenes, clips de audio, descargas 
                digitales, compilaciones de datos y software, son propiedad de ZADIA OS y están 
                protegidos por leyes de propiedad intelectual.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">6. Contacto</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300">
              <p>
                Si tiene preguntas sobre estos Términos de Servicio, puede contactarnos en:
              </p>
              <p className="mt-2 text-cyan-400">soporte@zadia.app</p>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <Link href="/privacy">
            <Button variant="outline" className="border-gray-600 text-gray-300 hover:text-white">
              Ver Política de Privacidad
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
