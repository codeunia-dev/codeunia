import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import crypto from 'crypto'

// Force Node.js runtime for API routes
export const runtime = 'nodejs';


export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { orderId, paymentId, signature } = body

    if (!orderId || !paymentId || !signature) {
      return NextResponse.json({ error: 'Missing payment verification data' }, { status: 400 })
    }

    // Get authenticated user
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Verify Razorpay signature
    const razorpaySecret = process.env.RAZORPAY_KEY_SECRET
    if (!razorpaySecret) {
      console.error('Razorpay secret key not configured')
      return NextResponse.json({ error: 'Payment verification failed' }, { status: 500 })
    }

    const body_string = orderId + "|" + paymentId
    const expected_signature = crypto
      .createHmac('sha256', razorpaySecret)
      .update(body_string.toString())
      .digest('hex')

    const is_authentic = expected_signature === signature

    if (!is_authentic) {
      console.error('Payment signature verification failed')
      return NextResponse.json({ error: 'Payment verification failed' }, { status: 400 })
    }

    // Update payment status in database
    const { error: updateError } = await supabase
      .from('internship_applications')
      .update({
        payment_signature: signature,
        payment_status: 'verified',
        paid_at: new Date().toISOString()
      })
      .eq('order_id', orderId)
      .eq('user_id', user.id)

    if (updateError) {
      console.error('Error updating payment status:', updateError)
      return NextResponse.json({ error: 'Failed to update payment status' }, { status: 500 })
    }

    console.log(`✅ Payment verified: ${paymentId} for order ${orderId}`)

    return NextResponse.json({ 
      success: true, 
      verified: true,
      paymentId,
      orderId 
    })

  } catch (e) {
    console.error('Payment verification error:', e)
    const msg = e instanceof Error ? e.message : 'Payment verification failed'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
