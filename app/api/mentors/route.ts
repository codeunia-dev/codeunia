import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Force Node.js runtime for API routes
export const runtime = 'nodejs';

// Create Supabase client function to avoid build-time initialization
function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// GET: List all approved mentors
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const expertise = searchParams.get('expertise');
  const type = searchParams.get('type');
  const search = searchParams.get('search');

  const supabase = getSupabaseClient();
  let query = supabase
    .from("mentor_applications")
    .select("id, first_name, last_name, company, occupation, expertise, expertise_areas, mentoring_types, linkedin, availability, created_at")
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  if (expertise && expertise !== 'all') {
    query = query.contains('expertise_areas', [expertise]);
  }

  if (type && type !== 'all') {
    query = query.contains('mentoring_types', [type]);
  }

  if (search) {
    query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,company.ilike.%${search}%,occupation.ilike.%${search}%`);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  return NextResponse.json({ mentors: data });
}
