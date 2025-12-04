/**
 * ZADIA OS - Stripe Service
 * 
 * Payment processing, subscriptions, and checkout
 * REGLA 1: Real Firebase data (Stripe integration)
 * REGLA 4: Modular architecture
 */

import { 
  collection, 
  doc, 
  getDoc,
  query,
  where,
  getDocs,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { logger } from '@/lib/logger';

// ============================================
// Types
// ============================================

export type SubscriptionStatus = 
  | 'active'
  | 'canceled'
  | 'incomplete'
  | 'incomplete_expired'
  | 'past_due'
  | 'paused'
  | 'trialing'
  | 'unpaid';

export type PaymentStatus = 
  | 'pending'
  | 'processing'
  | 'succeeded'
  | 'failed'
  | 'refunded'
  | 'canceled';

export interface StripeCustomer {
  id: string;
  tenantId: string;
  stripeCustomerId: string;
  email: string;
  name: string;
  defaultPaymentMethodId?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Subscription {
  id: string;
  tenantId: string;
  stripeSubscriptionId: string;
  stripeCustomerId: string;
  status: SubscriptionStatus;
  priceId: string;
  productId: string;
  productName: string;
  interval: 'month' | 'year';
  amount: number;
  currency: string;
  currentPeriodStart: Timestamp;
  currentPeriodEnd: Timestamp;
  cancelAtPeriodEnd: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Payment {
  id: string;
  tenantId: string;
  stripePaymentIntentId: string;
  stripeCustomerId?: string;
  invoiceId?: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentMethodType: string;
  description?: string;
  receiptUrl?: string;
  metadata?: Record<string, string>;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface CheckoutSession {
  id: string;
  tenantId: string;
  stripeSessionId: string;
  mode: 'payment' | 'subscription' | 'setup';
  status: 'open' | 'complete' | 'expired';
  successUrl: string;
  cancelUrl: string;
  clientReferenceId?: string;
  invoiceId?: string;
  createdAt: Timestamp;
}

// ============================================
// Customer Management
// ============================================

/**
 * Create or get Stripe customer for tenant
 */
export async function getOrCreateStripeCustomer(
  tenantId: string,
  email: string,
  name: string
): Promise<StripeCustomer | null> {
  try {
    // Check if customer exists
    const customersRef = collection(db, 'stripeCustomers');
    const q = query(customersRef, where('tenantId', '==', tenantId));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      return {
        id: snapshot.docs[0].id,
        ...snapshot.docs[0].data(),
      } as StripeCustomer;
    }

    // Create customer via API route (server-side Stripe call)
    const response = await fetch('/api/stripe/customers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tenantId, email, name }),
    });

    if (!response.ok) {
      throw new Error('Failed to create Stripe customer');
    }

    const customer = await response.json();
    return customer;
  } catch (error) {
    logger.error('Failed to get/create Stripe customer', error as Error);
    return null;
  }
}

/**
 * Get customer by tenant ID
 */
export async function getStripeCustomer(
  tenantId: string
): Promise<StripeCustomer | null> {
  try {
    const customersRef = collection(db, 'stripeCustomers');
    const q = query(customersRef, where('tenantId', '==', tenantId));
    const snapshot = await getDocs(q);

    if (snapshot.empty) return null;

    return {
      id: snapshot.docs[0].id,
      ...snapshot.docs[0].data(),
    } as StripeCustomer;
  } catch (error) {
    logger.error('Failed to get Stripe customer', error as Error);
    return null;
  }
}

// ============================================
// Subscriptions
// ============================================

/**
 * Get tenant subscription
 */
export async function getSubscription(
  tenantId: string
): Promise<Subscription | null> {
  try {
    const subsRef = collection(db, 'subscriptions');
    const q = query(
      subsRef, 
      where('tenantId', '==', tenantId),
      where('status', 'in', ['active', 'trialing', 'past_due'])
    );
    const snapshot = await getDocs(q);

    if (snapshot.empty) return null;

    return {
      id: snapshot.docs[0].id,
      ...snapshot.docs[0].data(),
    } as Subscription;
  } catch (error) {
    logger.error('Failed to get subscription', error as Error);
    return null;
  }
}

/**
 * Create subscription checkout session
 */
export async function createSubscriptionCheckout(
  tenantId: string,
  priceId: string,
  successUrl: string,
  cancelUrl: string
): Promise<{ sessionId: string; url: string } | null> {
  try {
    const response = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tenantId,
        priceId,
        mode: 'subscription',
        successUrl,
        cancelUrl,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create checkout session');
    }

    return await response.json();
  } catch (error) {
    logger.error('Failed to create subscription checkout', error as Error);
    return null;
  }
}

/**
 * Cancel subscription at period end
 */
export async function cancelSubscription(
  tenantId: string
): Promise<boolean> {
  try {
    const response = await fetch('/api/stripe/subscriptions/cancel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tenantId }),
    });

    return response.ok;
  } catch (error) {
    logger.error('Failed to cancel subscription', error as Error);
    return false;
  }
}

