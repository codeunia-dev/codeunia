import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import InternshipCertificate from "@/components/InternshipCertificate";

type InternRow = {
  email: string;
  passed: boolean | null;
};

type ProfileRow = {
  email: string | null;
  first_name: string | null;
  last_name: string | null;
};

function formatNamePart(part: string | null | undefined): string {
  if (!part) return "";
  const lower = part.toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

export default async function InternshipsPage() {
  const supabase = await createClient();

  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData?.user) {
    redirect("/auth/signin");
  }

  const authEmail = (authData.user.email || "").toLowerCase();

  // Fetch profile name by email
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("email, first_name, last_name")
    .eq("email", authEmail)
    .single<ProfileRow>();

  // Fetch internship pass status by email
  const { data: intern, error: internError } = await supabase
    .from("interns")
    .select("email, passed")
    .eq("email", authEmail)
    .maybeSingle<InternRow>();

  if (internError || !intern) {
    return (
      <div className="flex-1 w-full flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-2xl font-semibold mb-2">Internship Access</h1>
        <p className="text-muted-foreground max-w-md">
          We could not find your internship record. If you recently joined, please wait a bit or contact support.
        </p>
      </div>
    );
  }

  if (!intern.passed) {
    return (
      <div className="flex-1 w-full flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-2xl font-semibold mb-2">Certificate Locked</h1>
        <p className="text-muted-foreground max-w-md">
          Your internship status is not marked as passed yet. Once approved, your certificate will be available here.
        </p>
      </div>
    );
  }

  const firstName = formatNamePart(profile?.first_name) || formatNamePart(authData.user.user_metadata?.first_name);
  const lastName = formatNamePart(profile?.last_name) || formatNamePart(authData.user.user_metadata?.last_name);
  const fullName = `${firstName} ${lastName}`.trim() || authEmail || "";

  return (
    <div className="flex-1 w-full p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Internship Certificate</h1>
        <p className="text-muted-foreground">Download your internship completion certificate.</p>
      </div>

      <InternshipCertificate
        fullName={fullName}
        backgroundSrc="/images/certificatesample.png"
      />
    </div>
  );
}
