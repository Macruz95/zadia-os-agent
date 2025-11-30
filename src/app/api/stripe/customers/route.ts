/**
 * ZADIA OS - Stripe Customers API
 * 
 * Create and manage Stripe customers
 */

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { 
  collection, 
  addDoc, 
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY || '');
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tenantId, email, name } = body;

    if (!tenantId || !email || !name) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create Stripe customer
    const stripe = getStripe();
    const stripeCustomer = await stripe.customers.create({
      email,
      name,
      metadata: {
        tenantId,
      },
    });

    // Store in Firestore
    const docRef = await addDoc(collection(db, 'stripeCustomers'), {
      tenantId,
      stripeCustomerId: stripeCustomer.id,
      email,
      name,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    return NextResponse.json({
      id: docRef.id,
      tenantId,
      stripeCustomerId: stripeCustomer.id,
      email,
      name,
    });
  } catch {
    return NextResponse.json(
      { error: 'Failed to create Stripe customer' },
      { status: 500 }
    );
  }
}
