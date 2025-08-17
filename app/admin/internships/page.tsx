"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Eye, Edit, Trash2, Plus, ExternalLink, Sparkles } from "lucide-react";
import { toast } from "sonner";

type Domain = "Web Development" | "Python" | "Artificial Intelligence" | "Machine Learning" | "Java";

type AdminInternship = {
  email: string;
  passed: boolean | null;
  domain: Domain;
  start_date: string;
  end_date: string;
  certificate_url: string | null;
  certificate_issued_at: string | null;
  verification_code: string | null;
  project_name: string | null;
  project_url: string | null;
};

const domainOptions: Domain[] = [
  "Web Development",
  "Python",
  "Artificial Intelligence",
  "Machine Learning",
  "Java",
];

function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return "-";
  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return dateString;
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" });
}

export default function AdminInternshipsPage() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<AdminInternship[]>([]);
  const [search, setSearch] = useState("");
  const [domainFilter, setDomainFilter] = useState<string>("all");
  const [passedFilter, setPassedFilter] = useState<string>("all");

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<AdminInternship | null>(null);

  const [form, setForm] = useState<AdminInternship>({
    email: "",
    passed: false,
    domain: "Web Development",
    start_date: "",
    end_date: "",
    certificate_url: "",
    certificate_issued_at: "",
    verification_code: "",
    project_name: "",
    project_url: "",
  });

  function resetForm() {
    setForm({
      email: "",
      passed: false,
      domain: "Web Development",
      start_date: "",
      end_date: "",
      certificate_url: "",
      certificate_issued_at: "",
      verification_code: "",
      project_name: "",
      project_url: "",
    });
  }

  async function fetchInternships() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/internships");
      if (!res.ok) throw new Error("Failed to fetch internships");
      const data = await res.json();
      setItems(Array.isArray(data.interns) ? data.interns : []);
    } catch (e) {
      toast.error((e as Error).message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchInternships();
  }, []);

  const filtered = useMemo(() => {
    return items.filter((it) => {
      const q = search.trim().toLowerCase();
      const matchesSearch = !q ||
        it.email.toLowerCase().includes(q) ||
        (it.project_name || "").toLowerCase().includes(q) ||
        (it.project_url || "").toLowerCase().includes(q);
      const matchesDomain = domainFilter === "all" || it.domain === domainFilter;
      const matchesPassed =
        passedFilter === "all" ||
        (passedFilter === "passed" && it.passed === true) ||
        (passedFilter === "not_passed" && !it.passed);
      return matchesSearch && matchesDomain && matchesPassed;
    });
  }, [items, search, domainFilter, passedFilter]);

  async function handleCreate() {
    try {
      const payload = { ...form };
      const res = await fetch("/api/admin/internships", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to create");
      toast.success("Internship created");
      setCreateOpen(false);
      resetForm();
      fetchInternships();
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  async function handleStartEdit(item: AdminInternship) {
    setSelected(item);
    setForm({
      email: item.email,
      passed: Boolean(item.passed),
      domain: item.domain,
      start_date: item.start_date || "",
      end_date: item.end_date || "",
      certificate_url: item.certificate_url || "",
      certificate_issued_at: item.certificate_issued_at || "",
      verification_code: item.verification_code || "",
      project_name: item.project_name || "",
      project_url: item.project_url || "",
    });
    setEditOpen(true);
  }

  async function handleEdit() {
    if (!selected) return;
    try {
      const payload = {
        key: {
          email: selected.email,
          domain: selected.domain,
          start_date: selected.start_date,
        },
        ...form,
      };
      const res = await fetch("/api/admin/internships", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to update");
      toast.success("Internship updated");
      setEditOpen(false);
      setSelected(null);
      fetchInternships();
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  async function handleDelete() {
    if (!selected) return;
    try {
      const res = await fetch("/api/admin/internships", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: {
            email: selected.email,
            domain: selected.domain,
            start_date: selected.start_date,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to delete");
      toast.success("Internship deleted");
      setDeleteOpen(false);
      setSelected(null);
      fetchInternships();
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  return (
    <div className="flex-1 w-full p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Internships (Admin)</h1>
          <p className="text-muted-foreground">Manage internships across all users.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={fetchInternships} variant="outline">Refresh</Button>
          <Dialog open={createOpen} onOpenChange={(open) => { 
            if (open) { resetForm(); } 
            setCreateOpen(open); 
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Internship
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Internship</DialogTitle>
                <DialogDescription>Add a new internship record.</DialogDescription>
              </DialogHeader>
              <InternshipForm form={form} setForm={setForm} />
              <DialogFooter>
                <Button onClick={handleCreate}>Create</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-3">
        <div className="flex-1">
          <Input
            placeholder="Search by email, project name, or URL"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={domainFilter} onValueChange={setDomainFilter}>
          <SelectTrigger className="w-full md:w-56"><SelectValue placeholder="Domain" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Domains</SelectItem>
            {domainOptions.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={passedFilter} onValueChange={setPassedFilter}>
          <SelectTrigger className="w-full md:w-48"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="passed">Passed</SelectItem>
            <SelectItem value="not_passed">Not Passed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-x-auto border rounded-xl">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[200px]">Email</TableHead>
              <TableHead className="min-w-[140px]">Domain</TableHead>
              <TableHead className="min-w-[120px]">Start</TableHead>
              <TableHead className="min-w-[120px]">End</TableHead>
              <TableHead className="min-w-[120px]">Status</TableHead>
              <TableHead className="min-w-[180px]">Project</TableHead>
              <TableHead className="min-w-[140px]">Certificate</TableHead>
              <TableHead className="text-right min-w-[160px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={8} className="text-center text-sm text-muted-foreground">Loading...</TableCell></TableRow>
            ) : filtered.length === 0 ? (
              <TableRow><TableCell colSpan={8} className="text-center text-sm text-muted-foreground">No internships found</TableCell></TableRow>
            ) : (
              filtered.map((it) => (
                <TableRow key={`${it.email}-${it.domain}-${it.start_date}`} className="align-middle">
                  <TableCell className="text-sm font-medium">{it.email}</TableCell>
                  <TableCell className="text-sm">{it.domain}</TableCell>
                  <TableCell className="text-sm">{formatDate(it.start_date)}</TableCell>
                  <TableCell className="text-sm">{formatDate(it.end_date)}</TableCell>
                  <TableCell>
                    {it.passed ? (
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Passed</Badge>
                    ) : (
                      <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Pending</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm">{it.project_name || "—"}</TableCell>
                  <TableCell className="text-sm">
                    {it.certificate_url ? (
                      <a href={it.certificate_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary underline break-all">
                        <Eye className="w-4 h-4" />
                        <span className="truncate max-w-[220px] inline-block align-middle">Preview</span>
                      </a>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {it.project_url && (
                        <a href={it.project_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-2 py-1 text-xs border rounded">
                          <ExternalLink className="w-3 h-3" /> Project
                        </a>
                      )}
                      <Button variant="outline" size="sm" onClick={() => handleStartEdit(it)}><Edit className="w-4 h-4 mr-1" /> Edit</Button>
                      <Button variant="destructive" size="sm" onClick={() => { setSelected(it); setDeleteOpen(true); }}><Trash2 className="w-4 h-4 mr-1" /> Delete</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={editOpen} onOpenChange={(o) => { setEditOpen(o); if (!o) setSelected(null); }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Internship</DialogTitle>
            <DialogDescription>Update the internship details.</DialogDescription>
          </DialogHeader>
          <InternshipForm form={form} setForm={setForm} />
          <DialogFooter>
            <Button onClick={handleEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Internship</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the internship for{" "}
              <span className="font-medium">{selected?.email}</span>.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

type InternshipFormProps = {
  form: AdminInternship;
  setForm: React.Dispatch<React.SetStateAction<AdminInternship>>;
};

function InternshipForm({ form, setForm }: InternshipFormProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateCertificate = async () => {
    if (!form.email || !form.domain || !form.start_date) {
      toast.error("Please fill in Email, Domain, and Start Date before generating.");
      return;
    }

    setIsGenerating(true);
    try {
      const res = await fetch("/api/admin/internships/generate-certificate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            email: form.email,
            domain: form.domain,
            start_date: form.start_date
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to generate certificate.");
      }

      setForm((f) => ({ 
          ...f, 
          certificate_url: data.publicUrl,
          verification_code: data.verification_code
      }));
      toast.success("Certificate generated and URL updated!");

    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="domain">Domain</Label>
        <Select value={form.domain} onValueChange={(v) => setForm((f) => ({ ...f, domain: v as Domain }))}>
          <SelectTrigger id="domain"><SelectValue placeholder="Select domain" /></SelectTrigger>
          <SelectContent>
            {domainOptions.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="start_date">Start Date</Label>
        <Input id="start_date" type="date" value={form.start_date || ""} onChange={(e) => setForm((f) => ({ ...f, start_date: e.target.value }))} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="end_date">End Date</Label>
        <Input id="end_date" type="date" value={form.end_date || ""} onChange={(e) => setForm((f) => ({ ...f, end_date: e.target.value }))} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="passed">Status</Label>
        <Select value={String(form.passed)} onValueChange={(v) => setForm((f) => ({ ...f, passed: v === "true" }))}>
          <SelectTrigger id="passed"><SelectValue placeholder="Select status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="true">Passed</SelectItem>
            <SelectItem value="false">Not Passed</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="project_name">Project Name</Label>
        <Input id="project_name" value={form.project_name || ""} onChange={(e) => setForm((f) => ({ ...f, project_name: e.target.value }))} />
      </div>
      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="project_url">Project URL</Label>
        <Input id="project_url" value={form.project_url || ""} onChange={(e) => setForm((f) => ({ ...f, project_url: e.target.value }))} />
      </div>
      
      <div className="space-y-2 md:col-span-2">
        <Label>Certificate Generation</Label>
        <div className="flex items-center gap-2 p-2 border rounded-lg bg-muted/30">
            <div className="flex-1">
                <Button onClick={handleGenerateCertificate} disabled={isGenerating} className="w-full">
                    <Sparkles className="w-4 h-4 mr-2" />
                    {isGenerating ? "Generating PDF..." : "Generate & Upload Certificate"}
                </Button>
            </div>
        </div>
        <p className="text-xs text-muted-foreground">This will generate a new PDF certificate with the intern&apos;s name and upload it, creating the URL below.</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="certificate_url">Certificate URL</Label>
        <Input id="certificate_url" value={form.certificate_url || ""} readOnly className="bg-muted/50" placeholder="URL will be generated automatically..." />
      </div>

      <div className="space-y-2">
        <Label htmlFor="verification_code">Verification Code</Label>
        <Input id="verification_code" value={form.verification_code || ""} readOnly className="bg-muted/50" placeholder="Code will be generated automatically..." />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="certificate_issued_at">Certificate Issued At</Label>
        <Input id="certificate_issued_at" type="datetime-local" value={form.certificate_issued_at || ""} onChange={(e) => setForm((f) => ({ ...f, certificate_issued_at: e.target.value }))} />
      </div>
    </div>
  );
}