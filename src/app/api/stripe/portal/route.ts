/**
 * ZADIA OS - Stripe Billing Portal API
 * 
 * Create customer portal sessions
 */

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { cookies } from 'next/headers';
import { adminDb, getAdminAuth } from '@/lib/firebase-admin';

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY || '');
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminAuth = getAdminAuth();
    if (!adminAuth) {
      return NextResponse.json(
        { error: 'Server auth not configured' },
        { status: 501 }
      );
    }

    let userId: string;
    try {
      const decoded = await adminAuth.verifyIdToken(token, true);
      userId = decoded.uid;
    } catch {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json();
    const { tenantId, returnUrl } = body;

    if (!tenantId || !returnUrl) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify user has access to tenant
    const tenantDoc = await adminDb.collection('tenants').doc(tenantId).get();
    if (!tenantDoc.exists) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    const tenantData = tenantDoc.data();
    const isTenantOwner = tenantData?.ownerId === userId;
    const memberDoc = await adminDb.collection('tenantMembers').doc(`${tenantId}_${userId}`).get();
    const isTenantMember = memberDoc.exists;
    if (!isTenantOwner && !isTenantMember) {
      return NextResponse.json(
        { error: 'Forbidden - Not a tenant member' },
        { status: 403 }
      );
    }

    // Get Stripe customer from Admin Firestore
    const customersQuery = await adminDb.collection('stripeCustomers')
      .where('tenantId', '==', tenantId)
      .limit(1)
      .get();

    if (customersQuery.empty) {
      return NextResponse.json(
        { error: 'No Stripe customer found for this tenant' },
        { status: 404 }
      );
    }

    const customerId = customersQuery.docs[0].data().stripeCustomerId;

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
