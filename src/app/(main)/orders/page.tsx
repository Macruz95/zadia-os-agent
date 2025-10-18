'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, Package, Clock, Truck, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import OrdersList from '@/modules/orders/components/OrdersList';
import TrackingDialog from '@/modules/orders/components/TrackingDialog';
import { useOrders } from '@/modules/orders/hooks/use-orders';
import type { OrderStatus } from '@/modules/orders/types/orders.types';
import type { UpdateTrackingFormData } from '@/modules/orders/validations/orders.validation';
import { Timestamp } from 'firebase/firestore';

export default function OrdersPage() {
  const { orders, stats, loading, fetchOrders, fetchStats, addTracking } =
    useOrders();
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(
    null
  );
  const [trackingDialogOpen, setTrackingDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<OrderStatus | 'all'>('all');

  /**
   * Cargar estadísticas al montar
   */
  useState(() => {
    fetchStats();
  });

  /**
   * Filtrar pedidos según tab activo
   */
  const filteredOrders = orders.filter((order) => {
    if (activeTab === 'all') return true;
    return order.status === activeTab;
  });

  /**
   * Abrir diálogo de tracking
   */
  const handleAddTracking = (orderId: string) => {
    setSelectedOrderId(orderId);
    setTrackingDialogOpen(true);
  };

  /**
   * Guardar tracking
   */
  const handleSaveTracking = async (data: UpdateTrackingFormData) => {
    if (!selectedOrderId) return false;

    const success = await addTracking(selectedOrderId, {
      carrier: data.carrier,
      trackingNumber: data.trackingNumber,
      trackingUrl: data.trackingUrl,
      shippedDate: Timestamp.now(),
      estimatedDelivery: data.estimatedDelivery
        ? Timestamp.fromDate(data.estimatedDelivery)
        : undefined,
    });

    if (success) {
      await fetchOrders();
      await fetchStats();
    }

    return success;
  };

  /**
   * Formatear moneda
   */
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pedidos</h1>
          <p className="text-muted-foreground">
            Gestiona los pedidos de tus clientes
          </p>
        </div>
        <Button asChild>
          <Link href="/orders/new">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Pedido
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Pedidos
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalOrders}</div>
              <p className="text-xs text-muted-foreground">
                {formatCurrency(stats.totalRevenue)} en ingresos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pendientes
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.pendingOrders}
              </div>
              <p className="text-xs text-muted-foreground">
                Por procesar/confirmar
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                En Envío
              </CardTitle>
              <Truck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.shippedOrders}
              </div>
              <p className="text-xs text-muted-foreground">
                En tránsito
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Entregados
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.deliveredOrders}
              </div>
              <p className="text-xs text-muted-foreground">
                Completados
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs y Lista */}
      <Card>
        <CardContent className="pt-6">
          <Tabs
            value={activeTab}
            onValueChange={(value) =>
              setActiveTab(value as OrderStatus | 'all')
            }
          >
            <TabsList>
              <TabsTrigger value="all">Todos</TabsTrigger>
              <TabsTrigger value="pending">Pendientes</TabsTrigger>
              <TabsTrigger value="confirmed">Confirmados</TabsTrigger>
              <TabsTrigger value="processing">En proceso</TabsTrigger>
              <TabsTrigger value="shipped">Enviados</TabsTrigger>
              <TabsTrigger value="delivered">Entregados</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-4">
              {loading ? (
                <div className="py-8 text-center text-muted-foreground">
                  Cargando pedidos...
                </div>
              ) : (
                <OrdersList
                  orders={filteredOrders}
                  onAddTracking={handleAddTracking}
                />
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Tracking Dialog */}
      <TrackingDialog
        open={trackingDialogOpen}
        onOpenChange={setTrackingDialogOpen}
        onSubmit={handleSaveTracking}
      />
    </div>
  );
}
