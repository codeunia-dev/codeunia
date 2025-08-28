import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendInternshipApplicationEmails } from '@/lib/services/email'

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

    if (authError || !user || !user.email) {
      console.error('Authentication error:', authError)
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Verify user profile exists - just check if user has a profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      console.error('Profile verification failed:', profileError)
      return NextResponse.json({ error: 'User profile verification failed. Please complete your profile setup.' }, { status: 404 })
    }

    console.log('✅ Profile found for user:', { userId: user.id, userEmail: user.email, profileEmail: profile.email })

    // Check if email foreign key will work
    const { data: emailCheck, error: emailError } = await supabase
      .from('profiles')
      .select('email')
      .eq('email', user.email)
      .single()

    console.log('🔍 Email FK check:', {
      authEmail: user.email,
      emailExists: !!emailCheck,
      emailError: emailError?.code
    })

    if (!emailCheck || emailError) {
      console.error('❌ FK constraint will fail - no profile with auth email:', user.email)
      console.log('🔧 Fixing by updating profile email field...')

      // Fix: Update the user's profile to set the email field
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ email: user.email })
        .eq('id', user.id)

      if (updateError) {
        console.error('❌ Failed to update profile email:', updateError)
        return NextResponse.json(
          { error: `Failed to update profile email: ${updateError.message}` },
          { status: 500 }
        )
      }

      console.log('✅ Profile email updated successfully')
    }

    // Check if this is a paid internship
    const isPaidInternship = Boolean(paymentId && orderId && amountPaid !== undefined && amountPaid > 0)

    const insert = {
      user_id: user.id,
      email: user.email, // Use email from authenticated user
      internship_id: internshipId,
      domain,
      level,
      cover_note: coverNote || null,
      status: 'submitted',
      duration_weeks: typeof durationWeeks === 'number' ? durationWeeks : null,
      created_at: new Date().toISOString(),
      // Payment fields - must satisfy constraint: 
      // (amount_paid = 0 AND is_paid = false) OR (amount_paid > 0 AND is_paid = true)
      order_id: isPaidInternship ? orderId : null,
      payment_id: isPaidInternship ? paymentId : null,
      payment_signature: isPaidInternship ? paymentSignature : null,
      amount_paid: isPaidInternship ? (amountPaid || 0) : 0,
      original_amount: isPaidInternship ? (originalAmount || 0) : 0,
      discount_applied: isPaidInternship ? (discountApplied || 0) : 0,
      currency: isPaidInternship ? 'INR' : null,
      payment_status: isPaidInternship ? 'completed' : null,
      is_paid: isPaidInternship, // This will be true for paid, false for free
      paid_at: isPaidInternship ? new Date().toISOString() : null
    }

    const { data: insertedData, error } = await supabase
      .from('internship_applications')
      .insert([insert])
      .select('id')
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log(`✅ Application submitted: ${internshipId} by ${user.email} (${isPaidInternship ? 'PAID' : 'FREE'})`)

    // Get user's full name from profile for email
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('first_name, last_name')
      .eq('id', user.id)
      .single()

    const applicantName = userProfile
      ? `${userProfile.first_name || ''} ${userProfile.last_name || ''}`.trim() || 'Codeunia User'
      : 'Codeunia User'

    // Map internship ID to title
    const internshipTitles: Record<string, string> = {
      'free-basic': 'Codeunia Starter Internship',
      'paid-pro': 'Codeunia Pro Internship'
    }

    // Send confirmation and notification emails
    try {
      const emailResult = await sendInternshipApplicationEmails({
        applicantName,
        applicantEmail: user.email,
        internshipTitle: internshipTitles[internshipId] || internshipId,
        internshipId,
        domain,
        level,
        duration: durationWeeks || 4,
        isPaid: isPaidInternship,
        amountPaid: isPaidInternship ? Math.floor((amountPaid || 0) / 100) : undefined, // Convert from paise to rupees
        coverNote: coverNote || undefined,
        applicationId: insertedData?.id || 'unknown'
      })

      if (emailResult.success) {
        console.log('✅ Application emails sent successfully')
      } else {
        console.error('❌ Failed to send application emails:', emailResult.error)
        // Don't fail the application if email fails, just log it
      }
    } catch (emailError) {
      console.error('❌ Email sending error:', emailError)
      // Don't fail the application if email fails
    }

    return NextResponse.json({
      success: true,
      applicationId: insertedData?.id || insert.user_id,
      paymentStatus: insert.payment_status,
      isPaid: insert.is_paid
    })
  } catch (e) {
    console.error('Server error:', e)
    const msg = e instanceof Error ? e.message : 'Server error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}


