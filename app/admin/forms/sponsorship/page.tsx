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
import { Trophy, Search, MoreHorizontal, Eye, Download } from "lucide-react";
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

interface SponsorshipApplication {
  id: string;
  company_name: string;
  company_size: string;
  contact_name: string;
  designation: string;
  email: string;
  phone: string;
  website: string;
  industry: string;
  preferred_events: string[];
  marketing_goals: string;
  target_audience: string;
  specific_requirements: string;
  status: string;
  created_at: string;
}

const EVENT_LABELS: Record<string, string> = {
  "Hackathons": "Hackathons",
  "Workshops": "Workshops",
  "Conferences": "Conferences",
  "Webinars": "Webinars",
  "Mentorship Programs": "Mentorship Programs",
  "Career Fairs": "Career Fairs",
  "Tech Talks": "Tech Talks",
  "All Events": "All Events",
};

export default function AdminSponsorshipPage() {
  const [applications, setApplications] = useState<SponsorshipApplication[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState<SponsorshipApplication | null>(null);

  const fetchSponsorships = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin-sponsorship");
      const json = await res.json();
      if (json.sponsorships) setApplications(json.sponsorships);
    } catch {
      // Optionally handle error
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSponsorships();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this application?")) return;
    try {
      const res = await fetch("/api/admin-sponsorship", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Application deleted successfully");
        fetchSponsorships();
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
        app.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.contact_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.industry?.toLowerCase().includes(searchTerm.toLowerCase());
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
      icon: Trophy,
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-950/20",
    },
    {
      title: "Pending",
      value: pending,
      icon: Trophy,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50 dark:bg-yellow-950/20",
    },
    {
      title: "Approved",
      value: approved,
      icon: Trophy,
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-950/20",
    },
    {
      title: "Rejected",
      value: rejected,
      icon: Trophy,
      color: "text-red-600",
      bgColor: "bg-red-50 dark:bg-red-950/20",
    },
    {
      title: "New This Month",
      value: newThisMonth,
      icon: Trophy,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50 dark:bg-indigo-950/20",
    },
  ];

  const getStatusBadge = (status: string) => {
    if (!status || typeof status !== 'string') {
      return <Badge className="bg-gray-200 text-gray-800 dark:bg-gray-800 dark:text-gray-200 text-xs">Unknown</Badge>;
    }
    return (
      <Badge className={STATUS_COLORS[status] + " text-xs"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

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
            Sponsorship Applications
          </h1>
          <p className="text-zinc-400 mt-1 font-medium text-sm sm:text-base">View and manage all sponsorship applications</p>
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
              placeholder="Search by company, contact, email, phone, or industry..."
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
            <Trophy className="h-5 w-5 mr-2 text-purple-400" />
            Sponsorship Applications
          </CardTitle>
          <CardDescription className="text-zinc-500 dark:text-zinc-300 font-medium text-sm">
            Search and filter through all sponsorship applications
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <span className="animate-spin rounded-full h-8 w-8 border-2 border-purple-400 border-t-transparent"></span>
            </div>
          ) : filteredApplications.length === 0 ? (
            <div className="text-center py-8">
              <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No applications found</h3>
              <p className="text-muted-foreground text-sm">Try adjusting your search criteria</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs sm:text-sm">Company</TableHead>
                    <TableHead className="text-xs sm:text-sm">Contact</TableHead>
                    <TableHead className="text-xs sm:text-sm">Email</TableHead>
                    <TableHead className="text-xs sm:text-sm">Phone</TableHead>
                    <TableHead className="text-xs sm:text-sm">Status</TableHead>
                    <TableHead className="text-xs sm:text-sm hidden md:table-cell">Industry</TableHead>
                    <TableHead className="text-xs sm:text-sm hidden md:table-cell">Company Size</TableHead>
                    <TableHead className="text-xs sm:text-sm hidden md:table-cell">Preferred Events</TableHead>
                    <TableHead className="text-xs sm:text-sm hidden md:table-cell">Applied</TableHead>
                    <TableHead className="text-right text-xs sm:text-sm">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredApplications.map((app) => (
                    <TableRow key={app.id} className="hover:bg-purple-700/10 transition-colors">
                      <TableCell>
                        <div className="font-medium text-sm text-zinc-900 dark:text-zinc-100">
                          {app.company_name}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs">{app.contact_name}</TableCell>
                      <TableCell className="text-xs">{app.email}</TableCell>
                      <TableCell className="text-xs">{app.phone}</TableCell>
                      <TableCell>{getStatusBadge(app.status)}</TableCell>
                      <TableCell className="hidden md:table-cell text-xs">{app.industry}</TableCell>
                      <TableCell className="hidden md:table-cell text-xs">{app.company_size}</TableCell>
                      <TableCell className="hidden md:table-cell text-xs">
                        {Array.isArray(app.preferred_events)
                          ? app.preferred_events.map((i: string) => (
                              <Badge key={i} className="mr-1 mb-1 bg-purple-200 text-purple-800 dark:bg-purple-900 dark:text-purple-200 text-xxs">
                                {EVENT_LABELS[i] || i}
                              </Badge>
                            ))
                          : null}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-xs">
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
            <DialogTitle>Sponsorship Application Details</DialogTitle>
            <DialogDescription>
              Full details for {selectedApp?.company_name}
            </DialogDescription>
          </DialogHeader>
          {selectedApp && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Company Name</Label>
                  <div className="text-sm font-medium">{selectedApp.company_name}</div>
                </div>
                <div>
                  <Label>Contact Name</Label>
                  <div className="text-sm font-medium">{selectedApp.contact_name}</div>
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
                  <Label>Industry</Label>
                  <div className="text-sm font-medium">{selectedApp.industry}</div>
                </div>
                <div>
                  <Label>Company Size</Label>
                  <div className="text-sm font-medium">{selectedApp.company_size}</div>
                </div>
                <div>
                  <Label>Designation</Label>
                  <div className="text-sm font-medium">{selectedApp.designation}</div>
                </div>
                <div>
                  <Label>Website</Label>
                  <div className="text-sm font-medium break-all">
                    <a href={selectedApp.website} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
                      {selectedApp.website}
                    </a>
                  </div>
                </div>
              </div>
              <div>
                <Label>Preferred Events</Label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {Array.isArray(selectedApp.preferred_events)
                    ? selectedApp.preferred_events.map((i: string) => (
                        <Badge key={i} className="bg-purple-200 text-purple-800 dark:bg-purple-900 dark:text-purple-200 text-xxs">
                          {EVENT_LABELS[i] || i}
                        </Badge>
                      ))
                    : null}
                </div>
              </div>
              <div>
                <Label>Marketing Goals</Label>
                <div className="text-sm font-medium whitespace-pre-line">{selectedApp.marketing_goals}</div>
              </div>
              <div>
                <Label>Target Audience</Label>
                <div className="text-sm font-medium whitespace-pre-line">{selectedApp.target_audience}</div>
              </div>
              <div>
                <Label>Specific Requirements</Label>
                <div className="text-sm font-medium whitespace-pre-line">{selectedApp.specific_requirements}</div>
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
                    const res = await fetch('/api/admin-sponsorship', {
                      method: 'PATCH',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ id: selectedApp.id, status: 'approved' }),
                    });
                    const json = await res.json();
                    if (json.sponsorship) {
                      toast.success('Application approved');
                      setViewDialogOpen(false);
                      fetchSponsorships();
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
                    const res = await fetch('/api/admin-sponsorship', {
                      method: 'PATCH',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ id: selectedApp.id, status: 'rejected' }),
                    });
                    const json = await res.json();
                    if (json.sponsorship) {
                      toast.success('Application rejected');
                      setViewDialogOpen(false);
                      fetchSponsorships();
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
