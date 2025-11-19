import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

// GET: Export registrations as CSV
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;
        const supabase = await createClient();

        // Get the current user
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

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

        // Get all registrations for this event
        const { data: registrations, error: regError } = await supabase
            .from('master_registrations')
            .select('*')
            .eq('activity_type', 'event')
            .eq('activity_id', event.id.toString())
            .order('created_at', { ascending: false });

        if (regError) {
            console.error('Error fetching registrations:', regError);
            return NextResponse.json(
                { error: 'Failed to fetch registrations' },
                { status: 500 }
            );
        }

        // Convert to CSV
        const headers = [
            'ID',
            'Full Name',
            'Email',
            'Phone',
            'Institution',
            'Department',
            'Year of Study',
            'Experience Level',
            'Status',
            'Payment Status',
            'Payment Amount',
            'Registration Date',
            'Created At'
        ];

        const csvRows = [headers.join(',')];

        registrations?.forEach(reg => {
            const row = [
                reg.id,
                `"${reg.full_name || ''}"`,
                `"${reg.email || ''}"`,
                `"${reg.phone || ''}"`,
                `"${reg.institution || ''}"`,
                `"${reg.department || ''}"`,
                `"${reg.year_of_study || ''}"`,
                `"${reg.experience_level || ''}"`,
                reg.status,
                reg.payment_status,
                reg.payment_amount || '',
                reg.registration_date,
                reg.created_at
            ];
            csvRows.push(row.join(','));
        });

        const csv = csvRows.join('\n');
        const filename = `${event.slug}-registrations-${new Date().toISOString().split('T')[0]}.csv`;

        return new NextResponse(csv, {
            headers: {
                'Content-Type': 'text/csv',
                'Content-Disposition': `attachment; filename="${filename}"`
            }
        });

    } catch (error) {
        console.error('Error exporting registrations:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
