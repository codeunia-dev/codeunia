import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import crypto from 'crypto';

const premiumPlans = {
  monthly: { duration: 30, pointsMultiplier: 2, price: 499 },
  biannual: { duration: 180, pointsMultiplier: 3, price: 2499 },
  yearly: { duration: 365, pointsMultiplier: 4, price: 4499 },
};

export async function POST(request: NextRequest) {
  try {
    const { orderId, paymentId, signature, planId, userId } = await request.json();

    // Validate input
    if (!orderId || !paymentId || !signature || !planId || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Prevent processing free plan
    if (planId === 'free') {
      return NextResponse.json(
        { error: 'Free plan cannot be processed for payment' },
        { status: 400 }
      );
    }

    // Verify user is authenticated
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user || user.id !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify Razorpay signature
    const text = `${orderId}|${paymentId}`;
    const signatureHash = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(text)
      .digest('hex');

    if (signatureHash !== signature) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Verify payment with Razorpay
    const Razorpay = (await import('razorpay')).default;
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || '',
      key_secret: process.env.RAZORPAY_KEY_SECRET || '',
    });

    try {
      const payment = await razorpay.payments.fetch(paymentId);
      
      if (payment.status !== 'captured') {
        console.error('Payment status not captured:', payment.status, 'for payment:', paymentId);
        return NextResponse.json(
          { error: 'Payment not completed. Status: ' + payment.status },
          { status: 400 }
        );
      }

      const expectedAmount = (premiumPlans[planId as keyof typeof premiumPlans]?.price || 0) * 100;
      console.log('Payment verification - Expected amount:', expectedAmount, 'Actual amount:', payment.amount, 'Plan:', planId);
      
      if (payment.amount !== expectedAmount) {
        console.error('Payment amount mismatch - Expected:', expectedAmount, 'Actual:', payment.amount, 'Plan:', planId);
        return NextResponse.json(
          { error: 'Payment amount mismatch' },
          { status: 400 }
        );
      }
    } catch (razorpayError) {
      console.error('Error fetching payment from Razorpay:', razorpayError);
      return NextResponse.json(
        { error: 'Failed to verify payment with payment gateway' },
        { status: 500 }
      );
    }

    // Get plan details
    const plan = premiumPlans[planId as keyof typeof premiumPlans];
    if (!plan) {
      return NextResponse.json(
        { error: 'Invalid plan' },
        { status: 400 }
      );
    }

    // Calculate premium expiry date
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + plan.duration);

    // Update user profile with premium status
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        is_premium: true,
        premium_expires_at: expiresAt.toISOString(),
        premium_plan: planId,
        premium_purchased_at: new Date().toISOString(),
        points_multiplier: plan.pointsMultiplier,
      })
      .eq('id', userId);

    if (updateError) {
      console.error('Error updating premium status:', updateError);
      return NextResponse.json(
        { error: 'Failed to update premium status' },
        { status: 500 }
      );
    }

    // Mark pending payment as completed
    const { error: pendingError } = await supabase
      .from('pending_payments')
      .update({
        status: 'completed',
        notes: `Payment completed with ID: ${paymentId}`
      })
      .eq('order_id', orderId)
      .eq('user_id', userId);

    if (pendingError) {
      console.error('Error updating pending payment:', pendingError);
    }

    // Log premium purchase
    const { error: logError } = await supabase
      .from('user_activity_log')
      .insert({
        user_id: userId,
        activity_type: 'premium_purchase',
        points_awarded: 0, // Premium purchase doesn't award points
        metadata: JSON.stringify({
          payment_id: paymentId,
          order_id: orderId,
          plan_id: planId,
          amount: plan.price * 100, // Log amount in paisa for consistency
          amount_inr: plan.price, // Also log INR amount for clarity
          currency: 'INR'
        })
      });

    if (logError) {
      console.error('Error logging premium purchase:', logError);
    }

    return NextResponse.json({
      success: true,
      message: 'Premium activated successfully',
      expiresAt: expiresAt.toISOString(),
    });

  } catch (error) {
    console.error('Error verifying payment:', error);
    return NextResponse.json(
      { error: 'Failed to verify payment' },
      { status: 500 }
    );
  }
} 