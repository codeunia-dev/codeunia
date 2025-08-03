import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { planId, amount, currency, userId } = await request.json();

    // Validate input
    if (!planId || !amount || !currency || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate Razorpay environment variables
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return NextResponse.json(
        { error: 'Razorpay configuration is missing' },
        { status: 500 }
      );
    }

    // Initialize Razorpay client
    const Razorpay = (await import('razorpay')).default;
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || '',
      key_secret: process.env.RAZORPAY_KEY_SECRET || '',
    });

    // Create Razorpay order
    let order;
    try {
      order = await razorpay.orders.create({
        amount: amount,
        currency: currency,
        receipt: `prem_${Date.now()}`,
        notes: {
          userId: userId,
          planId: planId,
        },
      });
    } catch (razorpayError) {
      console.error('Razorpay order creation error:', razorpayError);
      return NextResponse.json(
        { error: 'Payment service temporarily unavailable' },
        { status: 503 }
      );
    }

    // Track pending payment in database
    const supabase = await createClient();
    const { error: dbError } = await supabase
      .from('pending_payments')
      .insert({
        user_id: userId,
        order_id: order.id,
        plan_id: planId,
        amount: amount,
        currency: currency,
        expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 minutes from now
        status: 'pending'
      });

    if (dbError) {
      console.error('Error tracking pending payment:', dbError);
      // Don't fail the order creation, just log the error
    }

    return NextResponse.json({
      orderId: order.id,
      key: process.env.RAZORPAY_KEY_ID,
    });

  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
} 