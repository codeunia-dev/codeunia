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

// GET: Export registrations as CSV
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        
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

        // Get the hackathon by slug
        const { data: hackathon, error: hackathonError } = await supabase
            .from('hackathons')
            .select('id, title, company_id, slug')
            .eq('slug', id)
            .single();

        if (hackathonError || !hackathon) {
            return NextResponse.json(
                { error: 'Hackathon not found' },
                { status: 404 }
            );
        }

        // Check if user has access to this hackathon's company
        const { data: membership } = await supabase
            .from('company_members')
            .select('role')
            .eq('company_id', hackathon.company_id)
            .eq('user_id', user.id)
            .single();

        if (!membership) {
            return NextResponse.json(
                { error: 'Unauthorized access' },
                { status: 403 }
            );
        }

        // Get all registrations for this hackathon
        const { data: registrations, error: regError } = await supabase
            .from('master_registrations')
            .select('*')
            .eq('activity_type', 'hackathon')
            .eq('activity_id', hackathon.id.toString())
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
            'Status',
            'Payment Status',
            'Payment Amount',
            'Registered On'
        ];

        const csvRows = [headers.join(',')];

        registrations?.forEach(reg => {
            // Format date to be more readable (e.g., "Nov 19 2025")
            const registeredDate = reg.created_at 
                ? new Date(reg.created_at).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                }).replace(/,/g, '')
                : '';

            const row = [
                reg.id,
                `"${reg.full_name || ''}"`,
                `"${reg.email || ''}"`,
                `"${reg.phone || ''}"`,
                reg.status,
                reg.payment_status,
                reg.payment_amount ? `₹${reg.payment_amount / 100}` : 'N/A',
                `"${registeredDate}"`
            ];
            csvRows.push(row.join(','));
        });

        const csv = csvRows.join('\n');
        const filename = `${hackathon.slug}-registrations-${new Date().toISOString().split('T')[0]}.csv`;

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
