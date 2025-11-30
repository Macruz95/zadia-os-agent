/**
 * ZADIA OS - Accept Quote API
 * 
 * Public endpoint for accepting quotes
 */

import { NextRequest, NextResponse } from 'next/server';
import { 
  doc, 
  getDoc, 
  updateDoc,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { quoteId, token } = body;

    if (!quoteId || !token) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify quote and token
    const quoteRef = doc(db, 'quotes', quoteId);
    const quoteSnap = await getDoc(quoteRef);

    if (!quoteSnap.exists()) {
      return NextResponse.json(
        { error: 'Quote not found' },
        { status: 404 }
      );
    }

    const quote = quoteSnap.data();

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
      const expiresAt = new Date(quote.expiresAt.seconds * 1000);
      if (expiresAt < new Date()) {
        return NextResponse.json(
          { error: 'Quote has expired' },
          { status: 400 }
        );
      }
    }

    // Update quote status
    await updateDoc(quoteRef, {
      status: 'accepted',
      acceptedAt: Timestamp.now(),
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
