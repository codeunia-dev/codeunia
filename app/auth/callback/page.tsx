"use client"

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

function OAuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get("returnUrl") || "/";

  useEffect(() => {
    const checkSession = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        router.replace(returnUrl);
      } else {
        toast.error("Authentication failed. Please try signing in again.");
        router.replace(`/auth/signin?returnUrl=${encodeURIComponent(returnUrl)}`);
      }
    };
    checkSession();
  }, [router, returnUrl]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-muted/50">
      <div className="relative">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
        <div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-ping"></div>
      </div>
      <span className="ml-4 text-lg text-muted-foreground">Signing you in...</span>
    </div>
  );
}

export default function OAuthCallback() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-muted/50">
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
          <div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-ping"></div>
        </div>
        <span className="ml-4 text-lg text-muted-foreground">Loading...</span>
      </div>
    }>
      <OAuthCallbackContent />
    </Suspense>
  );
} 