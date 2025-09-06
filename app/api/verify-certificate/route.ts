import { createClient } from "@supabase/supabase-js";
import { UnifiedCache } from "@/lib/unified-cache-system";

// Create Supabase client function to avoid build-time initialization
function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

interface CertificateData {
  verification_code: string;
  profiles: {
    first_name: string;
    last_name: string;
  };
  [key: string]: unknown; // Other internship fields
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return UnifiedCache.createResponse(
      { error: "Verification code is required." }, 
      'USER_PRIVATE'
    );
  }

  try {
    // Use unified cache system for certificate verification
    // Cache for longer since certificates don't change frequently
    const cacheKey = `certificate-${code}`;
    
    const result = await UnifiedCache.cachedQuery(
      cacheKey,
      async (): Promise<CertificateData | null> => {
        // Fetch the internship record by verification code
        const supabase = getSupabaseClient();
        const { data: intern, error: internError } = await supabase
          .from("interns")
          .select("*, profiles(first_name, last_name)") // Join with profiles table
          .eq("verification_code", code)
          .single();

        if (internError) {
          // If error is "PGRST116", it means no rows were found
          if (internError.code === "PGRST116") {
            return null; // Return null for not found
          }
          throw new Error(internError.message);
        }

        return intern;
      },
      'STATIC_IMMUTABLE' // Use static immutable since certificates don't change
    );

    if (!result) {
      return UnifiedCache.createResponse(
        { error: "Certificate not found." }, 
        'USER_PRIVATE'
      );
    }

    return UnifiedCache.createResponse(result, 'STATIC_IMMUTABLE');

  } catch (error) {
    console.error("Error verifying certificate:", error);
    return UnifiedCache.createResponse(
      { error: "Internal server error" }, 
      'USER_PRIVATE'
    );
  }
}
