import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Check if user is admin
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (!profile?.is_admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Fetch all support tickets
    const { data: tickets, error } = await supabase
      .from('support_tickets')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching tickets:', error)
      return NextResponse.json({ error: 'Failed to fetch tickets' }, { status: 500 })
    }

    // Fetch user information for each ticket
    const userIds = [...new Set(tickets.map(t => t.user_id))]
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, email, first_name, last_name, avatar_url')
      .in('id', userIds)

    // Map user data to tickets
    const ticketsWithUsers = tickets.map(ticket => ({
      ...ticket,
      user: profiles?.find(p => p.id === ticket.user_id) || null
    }))

    return NextResponse.json({ tickets: ticketsWithUsers })
  } catch (error) {
    console.error('Error in tickets API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
