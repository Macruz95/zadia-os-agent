/**
 * ZADIA OS - Stripe Checkout API
 * 
 * Server-side Stripe integration for checkout sessions
 */

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { 
  collection, 
  addDoc, 
  Timestamp,
  query,
  where,
  getDocs, 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY || '');
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      tenantId,
      mode,
      priceId,
      amount,
      currency,
      description,
      invoiceId,
      customerEmail,
      successUrl,
      cancelUrl,
    } = body;

    if (!tenantId || !mode || !successUrl || !cancelUrl) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get or create Stripe customer
    let customerId: string | undefined;
    
    const customersRef = collection(db, 'stripeCustomers');
    const customerQuery = query(customersRef, where('tenantId', '==', tenantId));
    const customerSnapshot = await getDocs(customerQuery);
    
    if (!customerSnapshot.empty) {
      customerId = customerSnapshot.docs[0].data().stripeCustomerId;
    }

    // Build line items based on mode
    let lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
    
    if (mode === 'subscription' && priceId) {
      lineItems = [{
        price: priceId,
        quantity: 1,
      }];
    } else if (mode === 'payment' && amount) {
      lineItems = [{
        price_data: {
          currency: currency || 'usd',
          product_data: {
            name: description || 'Pago',
          },
          unit_amount: amount,
        },
        quantity: 1,
      }];
    }

    // Create checkout session
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: mode as Stripe.Checkout.SessionCreateParams.Mode,
      line_items: lineItems,
      success_url: successUrl,
      cancel_url: cancelUrl,
      client_reference_id: tenantId,
      metadata: {
        tenantId,
        invoiceId: invoiceId || '',
      },
    };

    if (customerId) {
      sessionParams.customer = customerId;
    } else if (customerEmail) {
      sessionParams.customer_email = customerEmail;
    }

    if (mode === 'subscription') {
      sessionParams.subscription_data = {
        metadata: { tenantId },
      };
    }

    if (mode === 'payment') {
      sessionParams.payment_intent_data = {
        metadata: {
          tenantId,
          invoiceId: invoiceId || '',
        },
      };
    }

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create(sessionParams);

    // Store session in Firestore
    await addDoc(collection(db, 'checkoutSessions'), {
      tenantId,
      stripeSessionId: session.id,
      mode,
      status: 'open',
      successUrl,
      cancelUrl,
      clientReferenceId: tenantId,
      invoiceId: invoiceId || null,
      createdAt: Timestamp.now(),
    });

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch {
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