/**
 * Reactivate canceled subscription
 */
export async function reactivateSubscription(
  tenantId: string
): Promise<boolean> {
  try {
    const response = await fetch('/api/stripe/subscriptions/reactivate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tenantId }),
    });

    return response.ok;
  } catch (error) {
    logger.error('Failed to reactivate subscription', error as Error);
    return false;
  }
}

// ============================================
// Payments
// ============================================

/**
 * Create one-time payment checkout (for invoices)
 */
export async function createPaymentCheckout(params: {
  tenantId: string;
  amount: number;
  currency: string;
  description: string;
  invoiceId?: string;
  customerEmail?: string;
  successUrl: string;
  cancelUrl: string;
}): Promise<{ sessionId: string; url: string } | null> {
  try {
    const response = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...params,
        mode: 'payment',
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create payment checkout');
    }

    return await response.json();
  } catch (error) {
    logger.error('Failed to create payment checkout', error as Error);
    return null;
  }
}

/**
 * Get payments for tenant
 */
export async function getPayments(
  tenantId: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _pageSize: number = 50
): Promise<Payment[]> {
  try {
    const paymentsRef = collection(db, 'payments');
    const q = query(
      paymentsRef,
      where('tenantId', '==', tenantId),
    );
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as Payment));
  } catch (error) {
    logger.error('Failed to get payments', error as Error);
    return [];
  }
}

/**
 * Get payment by ID
 */
export async function getPayment(
  paymentId: string
): Promise<Payment | null> {
  try {
    const docRef = doc(db, 'payments', paymentId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) return null;

    return {
      id: docSnap.id,
      ...docSnap.data(),
    } as Payment;
  } catch (error) {
    logger.error('Failed to get payment', error as Error);
    return null;
  }
}

// ============================================
// Billing Portal
// ============================================

/**
 * Create billing portal session
 */
export async function createBillingPortalSession(
  tenantId: string,
  returnUrl: string
): Promise<{ url: string } | null> {
  try {
    const response = await fetch('/api/stripe/portal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tenantId, returnUrl }),
    });

    if (!response.ok) {
      throw new Error('Failed to create billing portal session');
    }

    return await response.json();
  } catch (error) {
    logger.error('Failed to create billing portal session', error as Error);
    return null;
  }
}

// ============================================
// Pricing Plans
// ============================================

export interface PricingPlan {
  id: string;
  name: string;
  description: string;
  priceId: string;
  amount: number;
  currency: string;
  interval: 'month' | 'year';
  features: string[];
  highlighted?: boolean;
  maxUsers?: number;
  maxStorage?: number;
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'Para pequeños negocios',
    priceId: process.env.NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID || '',
    amount: 2900, // $29.00
    currency: 'usd',
    interval: 'month',
    features: [
      '5 usuarios incluidos',
      '5 GB almacenamiento',
      'CRM básico',
      'Facturación',
      'Soporte por email',
    ],
    maxUsers: 5,
    maxStorage: 5,
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'Para empresas en crecimiento',
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID || '',
    amount: 7900, // $79.00
    currency: 'usd',
    interval: 'month',
    features: [
      '20 usuarios incluidos',
      '50 GB almacenamiento',
      'CRM completo',
      'Facturación + Pagos',
      'Inventario',
      'Proyectos',
      'API acceso',
      'Soporte prioritario',
    ],
    highlighted: true,
    maxUsers: 20,
    maxStorage: 50,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'Para grandes organizaciones',
    priceId: process.env.NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID || '',
    amount: 19900, // $199.00
    currency: 'usd',
    interval: 'month',
    features: [
      'Usuarios ilimitados',
      '500 GB almacenamiento',
      'Todas las funciones',
      'White-label opcional',
      'API ilimitada',
      'SSO & SAML',
      'Account manager dedicado',
      'SLA 99.9%',
    ],
    maxUsers: -1, // Unlimited
    maxStorage: 500,
  },
];

/**
 * Get pricing plan by ID
 */
export function getPricingPlan(planId: string): PricingPlan | undefined {
  return PRICING_PLANS.find(p => p.id === planId);
}

/**
 * Format price for display
 */
export function formatPrice(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: 0,
  }).format(amount / 100);
}
