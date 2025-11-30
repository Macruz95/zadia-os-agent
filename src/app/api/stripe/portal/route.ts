/**
 * ZADIA OS - Stripe Billing Portal API
 * 
 * Create customer portal sessions
 */

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { 
  collection, 
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
    const { tenantId, returnUrl } = body;

    if (!tenantId || !returnUrl) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get Stripe customer
    const customersRef = collection(db, 'stripeCustomers');
    const q = query(customersRef, where('tenantId', '==', tenantId));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return NextResponse.json(
        { error: 'No Stripe customer found for this tenant' },
        { status: 404 }
      );
    }

    const customerId = snapshot.docs[0].data().stripeCustomerId;

    // Create portal session
    const stripe = getStripe();
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });

    return NextResponse.json({
      url: session.url,
    });
  } catch {
    return NextResponse.json(
      { error: 'Failed to create billing portal session' },
      { status: 500 }
    );
  }
}
