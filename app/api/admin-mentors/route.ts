import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Setup Supabase client with service role key (bypasses RLS)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET: List all mentor applications
export async function GET() {
  const { data, error } = await supabase
    .from("mentor_applications")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ mentors: data });
}

// POST: Create a new mentor application
export async function POST(req: Request) {
  const body = await req.json();
  const { data, error } = await supabase
    .from("mentor_applications")
    .insert([body])
    .select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ mentor: data[0] });
}

// PATCH: Update a mentor application (expects { id, ...fields })
export async function PATCH(req: Request) {
  const body = await req.json();
  const { id, ...fields } = body;
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }
  const { data, error } = await supabase
    .from("mentor_applications")
    .update(fields)
    .eq("id", id)
    .select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ mentor: data[0] });
}

// DELETE: Delete a mentor application (expects { id })
export async function DELETE(req: Request) {
  const body = await req.json();
  const { id } = body;
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }
  const { error } = await supabase
    .from("mentor_applications")
    .delete()
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true });
} 