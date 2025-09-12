import { NextResponse } from 'next/server'
import Razorpay from 'razorpay'
import { createClient } from '@/lib/supabase/server'

// Force Node.js runtime for API routes
export const runtime = 'nodejs';


export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { internshipId, amount, currency } = body as { internshipId?: string; amount?: number; currency?: string }
    if (!internshipId || !amount || !currency) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return NextResponse.json({ error: 'Payment config missing' }, { status: 500 })
    }

    // Get authenticated user using server-side Supabase client
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      console.error('Authentication error:', authError)
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const razorpay = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET })
    const order = await razorpay.orders.create({ 
      amount, 
      currency, 
      receipt: `intern_${Date.now()}`, 
      notes: { internshipId, userId: user.id } 
    })
    return NextResponse.json({ orderId: order.id, key: process.env.RAZORPAY_KEY_ID })
  } catch (e) {
    console.error('Server error:', e)
    const msg = e instanceof Error ? e.message : 'Server error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}


