/**
 * ZADIA OS - Accept Quote API
 * 
 * Public endpoint for accepting quotes
 */

import { NextRequest, NextResponse } from 'next/server';
import { adminDb, getAdminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(request: NextRequest) {
  try {
    if (!getAdminDb()) {
      return NextResponse.json(
        { error: 'Server database not configured' },
        { status: 501 }
      );
    }

    const body = await request.json();
    const { quoteId, token } = body;

    if (!quoteId || !token) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify quote and token
    const quoteRef = adminDb.collection('quotes').doc(quoteId);
    const quoteSnap = await quoteRef.get();

    if (!quoteSnap.exists) {
      return NextResponse.json(
        { error: 'Quote not found' },
        { status: 404 }
      );
    }

    const quote = quoteSnap.data();
    if (!quote) {
      return NextResponse.json(
        { error: 'Quote not found' },
        { status: 404 }
      );
    }

    // Verify token
    if (quote.publicToken !== token) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 403 }
      );
    }

    // Check if already accepted
    if (quote.status === 'accepted') {
      return NextResponse.json(
        { error: 'Quote already accepted' },
        { status: 400 }
      );
    }

    // Check if expired
    if (quote.expiresAt) {
      const expiresAt = typeof quote.expiresAt?.toDate === 'function'
        ? quote.expiresAt.toDate()
        : new Date(quote.expiresAt.seconds * 1000);
      if (expiresAt < new Date()) {
        return NextResponse.json(
          { error: 'Quote has expired' },
          { status: 400 }
        );
      }
    }

    // Update quote status
    await quoteRef.update({
      status: 'accepted',
      acceptedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    // TODO: Send notification to tenant about accepted quote
    // TODO: Create opportunity/deal from accepted quote

    return NextResponse.json({
      success: true,
      message: 'Quote accepted successfully',
    });
  } catch {
    return NextResponse.json(
      { error: 'Failed to accept quote' },
      { status: 500 }
    );
  }
}
