/**
 * ZADIA OS - Stripe Webhooks API
 * 
 * Handle Stripe webhook events
 */

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { adminDb, getAdminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY || '');
}

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature') || '';

    // Ensure Admin DB is available for webhook processing
    if (!getAdminDb()) {
      return NextResponse.json(
        { error: 'Server database not configured' },
        { status: 501 }
      );
    }

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
  const sessionsQuery = await adminDb.collection('checkoutSessions')
    .where('stripeSessionId', '==', session.id)
    .limit(1)
    .get();
  if (!sessionsQuery.empty) {
    await sessionsQuery.docs[0].ref.update({
      status: 'complete',
      updatedAt: FieldValue.serverTimestamp(),
    });
  }

  // Create customer record if needed
  if (session.customer && typeof session.customer === 'string') {
    const customerSnapshot = await adminDb.collection('stripeCustomers')
      .where('tenantId', '==', tenantId)
      .limit(1)
      .get();

    if (customerSnapshot.empty) {
      await adminDb.collection('stripeCustomers').add({
        tenantId,
        stripeCustomerId: session.customer,
        email: session.customer_email || '',
        name: session.customer_details?.name || '',
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
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
    updatedAt: FieldValue.serverTimestamp(),
  };

  // Check if subscription exists
  const subsSnapshot = await adminDb.collection('subscriptions')
    .where('stripeSubscriptionId', '==', subscription.id)
    .limit(1)
    .get();

  if (subsSnapshot.empty) {
    await adminDb.collection('subscriptions').add({
      ...subscriptionData,
      createdAt: FieldValue.serverTimestamp(),
    });
  } else {
    await subsSnapshot.docs[0].ref.update(subscriptionData);
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const subsSnapshot = await adminDb.collection('subscriptions')
    .where('stripeSubscriptionId', '==', subscription.id)
    .limit(1)
    .get();

  if (!subsSnapshot.empty) {
    await subsSnapshot.docs[0].ref.update({
      status: 'canceled',
      updatedAt: FieldValue.serverTimestamp(),
    });
  }
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  const tenantId = invoice.metadata?.tenantId;
  if (!tenantId) return;

  // Record payment
  await adminDb.collection('payments').add({
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
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const tenantId = invoice.metadata?.tenantId;
  if (!tenantId) return;

  await adminDb.collection('payments').add({
    tenantId,
    stripeInvoiceId: invoice.id,
    amount: invoice.amount_due,
    currency: invoice.currency || 'usd',
    status: 'failed',
    paymentMethodType: 'card',
    description: `Factura ${invoice.number} - Pago fallido`,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
}

async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  const tenantId = paymentIntent.metadata?.tenantId;
  const invoiceId = paymentIntent.metadata?.invoiceId;
  
  if (!tenantId) return;

  // Check if this payment was for an invoice
  if (invoiceId) {
    // Update invoice status
    const invoiceRef = adminDb.collection('invoices').doc(invoiceId);
    const invoiceSnap = await invoiceRef.get();
    if (invoiceSnap.exists) {
      const invoiceData = invoiceSnap.data();
      if (invoiceData?.tenantId === tenantId) {
        await invoiceRef.update({
          status: 'paid',
          paidAt: FieldValue.serverTimestamp(),
          stripePaymentIntentId: paymentIntent.id,
          updatedAt: FieldValue.serverTimestamp(),
        });
      }
    }
  }

  // Record payment
  await adminDb.collection('payments').add({
    tenantId,
    stripePaymentIntentId: paymentIntent.id,
    invoiceId: invoiceId || null,
    amount: paymentIntent.amount,
    currency: paymentIntent.currency,
    status: 'succeeded',
    paymentMethodType: paymentIntent.payment_method_types?.[0] || 'card',
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
}
