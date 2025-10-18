import { z } from 'zod';

/**
 * Schema para OrderItem
 */
export const orderItemSchema = z.object({
  id: z.string().optional(),
  productId: z.string().optional(),
  productName: z.string().min(1, 'El nombre del producto es requerido'),
  description: z.string().min(1, 'La descripción es requerida'),
  quantity: z.number().positive('La cantidad debe ser mayor a 0'),
  unitPrice: z.number().nonnegative('El precio debe ser mayor o igual a 0'),
  discount: z.number().nonnegative('El descuento debe ser mayor o igual a 0').default(0),
  subtotal: z.number().nonnegative('El subtotal debe ser mayor o igual a 0'),
  unitOfMeasure: z.string().optional().default('pza'),
  availableStock: z.number().optional(),
});

/**
 * Schema para ShippingAddress
 */
export const shippingAddressSchema = z.object({
  street: z.string().min(1, 'La calle es requerida'),
  city: z.string().min(1, 'La ciudad es requerida'),
  state: z.string().min(1, 'El estado es requerido'),
  zipCode: z.string().min(1, 'El código postal es requerido'),
  country: z.string().min(1, 'El país es requerido').default('México'),
  contactName: z.string().optional(),
  contactPhone: z.string().optional(),
});

/**
 * Schema para TrackingInfo
 */
export const trackingInfoSchema = z.object({
  carrier: z.string().min(1, 'La paquetería es requerida'),
  trackingNumber: z.string().min(1, 'El número de guía es requerido'),
  trackingUrl: z.string().url('URL inválida').optional(),
  shippedDate: z.date(),
  estimatedDelivery: z.date().optional(),
  actualDelivery: z.date().optional(),
});

/**
 * Schema para crear/actualizar Order
 */
export const orderSchema = z.object({
  number: z.string().regex(/^ORD-\d{4}-\d{3,}$/, 'Formato de número inválido (ORD-YYYY-NNN)').optional(),
  status: z.enum([
    'draft',
    'pending',
    'confirmed',
    'processing',
    'ready',
    'shipped',
    'delivered',
    'cancelled',
  ]),
  paymentStatus: z.enum(['pending', 'partial', 'paid', 'refunded']),
  
  // Referencias
  clientId: z.string().min(1, 'El ID del cliente es requerido'),
  clientName: z.string().min(1, 'El nombre del cliente es requerido'),
  quoteId: z.string().optional(),
  quoteNumber: z.string().optional(),
  invoiceId: z.string().optional(),
  invoiceNumber: z.string().optional(),
  
  // Items
  items: z.array(orderItemSchema).min(1, 'Debe haber al menos un item'),
  
  // Totales
  subtotal: z.number().nonnegative('El subtotal debe ser mayor o igual a 0'),
  taxes: z.record(z.string(), z.number()).default({ IVA: 16 }),
  shippingCost: z.number().nonnegative('El costo de envío debe ser mayor o igual a 0').default(0),
  discounts: z.number().nonnegative('Los descuentos deben ser mayor o igual a 0').default(0),
  total: z.number().nonnegative('El total debe ser mayor o igual a 0'),
  currency: z.string().min(1, 'La moneda es requerida').default('USD'),
  
  // Envío
  shippingMethod: z.enum(['pickup', 'standard', 'express', 'overnight']),
  shippingAddress: shippingAddressSchema,
  tracking: trackingInfoSchema.optional(),
  
  // Fechas
  orderDate: z.date(),
  requiredDate: z.date().optional(),
  shippedDate: z.date().optional(),
  deliveredDate: z.date().optional(),
  
  // Notas
  notes: z.string().max(1000, 'Las notas no pueden exceder 1000 caracteres').optional(),
  internalNotes: z.string().max(1000, 'Las notas internas no pueden exceder 1000 caracteres').optional(),
  
  // Auditoría
  createdBy: z.string().min(1, 'El creador es requerido'),
});

/**
 * Schema para actualizar tracking
 */
export const updateTrackingSchema = z.object({
  carrier: z.string().min(1, 'La paquetería es requerida'),
  trackingNumber: z.string().min(1, 'El número de guía es requerido'),
  trackingUrl: z.string().url('URL inválida').optional(),
  estimatedDelivery: z.date().optional(),
});

/**
 * Schema para actualizar estado
 */
export const updateOrderStatusSchema = z.object({
  status: z.enum([
    'draft',
    'pending',
    'confirmed',
    'processing',
    'ready',
    'shipped',
    'delivered',
    'cancelled',
  ]),
  notes: z.string().max(500, 'Las notas no pueden exceder 500 caracteres').optional(),
});

/**
 * Schema para filtros de búsqueda
 */
export const orderFiltersSchema = z.object({
  clientId: z.string().optional(),
  status: z.enum([
    'draft',
    'pending',
    'confirmed',
    'processing',
    'ready',
    'shipped',
    'delivered',
    'cancelled',
  ]).optional(),
  paymentStatus: z.enum(['pending', 'partial', 'paid', 'refunded']).optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  shippingMethod: z.enum(['pickup', 'standard', 'express', 'overnight']).optional(),
});

/**
 * Type inference
 */
export type OrderFormData = z.infer<typeof orderSchema>;
export type OrderItemFormData = z.infer<typeof orderItemSchema>;
export type ShippingAddressFormData = z.infer<typeof shippingAddressSchema>;
export type TrackingInfoFormData = z.infer<typeof trackingInfoSchema>;
export type UpdateTrackingFormData = z.infer<typeof updateTrackingSchema>;
export type UpdateOrderStatusFormData = z.infer<typeof updateOrderStatusSchema>;
export type OrderFiltersFormData = z.infer<typeof orderFiltersSchema>;
