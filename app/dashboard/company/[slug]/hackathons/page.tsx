'use client'

import { useState, useEffect, useCallback } from 'react'
import { useCompanyContext } from '@/contexts/CompanyContext'
import { usePendingInvitationRedirect } from '@/lib/hooks/usePendingInvitationRedirect'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Trophy, Search, Plus, Edit, Eye, Clock, CheckCircle, XCircle, AlertCircle, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface Hackathon {
  id: string
  slug: string
  title: string
  excerpt: string
  category: string
  status: string
  approval_status: 'draft' | 'pending' | 'approved' | 'rejected' | 'changes_requested' | 'deleted'
  date: string
  time: string
  duration: string
  views: number
  registered: number
  prize?: string
}

export default function CompanyHackathonsPage() {
  const { currentCompany, userRole, loading: companyLoading } = useCompanyContext()
  const isPendingInvitation = usePendingInvitationRedirect()
  const [hackathons, setHackathons] = useState<Hackathon[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [hackathonToDelete, setHackathonToDelete] = useState<Hackathon | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const canManageEvents = userRole && ['owner', 'admin', 'editor'].includes(userRole)

  const fetchHackathons = useCallback(async () => {
    if (!currentCompany) return

    try {
      setLoading(true)
      // Fetch all hackathons (not just approved) for company members
      const response = await fetch(`/api/companies/${currentCompany.slug}/hackathons?status=all&limit=100`)

      if (!response.ok) {
        throw new Error('Failed to fetch hackathons')
      }

      const data = await response.json()
      setHackathons(data.hackathons || [])
    } catch (error) {
      console.error('Error fetching hackathons:', error)
      toast.error('Failed to load hackathons')
    } finally {
      setLoading(false)
    }
  }, [currentCompany])

  useEffect(() => {
    if (currentCompany) {
      fetchHackathons()
    }
  }, [currentCompany, fetchHackathons])

  const handleDeleteClick = (hackathon: Hackathon) => {
    setHackathonToDelete(hackathon)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!hackathonToDelete || !currentCompany) return

    try {
      setIsDeleting(true)
      // Use slug instead of id for the API endpoint
      const response = await fetch(`/api/hackathons/${hackathonToDelete.slug}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete hackathon')
      }

      toast.success('Hackathon deleted successfully')
      setDeleteDialogOpen(false)
      setHackathonToDelete(null)

      // Refresh the list
      fetchHackathons()
    } catch (error) {
      console.error('Error deleting hackathon:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to delete hackathon')
    } finally {
      setIsDeleting(false)
    }
  }

  if (companyLoading || isPendingInvitation) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  const filteredHackathons = hackathons.filter(hackathon =>
    hackathon.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hackathon.category?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Filter out deleted items for stats (summary cards should only show active items)
  const activeHackathons = hackathons.filter(h => h.approval_status !== 'deleted')

  const stats = {
    total: activeHackathons.length,
    approved: activeHackathons.filter(h => h.approval_status === 'approved').length,
    pending: activeHackathons.filter(h => h.approval_status === 'pending').length,
    draft: activeHackathons.filter(h => h.status === 'draft').length,
    totalViews: activeHackathons.reduce((sum, h) => sum + (h.views || 0), 0),
    totalRegistrations: activeHackathons.reduce((sum, h) => sum + (h.registered || 0), 0),
  }

  const getApprovalBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <Badge className="bg-green-500/10 text-green-600 border-green-500/20 pointer-events-none">
            <CheckCircle className="h-3 w-3 mr-1" />
            Approved
          </Badge>
        )
      case 'pending':
        return (
          <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20 pointer-events-none">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        )
      case 'rejected':
        return (
          <Badge className="bg-red-500/10 text-red-600 border-red-500/20 pointer-events-none">
            <XCircle className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        )
      case 'changes_requested':
        return (
          <Badge className="bg-orange-500/10 text-orange-600 border-orange-500/20 pointer-events-none">
            <AlertCircle className="h-3 w-3 mr-1" />
            Changes Requested
          </Badge>
        )
      case 'deleted':
        return (
          <Badge className="bg-gray-500/10 text-gray-600 border-gray-500/20 pointer-events-none">
            <Trash2 className="h-3 w-3 mr-1" />
            Deleted
          </Badge>
        )
      default:
        return <Badge variant="outline" className="pointer-events-none">{status}</Badge>
    }
  }

  const getStatusBadge = (hackathon: Hackathon) => {
    // If not approved, show approval status instead of event status
    if (hackathon.approval_status !== 'approved') {
      switch (hackathon.approval_status) {
        case 'pending':
          return <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20 pointer-events-none">Pending Review</Badge>
        case 'draft':
          return <Badge variant="outline" className="pointer-events-none">Draft</Badge>
        case 'rejected':
          return <Badge className="bg-red-500/10 text-red-600 border-red-500/20 pointer-events-none">Rejected</Badge>
        case 'changes_requested':
          return <Badge className="bg-orange-500/10 text-orange-600 border-orange-500/20 pointer-events-none">Changes Requested</Badge>
        default:
          return <Badge variant="outline" className="pointer-events-none">{hackathon.approval_status}</Badge>
      }
    }

    // If approved, show event status
    switch (hackathon.status) {
      case 'live':
      case 'published':
        return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20 pointer-events-none">Live</Badge>
      case 'draft':
        return <Badge variant="outline" className="pointer-events-none">Draft</Badge>
      case 'cancelled':
        return <Badge variant="outline" className="text-gray-500 pointer-events-none">Cancelled</Badge>
      case 'completed':
        return <Badge variant="outline" className="text-gray-500 pointer-events-none">Completed</Badge>
      default:
        return <Badge variant="outline" className="pointer-events-none">{hackathon.status}</Badge>
    }
  }

  if (companyLoading || !currentCompany) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Hackathons</h1>
          <p className="text-muted-foreground mt-1">
            {canManageEvents ? "Manage your company's hackathons and coding challenges" : "View your company's hackathons"}
          </p>
        </div>
        {canManageEvents && (
          <Link href={`/dashboard/company/${currentCompany.slug}/hackathons/create`}>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Hackathon
            </Button>
          </Link>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Hackathons</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Drafts</CardTitle>
            <Edit className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.draft}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.totalViews}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Registrations</CardTitle>
            <CheckCircle className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.totalRegistrations}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search hackathons..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Hackathons Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Hackathons ({filteredHackathons.length})</CardTitle>
          <CardDescription>
            {canManageEvents ? 'View and manage all your hackathons' : 'View all company hackathons'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredHackathons.length === 0 ? (
            <div className="text-center py-12">
              <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                No hackathons found
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {searchTerm ? 'Try adjusting your search' : 'Hackathon creation coming soon'}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Hackathon</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Approval</TableHead>
                  <TableHead>Views</TableHead>
                  <TableHead>Participants</TableHead>
                  {canManageEvents && <TableHead>Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredHackathons.map((hackathon) => (
                  <TableRow key={hackathon.slug}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{hackathon.title}</span>
                        <span className="text-sm text-gray-500 truncate max-w-xs">
                          {hackathon.excerpt}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {new Date(hackathon.date).toLocaleDateString()}
                        {hackathon.duration && ` (${hackathon.duration})`}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{hackathon.category || 'General'}</Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(hackathon)}</TableCell>
                    <TableCell>{getApprovalBadge(hackathon.approval_status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4 text-gray-400" />
                        {hackathon.views || 0}
                      </div>
                    </TableCell>
                    <TableCell>
                      {hackathon.registered && hackathon.registered > 0 ? (
                        <Link
                          href={`/dashboard/company/${currentCompany.slug}/hackathons/${hackathon.slug}/registrations`}
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium hover:underline"
                        >
                          {hackathon.registered}
                        </Link>
                      ) : (
                        <span className="text-gray-500">0</span>
                      )}
                    </TableCell>
                    {canManageEvents ? (
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Link href={`/dashboard/company/${currentCompany.slug}/hackathons/${hackathon.slug}/edit`}>
                            <Button variant="outline" size="sm" title="Edit hackathon">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          {hackathon.approval_status === 'approved' && (
                            <Link href={`/hackathons/${hackathon.slug}`} target="_blank">
                              <Button variant="outline" size="sm" title="View public page">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteClick(hackathon)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            title="Delete hackathon"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    ) : (
                      hackathon.approval_status === 'approved' && (
                        <TableCell>
                          <Link href={`/hackathons/${hackathon.slug}`} target="_blank">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                        </TableCell>
                      )
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the hackathon &quot;{hackathonToDelete?.title}&quot;.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
