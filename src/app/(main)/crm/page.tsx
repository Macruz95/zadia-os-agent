'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  UserPlus, 
  Users, 
  Lightbulb,
  TrendingUp,
  ArrowRight 
} from 'lucide-react';

export default function CRMPage() {
  const modules = [
    {
      title: 'Leads',
      description: 'Gestiona tus prospectos y nuevas oportunidades de negocio',
      icon: UserPlus,
      href: '/crm/leads',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      stats: 'Captura, califica y convierte'
    },
    {
      title: 'Clientes',
      description: 'Administra tu cartera de clientes activos',
      icon: Users,
      href: '/clients',
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      stats: 'Información completa y contactos'
    },
    {
      title: 'Oportunidades',
      description: 'Seguimiento de oportunidades de venta en pipeline',
      icon: Lightbulb,
      href: '/crm/opportunities',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      stats: 'Pipeline y forecasting'
    },
    {
      title: 'Reportes',
      description: 'Analítica y métricas del proceso de ventas',
      icon: TrendingUp,
      href: '/crm/reports',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      stats: 'Conversión y rendimiento'
    }
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">CRM</h1>
        <p className="text-muted-foreground mt-2">
          Customer Relationship Management - Gestiona todo el ciclo de vida del cliente
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Leads Activos</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">
              En proceso de calificación
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">
              Cartera total
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Oportunidades</CardTitle>
            <Lightbulb className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">
              En pipeline
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasa Conversión</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-%</div>
            <p className="text-xs text-muted-foreground">
              Lead → Cliente
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Modules Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {modules.map((module) => {
          const Icon = module.icon;
          return (
            <Card key={module.href} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-lg ${module.bgColor}`}>
                    <Icon className={`h-6 w-6 ${module.color}`} />
                  </div>
                  <div className="flex-1">
                    <CardTitle>{module.title}</CardTitle>
                    <CardDescription className="mt-1">
                      {module.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    {module.stats}
                  </p>
                  <Link href={module.href}>
                    <Button variant="ghost" size="sm">
                      Acceder
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Acciones Rápidas</CardTitle>
          <CardDescription>
            Operaciones comunes del módulo CRM
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Link href="/crm/leads/new">
            <Button variant="outline">
              <UserPlus className="mr-2 h-4 w-4" />
              Nuevo Lead
            </Button>
          </Link>
          <Link href="/clients/new">
            <Button variant="outline">
              <Users className="mr-2 h-4 w-4" />
              Nuevo Cliente
            </Button>
          </Link>
          <Link href="/crm/opportunities/new">
            <Button variant="outline">
              <Lightbulb className="mr-2 h-4 w-4" />
              Nueva Oportunidad
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
