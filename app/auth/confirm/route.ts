import { createClient } from "@/lib/supabase/server";
import { type EmailOtpType } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/";
  const returnUrl = searchParams.get("returnUrl") ?? "/protected";

  const supabase = await createClient();

  // Handle OAuth callback (Google sign-in)
  if (searchParams.get("access_token") || searchParams.get("refresh_token")) {
    try {
      // Get the current session to check if user is authenticated
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Session error:', error);
        redirect(`/auth/error?error=${encodeURIComponent('Authentication failed')}`);
      }

      if (session?.user) {
        // User is authenticated, redirect to the return URL
        redirect(returnUrl);
      } else {
        // No session found, redirect to signin
        redirect(`/auth/signin?returnUrl=${encodeURIComponent(returnUrl)}`);
      }
    } catch (error) {
      console.error('OAuth callback error:', error);
      redirect(`/auth/error?error=${encodeURIComponent('Authentication failed')}`);
    }
  }

  // Handle email verification
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });
    
    if (!error) {
      // redirect user to specified redirect URL or root of app
      redirect(next);
    } else {
      // redirect the user to an error page with some instructions
      redirect(`/auth/error?error=${encodeURIComponent(error?.message || 'Verification failed')}`);
    }
  }

  // redirect the user to an error page with some instructions
  redirect(`/auth/error?error=${encodeURIComponent('No token hash or type')}`);
}
