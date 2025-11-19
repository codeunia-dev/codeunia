import { NextRequest, NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';

// Create Supabase client with service role key to bypass RLS for master_registrations
const getServiceRoleClient = () => {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        }
    );
};

// GET: Fetch all registrations for an event
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;

        // Use server client for authentication
        const serverClient = await createServerClient();
        const { data: { user }, error: authError } = await serverClient.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        // Use service role client for querying (bypasses RLS)
        const supabase = getServiceRoleClient();

        // Get the event by slug
        const { data: event, error: eventError } = await supabase
            .from('events')
            .select('id, title, company_id, slug')
            .eq('slug', slug)
            .single();

        if (eventError || !event) {
            return NextResponse.json(
                { error: 'Event not found' },
                { status: 404 }
            );
        }

        // Check if user has access to this event's company
        const { data: membership } = await supabase
            .from('company_members')
            .select('role')
            .eq('company_id', event.company_id)
            .eq('user_id', user.id)
            .single();

        if (!membership) {
            return NextResponse.json(
                { error: 'Unauthorized access' },
                { status: 403 }
            );
        }

        // Get search and filter parameters
        const searchParams = request.nextUrl.searchParams;
        const search = searchParams.get('search') || '';
        const status = searchParams.get('status') || '';
        const paymentStatus = searchParams.get('payment_status') || '';
        const limit = parseInt(searchParams.get('limit') || '100');
        const offset = parseInt(searchParams.get('offset') || '0');

        // Build query for registrations
        let query = supabase
            .from('master_registrations')
            .select('*', { count: 'exact' })
            .eq('activity_type', 'event')
            .eq('activity_id', event.id.toString())
            .order('created_at', { ascending: false });

        // Apply filters
        if (status) {
            query = query.eq('status', status);
        }

        if (paymentStatus) {
            query = query.eq('payment_status', paymentStatus);
        }

        // Apply search (search in full_name, email, phone)
        if (search) {
            query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`);
        }

        // Apply pagination
        query = query.range(offset, offset + limit - 1);

        const { data: registrations, error: regError, count } = await query;

        // Debug logging
        console.log('=== REGISTRATIONS DEBUG ===');
        console.log('Event ID:', event.id);
        console.log('Event ID type:', typeof event.id);
        console.log('Activity ID being queried:', event.id.toString());
        console.log('Registrations found:', registrations?.length);
        console.log('Total count:', count);
        console.log('Error:', regError);
        if (registrations && registrations.length > 0) {
            console.log('Sample registration:', registrations[0]);
        }
        console.log('=========================');

        if (regError) {
            console.error('Error fetching registrations:', regError);
            return NextResponse.json(
                { error: 'Failed to fetch registrations' },
                { status: 500 }
            );
        }

        // Get user profiles for registrations that have user_id
        const userIds = registrations
            ?.filter(r => r.user_id)
            .map(r => r.user_id) || [];

        let profiles: { id: string; first_name: string | null; last_name: string | null; email: string | null; avatar_url: string | null }[] = [];
        if (userIds.length > 0) {
            const { data: profilesData } = await supabase
                .from('profiles')
                .select('id, first_name, last_name, email, avatar_url')
                .in('id', userIds);

            profiles = profilesData || [];
        }

        // Merge profile data with registrations
        const enrichedRegistrations = registrations?.map(reg => {
            const profile = profiles.find(p => p.id === reg.user_id);
            const profileName = profile
                ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim()
                : null;

            return {
                ...reg,
                profile_name: profileName || reg.full_name,
                profile_avatar: profile?.avatar_url,
                email: profile?.email || reg.email, // Use profile email if available
            };
        });

        return NextResponse.json({
            registrations: enrichedRegistrations || [],
            total: count || 0,
            event: {
                id: event.id,
                title: event.title,
                slug: event.slug
            }
        });

    } catch (error) {
        console.error('Error in registrations API:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// PATCH: Update registration status
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;
        const body = await request.json();
        const { registration_id, status, payment_status } = body;

        if (!registration_id) {
            return NextResponse.json(
                { error: 'Registration ID is required' },
                { status: 400 }
            );
        }

        // Use server client for authentication
        const serverClient = await createServerClient();
        const { data: { user }, error: authError } = await serverClient.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        // Use service role client for querying
        const supabase = getServiceRoleClient();

        // Get the event by slug
        const { data: event, error: eventError } = await supabase
            .from('events')
            .select('id, company_id')
            .eq('slug', slug)
            .single();

        if (eventError || !event) {
            return NextResponse.json(
                { error: 'Event not found' },
                { status: 404 }
            );
        }

        // Check if user has access to this event's company
        const { data: membership } = await supabase
            .from('company_members')
            .select('role')
            .eq('company_id', event.company_id)
            .eq('user_id', user.id)
            .single();

        if (!membership || !['owner', 'admin', 'editor'].includes(membership.role)) {
            return NextResponse.json(
                { error: 'Unauthorized access' },
                { status: 403 }
            );
        }

        // Update registration
        const updates: Record<string, unknown> = {
            updated_at: new Date().toISOString()
        };

        if (status) updates.status = status;
        if (payment_status) updates.payment_status = payment_status;

        const { data: updatedRegistration, error: updateError } = await supabase
            .from('master_registrations')
            .update(updates)
            .eq('id', registration_id)
            .eq('activity_type', 'event')
            .eq('activity_id', event.id.toString())
            .select()
            .single();

        if (updateError) {
            console.error('Error updating registration:', updateError);
            return NextResponse.json(
                { error: 'Failed to update registration' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            registration: updatedRegistration
        });

    } catch (error) {
        console.error('Error updating registration:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
