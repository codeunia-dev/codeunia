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

// List all internships
export async function GET() {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("interns")
    .select(
      [
        "email",
        "passed",
        "domain",
        "start_date",
        "end_date",
        "certificate_url",
        "certificate_issued_at",
        "project_name",
        "project_url",
      ].join(", ")
    )
    .order("start_date", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ interns: data ?? [] });
}

// Create a new internship
export async function POST(request: Request) {
  const body = await request.json();
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("interns")
    .insert([body])
    .select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ intern: data?.[0] }, { status: 201 });
}

// Update an internship (expects { id, ...fields })
export async function PATCH(request: Request) {
  const body = await request.json();
  const { key, ...fields } = body as {
    key?: { email?: string; domain?: string; start_date?: string };
    [k: string]: unknown;
  };
  if (!key?.email || !key?.domain || !key?.start_date) {
    return NextResponse.json({ error: "Missing key { email, domain, start_date }" }, { status: 400 });
  }

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("interns")
    .update(fields)
    .eq("email", key.email)
    .eq("domain", key.domain)
    .eq("start_date", key.start_date)
    .select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ intern: data?.[0] });
}

// Delete an internship (expects { id })
export async function DELETE(request: Request) {
  const body = await request.json();
  const { key } = body as { key?: { email?: string; domain?: string; start_date?: string } };
  if (!key?.email || !key?.domain || !key?.start_date) {
    return NextResponse.json({ error: "Missing key { email, domain, start_date }" }, { status: 400 });
  }

  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from("interns")
    .delete()
    .eq("email", key.email)
    .eq("domain", key.domain)
    .eq("start_date", key.start_date);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
