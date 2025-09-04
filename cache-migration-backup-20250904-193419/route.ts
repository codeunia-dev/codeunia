
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client with service role
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.json({ error: "Verification code is required." }, { status: 400 });
  }

  try {
    // Fetch the internship record by verification code
    const { data: intern, error: internError } = await supabase
      .from("interns")
      .select("*, profiles(first_name, last_name)") // Join with profiles table
      .eq("verification_code", code)
      .single();

    if (internError) {
      // If error is "PGRST116", it means no rows were found, which is not a server error
      if (internError.code === "PGRST116") {
        return NextResponse.json({ error: "Certificate not found." }, { status: 404 });
      }
      throw new Error(internError.message);
    }

    if (!intern) {
      return NextResponse.json({ error: "Certificate not found." }, { status: 404 });
    }

    return NextResponse.json(intern);

  } catch (e) {
    console.error("Verification Error:", e);
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
