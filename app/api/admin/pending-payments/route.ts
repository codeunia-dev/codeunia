import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Force Node.js runtime for API routes
export const runtime = 'nodejs';


// Define the type for updateData
interface UpdateData {
  last_contact_at: string;
  notes: string;
  contact_attempts?: number;
  status?: string;
}

export async function GET() {
  try {
    // Verify admin access (you can add your own admin verification logic)
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get pending payments that need follow-up
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
        notes,
        profiles!inner(
          email,
          first_name,
          last_name,
          phone
        )
      `)
      .eq('status', 'pending')
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching pending payments:', error);
      return NextResponse.json(
        { error: 'Failed to fetch pending payments' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      pendingPayments: pendingPayments || [],
      count: pendingPayments?.length || 0
    });

  } catch (error) {
    console.error('Error in pending payments API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { paymentId, action, notes } = await request.json();

    // Verify admin access
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Update payment status based on action
    const updateData: UpdateData = {
      last_contact_at: new Date().toISOString(),
      notes: notes || ''
    };

    if (action === 'contacted') {
      // We'll handle the increment in the update query
      const { data: currentPayment } = await supabase
        .from('pending_payments')
        .select('contact_attempts')
        .eq('id', paymentId)
        .single();
      
      updateData.contact_attempts = (currentPayment?.contact_attempts || 0) + 1;
    } else if (action === 'completed') {
      updateData.status = 'completed';
    } else if (action === 'expired') {
      updateData.status = 'expired';
    }

    const { error } = await supabase
      .from('pending_payments')
      .update(updateData)
      .eq('id', paymentId);

    if (error) {
      console.error('Error updating pending payment:', error);
      return NextResponse.json(
        { error: 'Failed to update payment status' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Payment status updated successfully'
    });

  } catch (error) {
    console.error('Error updating pending payment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}