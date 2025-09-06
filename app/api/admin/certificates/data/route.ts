import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Create Supabase client function to avoid build-time initialization
function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET() {
  try {
    const supabaseAdmin = getSupabaseClient();
    // Fetch certificates and templates
    const [certificates, templates] = await Promise.all([
      supabaseAdmin
        .from('certificates')
        .select('*')
        .order('issued_at', { ascending: false }),
      
      supabaseAdmin
        .from('certificate_templates')
        .select('*')
        .order('created_at', { ascending: false })
    ]);

    return NextResponse.json({
      certificates: certificates.data || [],
      templates: templates.data || []
    });
  } catch (error) {
    console.error('Error fetching certificate data:', error);
    return NextResponse.json({ error: 'Failed to fetch certificate data' }, { status: 500 });
  }
} 