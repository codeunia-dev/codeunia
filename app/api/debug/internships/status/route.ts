import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Force Node.js runtime for API routes
export const runtime = 'nodejs';


export async function GET() {
  try {
    const supabase = await createClient()
    const { data: userData } = await supabase.auth.getUser()
    const user = userData?.user || null

    const email = user?.email || null
    const userId = user?.id || null

    let internsCount = 0
    let internsSample: unknown[] = []
    if (email) {
      const { data } = await supabase
        .from('interns')
        .select('email, domain, start_date, end_date, passed')
        .ilike('email', email)
        .limit(5)
      internsCount = data?.length || 0
      internsSample = data || []
    }

    let appsCount = 0
    let appsSample: unknown[] = []
    if (userId) {
      try {
        const { data: apps } = await supabase
          .from('internship_applications')
          .select('internship_id, domain, level, status, created_at')
          .eq('user_id', userId)
          .limit(5)
        appsCount = apps?.length || 0
        appsSample = apps || []
      } catch {}
    }

    return NextResponse.json({
      env: {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasAnon: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
      },
      user: { id: userId, email },
      interns: { count: internsCount, sample: internsSample },
      applications: { count: appsCount, sample: appsSample },
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Server error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}


