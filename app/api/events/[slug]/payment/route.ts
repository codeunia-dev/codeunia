import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { createClient } from '@/lib/supabase/server';
import crypto from 'crypto';

// Force Node.js runtime for API routes
export const runtime = 'nodejs';


// Initialize Razorpay client
const getRazorpayClient = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error('Razorpay credentials not configured');
  }
  
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
};

// POST: Create payment order for an event
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const supabase = await createClient();
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get the event by slug
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id, title, price, payment, capacity, registered, registration_required')
      .eq('slug', slug)
      .single();

    if (eventError || !event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    // Check if event requires payment
    if (event.payment !== 'Required' && event.payment !== 'Paid') {
      return NextResponse.json(
        { error: 'This event does not require payment' },
        { status: 400 }
      );
    }

    // Parse price (assuming format like "₹500" or "500")
    const priceMatch = event.price.match(/(\d+)/);
    if (!priceMatch) {
      return NextResponse.json(
        { error: 'Invalid event price format' },
        { status: 400 }
      );
    }

    const priceInPaise = parseInt(priceMatch[1]) * 100; // Convert to paise

    // Check if event is at capacity
    if (event.registered >= event.capacity) {
      return NextResponse.json(
        { error: 'Event is at full capacity' },
        { status: 400 }
      );
    }

    // Check if user is already registered
    const { data: existingRegistration } = await supabase
      .from('master_registrations')
      .select('id, payment_status')
      .eq('user_id', user.id)
      .eq('activity_type', 'event')
      .eq('activity_id', event.id.toString())
      .single();

    if (existingRegistration) {
      if (existingRegistration.payment_status === 'paid') {
        return NextResponse.json(
          { error: 'You are already registered and paid for this event' },
          { status: 400 }
        );
      } else if (existingRegistration.payment_status === 'pending') {
        return NextResponse.json(
          { error: 'You have a pending payment for this event' },
          { status: 400 }
        );
      }
    }

    // Create Razorpay order
    const orderData = {
      amount: priceInPaise,
      currency: 'INR',
      receipt: `event_${event.id}_${user.id}_${Date.now()}`,
      notes: {
        event_id: event.id,
        event_title: event.title,
        user_id: user.id,
        type: 'event_registration'
      }
    };

    const razorpay = getRazorpayClient();
    const order = await razorpay.orders.create(orderData);

    // Store pending payment
    const { error: paymentError } = await supabase
      .from('pending_payments')
      .insert({
        user_id: user.id,
        order_id: order.id,
        plan_id: `event_${event.id}`,
        amount: priceInPaise,
        currency: 'INR',
        expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 minutes
        status: 'pending',
        notes: JSON.stringify({
          event_id: event.id,
          event_title: event.title,
          event_slug: slug,
          type: 'event_registration'
        })
      });

    if (paymentError) {
      console.error('Error storing pending payment:', paymentError);
      return NextResponse.json(
        { error: 'Failed to create payment order' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      orderId: order.id,
      key: process.env.RAZORPAY_KEY_ID,
      amount: priceInPaise,
      currency: 'INR',
      event_title: event.title,
      event_price: event.price
    });

  } catch (error) {
    console.error('Error creating payment order:', error);
    return NextResponse.json(
      { error: 'Failed to create payment order' },
      { status: 500 }
    );
  }
}

// PUT: Verify payment and complete event registration
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await params; // Extract slug but don't use it yet
    const body = await request.json();
    const { orderId, paymentId, signature } = body;

    if (!orderId || !paymentId || !signature) {
      return NextResponse.json(
        { error: 'Missing payment verification data' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Verify Razorpay signature
    const razorpaySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!razorpaySecret) {
      return NextResponse.json(
        { error: 'Payment verification failed' },
        { status: 500 }
      );
    }

    const body_string = orderId + "|" + paymentId;
    const expected_signature = crypto
      .createHmac('sha256', razorpaySecret)
      .update(body_string.toString())
      .digest('hex');

    if (signature !== expected_signature) {
      return NextResponse.json(
        { error: 'Invalid payment signature' },
        { status: 400 }
      );
    }

    // Get pending payment record
    const { data: pendingPayment, error: paymentError } = await supabase
      .from('pending_payments')
      .select('*')
      .eq('order_id', orderId)
      .eq('user_id', user.id)
      .eq('status', 'pending')
      .single();

    if (paymentError || !pendingPayment) {
      return NextResponse.json(
        { error: 'Payment record not found or already processed' },
        { status: 400 }
      );
    }

    // Parse event details from notes
    const notes = JSON.parse(pendingPayment.notes);
    const eventId = notes.event_id;

    // Get event details
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id, title, capacity, registered')
      .eq('id', eventId)
      .single();

    if (eventError || !event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    // Check if event is still available
    if (event.registered >= event.capacity) {
      return NextResponse.json(
        { error: 'Event is now at full capacity' },
        { status: 400 }
      );
    }

    // Create or update registration
    const { data: existingRegistration } = await supabase
      .from('master_registrations')
      .select('id')
      .eq('user_id', user.id)
      .eq('activity_type', 'event')
      .eq('activity_id', eventId.toString())
      .single();

    let registration;
    if (existingRegistration) {
      // Update existing registration
      const { data: updatedRegistration, error: updateError } = await supabase
        .from('master_registrations')
        .update({
          payment_status: 'paid',
          payment_amount: pendingPayment.amount,
          payment_currency: pendingPayment.currency,
          payment_id: paymentId,
          status: 'registered',
          updated_at: new Date().toISOString()
        })
        .eq('id', existingRegistration.id)
        .select()
        .single();

      if (updateError) throw updateError;
      registration = updatedRegistration;
    } else {
      // Create new registration
      const { data: newRegistration, error: createError } = await supabase
        .from('master_registrations')
        .insert({
          user_id: user.id,
          activity_type: 'event',
          activity_id: eventId.toString(),
          registration_date: new Date().toISOString(),
          status: 'registered',
          payment_status: 'paid',
          payment_amount: pendingPayment.amount,
          payment_currency: pendingPayment.currency,
          payment_id: paymentId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (createError) throw createError;
      registration = newRegistration;

      // Update event registration count
      await supabase
        .from('events')
        .update({ 
          registered: event.registered + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', eventId);
    }

    // Update pending payment status
    await supabase
      .from('pending_payments')
      .update({
        status: 'completed',
        notes: JSON.stringify({
          ...notes,
          payment_id: paymentId,
          registration_id: registration.id,
          completed_at: new Date().toISOString()
        })
      })
      .eq('order_id', orderId);

    // Log payment activity
    await supabase
      .from('user_activity_log')
      .insert({
        user_id: user.id,
        activity_type: 'event_payment',
        points: 0,
        metadata: JSON.stringify({
          event_id: eventId,
          event_title: event.title,
          payment_id: paymentId,
          amount: pendingPayment.amount,
          currency: pendingPayment.currency
        })
      });

    return NextResponse.json({
      success: true,
      message: 'Payment verified and registration completed',
      registration: {
        id: registration.id,
        event_title: event.title,
        payment_status: 'paid',
        amount: pendingPayment.amount,
        currency: pendingPayment.currency
      }
    });

  } catch (error) {
    console.error('Error verifying payment:', error);
    return NextResponse.json(
      { error: 'Failed to verify payment' },
      { status: 500 }
    );
  }
}
