import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

// Save internship application. Uses service role only for insert authorization; user context validated via auth cookie
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { internshipId, domain, level, coverNote, durationWeeks } = body as {
      internshipId?: string
      domain?: string
      level?: string
      coverNote?: string
      durationWeeks?: number
    }

    if (!internshipId || !domain || !level) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    // Get current user token from Authorization header or cookies
    const authHeader = request.headers.get('authorization') || request.headers.get('Authorization')
    const bearerToken = authHeader?.toLowerCase().startsWith('bearer ')
      ? authHeader.slice(7)
      : null

    const cookieStore = await cookies()
    const cookieToken = cookieStore.get('sb-access-token')?.value || null
    const accessToken = bearerToken || cookieToken
    if (!accessToken) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const anon = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
      global: { headers: { Authorization: `Bearer ${accessToken}` } }
    })
    const { data: userData, error: userErr } = await anon.auth.getUser()
    if (userErr || !userData?.user) {
      return NextResponse.json({ error: 'Auth failed' }, { status: 401 })
    }

    const user = userData.user

    const insert = {
      user_id: user.id,
      email: user.email,
      internship_id: internshipId,
      domain,
      level,
      cover_note: coverNote || null,
      status: 'submitted',
      duration_weeks: typeof durationWeeks === 'number' ? durationWeeks : null,
      created_at: new Date().toISOString()
    }

    const { error } = await supabase.from('internship_applications').insert([insert])
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ success: true })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Server error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}


