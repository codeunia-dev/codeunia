"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Lightbulb, Search, MoreHorizontal, Eye, Download } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  approved: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  rejected: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

interface MentorApplication {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  location: string;
  occupation: string;
  company: string;
  experience: string;
  expertise: string;
  linkedin: string;
  expertise_areas: string[];
  mentoring_types: string[];
  availability: string;
  commitment: string;
  motivation: string;
  previous_mentoring: string;
  teaching_style: string;
  status: string;
  created_at: string;
}

const EXPERTISE_LABELS: Record<string, string> = {
  "web-development": "Web Development",
  "mobile-development": "Mobile Development",
  "ai-ml": "AI & Machine Learning",
  "data-science": "Data Science",
  "cybersecurity": "Cybersecurity",
  "blockchain": "Blockchain",
  "ui-ux": "UI/UX Design",
  "devops": "DevOps",
  "game-development": "Game Development",
  "cloud-computing": "Cloud Computing",
  "system-design": "System Design",
  "algorithms": "Algorithms & Data Structures",
};

const MENTORING_TYPE_LABELS: Record<string, string> = {
  "one-on-one": "One-on-One Mentoring",
  "group-sessions": "Group Sessions",
  "code-reviews": "Code Reviews",
  "project-guidance": "Project Guidance",
  "career-advice": "Career Advice",
  "interview-prep": "Interview Preparation",
};

const AVAILABILITY_LABELS: Record<string, string> = {
  "weekends": "Weekends",
  "weekdays": "Weekdays",
  "evenings": "Evenings",
  "flexible": "Flexible",
};

const COMMITMENT_LABELS: Record<string, string> = {
  "occasional": "Occasional (1-2 sessions/month)",
  "regular": "Regular (Weekly sessions)",
  "intensive": "Intensive (Multiple sessions/week)",
  "flexible": "Flexible - As needed",
};

