import Link from 'next/link';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Package,
  Eye,
  RefreshCw,
  Truck,
  XCircle,
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Order } from '../types/orders.types';
import {
  ORDER_STATUS_CONFIG,
  PAYMENT_STATUS_CONFIG,
  SHIPPING_METHOD_CONFIG,
} from '../types/orders.types';

interface OrdersListProps {
  orders: Order[];
  onUpdateStatus?: (orderId: string) => void;
  onAddTracking?: (orderId: string) => void;
  onCancel?: (orderId: string) => void;
}

export default function OrdersList({
  orders,
  onUpdateStatus,
  onAddTracking,
  onCancel,
}: OrdersListProps) {
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
  const formatDate = (date: Date | { toDate: () => Date }) => {
    const dateObj = date instanceof Date ? date : date.toDate();
    return format(dateObj, 'dd MMM yyyy', { locale: es });
  };

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Package className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold">No hay pedidos</h3>
        <p className="text-sm text-muted-foreground mt-2">
          Comienza creando un nuevo pedido
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Número</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Pago</TableHead>
            <TableHead>Envío</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => {
            const statusConfig = ORDER_STATUS_CONFIG[order.status];
            const paymentConfig =
              PAYMENT_STATUS_CONFIG[order.paymentStatus];
            const shippingConfig =
              SHIPPING_METHOD_CONFIG[order.shippingMethod];

            return (
              <TableRow key={order.id}>
                <TableCell className="font-medium">
                  {order.number}
                </TableCell>
                <TableCell>{order.clientName}</TableCell>
                <TableCell>{formatDate(order.orderDate)}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      statusConfig.color === 'green'
                        ? 'default'
                        : statusConfig.color === 'red'
                          ? 'destructive'
                          : statusConfig.color === 'yellow'
                            ? 'secondary'
                            : 'outline'
                    }
                    className="gap-1"
                  >
                    {statusConfig.label}
                  </Badge>
                </TableCell>
                <TableCell>
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
                </TableCell>
                <TableCell>
                  <span className="text-sm">
                    {shippingConfig.label}
                  </span>
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency(order.total, order.currency)}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        Acciones
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href={`/orders/${order.id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          Ver detalles
                        </Link>
                      </DropdownMenuItem>
                      {order.status !== 'cancelled' &&
                        order.status !== 'delivered' && (
                          <>
                            <DropdownMenuItem
                              onClick={() =>
                                onUpdateStatus?.(order.id)
                              }
                            >
                              <RefreshCw className="mr-2 h-4 w-4" />
                              Actualizar estado
                            </DropdownMenuItem>
                            {order.status === 'ready' &&
                              !order.tracking && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    onAddTracking?.(order.id)
                                  }
                                >
                                  <Truck className="mr-2 h-4 w-4" />
                                  Agregar envío
                                </DropdownMenuItem>
                              )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => onCancel?.(order.id)}
                              className="text-destructive"
                            >
                              <XCircle className="mr-2 h-4 w-4" />
                              Cancelar pedido
                            </DropdownMenuItem>
                          </>
                        )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
