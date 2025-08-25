import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

import InternshipsTable from "@/components/InternshipsTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const dynamic = "force-dynamic";

type InternshipApplication = {
  status: string
  start_date?: string
  end_date?: string
  repo_url?: string
  duration_weeks?: number
}

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

export default async function InternshipsPage() {
  const supabase = await createClient();

  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData?.user) {
    redirect("/auth/signin");
  }

  const authEmailRaw = authData.user.email || "";

  // Fetch profile name by email
  const { data: profile } = await supabase
    .from("profiles")
    .select("email, first_name, last_name")
    .ilike("email", authEmailRaw)
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
    .ilike("email", authEmailRaw)
    .eq("passed", true)
    .order("start_date", { ascending: false }) as unknown as {
      data: InternRow[] | null;
      error: unknown;
    };

  // Also fetch user's applications
  // Fetch applications; try to include remarks if column exists
  let applications: unknown[] | null = null
  try {
    const { data: apps } = await supabase
      .from('internship_applications')
      .select('internship_id, domain, level, status, created_at, remarks, repo_url, duration_weeks, start_date, end_date')
      .eq('user_id', authData.user.id)
      .order('created_at', { ascending: false })
    applications = apps || []
  } catch {
    try {
      const { data: apps2 } = await supabase
        .from('internship_applications')
        .select('internship_id, domain, level, status, created_at')
        .eq('user_id', authData.user.id)
        .order('created_at', { ascending: false })
      applications = apps2 || []
    } catch {}
  }

  if ((internError || !internships || internships.length === 0) && (!applications || applications.length === 0)) {
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
  const fullName = `${firstName} ${lastName}`.trim() || authEmailRaw || "";

  return (
    <div className="flex-1 w-full p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Internship Certificate</h1>
        <p className="text-muted-foreground">Your completed internships and certificate access.</p>
      </div>

      <div className="mb-6">
        <div className="text-sm text-muted-foreground mb-1">Intern</div>
        <div className="font-medium">{fullName || authEmailRaw}</div>
      </div>

      {internships && internships.length > 0 && (
        <InternshipsTable internships={internships as unknown as InternRow[]} />
      )}

      {applications && applications.length > 0 && (
        <div className="mt-10">
          <Card>
            <CardHeader>
              <CardTitle>Your Applications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto border rounded-xl">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Internship</TableHead>
                      <TableHead>Domain</TableHead>
                      <TableHead>Level</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Remarks</TableHead>
                      <TableHead>Applied</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(applications as Array<{ internship_id: string; domain: string; level: string; status: string; created_at: string; remarks?: string }>).map((a, i) => (
                      <TableRow key={i}>
                        <TableCell className="text-sm">{a.internship_id}</TableCell>
                        <TableCell className="text-sm">{a.domain}</TableCell>
                        <TableCell className="text-sm">{a.level}</TableCell>
                        <TableCell className="text-sm capitalize">{a.status}</TableCell>
                        <TableCell className="text-sm">{'remarks' in a && a.remarks ? a.remarks : '—'}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{new Date(a.created_at).toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {applications && (applications as Array<{ status: string }>).some((a) => a.status === 'accepted') && (
        <div className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Current Internship Assignment</CardTitle>
            </CardHeader>
            <CardContent>
              {(applications as InternshipApplication[]).filter((a) => a.status === 'accepted').map((a, idx) => {
                const start = a.start_date ? new Date(a.start_date) : null
                const end = a.end_date ? new Date(a.end_date) : null
                const today = new Date()
                const daysLeft = start && end ? Math.max(0, Math.ceil((end.getTime() - today.getTime()) / (1000*60*60*24))) : null
                return (
                  <div key={idx} className="grid grid-cols-1 md:grid-cols-2 gap-4 border rounded-lg p-4 mb-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Repository</div>
                      {a.repo_url ? (
                        <a href={a.repo_url} target="_blank" className="text-primary underline break-all">{a.repo_url}</a>
                      ) : (
                        <div className="text-sm">—</div>
                      )}
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Duration</div>
                      <div className="text-sm">{a.duration_weeks ? `${a.duration_weeks} weeks` : '—'}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Start</div>
                      <div className="text-sm">{start ? start.toLocaleDateString() : '—'}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">End</div>
                      <div className="text-sm">{end ? end.toLocaleDateString() : '—'}{daysLeft !== null ? ` • ${daysLeft} days left` : ''}</div>
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </div>
      )}

      
    </div>
  );
}