export default function AdminMentorPage() {
  const [applications, setApplications] = useState<MentorApplication[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState<MentorApplication | null>(null);

  const fetchMentors = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin-mentors");
      const json = await res.json();
      if (json.mentors) setApplications(json.mentors);
    } catch {
      // Optionally handle error
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMentors();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this application?")) return;
    try {
      const res = await fetch("/api/admin-mentors", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Application deleted successfully");
        fetchMentors();
      } else {
        toast.error(json.error || "Failed to delete application");
      }
    } catch {
      toast.error("Failed to delete application");
    }
  };

  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      const matchesSearch =
        app.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.occupation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.company?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || app.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [applications, searchTerm, statusFilter]);

  // Stats
  const total = applications.length;
  const pending = applications.filter((a) => a.status === "pending").length;
  const approved = applications.filter((a) => a.status === "approved").length;
  const rejected = applications.filter((a) => a.status === "rejected").length;
  const thisMonth = new Date().getMonth();
  const thisYear = new Date().getFullYear();
  const newThisMonth = applications.filter((a) => {
    const d = new Date(a.created_at);
    return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
  }).length;

  const stats = [
    {
      title: "Total Applications",
      value: total,
      icon: Lightbulb,
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-950/20",
    },
    {
      title: "Pending",
      value: pending,
      icon: Lightbulb,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50 dark:bg-yellow-950/20",
    },
    {
      title: "Approved",
      value: approved,
      icon: Lightbulb,
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-950/20",
    },
    {
      title: "Rejected",
      value: rejected,
      icon: Lightbulb,
      color: "text-red-600",
      bgColor: "bg-red-50 dark:bg-red-950/20",
    },
    {
      title: "New This Month",
      value: newThisMonth,
      icon: Lightbulb,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50 dark:bg-indigo-950/20",
    },
  ];

  const getStatusBadge = (status: string) => (
    <Badge className={STATUS_COLORS[status] + " text-xs"}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>
  );

  return (
    <div className="bg-black space-y-8 md:space-y-14 min-h-screen px-4 py-8 md:px-8 lg:px-16 relative overflow-x-hidden">
      <div className="pointer-events-none fixed inset-0 z-0 opacity-60 select-none" aria-hidden>
        <svg width="100%" height="100%" className="w-full h-full">
          <defs>
            <radialGradient id="bgPattern" cx="50%" cy="50%" r="80%">
              <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.04" />
            </radialGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#bgPattern)" />
        </svg>
      </div>
      <div className="flex items-center gap-3 pb-6 border-b border-zinc-800/60 relative z-10 mt-2 mb-4">
        <span className="inline-block w-2 h-6 sm:h-8 bg-gradient-to-b from-purple-400 to-indigo-400 rounded-full mr-2" />
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white drop-shadow-sm flex items-center gap-3">
            Mentor Applications
          </h1>
          <p className="text-zinc-400 mt-1 font-medium text-sm sm:text-base">View and manage all mentor applications</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
        {stats.map((stat) => (
          <Card key={stat.title} className={`border-0 shadow-2xl rounded-2xl transition-transform duration-300 hover:-translate-y-2 ${stat.bgColor}`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-xs sm:text-sm font-medium text-zinc-900 dark:text-zinc-100 flex items-center gap-2 tracking-tight">{stat.title}</CardTitle>
              <div className="p-2 rounded-lg bg-gradient-to-br from-white/80 to-zinc-100/40 dark:from-zinc-800/80 dark:to-zinc-900/40 shadow-lg flex items-center justify-center">
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-8">
        <div className="flex gap-3">
          <Button variant="outline" className="text-sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
        <div className="flex flex-1 gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, phone, or company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 text-sm"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-40 text-sm">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <Card className="border-0 shadow-2xl rounded-2xl bg-gradient-to-br from-purple-100/80 to-indigo-200/60 dark:from-purple-900/60 dark:to-indigo-800/40 relative overflow-hidden group mt-8">
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl text-zinc-900 dark:text-zinc-100 font-bold flex items-center">
            <Lightbulb className="h-5 w-5 mr-2 text-purple-400" />
            Mentor Applications
          </CardTitle>
          <CardDescription className="text-zinc-500 dark:text-zinc-300 font-medium text-sm">
            Search and filter through all mentor applications
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <span className="animate-spin rounded-full h-8 w-8 border-2 border-purple-400 border-t-transparent"></span>
            </div>
          ) : filteredApplications.length === 0 ? (
            <div className="text-center py-8">
              <Lightbulb className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No applications found</h3>
              <p className="text-muted-foreground text-sm">Try adjusting your search criteria</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs sm:text-sm">Name</TableHead>
                    <TableHead className="text-xs sm:text-sm">Email</TableHead>
                    <TableHead className="text-xs sm:text-sm">Phone</TableHead>
                    <TableHead className="text-xs sm:text-sm">Status</TableHead>
                    <TableHead className="text-xs sm:text-sm hidden md:table-cell">Company</TableHead>
                    <TableHead className="text-xs sm:text-sm hidden md:table-cell">Expertise</TableHead>
                    <TableHead className="text-xs sm:text-sm hidden md:table-cell">Expertise Areas</TableHead>
                    <TableHead className="text-xs sm:text-sm hidden md:table-cell">Mentoring Types</TableHead>
                    <TableHead className="text-xs sm:text-sm hidden md:table-cell">Availability</TableHead>
                    <TableHead className="text-xs sm:text-sm hidden md:table-cell">Commitment</TableHead>
                    <TableHead className="text-xs sm:text-sm hidden lg:table-cell">Applied</TableHead>
                    <TableHead className="text-right text-xs sm:text-sm">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredApplications.map((app) => (
                    <TableRow key={app.id} className="hover:bg-purple-700/10 transition-colors">
                      <TableCell>
                        <div className="font-medium text-sm text-zinc-900 dark:text-zinc-100">
                          {app.first_name} {app.last_name}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs">{app.email}</TableCell>
                      <TableCell className="text-xs">{app.phone}</TableCell>
                      <TableCell>{getStatusBadge(app.status)}</TableCell>
                      <TableCell className="hidden md:table-cell text-xs">{app.company}</TableCell>
                      <TableCell className="hidden md:table-cell text-xs">{app.expertise}</TableCell>
                      <TableCell className="hidden md:table-cell text-xs">
                        {Array.isArray(app.expertise_areas)
                          ? app.expertise_areas.map((i: string) => (
                              <Badge key={i} className="mr-1 mb-1 bg-purple-200 text-purple-800 dark:bg-purple-900 dark:text-purple-200 text-xxs">
                                {EXPERTISE_LABELS[i] || i}
                              </Badge>
                            ))
                          : null}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-xs">
                        {Array.isArray(app.mentoring_types)
                          ? app.mentoring_types.map((i: string) => (
                              <Badge key={i} className="mr-1 mb-1 bg-indigo-200 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200 text-xxs">
                                {MENTORING_TYPE_LABELS[i] || i}
                              </Badge>
                            ))
                          : null}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-xs">
                        {AVAILABILITY_LABELS[app.availability] || app.availability}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-xs">
                        {COMMITMENT_LABELS[app.commitment] || app.commitment}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-xs">
                        {app.created_at ? new Date(app.created_at).toLocaleDateString() : "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-purple-700/20 text-purple-400 font-semibold text-xs sm:text-sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuLabel className="text-xs">Actions</DropdownMenuLabel>
                            <DropdownMenuItem
                              className="text-xs"
                              onClick={() => {
                                setSelectedApp(app);
                                setViewDialogOpen(true);
                              }}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View Application
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-xs text-red-600"
                              onClick={() => handleDelete(app.id)}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                              Delete Application
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Application Dialog (outside the map) */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-md w-full max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Mentor Application Details</DialogTitle>
            <DialogDescription>
              Full details for {selectedApp?.first_name} {selectedApp?.last_name}
            </DialogDescription>
          </DialogHeader>
          {selectedApp && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>First Name</Label>
                  <div className="text-sm font-medium">{selectedApp.first_name}</div>
                </div>
                <div>
                  <Label>Last Name</Label>
                  <div className="text-sm font-medium">{selectedApp.last_name}</div>
                </div>
                <div>
                  <Label>Email</Label>
                  <div className="text-sm font-medium">{selectedApp.email}</div>
                </div>
                <div>
                  <Label>Phone</Label>
                  <div className="text-sm font-medium">{selectedApp.phone}</div>
                </div>
                <div>
                  <Label>Location</Label>
                  <div className="text-sm font-medium">{selectedApp.location}</div>
                </div>
                <div>
                  <Label>Occupation</Label>
                  <div className="text-sm font-medium">{selectedApp.occupation}</div>
                </div>
                <div>
                  <Label>Company</Label>
                  <div className="text-sm font-medium">{selectedApp.company}</div>
                </div>
                <div>
                  <Label>LinkedIn</Label>
                  <div className="text-sm font-medium break-all">
                    <a href={selectedApp.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
                      {selectedApp.linkedin}
                    </a>
                  </div>
                </div>
              </div>
              <div>
                <Label>Experience</Label>
                <div className="text-sm font-medium whitespace-pre-line">{selectedApp.experience}</div>
              </div>
              <div>
                <Label>Expertise</Label>
                <div className="text-sm font-medium whitespace-pre-line">{selectedApp.expertise}</div>
              </div>
              <div>
                <Label>Expertise Areas</Label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {Array.isArray(selectedApp.expertise_areas)
                    ? selectedApp.expertise_areas.map((i: string) => (
                        <Badge key={i} className="bg-purple-200 text-purple-800 dark:bg-purple-900 dark:text-purple-200 text-xxs">
                          {EXPERTISE_LABELS[i] || i}
                        </Badge>
                      ))
                    : null}
                </div>
              </div>
              <div>
                <Label>Mentoring Types</Label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {Array.isArray(selectedApp.mentoring_types)
                    ? selectedApp.mentoring_types.map((i: string) => (
                        <Badge key={i} className="bg-indigo-200 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200 text-xxs">
                          {MENTORING_TYPE_LABELS[i] || i}
                        </Badge>
                      ))
                    : null}
                </div>
              </div>
              <div>
                <Label>Availability</Label>
                <div className="text-sm font-medium">
                  {AVAILABILITY_LABELS[selectedApp.availability] || selectedApp.availability}
                </div>
              </div>
              <div>
                <Label>Commitment</Label>
                <div className="text-sm font-medium">
                  {COMMITMENT_LABELS[selectedApp.commitment] || selectedApp.commitment}
                </div>
              </div>
              <div>
                <Label>Motivation</Label>
                <div className="text-sm font-medium whitespace-pre-line">{selectedApp.motivation}</div>
              </div>
              <div>
                <Label>Previous Mentoring Experience</Label>
                <div className="text-sm font-medium whitespace-pre-line">{selectedApp.previous_mentoring}</div>
              </div>
              <div>
                <Label>Teaching Style</Label>
                <div className="text-sm font-medium whitespace-pre-line">{selectedApp.teaching_style}</div>
              </div>
              <div>
                <Label>Status</Label>
                <div>{getStatusBadge(selectedApp.status)}</div>
              </div>
              <div>
                <Label>Applied At</Label>
                <div className="text-sm font-medium">{selectedApp.created_at ? new Date(selectedApp.created_at).toLocaleString() : "-"}</div>
              </div>
            </div>
          )}
          <DialogFooter>
            {/* Approve/Reject buttons for admin */}
            {selectedApp && (
              <div className="flex gap-2 w-full justify-end">
                <Button
                  variant="outline"
                  className="border-green-600 text-green-700 hover:bg-green-50 dark:hover:bg-green-900"
                  disabled={selectedApp.status === 'approved'}
                  onClick={async () => {
                    const res = await fetch('/api/admin-mentors', {
                      method: 'PATCH',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ id: selectedApp.id, status: 'approved' }),
                    });
                    const json = await res.json();
                    if (json.mentor) {
                      toast.success('Application approved');
                      setViewDialogOpen(false);
                      fetchMentors();
                    } else {
                      toast.error(json.error || 'Failed to approve');
                    }
                  }}
                >
                  Approve
                </Button>
                <Button
                  variant="outline"
                  className="border-red-600 text-red-700 hover:bg-red-50 dark:hover:bg-red-900"
                  disabled={selectedApp.status === 'rejected'}
                  onClick={async () => {
                    const res = await fetch('/api/admin-mentors', {
                      method: 'PATCH',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ id: selectedApp.id, status: 'rejected' }),
                    });
                    const json = await res.json();
                    if (json.mentor) {
                      toast.success('Application rejected');
                      setViewDialogOpen(false);
                      fetchMentors();
                    } else {
                      toast.error(json.error || 'Failed to reject');
                    }
                  }}
                >
                  Reject
                </Button>
              </div>
            )}
            {/* Close button removed, X icon in header is functional */}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 