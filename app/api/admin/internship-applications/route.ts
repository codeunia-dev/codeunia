import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// NOTE: Protect this route via middleware/admin auth in your app.
const service = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

// List applications (basic fields)
export async function GET() {
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
  return NextResponse.json({ applications: data })
}

// Update application: expects { id, status?, remarks? }
export async function PATCH(request: Request) {
  try {
    const body = await request.json() as { id?: string; status?: string; remarks?: string }
    if (!body.id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

    const update: Record<string, unknown> = {}
    if (body.status) update.status = body.status
    if (body.remarks !== undefined) update.remarks = body.remarks
    // Optional fields for assignment and scheduling
    const parsed = body as any
    if (typeof parsed.repo_url === 'string') update.repo_url = parsed.repo_url
    if (parsed.duration_weeks === 4 || parsed.duration_weeks === 6) update.duration_weeks = parsed.duration_weeks
    // If status becomes accepted and duration is set, set start/end if missing
    if (parsed.status === 'accepted') {
      const now = new Date()
      const startISO = now.toISOString()
      const weeks = parsed.duration_weeks === 6 ? 6 : parsed.duration_weeks === 4 ? 4 : undefined
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
    return NextResponse.json({ application: data })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Server error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}


