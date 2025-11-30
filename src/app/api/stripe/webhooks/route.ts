/**
 * ZADIA OS - Stripe Webhooks API
 * 
 * Handle Stripe webhook events
 */

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { 
  collection, 
  addDoc, 
  updateDoc,
  query,
  where,
  getDocs,
  doc,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY || '');
}

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature') || '';

    let event: Stripe.Event;

    try {
      const stripe = getStripe();
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch {
      return NextResponse.json(
        { error: 'Invalid webhook signature' },
        { status: 400 }
      );
    }

    // Handle events
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdate(event.data.object as Stripe.Subscription);
        break;
      
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
      
      case 'invoice.paid':
        await handleInvoicePaid(event.data.object as Stripe.Invoice);
        break;
      
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;
      
      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;
    }

    return NextResponse.json({ received: true });
  } catch {
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const tenantId = session.metadata?.tenantId || session.client_reference_id;
  if (!tenantId) return;

  // Update checkout session status
  const sessionsRef = collection(db, 'checkoutSessions');
  const q = query(sessionsRef, where('stripeSessionId', '==', session.id));
  const snapshot = await getDocs(q);
  
  if (!snapshot.empty) {
    await updateDoc(doc(db, 'checkoutSessions', snapshot.docs[0].id), {
      status: 'complete',
    });
  }

  // Create customer record if needed
  if (session.customer && typeof session.customer === 'string') {
    const customersRef = collection(db, 'stripeCustomers');
    const customerQuery = query(customersRef, where('tenantId', '==', tenantId));
    const customerSnapshot = await getDocs(customerQuery);
    
    if (customerSnapshot.empty) {
      await addDoc(customersRef, {
        tenantId,
        stripeCustomerId: session.customer,
        email: session.customer_email || '',
        name: session.customer_details?.name || '',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
    }
  }
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const tenantId = subscription.metadata?.tenantId;
  if (!tenantId) return;

  const priceId = subscription.items.data[0]?.price?.id || '';
  const product = subscription.items.data[0]?.price?.product;
  const productId = typeof product === 'string' ? product : (product as Stripe.Product)?.id || '';
  const productName = typeof product !== 'string' && 'name' in (product as Stripe.Product) 
    ? (product as Stripe.Product).name 
    : 'Plan';

  const subscriptionData = {
    tenantId,
    stripeSubscriptionId: subscription.id,
    stripeCustomerId: typeof subscription.customer === 'string' 
      ? subscription.customer 
      : subscription.customer.id,
    status: subscription.status,
    priceId,
    productId,
    productName,
    interval: subscription.items.data[0]?.price?.recurring?.interval as 'month' | 'year',
    amount: subscription.items.data[0]?.price?.unit_amount || 0,
    currency: subscription.currency,
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
    updatedAt: Timestamp.now(),
  };

  // Check if subscription exists
  const subsRef = collection(db, 'subscriptions');
  const q = query(subsRef, where('stripeSubscriptionId', '==', subscription.id));
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    await addDoc(subsRef, {
      ...subscriptionData,
      createdAt: Timestamp.now(),
    });
  } else {
    await updateDoc(doc(db, 'subscriptions', snapshot.docs[0].id), subscriptionData);
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const subsRef = collection(db, 'subscriptions');
  const q = query(subsRef, where('stripeSubscriptionId', '==', subscription.id));
  const snapshot = await getDocs(q);

  if (!snapshot.empty) {
    await updateDoc(doc(db, 'subscriptions', snapshot.docs[0].id), {
      status: 'canceled',
      updatedAt: Timestamp.now(),
    });
  }
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  const tenantId = invoice.metadata?.tenantId;
  if (!tenantId) return;

  // Record payment
  await addDoc(collection(db, 'payments'), {
    tenantId,
    stripeInvoiceId: invoice.id,
    stripeCustomerId: typeof invoice.customer === 'string' 
      ? invoice.customer 
      : (invoice.customer as Stripe.Customer)?.id || '',
    amount: invoice.amount_paid,
    currency: invoice.currency,
    status: 'succeeded',
    paymentMethodType: 'card',
    description: `Factura ${invoice.number}`,
    receiptUrl: invoice.hosted_invoice_url || undefined,
    metadata: {
      invoiceNumber: invoice.number || '',
    },
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const tenantId = invoice.metadata?.tenantId;
  if (!tenantId) return;

  await addDoc(collection(db, 'payments'), {
    tenantId,
    stripeInvoiceId: invoice.id,
    amount: invoice.amount_due,
    currency: invoice.currency || 'usd',
    status: 'failed',
    paymentMethodType: 'card',
    description: `Factura ${invoice.number} - Pago fallido`,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
}

async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  const tenantId = paymentIntent.metadata?.tenantId;
  const invoiceId = paymentIntent.metadata?.invoiceId;
  
  if (!tenantId) return;

  // Check if this payment was for an invoice
  if (invoiceId) {
    // Update invoice status
    const invoicesRef = collection(db, 'invoices');
    const q = query(invoicesRef, where('id', '==', invoiceId));
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      await updateDoc(doc(db, 'invoices', snapshot.docs[0].id), {
        status: 'paid',
        paidAt: Timestamp.now(),
        stripePaymentIntentId: paymentIntent.id,
      });
    }
  }

  // Record payment
  await addDoc(collection(db, 'payments'), {
    tenantId,
    stripePaymentIntentId: paymentIntent.id,
    invoiceId: invoiceId || null,
    amount: paymentIntent.amount,
    currency: paymentIntent.currency,
    status: 'succeeded',
    paymentMethodType: paymentIntent.payment_method_types?.[0] || 'card',
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
}
