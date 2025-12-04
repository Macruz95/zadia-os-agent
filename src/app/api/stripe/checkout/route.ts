/**
 * ZADIA OS - Stripe Checkout API
 * 
 * Server-side Stripe integration for checkout sessions
 * Uses Firebase Admin SDK for secure server-side operations
 */

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { cookies } from 'next/headers';
import { getAuth } from 'firebase-admin/auth';
import { getApps, initializeApp, cert } from 'firebase-admin/app';

// Initialize Firebase Admin if not already initialized
function getAdminAuth() {
  if (!getApps().length) {
    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (serviceAccountKey) {
      try {
        const serviceAccount = JSON.parse(serviceAccountKey);
        initializeApp({
          credential: cert(serviceAccount),
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        });
      } catch {
        initializeApp({
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        });
      }
    } else {
      initializeApp({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      });
    }
  }
  return getAuth();
}

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY || '');
}

export async function POST(request: NextRequest) {
  try {
    // Verify user is authenticated
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify token with Firebase Admin
    let userId: string;
    try {
      const auth = getAdminAuth();
      const decodedToken = await auth.verifyIdToken(token);
      userId = decodedToken.uid;
    } catch {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

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

    // Verify user has access to tenant
    const tenantDoc = await adminDb.collection('tenants').doc(tenantId).get();
    if (!tenantDoc.exists) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      );
    }

    const tenantData = tenantDoc.data();
    const isTenantOwner = tenantData?.ownerId === userId;
    
    // Check if user is a member
    const memberDoc = await adminDb.collection('tenantMembers').doc(`${tenantId}_${userId}`).get();
    const isTenantMember = memberDoc.exists;

    if (!isTenantOwner && !isTenantMember) {
      return NextResponse.json(
        { error: 'Forbidden - Not a tenant member' },
        { status: 403 }
      );
    }

    // Get or create Stripe customer using Admin SDK
    let customerId: string | undefined;
    
    const customersQuery = await adminDb.collection('stripeCustomers')
      .where('tenantId', '==', tenantId)
      .limit(1)
      .get();
    
    if (!customersQuery.empty) {
      customerId = customersQuery.docs[0].data().stripeCustomerId;
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
        userId,
      },
    };

    if (customerId) {
      sessionParams.customer = customerId;
    } else if (customerEmail) {
      sessionParams.customer_email = customerEmail;
    }

    if (mode === 'subscription') {
      sessionParams.subscription_data = {
        metadata: { tenantId, userId },
      };
    }

    if (mode === 'payment') {
      sessionParams.payment_intent_data = {
        metadata: {
          tenantId,
          invoiceId: invoiceId || '',
          userId,
        },
      };
    }

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create(sessionParams);

    // Store session in Firestore using Admin SDK
    await adminDb.collection('checkoutSessions').add({
      tenantId,
      userId,
      stripeSessionId: session.id,
      mode,
      status: 'open',
      successUrl,
      cancelUrl,
      clientReferenceId: tenantId,
      invoiceId: invoiceId || null,
      createdAt: FieldValue.serverTimestamp(),
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
