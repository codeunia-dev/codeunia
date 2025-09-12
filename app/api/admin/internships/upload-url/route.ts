
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";

// Force Node.js runtime for API routes
export const runtime = 'nodejs';


// Create Supabase client function to avoid build-time initialization
function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(request: Request) {
  try {
    const { email, domain, start_date, contentType } = await request.json();

    if (!email || !domain || !start_date || !contentType) {
      return NextResponse.json({ error: "Missing required fields: email, domain, start_date, contentType" }, { status: 400 });
    }

    const fileExtension = contentType.split("/")[1] || "pdf";
    // Sanitize inputs to create a valid file path
    const sanitizedEmail = email.replace(/[^a-zA-Z0-9-._]/g, "_");
    const sanitizedDomain = domain.replace(/[^a-zA-Z0-9-]/g, "_");
    const sanitizedStartDate = start_date.split("T")[0]; // Get date part only
    const uniqueId = uuidv4().slice(0, 8);

    const filePath = `public/${sanitizedEmail}_${sanitizedDomain}_${sanitizedStartDate}_${uniqueId}.${fileExtension}`;

    const supabase = getSupabaseClient();
    const { data, error } = await supabase.storage
      .from("internship-certificates")
      .createSignedUploadUrl(filePath);

    if (error) {
      console.error("Error creating signed URL:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Also get the public URL to return to the client
    const { data: publicUrlData } = supabase.storage
      .from("internship-certificates")
      .getPublicUrl(filePath);

    return NextResponse.json({
      signedUrl: data.signedUrl,
      path: data.path,
      publicUrl: publicUrlData.publicUrl,
    });

  } catch (e) {
    console.error("Unexpected error in upload-url route:", e);
    return NextResponse.json({ error: (e as Error).message || "An unexpected error occurred." }, { status: 500 });
  }
}
