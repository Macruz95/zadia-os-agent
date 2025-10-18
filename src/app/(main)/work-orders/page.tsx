'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Wrench, 
  ClipboardList, 
  Clock,
  DollarSign,
  ArrowRight 
} from 'lucide-react';

export default function WorkOrdersPage() {
  const modules = [
    {
      title: 'Órdenes Activas',
      description: 'Gestiona órdenes de trabajo en ejecución',
      icon: Wrench,
      href: '/work-orders/list',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      stats: 'En progreso y planificadas'
    },
    {
      title: 'Materiales',
      description: 'Control de materiales utilizados en órdenes',
      icon: ClipboardList,
      href: '/work-orders/materials',
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      stats: 'Inventario y consumo'
    },
    {
      title: 'Horas Trabajadas',
      description: 'Registro de tiempo y mano de obra',
      icon: Clock,
      href: '/work-orders/hours',
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      stats: 'Tiempo y productividad'
    },
    {
      title: 'Costos',
      description: 'Análisis de costos y rentabilidad',
      icon: DollarSign,
      href: '/work-orders/costs',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      stats: 'Real vs estimado'
    }
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Work Orders</h1>
        <p className="text-muted-foreground mt-2">
          Órdenes de Trabajo - Gestión operativa y ejecución de proyectos
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Órdenes Abiertas</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">
              En ejecución
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Materiales Usados</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">
              Este mes
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Horas Totales</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">
              Este mes
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eficiencia</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-%</div>
            <p className="text-xs text-muted-foreground">
              Costo vs presupuesto
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
            Operaciones comunes del módulo Work Orders
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Link href="/work-orders/new">
            <Button variant="outline">
              <Wrench className="mr-2 h-4 w-4" />
              Nueva Orden de Trabajo
            </Button>
          </Link>
          <Link href="/work-orders/list">
            <Button variant="outline">
              Ver Todas las Órdenes
            </Button>
          </Link>
          <Link href="/work-orders/materials">
            <Button variant="outline">
              <ClipboardList className="mr-2 h-4 w-4" />
              Registrar Materiales
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
