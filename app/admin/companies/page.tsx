"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import { Building2, Search, MoreHorizontal, Eye, CheckCircle, XCircle, Ban, Download, FileText } from "lucide-react"
import { toast } from "sonner"
import { apiFetch } from "@/lib/api-fetch"
import Link from "next/link"
import type { Company } from "@/types/company"

export default function AdminCompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [verificationFilter, setVerificationFilter] = useState("all")
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [confirmAction, setConfirmAction] = useState<{
    type: 'verify' | 'reject' | 'suspend'
    company: Company
  } | null>(null)

  const fetchCompanies = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (verificationFilter !== "all") {
        params.append("verification_status", verificationFilter)
      }
      if (statusFilter !== "all") {
        params.append("status", statusFilter)
      }
      
      const response = await apiFetch(`/api/admin/companies?${params.toString()}`)
      if (!response.ok) {
        throw new Error("Failed to fetch companies")
      }
      const data = await response.json()
      console.log('API Response:', data) // Debug log
      setCompanies(data.data?.companies || data.companies || [])
    } catch (error) {
      toast.error("Failed to fetch companies")
      console.error("Fetch error:", error)
      setCompanies([])
    } finally {
      setLoading(false)
    }
  }, [verificationFilter, statusFilter])

  useEffect(() => {
    fetchCompanies()
  }, [verificationFilter, statusFilter, fetchCompanies])

  const filteredCompanies = companies.filter((company) => {
    const matchesSearch =
      company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (company.industry && company.industry.toLowerCase().includes(searchTerm.toLowerCase()))
    return matchesSearch
  })

  const stats = {
    total: companies.length,
    verified: companies.filter((c) => c.verification_status === "verified").length,
    pending: companies.filter((c) => c.verification_status === "pending").length,
    rejected: companies.filter((c) => c.verification_status === "rejected").length,
  }

  const handleVerify = async (company: Company) => {
    try {
      setActionLoading(company.id)
      const response = await apiFetch(`/api/admin/companies/${company.id}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: "Approved by admin" }),
      })

      if (!response.ok) {
        throw new Error("Failed to verify company")
      }

      toast.success(`${company.name} has been verified`)
      fetchCompanies()
    } catch (error) {
      toast.error("Failed to verify company")
      console.error("Verify error:", error)
    } finally {
      setActionLoading(null)
      setConfirmAction(null)
    }
  }

  const handleReject = async (company: Company) => {
    try {
      setActionLoading(company.id)
      const response = await apiFetch(`/api/admin/companies/${company.id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: "Verification requirements not met" }),
      })

      if (!response.ok) {
        throw new Error("Failed to reject company")
      }

      toast.success(`${company.name} verification has been rejected`)
      fetchCompanies()
    } catch (error) {
      toast.error("Failed to reject company")
      console.error("Reject error:", error)
    } finally {
      setActionLoading(null)
      setConfirmAction(null)
    }
  }

  const handleSuspend = async (company: Company) => {
    try {
      setActionLoading(company.id)
      const response = await apiFetch(`/api/admin/companies/${company.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "suspended" }),
      })

      if (!response.ok) {
        throw new Error("Failed to suspend company")
      }

      toast.success(`${company.name} has been suspended`)
      fetchCompanies()
    } catch (error) {
      toast.error("Failed to suspend company")
      console.error("Suspend error:", error)
    } finally {
      setActionLoading(null)
      setConfirmAction(null)
    }
  }

  const getVerificationBadge = (status: string) => {
    switch (status) {
      case "verified":
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-xs">
            Verified
          </Badge>
        )
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 text-xs">
            Pending
          </Badge>
        )
      case "rejected":
        return (
          <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 text-xs">
            Rejected
          </Badge>
        )
      default:
        return <Badge variant="outline" className="text-xs">Unknown</Badge>
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs">
            Active
          </Badge>
        )
      case "suspended":
        return (
          <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 text-xs">
            Suspended
          </Badge>
        )
      case "deleted":
        return (
          <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200 text-xs">
            Deleted
          </Badge>
        )
      default:
        return <Badge variant="outline" className="text-xs">Unknown</Badge>
    }
  }

  return (
    <div className="bg-black space-y-8 md:space-y-14 min-h-screen px-4 py-8 md:px-8 lg:px-16 relative overflow-x-hidden">
      <div className="pointer-events-none fixed inset-0 z-0 opacity-60 select-none" aria-hidden>
        <svg width="100%" height="100%" className="w-full h-full">
          <defs>
            <radialGradient id="bgPattern" cx="50%" cy="50%" r="80%">
              <stop offset="0%" stopColor="#a5b4fc" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#818cf8" stopOpacity="0.04" />
            </radialGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#bgPattern)" />
        </svg>
      </div>

      {/* Header */}
      <div className="flex items-center gap-3 pb-6 border-b border-zinc-800/60 relative z-10 mt-2 mb-4">
        <span className="inline-block w-2 h-6 sm:h-8 bg-gradient-to-b from-blue-400 to-purple-400 rounded-full mr-2" />
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white drop-shadow-sm flex items-center gap-3">
            Company Management
          </h1>
          <p className="text-zinc-400 mt-1 font-medium text-sm sm:text-base">
            Manage and verify company registrations
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex gap-3">
          <Button variant="outline" className="text-sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Section */}
      <div className="flex items-center gap-3 mt-8 md:mt-10 mb-2 relative z-10">
        <span className="inline-block w-1.5 h-6 bg-gradient-to-b from-blue-400 to-emerald-400 rounded-full" />
        <h2 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-white tracking-tight">
          Company Stats
        </h2>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-0 shadow-2xl rounded-2xl transition-transform duration-300 hover:-translate-y-2 bg-gradient-to-br from-blue-100/80 to-blue-200/60 dark:from-blue-900/60 dark:to-blue-800/40">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-xs sm:text-sm font-medium text-zinc-900 dark:text-zinc-100 flex items-center gap-2 tracking-tight">
              Total Companies
            </CardTitle>
            <div className="p-2 rounded-lg bg-gradient-to-br from-white/80 to-zinc-100/40 dark:from-zinc-800/80 dark:to-zinc-900/40 shadow-lg flex items-center justify-center">
              <Building2 className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white">
              {stats.total}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-2xl rounded-2xl transition-transform duration-300 hover:-translate-y-2 bg-gradient-to-br from-green-100/80 to-green-200/60 dark:from-green-900/60 dark:to-green-800/40">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-xs sm:text-sm font-medium text-zinc-900 dark:text-zinc-100 flex items-center gap-2 tracking-tight">
              Verified
            </CardTitle>
            <div className="p-2 rounded-lg bg-gradient-to-br from-white/80 to-zinc-100/40 dark:from-zinc-800/80 dark:to-zinc-900/40 shadow-lg flex items-center justify-center">
              <CheckCircle className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white">
              {stats.verified}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-2xl rounded-2xl transition-transform duration-300 hover:-translate-y-2 bg-gradient-to-br from-yellow-100/80 to-yellow-200/60 dark:from-yellow-900/60 dark:to-yellow-800/40">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-xs sm:text-sm font-medium text-zinc-900 dark:text-zinc-100 flex items-center gap-2 tracking-tight">
              Pending Review
            </CardTitle>
            <div className="p-2 rounded-lg bg-gradient-to-br from-white/80 to-zinc-100/40 dark:from-zinc-800/80 dark:to-zinc-900/40 shadow-lg flex items-center justify-center">
              <Building2 className="h-4 w-4 text-yellow-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white">
              {stats.pending}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-2xl rounded-2xl transition-transform duration-300 hover:-translate-y-2 bg-gradient-to-br from-red-100/80 to-red-200/60 dark:from-red-900/60 dark:to-red-800/40">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-xs sm:text-sm font-medium text-zinc-900 dark:text-zinc-100 flex items-center gap-2 tracking-tight">
              Rejected
            </CardTitle>
            <div className="p-2 rounded-lg bg-gradient-to-br from-white/80 to-zinc-100/40 dark:from-zinc-800/80 dark:to-zinc-900/40 shadow-lg flex items-center justify-center">
              <XCircle className="h-4 w-4 text-red-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white">
              {stats.rejected}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Company Directory Section */}
      <div className="flex items-center gap-3 mt-8 md:mt-10 mb-2 relative z-10">
        <span className="inline-block w-1.5 h-6 bg-gradient-to-b from-cyan-400 to-purple-400 rounded-full" />
        <h2 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-white tracking-tight">
          Company Directory
        </h2>
      </div>

      {/* Company Directory Card */}
      <Card className="border-0 shadow-2xl rounded-2xl bg-gradient-to-br from-cyan-100/80 to-cyan-200/60 dark:from-cyan-900/60 dark:to-cyan-800/40 relative overflow-hidden group">
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl text-zinc-900 dark:text-zinc-100 font-bold flex items-center">
            <Building2 className="h-5 w-5 mr-2 text-blue-400" />
            All Companies
          </CardTitle>
          <CardDescription className="text-zinc-500 dark:text-zinc-300 font-medium text-sm">
            Search, filter, and manage company registrations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search companies by name, email, or industry..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 text-sm"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Select value={verificationFilter} onValueChange={setVerificationFilter}>
                <SelectTrigger className="w-full sm:w-48 text-sm">
                  <SelectValue placeholder="Verification Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Verification</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-40 text-sm">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="deleted">Deleted</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : filteredCompanies.length === 0 ? (
              <div className="text-center py-8">
                <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No companies found</h3>
                <p className="text-muted-foreground text-sm">
                  {searchTerm ? "Try adjusting your search criteria" : "Companies will appear here once registered"}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs sm:text-sm">Company</TableHead>
                    <TableHead className="text-xs sm:text-sm">Industry</TableHead>
                    <TableHead className="text-xs sm:text-sm">Verification</TableHead>
                    <TableHead className="text-xs sm:text-sm">Status</TableHead>
                    <TableHead className="text-xs sm:text-sm hidden lg:table-cell">Events</TableHead>
                    <TableHead className="text-xs sm:text-sm hidden lg:table-cell">Registered</TableHead>
                    <TableHead className="text-right text-xs sm:text-sm">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCompanies.map((company) => (
                    <TableRow key={company.id} className="hover:bg-purple-700/10 transition-colors">
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-primary to-purple-600 rounded-lg flex items-center justify-center text-white text-sm font-semibold">
                            {company.name[0]}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-sm truncate text-zinc-900 dark:text-zinc-100">
                              {company.name}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">{company.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs">{company.industry || "—"}</TableCell>
                      <TableCell>{getVerificationBadge(company.verification_status)}</TableCell>
                      <TableCell>{getStatusBadge(company.status)}</TableCell>
                      <TableCell className="hidden lg:table-cell text-xs">
                        {company.total_events || 0}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-xs">
                        {new Date(company.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              className="h-8 w-8 p-0 hover:bg-purple-700/20 text-purple-400 font-semibold text-xs sm:text-sm"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuLabel className="text-xs">Actions</DropdownMenuLabel>
                            <DropdownMenuItem className="text-xs" asChild>
                              <Link href={`/admin/companies/${company.id}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </Link>
                            </DropdownMenuItem>
                            {company.verification_status === "pending" && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-xs" asChild>
                                  <Link href={`/admin/companies/${company.id}/verify`}>
                                    <FileText className="mr-2 h-4 w-4" />
                                    Review Verification
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-xs text-green-600"
                                  onClick={() => setConfirmAction({ type: 'verify', company })}
                                  disabled={actionLoading === company.id}
                                >
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  Quick Verify
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-xs text-red-600"
                                  onClick={() => setConfirmAction({ type: 'reject', company })}
                                  disabled={actionLoading === company.id}
                                >
                                  <XCircle className="mr-2 h-4 w-4" />
                                  Quick Reject
                                </DropdownMenuItem>
                              </>
                            )}
                            {company.status === "active" && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-red-600 text-xs"
                                  onClick={() => setConfirmAction({ type: 'suspend', company })}
                                  disabled={actionLoading === company.id}
                                >
                                  <Ban className="mr-2 h-4 w-4" />
                                  Suspend Company
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <AlertDialog open={!!confirmAction} onOpenChange={() => setConfirmAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmAction?.type === 'verify' && 'Verify Company'}
              {confirmAction?.type === 'reject' && 'Reject Verification'}
              {confirmAction?.type === 'suspend' && 'Suspend Company'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction?.type === 'verify' &&
                `Are you sure you want to verify ${confirmAction.company.name}? This will allow them to create and manage events.`}
              {confirmAction?.type === 'reject' &&
                `Are you sure you want to reject ${confirmAction.company.name}'s verification? They will be notified of this decision.`}
              {confirmAction?.type === 'suspend' &&
                `Are you sure you want to suspend ${confirmAction.company.name}? This will prevent them from accessing their dashboard and managing events.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (confirmAction) {
                  if (confirmAction.type === 'verify') handleVerify(confirmAction.company)
                  else if (confirmAction.type === 'reject') handleReject(confirmAction.company)
                  else if (confirmAction.type === 'suspend') handleSuspend(confirmAction.company)
                }
              }}
              className={
                confirmAction?.type === 'verify'
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-red-600 hover:bg-red-700'
              }
            >
              {confirmAction?.type === 'verify' && 'Verify'}
              {confirmAction?.type === 'reject' && 'Reject'}
              {confirmAction?.type === 'suspend' && 'Suspend'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
