/**
 * ZADIA OS - Order Form Hook
 * Hook para manejar la lógica del formulario de pedidos
 * Rule #5: Max 200 lines per file
 */

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { Timestamp } from 'firebase/firestore';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';
import { OrdersService } from '../services/orders.service';
import { QuotesService } from '@/modules/sales/services/quotes.service';
import type { OrderFormData } from '../validations/orders.validation';

export function useOrderForm(userId?: string) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const quoteId = searchParams.get('quoteId');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [loadingQuote, setLoadingQuote] = useState(false);

  const formMethods = useForm<OrderFormData>({
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

  const { control, setValue, watch } = formMethods;

  const itemsArray = useFieldArray({
    control,
    name: 'items',
  });

  const items = watch('items');
  const shippingCost = watch('shippingCost');
  const discounts = watch('discounts');

  // Generar número de pedido
  useEffect(() => {
    const generateNumber = async () => {
      const number = await OrdersService.generateOrderNumber();
      setOrderNumber(number);
    };
    generateNumber();
  }, []);

  // Cargar cotización si viene de una quote
  useEffect(() => {
    const loadQuote = async () => {
      if (!quoteId) return;

      setLoadingQuote(true);
      try {
        const quote = await QuotesService.getQuoteById(quoteId);
        if (!quote) {
          toast.error('Cotización no encontrada');
          return;
        }

        setValue('clientId', quote.clientId);
        // Note: clientName needs to be fetched separately from clientId
        setValue('quoteId', quote.id);
        setValue('quoteNumber', quote.number);

        const orderItems = quote.items.map((item) => ({
          productName: item.description, // Using description as productName
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discount: item.discount,
          subtotal: item.subtotal,
          unitOfMeasure: item.unitOfMeasure || 'pza',
        }));

        setValue('items', orderItems);
        setValue('subtotal', quote.subtotal);
        setValue('taxes', quote.taxes);
        setValue('discounts', quote.discounts);
        setValue('total', quote.total);
        setValue('currency', quote.currency);

        if (quote.notes) {
          setValue('notes', quote.notes);
        }

        toast.success('Cotización cargada exitosamente');
      } catch {
        toast.error('Error al cargar cotización');
      } finally {
        setLoadingQuote(false);
      }
    };

    loadQuote();
  }, [quoteId, setValue]);

  // Calcular totales
  useEffect(() => {
    let subtotal = 0;

    items.forEach((item, index) => {
      const itemSubtotal =
        item.quantity * item.unitPrice * (1 - item.discount / 100);
      subtotal += itemSubtotal;
      setValue(`items.${index}.subtotal`, itemSubtotal);
    });

    const taxAmount = (subtotal * 16) / 100;
    const total = subtotal + taxAmount + shippingCost - discounts;

    setValue('subtotal', subtotal);
    setValue('total', total);
  }, [items, shippingCost, discounts, setValue]);

  const onSubmit = async (data: OrderFormData) => {
    if (!userId) {
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
        createdBy: userId,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const orderId = await OrdersService.createOrder(orderData as any);
      toast.success('Pedido creado exitosamente');
      router.push(`/orders/${orderId}`);
    } catch (error) {
      toast.error('Error al crear pedido');
      logger.error('Error creating order', error as Error, {
        component: 'useOrderForm',
        action: 'handleSubmit'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formMethods,
    itemsArray,
    isSubmitting,
    orderNumber,
    loadingQuote,
    items,
    shippingCost,
    discounts,
    onSubmit,
  };
}
