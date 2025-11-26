/**
 * ZADIA OS - New Order Page
 * Página para crear nuevos pedidos
 * Rule #2: ShadCN UI + Lucide Icons
 * Rule #5: Max 200 lines - Refactorized version
 */

'use client';

import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FormProvider } from 'react-hook-form';
import { useAuthState } from '@/hooks/use-auth-state';
import { useOrderForm } from '@/modules/orders/hooks/use-order-form';
import { formatCurrency } from '@/lib/currency.utils';
import {
  OrderClientInfo,
  OrderItemsTable,
  OrderShippingMethod,
  OrderShippingAddress,
  OrderDates,
  OrderFinancialSummary,
  OrderNotes,
} from '@/modules/orders/components/order-form';

export default function NewOrderPage() {
  const { user } = useAuthState();
  const {
    formMethods,
    itemsArray,
    isSubmitting,
    orderNumber,
    loadingQuote,
    items,
    onSubmit,
  } = useOrderForm(user?.uid);

  const { register, handleSubmit, setValue, watch, formState } = formMethods;
  const { errors } = formState;

  const subtotal = watch('subtotal') || 0;
  const total = watch('total') || 0;
  const taxAmount = (subtotal * 16) / 100;

  if (loadingQuote) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Cargando cotización...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Nuevo Pedido</h1>
          <p className="text-muted-foreground">
            No. {orderNumber || 'Generando...'}
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/orders">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Link>
        </Button>
      </div>

      <FormProvider {...formMethods}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <OrderClientInfo register={register} errors={errors} />

          <OrderItemsTable
            register={register}
            fields={itemsArray.fields}
            append={itemsArray.append}
            remove={itemsArray.remove}
            items={items}
            formatCurrency={(amount: number) => formatCurrency(amount)}
          />

          <OrderShippingMethod
            onValueChange={(value) => setValue('shippingMethod', value)}
          />

          <OrderShippingAddress register={register} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <OrderDates register={register} />
            <OrderFinancialSummary
              register={register}
              subtotal={subtotal}
              taxAmount={taxAmount}
              total={total}
              formatCurrency={(amount: number) => formatCurrency(amount)}
            />
          </div>

          <OrderNotes register={register} />

          <div className="flex justify-end gap-4">
            <Button variant="outline" asChild>
              <Link href="/orders">Cancelar</Link>
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              <Save className="mr-2 h-4 w-4" />
              {isSubmitting ? 'Guardando...' : 'Crear Pedido'}
            </Button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
}
