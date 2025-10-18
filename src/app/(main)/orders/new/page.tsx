'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm, useFieldArray } from 'react-hook-form';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  Package,
  User,
  MapPin,
  Truck,
  Calendar,
  DollarSign,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useAuthState } from '@/hooks/use-auth-state';
import { OrdersService } from '@/modules/orders/services/orders.service';
import type { OrderFormData } from '@/modules/orders/validations/orders.validation';
import { SHIPPING_METHOD_CONFIG } from '@/modules/orders/types/orders.types';
import { Timestamp } from 'firebase/firestore';
import { toast } from 'sonner';

export default function NewOrderPage() {
  const router = useRouter();
  const { user } = useAuthState();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<OrderFormData>({
    defaultValues: {
      status: 'draft',
      paymentStatus: 'pending',
      items: [
        {
          productName: '',
          description: '',
          quantity: 1,
          unitPrice: 0,
          discount: 0,
          subtotal: 0,
          unitOfMeasure: 'pza',
        },
      ],
      taxes: { IVA: 16 },
      shippingCost: 0,
      discounts: 0,
      total: 0,
      currency: 'USD',
      shippingMethod: 'standard',
      shippingAddress: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'México',
      },
      orderDate: new Date(),
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  const items = watch('items');
  const shippingCost = watch('shippingCost');
  const discounts = watch('discounts');

  /**
   * Generar número de pedido
   */
  useEffect(() => {
    const generateNumber = async () => {
      const number = await OrdersService.generateOrderNumber();
      setOrderNumber(number);
    };
    generateNumber();
  }, []);

  /**
   * Calcular totales
   */
  useEffect(() => {
    let subtotal = 0;

    items.forEach((item, index) => {
      const itemSubtotal =
        item.quantity * item.unitPrice * (1 - item.discount / 100);
      subtotal += itemSubtotal;
      setValue(`items.${index}.subtotal`, itemSubtotal);
    });

    const taxAmount = (subtotal * 16) / 100; // IVA 16%
    const total = subtotal + taxAmount + shippingCost - discounts;

    setValue('subtotal', subtotal);
    setValue('total', total);
  }, [items, shippingCost, discounts, setValue]);

  /**
   * Enviar formulario
   */
  const onSubmit = async (data: OrderFormData) => {
    if (!user) {
      toast.error('Debes iniciar sesión');
      return;
    }

    setIsSubmitting(true);

    try {
      const orderData = {
        ...data,
        number: orderNumber,
        orderDate: Timestamp.fromDate(data.orderDate),
        requiredDate: data.requiredDate
          ? Timestamp.fromDate(data.requiredDate)
          : undefined,
        createdBy: user.uid,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const orderId = await OrdersService.createOrder(orderData as any);
      toast.success('Pedido creado exitosamente');
      router.push(`/orders/${orderId}`);
    } catch (error) {
      toast.error('Error al crear pedido');
      // eslint-disable-next-line no-console
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
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

  const subtotal = items.reduce(
    (sum, item) =>
      sum + item.quantity * item.unitPrice * (1 - item.discount / 100),
    0
  );
  const taxAmount = (subtotal * 16) / 100;
  const total = subtotal + taxAmount + shippingCost - discounts;

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
              Nuevo Pedido
            </h1>
            <p className="text-muted-foreground">
              {orderNumber || 'Generando número...'}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Client Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Información del Cliente
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="clientId">ID del Cliente *</Label>
                    <Input
                      id="clientId"
                      {...register('clientId')}
                      placeholder="ID del cliente"
                    />
                    {errors.clientId && (
                      <p className="text-sm text-destructive">
                        {errors.clientId.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="clientName">Nombre del Cliente *</Label>
                    <Input
                      id="clientName"
                      {...register('clientName')}
                      placeholder="Nombre completo"
                    />
                    {errors.clientName && (
                      <p className="text-sm text-destructive">
                        {errors.clientName.message}
                      </p>
                    )}
                  </div>
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
                      <TableHead className="w-24">Cantidad</TableHead>
                      <TableHead className="w-32">Precio</TableHead>
                      <TableHead className="w-24">Desc %</TableHead>
                      <TableHead className="w-32">Subtotal</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fields.map((field, index) => (
                      <TableRow key={field.id}>
                        <TableCell>
                          <div className="space-y-2">
                            <Input
                              {...register(`items.${index}.productName`)}
                              placeholder="Nombre del producto"
                            />
                            <Input
                              {...register(`items.${index}.description`)}
                              placeholder="Descripción"
                            />
                          </div>
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            {...register(`items.${index}.quantity`, {
                              valueAsNumber: true,
                            })}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            step="0.01"
                            {...register(`items.${index}.unitPrice`, {
                              valueAsNumber: true,
                            })}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            {...register(`items.${index}.discount`, {
                              valueAsNumber: true,
                            })}
                          />
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">
                            {formatCurrency(items[index]?.subtotal || 0)}
                          </span>
                        </TableCell>
                        <TableCell>
                          {fields.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => remove(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    append({
                      productName: '',
                      description: '',
                      quantity: 1,
                      unitPrice: 0,
                      discount: 0,
                      subtotal: 0,
                      unitOfMeasure: 'pza',
                    })
                  }
                  className="mt-4"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Agregar Producto
                </Button>
              </CardContent>
            </Card>

            {/* Shipping Method */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Método de Envío
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  defaultValue="standard"
                  onValueChange={(value) =>
                    setValue(
                      'shippingMethod',
                      value as 'pickup' | 'standard' | 'express' | 'overnight'
                    )
                  }
                >
                  {Object.entries(SHIPPING_METHOD_CONFIG).map(
                    ([key, config]) => (
                      <div
                        key={key}
                        className="flex items-center space-x-2 p-3 border rounded-lg"
                      >
                        <RadioGroupItem value={key} id={key} />
                        <Label htmlFor={key} className="flex-1 cursor-pointer">
                          <p className="font-medium">{config.label}</p>
                          <p className="text-sm text-muted-foreground">
                            {config.estimatedDays}
                          </p>
                        </Label>
                      </div>
                    )
                  )}
                </RadioGroup>
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
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="street">Calle *</Label>
                  <Input
                    id="street"
                    {...register('shippingAddress.street')}
                    placeholder="Calle y número"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">Ciudad *</Label>
                    <Input
                      id="city"
                      {...register('shippingAddress.city')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">Estado *</Label>
                    <Input
                      id="state"
                      {...register('shippingAddress.state')}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="zipCode">Código Postal *</Label>
                    <Input
                      id="zipCode"
                      {...register('shippingAddress.zipCode')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">País *</Label>
                    <Input
                      id="country"
                      {...register('shippingAddress.country')}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Dates */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Fechas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="orderDate">Fecha del Pedido</Label>
                  <Input
                    id="orderDate"
                    type="date"
                    {...register('orderDate', {
                      setValueAs: (v) => (v ? new Date(v) : new Date()),
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="requiredDate">Fecha Requerida</Label>
                  <Input
                    id="requiredDate"
                    type="date"
                    {...register('requiredDate', {
                      setValueAs: (v) => (v ? new Date(v) : undefined),
                    })}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Financial Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Resumen Financiero
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>IVA (16%):</span>
                    <span>{formatCurrency(taxAmount)}</span>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="shippingCost">Costo de Envío</Label>
                    <Input
                      id="shippingCost"
                      type="number"
                      step="0.01"
                      {...register('shippingCost', {
                        valueAsNumber: true,
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="discounts">Descuentos</Label>
                    <Input
                      id="discounts"
                      type="number"
                      step="0.01"
                      {...register('discounts', {
                        valueAsNumber: true,
                      })}
                    />
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notes */}
            <Card>
              <CardHeader>
                <CardTitle>Notas</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  {...register('notes')}
                  placeholder="Notas adicionales..."
                  rows={4}
                />
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                asChild
              >
                <Link href="/orders">Cancelar</Link>
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={isSubmitting}
              >
                <Save className="mr-2 h-4 w-4" />
                {isSubmitting ? 'Guardando...' : 'Crear Pedido'}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
