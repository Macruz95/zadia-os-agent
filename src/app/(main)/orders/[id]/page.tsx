'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  ArrowLeft,
  Package,
  User,
  MapPin,
  FileText,
  Truck,
  RefreshCw,
  Receipt,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import TrackingDialog from '@/modules/orders/components/TrackingDialog';
import { OrdersService } from '@/modules/orders/services/orders.service';
import type { Order } from '@/modules/orders/types/orders.types';
import {
  ORDER_STATUS_CONFIG,
  PAYMENT_STATUS_CONFIG,
  SHIPPING_METHOD_CONFIG,
} from '@/modules/orders/types/orders.types';
import type { UpdateTrackingFormData } from '@/modules/orders/validations/orders.validation';
import { Timestamp } from 'firebase/firestore';
import { toast } from 'sonner';

export default function OrderDetailsPage() {
  const params = useParams();
  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [trackingDialogOpen, setTrackingDialogOpen] = useState(false);

  /**
   * Cargar pedido
   */
  useEffect(() => {
    loadOrder();
  }, [orderId]);

  const loadOrder = async () => {
    setLoading(true);
    const data = await OrdersService.getOrderById(orderId);
    setOrder(data);
    setLoading(false);
  };

  /**
   * Guardar tracking
   */
  const handleSaveTracking = async (data: UpdateTrackingFormData) => {
    try {
      await OrdersService.addTracking(orderId, {
        carrier: data.carrier,
        trackingNumber: data.trackingNumber,
        trackingUrl: data.trackingUrl,
        shippedDate: Timestamp.now(),
        estimatedDelivery: data.estimatedDelivery
          ? Timestamp.fromDate(data.estimatedDelivery)
          : undefined,
      });
      toast.success('Información de envío agregada');
      await loadOrder();
      return true;
    } catch {
      toast.error('Error al agregar información de envío');
      return false;
    }
  };

  /**
   * Formatear moneda
   */
  const formatCurrency = (amount: number, currency = 'USD') => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency,
    }).format(amount);
  };

  /**
   * Formatear fecha
   */
  const formatDate = (date: Date | { toDate: () => Date } | undefined) => {
    if (!date) return '-';
    const dateObj = date instanceof Date ? date : date.toDate();
    return format(dateObj, 'dd MMM yyyy', { locale: es });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Cargando pedido...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Package className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold">Pedido no encontrado</h3>
        <Button asChild className="mt-4">
          <Link href="/orders">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a pedidos
          </Link>
        </Button>
      </div>
    );
  }

  const statusConfig = ORDER_STATUS_CONFIG[order.status];
  const paymentConfig = PAYMENT_STATUS_CONFIG[order.paymentStatus];
  const shippingConfig = SHIPPING_METHOD_CONFIG[order.shippingMethod];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/orders">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {order.number}
            </h1>
            <p className="text-muted-foreground">
              Pedido creado el {formatDate(order.orderDate)}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {order.status === 'ready' && !order.tracking && (
            <Button onClick={() => setTrackingDialogOpen(true)}>
              <Truck className="mr-2 h-4 w-4" />
              Agregar Envío
            </Button>
          )}
          {order.status === 'delivered' && !order.invoiceId && (
            <Button asChild>
              <Link href={`/finance/invoices/new?orderId=${order.id}`}>
                <Receipt className="mr-2 h-4 w-4" />
                Generar Factura
              </Link>
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5" />
                Estado del Pedido
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Estado:</span>
                <Badge
                  variant={
                    statusConfig.color === 'green'
                      ? 'default'
                      : statusConfig.color === 'red'
                        ? 'destructive'
                        : 'secondary'
                  }
                >
                  {statusConfig.label}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Pago:</span>
                <Badge
                  variant={
                    paymentConfig.color === 'green'
                      ? 'default'
                      : paymentConfig.color === 'red'
                        ? 'destructive'
                        : 'secondary'
                  }
                >
                  {paymentConfig.label}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Envío:</span>
                <span className="text-sm">{shippingConfig.label}</span>
              </div>
            </CardContent>
          </Card>

          {/* Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Productos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Producto</TableHead>
                    <TableHead className="text-right">Cantidad</TableHead>
                    <TableHead className="text-right">Precio</TableHead>
                    <TableHead className="text-right">Descuento</TableHead>
                    <TableHead className="text-right">Subtotal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{item.productName}</p>
                          {item.description && (
                            <p className="text-sm text-muted-foreground">
                              {item.description}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {item.quantity} {item.unitOfMeasure}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(item.unitPrice, order.currency)}
                      </TableCell>
                      <TableCell className="text-right">
                        {item.discount > 0
                          ? `${item.discount}%`
                          : '-'}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(item.subtotal, order.currency)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <Separator className="my-4" />

              {/* Totals */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(order.subtotal, order.currency)}</span>
                </div>
                {Object.entries(order.taxes).map(([name, rate]) => (
                  <div key={name} className="flex justify-between text-sm">
                    <span>{name} ({rate}%):</span>
                    <span>
                      {formatCurrency(
                        (order.subtotal * rate) / 100,
                        order.currency
                      )}
                    </span>
                  </div>
                ))}
                {order.shippingCost > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Envío:</span>
                    <span>
                      {formatCurrency(order.shippingCost, order.currency)}
                    </span>
                  </div>
                )}
                {order.discounts > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Descuentos:</span>
                    <span>
                      -{formatCurrency(order.discounts, order.currency)}
                    </span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span>{formatCurrency(order.total, order.currency)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tracking Info */}
          {order.tracking && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Información de Envío
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium">Paquetería</p>
                    <p className="text-sm text-muted-foreground">
                      {order.tracking.carrier}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Número de Guía</p>
                    <p className="text-sm text-muted-foreground">
                      {order.tracking.trackingNumber}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Fecha de Envío</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(order.tracking.shippedDate)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Entrega Estimada</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(order.tracking.estimatedDelivery)}
                    </p>
                  </div>
                </div>
                {order.tracking.trackingUrl && (
                  <Button variant="outline" asChild className="w-full">
                    <a
                      href={order.tracking.trackingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Rastrear Envío
                    </a>
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Client Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Cliente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium">{order.clientName}</p>
              {order.quoteNumber && (
                <Link
                  href={`/sales/quotes/${order.quoteId}`}
                  className="text-sm text-primary hover:underline mt-2 block"
                >
                  Ver cotización {order.quoteNumber}
                </Link>
              )}
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Dirección de Envío
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              <p>{order.shippingAddress.street}</p>
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.state}
              </p>
              <p>{order.shippingAddress.zipCode}</p>
              <p>{order.shippingAddress.country}</p>
              {order.shippingAddress.contactName && (
                <>
                  <Separator className="my-2" />
                  <p className="font-medium">
                    {order.shippingAddress.contactName}
                  </p>
                  {order.shippingAddress.contactPhone && (
                    <p className="text-muted-foreground">
                      {order.shippingAddress.contactPhone}
                    </p>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Notes */}
          {order.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Notas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {order.notes}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Tracking Dialog */}
      <TrackingDialog
        open={trackingDialogOpen}
        onOpenChange={setTrackingDialogOpen}
        onSubmit={handleSaveTracking}
      />
    </div>
  );
}
