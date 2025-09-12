import { NextResponse } from 'next/server';

// Force Node.js runtime for API routes
export const runtime = 'nodejs';


export async function GET() {
  try {
    // Use service role key to bypass authentication for testing
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Get all pending payments
    const { data: pendingPayments, error } = await supabase
      .from('pending_payments')
      .select(`
        id,
        user_id,
        order_id,
        plan_id,
        amount,
        currency,
        created_at,
        expires_at,
        status,
        contact_attempts,
        last_contact_at,
        notes
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching pending payments:', error);
      return NextResponse.json(
        { error: 'Failed to fetch pending payments' },
        { status: 500 }
      );
    }

    // Calculate time left for each payment
    const paymentsWithTimeLeft = pendingPayments?.map(payment => {
      const now = new Date().getTime();
      const expires = new Date(payment.expires_at).getTime();
      const timeLeft = Math.max(0, Math.floor((expires - now) / 1000));
      
      return {
        ...payment,
        timeLeft: timeLeft > 0 ? timeLeft : 0,
        isExpired: timeLeft <= 0,
        formattedTimeLeft: timeLeft > 0 
          ? `${Math.floor(timeLeft / 60)}:${(timeLeft % 60).toString().padStart(2, '0')}`
          : 'EXPIRED'
      };
    });

    return NextResponse.json({
      success: true,
      pendingPayments: paymentsWithTimeLeft || [],
      count: paymentsWithTimeLeft?.length || 0,
      summary: {
        pending: paymentsWithTimeLeft?.filter(p => p.status === 'pending' && !p.isExpired).length || 0,
        expired: paymentsWithTimeLeft?.filter(p => p.isExpired).length || 0,
        completed: paymentsWithTimeLeft?.filter(p => p.status === 'completed').length || 0
      }
    });

  } catch (error) {
    console.error('Error in public pending payments API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 