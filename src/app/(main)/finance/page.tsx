'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  DollarSign, 
  CreditCard,
  TrendingUp,
  ArrowRight 
} from 'lucide-react';
import { InvoicesService } from '@/modules/finance/services/invoices.service';
import { formatCurrency } from '@/lib/utils';
import { useTenantId } from '@/contexts/TenantContext';

interface FinanceStats {
  activeInvoices: number;
  totalDue: number;
  collectedThisMonth: number;
  collectionRate: number;
}

export default function FinancePage() {
  const tenantId = useTenantId();
  const [stats, setStats] = useState<FinanceStats>({
    activeInvoices: 0,
    totalDue: 0,
    collectedThisMonth: 0,
    collectionRate: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (tenantId) {
      loadStats();
    }
  }, [tenantId]);

  const loadStats = async () => {
    if (!tenantId) return;
    
    try {
      setLoading(true);
      const invoiceStats = await InvoicesService.getInvoiceStats(undefined, tenantId);
      
      // Calcular facturas activas (total - canceladas, considerando overdueInvoices)
      const activeInvoices = invoiceStats.totalInvoices + invoiceStats.overdueInvoices;
      
      // Total por cobrar
      const totalDue = invoiceStats.totalDue;
      
      // Cobrado (total pagado)
      const collectedThisMonth = invoiceStats.totalPaid;
      
      // Tasa de cobro (totalPaid / totalBilled * 100)
      const collectionRate = invoiceStats.totalBilled > 0 
        ? Math.round((invoiceStats.totalPaid / invoiceStats.totalBilled) * 100)
        : 0;
      
      setStats({
        activeInvoices,
        totalDue,
        collectedThisMonth,
        collectionRate,
      });
    } finally {
      setLoading(false);
    }
  };
  const modules = [
    {
      title: 'Facturas',
      description: 'Gestiona facturas emitidas y por cobrar',
      icon: FileText,
      href: '/finance/invoices',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      stats: 'Emitidas y pendientes'
    },
    {
      title: 'Pagos',
      description: 'Registro de pagos recibidos',
      icon: DollarSign,
      href: '/finance/payments',
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      stats: 'Historial completo'
    },
    {
      title: 'Cuentas por Cobrar',
      description: 'Seguimiento de cobros pendientes',
      icon: CreditCard,
      href: '/finance/receivables',
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      stats: 'Aging y alertas'
    },
    {
      title: 'Reportes Financieros',
      description: 'Análisis y métricas financieras',
      icon: TrendingUp,
      href: '/finance/reports',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      stats: 'Cash flow y rentabilidad'
    }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Finanzas</h1>
        <p className="text-muted-foreground mt-2">
          Gestión Financiera - Control de facturación, pagos y cuentas por cobrar
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Facturas Activas</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '...' : stats.activeInvoices}
            </div>
            <p className="text-xs text-muted-foreground">
              Pendientes de pago
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Por Cobrar</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '...' : formatCurrency(stats.totalDue)}
            </div>
            <p className="text-xs text-muted-foreground">
              Monto pendiente total
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cobrado</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '...' : formatCurrency(stats.collectedThisMonth)}
            </div>
            <p className="text-xs text-muted-foreground">
              Pagos recibidos
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasa de Cobro</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '...' : `${stats.collectionRate}%`}
            </div>
            <p className="text-xs text-muted-foreground">
              Efectividad de cobro
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
            Operaciones comunes del módulo de Finanzas
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Link href="/finance/invoices/new">
            <Button variant="outline">
              <FileText className="mr-2 h-4 w-4" />
              Nueva Factura
            </Button>
          </Link>
          <Link href="/finance/invoices">
            <Button variant="outline">
              Ver Todas las Facturas
            </Button>
          </Link>
          <Link href="/finance/invoices">
            <Button variant="outline">
              <CreditCard className="mr-2 h-4 w-4" />
              Cuentas por Cobrar
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
