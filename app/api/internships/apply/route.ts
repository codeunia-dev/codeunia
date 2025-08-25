import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { 
      internshipId, 
      domain, 
      level, 
      coverNote, 
      durationWeeks,
      // Payment related fields
      orderId,
      paymentId,
      paymentSignature,
      amountPaid,
      originalAmount,
      discountApplied
    } = body as {
      internshipId?: string
      domain?: string
      level?: string
      coverNote?: string
      durationWeeks?: number
      orderId?: string
      paymentId?: string
      paymentSignature?: string
      amountPaid?: number
      originalAmount?: number
      discountApplied?: number
      paymentMethod?: string
    }

    if (!internshipId || !domain || !level) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    // Get authenticated user using server-side Supabase client
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      console.error('Authentication error:', authError)
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Check if this is a paid internship
    const isPaidInternship = paymentId && orderId && amountPaid !== undefined

    const insert = {
      user_id: user.id,
      email: user.email,
      internship_id: internshipId,
      domain,
      level,
      cover_note: coverNote || null,
      status: isPaidInternship ? 'submitted' : 'submitted', // Both are submitted after this point
      duration_weeks: typeof durationWeeks === 'number' ? durationWeeks : null,
      created_at: new Date().toISOString(),
      // Payment fields
      order_id: orderId || null,
      payment_id: paymentId || null,
      payment_signature: paymentSignature || null,
      amount_paid: amountPaid || 0,
      original_amount: originalAmount || 0,
      discount_applied: discountApplied || 0,
      currency: 'INR',
      payment_status: isPaidInternship ? 'completed' : 'completed', // Free internships are also "completed"
      is_paid: isPaidInternship ? true : true, // Free internships are considered "paid" (no payment required)
      paid_at: isPaidInternship ? new Date().toISOString() : new Date().toISOString()
    }

    const { error } = await supabase.from('internship_applications').insert([insert])
    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log(`✅ Application submitted: ${internshipId} by ${user.email} (${isPaidInternship ? 'PAID' : 'FREE'})`)
    
    return NextResponse.json({ 
      success: true,
      applicationId: insert.user_id, // You might want to return the actual inserted ID
      paymentStatus: insert.payment_status,
      isPaid: insert.is_paid
    })
  } catch (e) {
    console.error('Server error:', e)
    const msg = e instanceof Error ? e.message : 'Server error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}


