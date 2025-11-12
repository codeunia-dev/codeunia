"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Building2,
  Mail,
  Globe,
  MapPin,
  Users,
  Calendar,
  CheckCircle,
  XCircle,
  Ban,
  ArrowLeft,
  ExternalLink,
  FileText,
  TrendingUp,
} from "lucide-react"
import { toast } from "sonner"
import { apiFetch } from "@/lib/api-fetch"
import Link from "next/link"
import type { Company, CompanyMember } from "@/types/company"

interface Event {
  id: string
  title: string
  slug: string
  date: string
  approval_status: string
  registered: number
}

export default function AdminCompanyDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const companyId = params.id as string

  const [company, setCompany] = useState<Company | null>(null)
  const [members, setMembers] = useState<CompanyMember[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [confirmAction, setConfirmAction] = useState<'verify' | 'reject' | 'suspend' | null>(null)

  const fetchCompanyDetails = useCallback(async () => {
    try {
      setLoading(true)
      
      // Fetch company details
      const companyResponse = await apiFetch(`/api/admin/companies/${companyId}`)
      if (!companyResponse.ok) {
        throw new Error("Failed to fetch company details")
      }
      const companyData = await companyResponse.json()
      console.log('Company API Response:', companyData) // Debug log
      setCompany(companyData.company)

      // Fetch company members
      const membersResponse = await apiFetch(`/api/companies/${companyData.company.slug}/members`)
      if (membersResponse.ok) {
        const membersData = await membersResponse.json()
        setMembers(membersData.members || [])
      }

      // Fetch company events
      const eventsResponse = await apiFetch(`/api/companies/${companyData.company.slug}/events`)
      if (eventsResponse.ok) {
        const eventsData = await eventsResponse.json()
        setEvents(eventsData.events || [])
      }
    } catch (error) {
      toast.error("Failed to fetch company details")
      console.error("Fetch error:", error)
    } finally {
      setLoading(false)
    }
  }, [companyId])

  useEffect(() => {
    if (companyId) {
      fetchCompanyDetails()
    }
  }, [companyId, fetchCompanyDetails])

  const handleVerify = async () => {
    try {
      setActionLoading(true)
      const response = await apiFetch(`/api/admin/companies/${companyId}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: "Approved by admin" }),
      })

      if (!response.ok) {
        throw new Error("Failed to verify company")
      }

      toast.success("Company has been verified")
      fetchCompanyDetails()
    } catch (error) {
      toast.error("Failed to verify company")
      console.error("Verify error:", error)
    } finally {
      setActionLoading(false)
      setConfirmAction(null)
    }
  }

  const handleReject = async () => {
    try {
      setActionLoading(true)
      const response = await apiFetch(`/api/admin/companies/${companyId}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: "Verification requirements not met" }),
      })

      if (!response.ok) {
        throw new Error("Failed to reject company")
      }

      toast.success("Company verification has been rejected")
      fetchCompanyDetails()
    } catch (error) {
      toast.error("Failed to reject company")
      console.error("Reject error:", error)
    } finally {
      setActionLoading(false)
      setConfirmAction(null)
    }
  }

  const handleSuspend = async () => {
    try {
      setActionLoading(true)
      const response = await apiFetch(`/api/admin/companies/${companyId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "suspended" }),
      })

      if (!response.ok) {
        throw new Error("Failed to suspend company")
      }

      toast.success("Company has been suspended")
      fetchCompanyDetails()
    } catch (error) {
      toast.error("Failed to suspend company")
      console.error("Suspend error:", error)
    } finally {
      setActionLoading(false)
      setConfirmAction(null)
    }
  }

  const getVerificationBadge = (status: string) => {
    switch (status) {
      case "verified":
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Verified
          </Badge>
        )
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
            Pending Review
          </Badge>
        )
      case "rejected":
        return (
          <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
            <XCircle className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        )
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">Active</Badge>
      case "suspended":
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">Suspended</Badge>
      case "deleted":
        return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">Deleted</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getApprovalBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-xs">Approved</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 text-xs">Pending</Badge>
      case "rejected":
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 text-xs">Rejected</Badge>
      default:
        return <Badge variant="outline" className="text-xs">Unknown</Badge>
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "owner":
        return <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 text-xs">Owner</Badge>
      case "admin":
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs">Admin</Badge>
      case "editor":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-xs">Editor</Badge>
      case "member":
        return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200 text-xs">Member</Badge>
      default:
        return <Badge variant="outline" className="text-xs">Unknown</Badge>
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!company) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Company Not Found</h2>
          <p className="text-muted-foreground mb-4">The company you&apos;re looking for doesn&apos;t exist.</p>
          <Button onClick={() => router.push("/admin/companies")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Companies
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-black space-y-8 min-h-screen px-4 py-8 md:px-8 lg:px-16">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.push("/admin/companies")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">{company.name}</h1>
            <p className="text-zinc-400 text-sm">{company.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {getVerificationBadge(company.verification_status)}
          {getStatusBadge(company.status)}
        </div>
      </div>

      {/* Quick Actions */}
      {company.verification_status === "pending" && (
        <Card className="border-yellow-500/50 bg-yellow-50/10">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Pending Verification
            </CardTitle>
            <CardDescription>This company is awaiting verification approval</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <Button
                asChild
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Link href={`/admin/companies/${companyId}/verify`}>
                  <FileText className="h-4 w-4 mr-2" />
                  Review Verification
                </Link>
              </Button>
              <Button
                onClick={() => setConfirmAction('verify')}
                disabled={actionLoading}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Quick Verify
              </Button>
              <Button
                onClick={() => setConfirmAction('reject')}
                disabled={actionLoading}
                variant="destructive"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Quick Reject
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {company.status === "active" && company.verification_status === "verified" && (
        <div className="flex justify-end">
          <Button
            onClick={() => setConfirmAction('suspend')}
            disabled={actionLoading}
            variant="destructive"
          >
            <Ban className="h-4 w-4 mr-2" />
            Suspend Company
          </Button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{company.total_events || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{members.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Participants</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{company.total_participants || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Subscription</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{company.subscription_tier}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="events">Events ({events.length})</TabsTrigger>
          <TabsTrigger value="team">Team ({members.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Company Name</label>
                  <p className="text-sm mt-1">{company.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Legal Name</label>
                  <p className="text-sm mt-1">{company.legal_name || "—"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <div className="flex items-center gap-2 mt-1">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm">{company.email}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Website</label>
                  <div className="flex items-center gap-2 mt-1">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    {company.website ? (
                      <a
                        href={company.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                      >
                        {company.website}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : (
                      <p className="text-sm">—</p>
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Industry</label>
                  <p className="text-sm mt-1">{company.industry || "—"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Company Size</label>
                  <p className="text-sm mt-1 capitalize">{company.company_size || "—"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Registered</label>
                  <p className="text-sm mt-1">{new Date(company.created_at).toLocaleDateString()}</p>
                </div>
                {company.verified_at && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Verified</label>
                    <p className="text-sm mt-1">{new Date(company.verified_at).toLocaleDateString()}</p>
                  </div>
                )}
              </div>

              {company.description && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Description</label>
                  <p className="text-sm mt-1">{company.description}</p>
                </div>
              )}

              {company.address && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Address</label>
                  <div className="flex items-start gap-2 mt-1">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <p className="text-sm">
                      {[
                        company.address.street,
                        company.address.city,
                        company.address.state,
                        company.address.country,
                        company.address.zip,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Company Events</CardTitle>
              <CardDescription>All events created by this company</CardDescription>
            </CardHeader>
            <CardContent>
              {events.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No events yet</h3>
                  <p className="text-muted-foreground text-sm">This company hasn&apos;t created any events</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Event Title</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Registrations</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {events.map((event) => (
                      <TableRow key={event.id}>
                        <TableCell className="font-medium">{event.title}</TableCell>
                        <TableCell>{new Date(event.date).toLocaleDateString()}</TableCell>
                        <TableCell>{getApprovalBadge(event.approval_status)}</TableCell>
                        <TableCell>{event.registered || 0}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/events/${event.slug}`}>
                              <ExternalLink className="h-4 w-4" />
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
              <CardDescription>All members associated with this company</CardDescription>
            </CardHeader>
            <CardContent>
              {members.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No team members</h3>
                  <p className="text-muted-foreground text-sm">This company has no team members</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Member</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Joined</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {members.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">
                              {member.user?.first_name || member.user?.email || "Unknown"}
                            </p>
                            <p className="text-xs text-muted-foreground">{member.user?.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>{getRoleBadge(member.role)}</TableCell>
                        <TableCell>
                          <Badge
                            className={
                              member.status === "active"
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-xs"
                                : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 text-xs"
                            }
                          >
                            {member.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(member.joined_at).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Confirmation Dialog */}
      <AlertDialog open={!!confirmAction} onOpenChange={() => setConfirmAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmAction === 'verify' && 'Verify Company'}
              {confirmAction === 'reject' && 'Reject Verification'}
              {confirmAction === 'suspend' && 'Suspend Company'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction === 'verify' &&
                `Are you sure you want to verify ${company.name}? This will allow them to create and manage events.`}
              {confirmAction === 'reject' &&
                `Are you sure you want to reject ${company.name}'s verification? They will be notified of this decision.`}
              {confirmAction === 'suspend' &&
                `Are you sure you want to suspend ${company.name}? This will prevent them from accessing their dashboard and managing events.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (confirmAction === 'verify') handleVerify()
                else if (confirmAction === 'reject') handleReject()
                else if (confirmAction === 'suspend') handleSuspend()
              }}
              className={
                confirmAction === 'verify'
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-red-600 hover:bg-red-700'
              }
            >
              {confirmAction === 'verify' && 'Verify'}
              {confirmAction === 'reject' && 'Reject'}
              {confirmAction === 'suspend' && 'Suspend'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
