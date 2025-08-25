import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  try {
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

    const service = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
    const { data, error } = await service
      .from('internship_applications')
      .select('internship_id')
      .eq('user_id', userData.user.id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const ids = (data || []).map((r) => r.internship_id)
    return NextResponse.json({ appliedIds: ids })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Server error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}


