"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { apiFetch } from "@/lib/api-fetch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Crown, Search, MoreHorizontal, Eye, Download } from "lucide-react";
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

interface CoreTeamApplication {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  location: string;
  occupation: string;
  company?: string;
  experience: string;
  skills: string;
  portfolio?: string;
  preferred_role: string;
  availability: string;
  commitment: string;
  motivation: string;
  vision: string;
  previous_experience?: string;
  social_media?: string;
  references_info?: string;
  additional_info?: string;
  status: string;
  user_id?: string;
  created_at: string;
  updated_at: string;
}

export default function AdminCoreTeamPage() {
  const [applications, setApplications] = useState<CoreTeamApplication[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState<CoreTeamApplication | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [savingStatus, setSavingStatus] = useState<Record<number, boolean>>({});

  // Fetch applications
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        const response = await apiFetch("/api/admin-core-team");
        if (response.ok) {
          const data = await response.json();
          setApplications(data.applications || []);
        } else {
          toast.error("Failed to fetch applications");
        }
      } catch (error) {
        console.error("Error fetching applications:", error);
        toast.error("Error fetching applications");
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  // Filter applications
  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      const matchesSearch = 
        app.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.occupation.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.preferred_role.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || app.status === statusFilter;
      const matchesRole = roleFilter === "all" || app.preferred_role === roleFilter;
      
      return matchesSearch && matchesStatus && matchesRole;
    });
  }, [applications, searchTerm, statusFilter, roleFilter]);

  // Statistics
  const stats = {
    total: applications.length,
    pending: applications.filter(app => app.status === "pending").length,
    approved: applications.filter(app => app.status === "approved").length,
    rejected: applications.filter(app => app.status === "rejected").length,
  };

  // Get unique roles for filter
  const uniqueRoles = useMemo(() => {
    const roles = applications.map(app => app.preferred_role);
    return Array.from(new Set(roles)).sort();
  }, [applications]);

  // Handle status update
  const handleStatusUpdate = async (id: number, newStatus: string) => {
    try {
      setSavingStatus(prev => ({ ...prev, [id]: true }));
      
      const response = await apiFetch("/api/admin-core-team", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });

      if (response.ok) {
        setApplications(prev => 
          prev.map(app => 
            app.id === id ? { ...app, status: newStatus } : app
          )
        );
        toast.success("Status updated successfully");
      } else {
        toast.error("Failed to update status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Error updating status");
    } finally {
      setSavingStatus(prev => ({ ...prev, [id]: false }));
    }
  };

  // Handle view application
  const handleViewApplication = (application: CoreTeamApplication) => {
    setSelectedApplication(application);
    setIsViewDialogOpen(true);
  };

  // Export to CSV
  const handleExportCSV = () => {
    const csvContent = [
      ["Name", "Email", "Phone", "Location", "Occupation", "Company", "Preferred Role", "Status", "Applied Date"],
      ...filteredApplications.map(app => [
        `${app.first_name} ${app.last_name}`,
        app.email,
        app.phone || "",
        app.location,
        app.occupation,
        app.company || "",
        app.preferred_role,
        app.status,
        new Date(app.created_at).toLocaleDateString()
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `core-team-applications-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    toast.success("Applications exported successfully");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">Core Team Applications</h1>
          <p className="text-muted-foreground mt-1">
            Manage and review core team applications
          </p>
        </div>
        <Button onClick={handleExportCSV} variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
            <Crown className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <div className="h-2 w-2 bg-yellow-500 rounded-full" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <div className="h-2 w-2 bg-green-500 rounded-full" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.approved}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <div className="h-2 w-2 bg-red-500 rounded-full" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.rejected}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  id="search"
                  placeholder="Search by name, email, occupation..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Preferred Role</Label>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  {uniqueRoles.map(role => (
                    <SelectItem key={role} value={role}>{role}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Applications Table */}
      <Card>
        <CardHeader>
          <CardTitle>Applications ({filteredApplications.length})</CardTitle>
          <CardDescription>
            Review and manage core team applications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Occupation</TableHead>
                  <TableHead>Preferred Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Applied</TableHead>
                  <TableHead className="w-[70px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApplications.map((application) => (
                  <TableRow key={application.id}>
                    <TableCell className="font-medium">
                      {application.first_name} {application.last_name}
                    </TableCell>
                    <TableCell>{application.email}</TableCell>
                    <TableCell>{application.occupation}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                        {application.preferred_role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={STATUS_COLORS[application.status] || "bg-gray-100 text-gray-800"}>
                        {application.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(application.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleViewApplication(application)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleStatusUpdate(application.id, "approved")}
                            disabled={savingStatus[application.id]}
                          >
                            Approve
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleStatusUpdate(application.id, "rejected")}
                            disabled={savingStatus[application.id]}
                          >
                            Reject
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* View Application Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Core Team Application Details</DialogTitle>
            <DialogDescription>
              Review the complete application details
            </DialogDescription>
          </DialogHeader>
          
          {selectedApplication && (
            <div className="space-y-6">
              {/* Personal Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Full Name</Label>
                  <p className="text-sm">{selectedApplication.first_name} {selectedApplication.last_name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                  <p className="text-sm">{selectedApplication.email}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Phone</Label>
                  <p className="text-sm">{selectedApplication.phone || "Not provided"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Location</Label>
                  <p className="text-sm">{selectedApplication.location}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Occupation</Label>
                  <p className="text-sm">{selectedApplication.occupation}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Company</Label>
                  <p className="text-sm">{selectedApplication.company || "Not provided"}</p>
                </div>
              </div>

              {/* Application Details */}
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Preferred Role</Label>
                  <Badge className="bg-amber-50 text-amber-700 border-amber-200 mt-1">
                    {selectedApplication.preferred_role}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Experience</Label>
                  <p className="text-sm mt-1">{selectedApplication.experience}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Skills</Label>
                  <p className="text-sm mt-1">{selectedApplication.skills}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Availability</Label>
                  <p className="text-sm mt-1">{selectedApplication.availability}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Commitment</Label>
                  <p className="text-sm mt-1">{selectedApplication.commitment}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Motivation</Label>
                  <p className="text-sm mt-1">{selectedApplication.motivation}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Vision</Label>
                  <p className="text-sm mt-1">{selectedApplication.vision}</p>
                </div>
                {selectedApplication.portfolio && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Portfolio</Label>
                    <p className="text-sm mt-1">{selectedApplication.portfolio}</p>
                  </div>
                )}
                {selectedApplication.previous_experience && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Previous Experience</Label>
                    <p className="text-sm mt-1">{selectedApplication.previous_experience}</p>
                  </div>
                )}
                {selectedApplication.social_media && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Social Media</Label>
                    <p className="text-sm mt-1">{selectedApplication.social_media}</p>
                  </div>
                )}
                {selectedApplication.references_info && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">References</Label>
                    <p className="text-sm mt-1">{selectedApplication.references_info}</p>
                  </div>
                )}
                {selectedApplication.additional_info && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Additional Information</Label>
                    <p className="text-sm mt-1">{selectedApplication.additional_info}</p>
                  </div>
                )}
              </div>

              {/* Status and Dates */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                  <Badge className={`mt-1 ${STATUS_COLORS[selectedApplication.status] || "bg-gray-100 text-gray-800"}`}>
                    {selectedApplication.status}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Applied</Label>
                  <p className="text-sm mt-1">{new Date(selectedApplication.created_at).toLocaleDateString()}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Last Updated</Label>
                  <p className="text-sm mt-1">{new Date(selectedApplication.updated_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
            {selectedApplication && (
              <>
                <Button 
                  onClick={() => {
                    handleStatusUpdate(selectedApplication.id, "approved");
                    setIsViewDialogOpen(false);
                  }}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Approve
                </Button>
                <Button 
                  onClick={() => {
                    handleStatusUpdate(selectedApplication.id, "rejected");
                    setIsViewDialogOpen(false);
                  }}
                  variant="destructive"
                >
                  Reject
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
