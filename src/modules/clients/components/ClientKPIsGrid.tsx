/**
 * ZADIA OS - Client KPIs Grid for Main Page
 * 
 * Grid de KPIs completo para página principal de clientes
 * REGLA 2: ShadCN UI + Lucide icons
 * REGLA 3: Datos reales de Firebase
 * REGLA 5: <200 líneas
 */

'use client';

import { Users, Building, Landmark, TrendingUp, AlertTriangle, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Client } from '../types/clients.types';

interface ClientKPIsGridProps {
  clients: Client[];
  loading?: boolean;
}

export function ClientKPIsGrid({ clients, loading }: ClientKPIsGridProps) {
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Calcular KPIs
  const totalClients = clients.length;
  const naturalPersons = clients.filter(c => c.clientType === 'PersonaNatural').length;
  const companies = clients.filter(c => c.clientType === 'Empresa').length;
  const organizations = clients.filter(c => c.clientType === 'Organización').length;
  const activeClients = clients.filter(c => c.status === 'Activo').length;
  const vipClients = clients.filter(c => c.tags.includes('VIP')).length;

  // KPIs por geo-segmentación (top 3 países)
  const clientsByCountry = clients.reduce((acc, client) => {
    const country = client.address?.country || 'Sin país';
    acc[country] = (acc[country] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topCountry = Object.entries(clientsByCountry)
    .sort(([, a], [, b]) => b - a)[0];

  const kpis = [
    {
      title: 'Total Clientes',
      value: totalClients.toString(),
      icon: Users,
      description: 'Registrados en el sistema',
      variant: 'default' as const,
    },
    {
      title: 'Personas Naturales',
      value: naturalPersons.toString(),
      icon: Users,
      description: `${totalClients > 0 ? ((naturalPersons / totalClients) * 100).toFixed(0) : 0}% del total`,
      variant: 'secondary' as const,
    },
    {
      title: 'Empresas',
      value: companies.toString(),
      icon: Building,
      description: `${totalClients > 0 ? ((companies / totalClients) * 100).toFixed(0) : 0}% del total`,
      variant: 'secondary' as const,
    },
    {
      title: 'Organizaciones',
      value: organizations.toString(),
      icon: Landmark,
      description: `${totalClients > 0 ? ((organizations / totalClients) * 100).toFixed(0) : 0}% del total`,
      variant: 'secondary' as const,
    },
    {
      title: 'Clientes Activos',
      value: activeClients.toString(),
      icon: TrendingUp,
      description: `${totalClients > 0 ? ((activeClients / totalClients) * 100).toFixed(0) : 0}% activos`,
      variant: 'default' as const,
    },
    {
      title: 'Clientes VIP',
      value: vipClients.toString(),
      icon: Star,
      description: vipClients > 0 ? 'Clientes prioritarios' : 'Sin clientes VIP',
      variant: 'default' as const,
    },
  ];

  // KPI adicional de geo-segmentación
  if (topCountry) {
    kpis.push({
      title: 'Top País',
      value: topCountry[0],
      icon: AlertTriangle,
      description: `${topCountry[1]} clientes`,
      variant: 'secondary' as const,
    });
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpis.slice(0, 6).map((kpi, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {kpi.title}
              </CardTitle>
              <kpi.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {kpi.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Top Clientes por Tags/Segmentación */}
      {(vipClients > 0 || clients.some(c => c.tags.length > 0)) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Segmentación de Clientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {Array.from(new Set(clients.flatMap(c => c.tags))).slice(0, 10).map((tag, index) => {
                const count = clients.filter(c => c.tags.includes(tag)).length;
                return (
                  <Badge key={index} variant="outline">
                    {tag} ({count})
                  </Badge>
                );
              })}
              {clients.filter(c => c.tags.length === 0).length > 0 && (
                <Badge variant="secondary">
                  Sin etiqueta ({clients.filter(c => c.tags.length === 0).length})
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
