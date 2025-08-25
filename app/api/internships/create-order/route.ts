import { NextResponse } from 'next/server'
import Razorpay from 'razorpay'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

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

    const cookieStore = await cookies()
    const accessToken = cookieStore.get('sb-access-token')?.value
    if (!accessToken) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const anon = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
      global: { headers: { Authorization: `Bearer ${accessToken}` } }
    })
    const { data: userData } = await anon.auth.getUser()
    const userId = userData?.user?.id
    if (!userId) return NextResponse.json({ error: 'Auth failed' }, { status: 401 })

    const razorpay = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET })
    const order = await razorpay.orders.create({ amount, currency, receipt: `intern_${Date.now()}`, notes: { internshipId, userId } })
    return NextResponse.json({ orderId: order.id, key: process.env.RAZORPAY_KEY_ID })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Server error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}


