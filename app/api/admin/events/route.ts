import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

// Force Node.js runtime for API routes
export const runtime = 'nodejs';


// GET - Fetch all events (admin only)
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin (using profiles table)
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (profileError || !profile?.is_admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Use service client for admin operations to bypass RLS
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    const serviceSupabase = createServiceClient(supabaseUrl, supabaseServiceKey)

    const { data: events, error } = await serviceSupabase
      .from('events')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Error fetching events:', error)
      return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 })
    }

    return NextResponse.json(events || [])

  } catch (error) {
    console.error('Error in GET /api/admin/events:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create new event (admin only)
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (profileError || !profile?.is_admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const formData = await request.json()

    // Transform payment field for database constraint
    const transformedData = { ...formData }
    if (transformedData.payment === 'Required') {
      transformedData.payment = 'Paid' // Transform 'Required' to 'Paid' for database constraint
    } else if (transformedData.payment === 'Not Required') {
      transformedData.payment = 'Free' // Transform 'Not Required' to 'Free' for database constraint
    }

    // Use service client for database operations
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    const serviceSupabase = createServiceClient(supabaseUrl, supabaseServiceKey)

    const { data: newEvent, error } = await serviceSupabase
      .from('events')
      .insert(transformedData)
      .select()
      .single()

    if (error) {
      console.error('Error creating event:', error)
      return NextResponse.json({ error: 'Failed to create event' }, { status: 500 })
    }

    return NextResponse.json(newEvent)

  } catch (error) {
    console.error('Error in POST /api/admin/events:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Update existing event (admin only)
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (profileError || !profile?.is_admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const requestData = await request.json()
    
    // Handle nested data format from frontend
    const { slug, data: eventData } = requestData as { slug: string; data?: Record<string, unknown> }
    const formData = eventData || requestData // Use nested data if available, otherwise use direct data
    
    if (!slug) {
      return NextResponse.json({ error: 'Event slug is required' }, { status: 400 })
    }

    // Transform payment field for database constraint
    const transformedData = { ...formData }
    if (transformedData.payment === 'Required') {
      transformedData.payment = 'Paid' // Transform 'Required' to 'Paid' for database constraint
    } else if (transformedData.payment === 'Not Required') {
      transformedData.payment = 'Free' // Transform 'Not Required' to 'Free' for database constraint
    }

    // Use service client for database operations
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    const serviceSupabase = createServiceClient(supabaseUrl, supabaseServiceKey)

    // Check for event existence with the original slug
    const { data: existingEvents, error: checkError } = await serviceSupabase
      .from('events')
      .select('id, slug, title')
      .eq('slug', slug)

    if (checkError) {
      return NextResponse.json(
        { error: 'Failed to check event existence' },
        { status: 500 }
      )
    }

    if (!existingEvents || existingEvents.length === 0) {
      return NextResponse.json(
        { error: `Event with slug '${slug}' not found` },
        { status: 404 }
      )
    }


    // Check if slug is being changed
    if (transformedData.slug && transformedData.slug !== slug) {
      // Check if new slug already exists
      const { data: existingWithNewSlug, error: slugCheckError } = await serviceSupabase
        .from('events')
        .select('id')
        .eq('slug', transformedData.slug)

      if (slugCheckError) {
        return NextResponse.json(
          { error: 'Failed to check new slug existence' },
          { status: 500 }
        )
      }

      if (existingWithNewSlug && existingWithNewSlug.length > 0) {
        return NextResponse.json(
          { error: `Event with slug '${transformedData.slug}' already exists` },
          { status: 409 }
        )
      }
    }

    const { data: events, error } = await serviceSupabase
      .from('events')
      .update(transformedData)
      .eq('slug', slug)
      .select()

    if (error) {
      return NextResponse.json(
        { error: 'Failed to update event' },
        { status: 500 }
      )
    }

    if (!events || events.length === 0) {
      return NextResponse.json(
        { error: `Event with slug '${slug}' not found` },
        { status: 404 }
      )
    }

    return NextResponse.json(events[0])

  } catch (error) {
    console.error('Error in PUT /api/admin/events:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Delete event (admin only)
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (profileError || !profile?.is_admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug')

    if (!slug) {
      return NextResponse.json({ error: 'Slug is required' }, { status: 400 })
    }

    // Use service client for database operations
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    const serviceSupabase = createServiceClient(supabaseUrl, supabaseServiceKey)

    const { error } = await serviceSupabase
      .from('events')
      .delete()
      .eq('slug', slug)

    if (error) {
      console.error('Error deleting event:', error)
      return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Event deleted successfully' })

  } catch (error) {
    console.error('Error in DELETE /api/admin/events:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}