import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Server-side clients
function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

async function getServerClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    }
  );
}

async function requireAdmin() {
  const supa = await getServerClient();
  const { data: { user }, error } = await supa.auth.getUser();
  if (error || !user) {
    return { ok: false, resp: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }
  // Check admin flag from profiles (service client to bypass RLS for lookup only)
  const svc = getServiceClient();
  const { data: profile, error: pErr } = await svc.from('profiles').select('is_admin').eq('id', user.id).single();
  if (pErr || !profile?.is_admin) {
    return { ok: false, resp: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
  }
  return { ok: true };
}

export async function GET() {
    try {
        const auth = await requireAdmin();
        if (!auth.ok) return auth.resp;
        
        const supabase = getServiceClient();
        
        const { data, error } = await supabase
            .from('core_team_applications')
            .select('id,first_name,last_name,email,phone,location,occupation,company,experience,skills,portfolio,preferred_role,availability,commitment,motivation,vision,previous_experience,social_media,references_info,additional_info,status,user_id,created_at,updated_at')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching core team applications:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ applications: data });
    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const auth = await requireAdmin();
        if (!auth.ok) return auth.resp;
        
        const body = await req.json();
        const { id, status, notes } = body as { id?: number; status?: string; notes?: string };

        const ALLOWED_STATUSES = new Set(['pending','approved','rejected']);
        if (!id || !status || !ALLOWED_STATUSES.has(status)) {
            return NextResponse.json({ error: 'Missing required fields or invalid status' }, { status: 400 });
        }

        const supabase = getServiceClient();
        
        const { data, error } = await supabase
            .from('core_team_applications')
            .update({ 
                status,
                updated_at: new Date().toISOString(),
                ...(notes && { notes })
            })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error updating core team application:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ application: data });
    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        const auth = await requireAdmin();
        if (!auth.ok) return auth.resp;
        
        const body = await req.json();
        const { id, ...updates } = body;

        if (!id) {
            return NextResponse.json({ error: 'Missing application ID' }, { status: 400 });
        }

        const supabase = getServiceClient();
        
        const { data, error } = await supabase
            .from('core_team_applications')
            .update({ 
                ...updates,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error updating core team application:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ application: data });
    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
