import { Timestamp } from 'firebase/firestore';

/**
 * Estados posibles de un pedido
 */
export type OrderStatus = 
  | 'draft'        // Borrador (no confirmado)
  | 'pending'      // Pendiente de procesar
  | 'confirmed'    // Confirmado por cliente
  | 'processing'   // En proceso de preparación
  | 'ready'        // Listo para envío
  | 'shipped'      // Enviado
  | 'delivered'    // Entregado
  | 'cancelled';   // Cancelado

/**
 * Métodos de envío
 */
export type ShippingMethod =
  | 'pickup'       // Recoger en tienda
  | 'standard'     // Envío estándar (3-5 días)
  | 'express'      // Envío express (1-2 días)
  | 'overnight';   // Envío urgente (24 hrs)

/**
 * Estados de pago del pedido
 */
export type PaymentStatus =
  | 'pending'      // Pendiente de pago
  | 'partial'      // Pago parcial
  | 'paid'         // Pagado completamente
  | 'refunded';    // Reembolsado

/**
 * Item individual del pedido
 */
export interface OrderItem {
  id: string;
  productId?: string;
  productName: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  subtotal: number;
  unitOfMeasure?: string;
  availableStock?: number;
}

/**
 * Dirección de envío
 */
export interface ShippingAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  contactName?: string;
  contactPhone?: string;
}

/**
 * Información de tracking
 */
export interface TrackingInfo {
  carrier: string;         // Paquetería (FedEx, DHL, etc.)
  trackingNumber: string;  // Número de guía
  trackingUrl?: string;    // URL de rastreo
  shippedDate: Date | Timestamp;
  estimatedDelivery?: Date | Timestamp;
  actualDelivery?: Date | Timestamp;
}

/**
 * Pedido (Order)
 * Representa un pedido de venta
 */
export interface Order {
  id: string;
  number: string;              // ORD-2025-001
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  
  // Referencias
  clientId: string;
  clientName: string;
  quoteId?: string;            // Si viene de una cotización
  quoteNumber?: string;
  invoiceId?: string;          // Factura generada
  invoiceNumber?: string;
  
  // Items
  items: OrderItem[];
  
  // Totales
  subtotal: number;
  taxes: Record<string, number>; // { "IVA": 16 }
  shippingCost: number;
  discounts: number;
  total: number;
  currency: string;
  
  // Envío
  shippingMethod: ShippingMethod;
  shippingAddress: ShippingAddress;
  tracking?: TrackingInfo;
  
  // Fechas
  orderDate: Date | Timestamp;
  requiredDate?: Date | Timestamp;  // Fecha requerida por cliente
  shippedDate?: Date | Timestamp;
  deliveredDate?: Date | Timestamp;
  
  // Notas
  notes?: string;
  internalNotes?: string;
  
  // Auditoría
  createdBy: string;
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
}

/**
 * Configuración de estados
 */
export const ORDER_STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; color: string; icon: string }
> = {
  draft: { label: 'Borrador', color: 'gray', icon: 'FileText' },
  pending: { label: 'Pendiente', color: 'yellow', icon: 'Clock' },
  confirmed: { label: 'Confirmado', color: 'blue', icon: 'CheckCircle' },
  processing: { label: 'Procesando', color: 'purple', icon: 'Package' },
  ready: { label: 'Listo', color: 'cyan', icon: 'PackageCheck' },
  shipped: { label: 'Enviado', color: 'indigo', icon: 'Truck' },
  delivered: { label: 'Entregado', color: 'green', icon: 'PackageCheck' },
  cancelled: { label: 'Cancelado', color: 'red', icon: 'XCircle' },
};

export const SHIPPING_METHOD_CONFIG: Record<
  ShippingMethod,
  { label: string; estimatedDays: string; icon: string }
> = {
  pickup: { label: 'Recoger en tienda', estimatedDays: 'Mismo día', icon: 'Store' },
  standard: { label: 'Envío estándar', estimatedDays: '3-5 días', icon: 'Truck' },
  express: { label: 'Envío express', estimatedDays: '1-2 días', icon: 'Zap' },
  overnight: { label: 'Envío urgente', estimatedDays: '24 horas', icon: 'Rocket' },
};

export const PAYMENT_STATUS_CONFIG: Record<
  PaymentStatus,
  { label: string; color: string }
> = {
  pending: { label: 'Pendiente', color: 'yellow' },
  partial: { label: 'Parcial', color: 'orange' },
  paid: { label: 'Pagado', color: 'green' },
  refunded: { label: 'Reembolsado', color: 'red' },
};

/**
 * Filtros para búsqueda de pedidos
 */
export interface OrderFilters {
  clientId?: string;
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  startDate?: Date;
  endDate?: Date;
  shippingMethod?: ShippingMethod;
}

/**
 * Estadísticas de pedidos
 */
export interface OrderStats {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  averageOrderValue: number;
}
