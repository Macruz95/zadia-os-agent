/**
 * ZADIA OS - Stripe Customers API
 * 
 * Create and manage Stripe customers
 */

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { cookies } from 'next/headers';
import { adminDb, getAdminAuth } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

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
    const { tenantId, email, name } = body;

    if (!tenantId || !email || !name) {
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

    // Prevent duplicate customer record for tenant
    const existing = await adminDb.collection('stripeCustomers')
      .where('tenantId', '==', tenantId)
      .limit(1)
      .get();
    if (!existing.empty) {
      const existingData = existing.docs[0].data();
      return NextResponse.json(
        {
          id: existing.docs[0].id,
          tenantId,
          stripeCustomerId: existingData.stripeCustomerId,
          email: existingData.email,
          name: existingData.name,
        },
        { status: 200 }
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

    // Store in Firestore (Admin)
    const docRef = await adminDb.collection('stripeCustomers').add({
      tenantId,
      stripeCustomerId: stripeCustomer.id,
      email,
      name,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
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
