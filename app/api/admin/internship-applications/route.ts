import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { sendStatusUpdateEmail } from '@/lib/services/email'

// Force Node.js runtime for API routes
export const runtime = 'nodejs';

// List applications (basic fields)
export async function GET() {
  const service = createServiceClient();
  // Try to include remarks if the column exists; otherwise fall back
  let data: unknown[] | null = null
  let errorMsg: string | null = null
  try {
    const { data: d } = await service
      .from('internship_applications')
      .select('id, user_id, email, internship_id, domain, level, status, cover_note, remarks, repo_url, duration_weeks, start_date, end_date, created_at')
      .order('created_at', { ascending: false })
    data = d || []
  } catch (e) {
    errorMsg = e instanceof Error ? e.message : 'Error'
  }
  if (!data) {
    const { data: d2, error: e2 } = await service
      .from('internship_applications')
      .select('id, user_id, email, internship_id, domain, level, status, cover_note, repo_url, duration_weeks, start_date, end_date, created_at')
      .order('created_at', { ascending: false })
    if (e2) return NextResponse.json({ error: e2.message || errorMsg || 'Failed to fetch' }, { status: 500 })
    data = d2 || []
  }
  // Last-resort fallback
  if (!data) {
    const { data: d3 } = await service.from('internship_applications').select('*').order('created_at', { ascending: false })
    data = d3 || []
  }
  const response = NextResponse.json({ applications: data })
  
  // Prevent caching to ensure fresh data
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
  response.headers.set('Pragma', 'no-cache')
  response.headers.set('Expires', '0')
  
  return response
}

// Update application: expects { id, status?, remarks? }
export async function PATCH(request: Request) {
  try {
    const service = createServiceClient();
    const body = await request.json() as {
      id?: string
      status?: string
      remarks?: string
      repo_url?: string
      duration_weeks?: number
    }
    if (!body.id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

    // Get current application data before update (for email comparison)
    const { data: currentApp, error: fetchError } = await service
      .from('internship_applications')
      .select('id, email, internship_id, domain, level, status, duration_weeks, start_date, end_date')
      .eq('id', body.id)
      .single()

    if (fetchError || !currentApp) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    const update: Record<string, unknown> = {}
    if (body.status) update.status = body.status
    if (body.remarks !== undefined) update.remarks = body.remarks
    // Optional fields for assignment and scheduling
    if (typeof body.repo_url === 'string') update.repo_url = body.repo_url
    if (body.duration_weeks === 4 || body.duration_weeks === 6) update.duration_weeks = body.duration_weeks
    // If status becomes accepted and duration is set, set start/end if missing
    if (body.status === 'accepted') {
      const now = new Date()
      const startISO = now.toISOString()
      const weeks = body.duration_weeks === 6 ? 6 : body.duration_weeks === 4 ? 4 : currentApp.duration_weeks || 4
      if (weeks) {
        const end = new Date(now)
        end.setDate(end.getDate() + weeks * 7)
        update.start_date = startISO
        update.end_date = end.toISOString()
      }
    }

    const { data, error } = await service
      .from('internship_applications')
      .update(update)
      .eq('id', body.id)
      .select('id, status, remarks, repo_url, duration_weeks, start_date, end_date')
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Send status update email if status changed
    if (body.status && body.status !== currentApp.status) {
      try {
        // Get user profile for name
        const { data: profile } = await service
          .from('profiles')
          .select('first_name, last_name')
          .eq('email', currentApp.email)
          .single()

        const applicantName = profile
          ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Codeunia User'
          : 'Codeunia User'

        // Map internship ID to title
        const internshipTitles: Record<string, string> = {
          'free-basic': 'Codeunia Starter Internship',
          'paid-pro': 'Codeunia Pro Internship'
        }

        const emailResult = await sendStatusUpdateEmail({
          applicantName,
          applicantEmail: currentApp.email,
          internshipTitle: internshipTitles[currentApp.internship_id] || currentApp.internship_id,
          internshipId: currentApp.internship_id,
          domain: currentApp.domain,
          level: currentApp.level,
          duration: data.duration_weeks || currentApp.duration_weeks || 4,
          oldStatus: currentApp.status,
          newStatus: body.status,
          remarks: body.remarks,
          repoUrl: body.repo_url,
          startDate: data.start_date,
          endDate: data.end_date
        })

        if (emailResult.success && !emailResult.skipped) {
          console.log(`✅ Status update email sent to ${currentApp.email}: ${currentApp.status} → ${body.status}`)
        } else if (emailResult.skipped) {
          console.log(`⏭️ Status update email skipped (no change): ${currentApp.email}`)
        } else {
          console.error(`❌ Failed to send status update email to ${currentApp.email}:`, emailResult.error)
        }
      } catch (emailError) {
        console.error('❌ Status update email error:', emailError)
        // Don't fail the update if email fails
      }
    }

    return NextResponse.json({ application: data })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Server error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}


