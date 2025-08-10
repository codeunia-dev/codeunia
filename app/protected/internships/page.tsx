import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

import InternshipsTable from "@/components/InternshipsTable";

type InternRow = {
  email: string;
  passed: boolean | null;
  domain:
    | "Web Development"
    | "Python"
    | "Artificial Intelligence"
    | "Machine Learning"
    | "Java";
  start_date: string; // date
  end_date: string; // date
  certificate_url: string | null;
  certificate_issued_at: string | null; // timestamptz
  project_name: string | null;
  project_url: string | null;
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

function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return "-";
  try {
    const d = new Date(dateString);
    if (Number.isNaN(d.getTime())) return "-";
    return d.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
  } catch {
    return "-";
  }
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

  // Fetch internship records by email (completed only)
  const { data: internships, error: internError } = await supabase
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
    .eq("email", authEmail)
    .eq("passed", true)
    .order("start_date", { ascending: false }) as unknown as {
      data: InternRow[] | null;
      error: unknown;
    };

  if (internError || !internships || internships.length === 0) {
    return (
      <div className="flex-1 w-full flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-2xl font-semibold mb-2">Internships</h1>
        <p className="text-muted-foreground max-w-md">
          We could not find any completed internships for your account yet. If you recently completed one, please wait a bit or contact support.
        </p>
      </div>
    );
  }

  const firstName = formatNamePart(profile?.first_name) || formatNamePart(authData.user.user_metadata?.first_name);
  const lastName = formatNamePart(profile?.last_name) || formatNamePart(authData.user.user_metadata?.last_name);
  const fullName = `${firstName} ${lastName}`.trim() || authEmail || "";

  return (
    <div className="flex-1 w-full p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Internship Certificate</h1>
        <p className="text-muted-foreground">Your completed internships and certificate access.</p>
      </div>

      <div className="mb-6">
        <div className="text-sm text-muted-foreground mb-1">Intern</div>
        <div className="font-medium">{fullName || authEmail}</div>
      </div>

      <InternshipsTable internships={internships as unknown as InternRow[]} />

      
    </div>
  );
}