import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Razorpay from 'razorpay';
import crypto from 'crypto';

// Force Node.js runtime for API routes
export const runtime = 'nodejs';


// Create Supabase client function to avoid build-time initialization
function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// Initialize Razorpay only if environment variables are available
const getRazorpayClient = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error('Razorpay configuration is missing');
  }
  
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
};

// POST: Create payment order for a round
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const body = await request.json();
    const { test_id, round_id, user_id } = body;

    // Validate required fields
    if (!test_id || !round_id || !user_id) {
      return NextResponse.json(
        { error: 'Test ID, round ID, and user ID are required' },
        { status: 400 }
      );
    }

    // Get test and round details
    const { data: test, error: testError } = await supabase
      .from('tests')
      .select('*')
      .eq('id', test_id)
      .single();

    if (testError || !test) {
      return NextResponse.json(
        { error: 'Test not found' },
        { status: 404 }
      );
    }

    const { data: round, error: roundError } = await supabase
      .from('test_rounds')
      .select('*')
      .eq('id', round_id)
      .eq('test_id', test_id)
      .single();

    if (roundError || !round) {
      return NextResponse.json(
        { error: 'Round not found' },
        { status: 404 }
      );
    }

    // Check if test is paid
    if (!test.is_paid || test.price === 0) {
      return NextResponse.json(
        { error: 'This round does not require payment' },
        { status: 400 }
      );
    }

    // Check if user is already registered for this round
    const { data: existingRegistration, error: checkError } = await supabase
      .from('round_registrations')
      .select('*')
      .eq('user_id', user_id)
      .eq('round_id', round_id)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }

    if (existingRegistration) {
      return NextResponse.json(
        { error: 'Already registered for this round' },
        { status: 400 }
      );
    }

    // Create Razorpay order
    const orderData = {
      amount: test.price, // Amount in paise
      currency: test.currency || 'INR',
      receipt: `round_${round_id}_${Date.now()}`,
      notes: {
        test_id,
        round_id,
        user_id,
        round_name: round.name,
        test_name: test.name
      }
    };

    const razorpay = getRazorpayClient();
    const order = await razorpay.orders.create(orderData);

    // Store pending payment
    const { error: paymentError } = await supabase
      .from('pending_payments')
      .insert({
        user_id,
        order_id: order.id,
        plan_id: `round_${round_id}`,
        amount: test.price,
        currency: test.currency || 'INR',
        expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 minutes
        status: 'pending',
        notes: JSON.stringify({
          test_id,
          round_id,
          round_name: round.name,
          test_name: test.name
        })
      });

    if (paymentError) throw paymentError;

    return NextResponse.json({
      orderId: order.id,
      key: process.env.RAZORPAY_KEY_ID,
      amount: test.price,
      currency: test.currency || 'INR',
      test_name: test.name,
      round_name: round.name
    });
  } catch (error) {
    console.error('Error creating payment order:', error);
    return NextResponse.json(
      { error: 'Failed to create payment order' },
      { status: 500 }
    );
  }
}

// POST: Verify payment and register for round
export async function PUT(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const body = await request.json();
    const { orderId, paymentId, signature, test_id, round_id, user_id } = body;

    // Validate required fields
    if (!orderId || !paymentId || !signature || !test_id || !round_id || !user_id) {
      return NextResponse.json(
        { error: 'All payment verification fields are required' },
        { status: 400 }
      );
    }

    // Verify payment signature
    const text = `${orderId}|${paymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(text)
      .digest('hex');

    if (signature !== expectedSignature) {
      return NextResponse.json(
        { error: 'Invalid payment signature' },
        { status: 400 }
      );
    }

    // Get test and round details
    const { data: test, error: testError } = await supabase
      .from('tests')
      .select('*')
      .eq('id', test_id)
      .single();

    if (testError || !test) {
      return NextResponse.json(
        { error: 'Test not found' },
        { status: 404 }
      );
    }

    const { data: round, error: roundError } = await supabase
      .from('test_rounds')
      .select('*')
      .eq('id', round_id)
      .eq('test_id', test_id)
      .single();

    if (roundError || !round) {
      return NextResponse.json(
        { error: 'Round not found' },
        { status: 404 }
      );
    }

    // Check if round is currently active
    const now = new Date();
    const startDate = new Date(round.start_date);
    const endDate = new Date(round.end_date);

    if (now < startDate) {
      return NextResponse.json(
        { error: 'Round has not started yet' },
        { status: 400 }
      );
    }

    if (now > endDate) {
      return NextResponse.json(
        { error: 'Round has already ended' },
        { status: 400 }
      );
    }

    // Create round registration
    const { data: registration, error: registrationError } = await supabase
      .from('round_registrations')
      .insert({
        test_id,
        round_id,
        user_id,
        status: 'registered',
        submission_data: {
          payment_id: paymentId,
          payment_amount: test.price,
          payment_currency: test.currency || 'INR',
          payment_date: new Date().toISOString()
        }
      })
      .select()
      .single();

    if (registrationError) throw registrationError;

    // Update pending payment status
    await supabase
      .from('pending_payments')
      .update({
        status: 'completed',
        notes: JSON.stringify({
          test_id,
          round_id,
          round_name: round.name,
          test_name: test.name,
          payment_id: paymentId,
          registration_id: registration.id
        })
      })
      .eq('order_id', orderId);

    // Log payment activity
    await supabase
      .from('user_activity_log')
      .insert({
        user_id,
        activity_type: 'round_payment',
        points: 0,
        metadata: JSON.stringify({
          test_id,
          round_id,
          payment_id: paymentId,
          amount: test.price,
          currency: test.currency || 'INR'
        })
      });

    return NextResponse.json({
      message: 'Payment verified and registration successful',
      registration
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    return NextResponse.json(
      { error: 'Failed to verify payment' },
      { status: 500 }
    );
  }
} 