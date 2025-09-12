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

export async function GET() {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ users: data.users });
} 