'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { Check, Pencil, Search, Download, Eye, Calendar, Clock, Users, CheckCircle2, XCircle, AlertCircle, FileText } from 'lucide-react'
import { apiFetch } from '@/lib/api-fetch'

type AppRow = {
  id: string
  user_id: string
  email: string
  internship_id: string
  domain: string
  level: string
  status: string
  cover_note: string | null
  created_at: string
  remarks?: string | null
  repo_url?: string | null
  duration_weeks?: number | null
  start_date?: string | null
  end_date?: string | null
}

export default function AdminInternshipApplicationsPage() {
  const [rows, setRows] = useState<AppRow[]>([])
  const [filteredRows, setFilteredRows] = useState<AppRow[]>([])
  const [loading, setLoading] = useState(false)
  const [editing, setEditing] = useState<Record<string, { status: string; remarks?: string; repo_url?: string; duration_weeks?: number }>>({})
  const [progress, setProgress] = useState<Record<string, 'view' | 'edit' | 'saving'>>({})
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set())
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [domainFilter, setDomainFilter] = useState<string>('all')
  const [levelFilter, setLevelFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'created_at' | 'email' | 'status'>('created_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [viewingApplication, setViewingApplication] = useState<AppRow | null>(null)

  // Statistics
  const stats = {
    total: rows.length,
    submitted: rows.filter(r => r.status === 'submitted').length,
    reviewed: rows.filter(r => r.status === 'reviewed').length,
    accepted: rows.filter(r => r.status === 'accepted').length,
    rejected: rows.filter(r => r.status === 'rejected').length,
  }

  // Filter and sort applications
  useEffect(() => {
    const filtered = rows.filter(row => {
      const matchesSearch = searchTerm === '' ||
        row.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.domain.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.internship_id.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = statusFilter === 'all' || row.status === statusFilter
      const matchesDomain = domainFilter === 'all' || row.domain === domainFilter
      const matchesLevel = levelFilter === 'all' || row.level === levelFilter

      return matchesSearch && matchesStatus && matchesDomain && matchesLevel
    })

    // Sort applications
    filtered.sort((a, b) => {
      let aVal: string | number = a[sortBy]
      let bVal: string | number = b[sortBy]

      if (sortBy === 'created_at') {
        aVal = new Date(a.created_at).getTime()
        bVal = new Date(b.created_at).getTime()
      }

      if (sortOrder === 'asc') {
        return aVal < bVal ? -1 : aVal > bVal ? 1 : 0
      } else {
        return aVal > bVal ? -1 : aVal < bVal ? 1 : 0
      }
    })

    setFilteredRows(filtered)
  }, [rows, searchTerm, statusFilter, domainFilter, levelFilter, sortBy, sortOrder])

  // Get unique values for filters
  const uniqueDomains = [...new Set(rows.map(r => r.domain))]
  const uniqueLevels = [...new Set(rows.map(r => r.level))]

  async function load() {
    setLoading(true)
    try {
      const res = await apiFetch('/api/admin/internship-applications')
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to load applications')
      setRows(data.applications || [])
      const init: Record<string, { status: string; remarks?: string; repo_url?: string; duration_weeks?: number }> = {}
      const mode: Record<string, 'view' | 'edit' | 'saving'> = {}
      for (const r of (data.applications || []) as AppRow[]) {
        init[r.id] = { status: r.status, remarks: r.remarks || '', repo_url: r.repo_url || '', duration_weeks: r.duration_weeks || undefined }
        mode[r.id] = 'view'
      }
      setEditing(init)
      setProgress(mode)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Load failed')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function save(id: string) {
    const form = editing[id]
    try {
      setProgress((s) => ({ ...s, [id]: 'saving' }))
      const res = await apiFetch('/api/admin/internship-applications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: form.status, remarks: form.remarks, repo_url: form.repo_url, duration_weeks: form.duration_weeks })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Update failed')

      // Update the local state immediately with the new data
      setRows((prevRows) =>
        prevRows.map((row) =>
          row.id === id
            ? {
              ...row,
              status: form.status,
              remarks: form.remarks || null,
              repo_url: form.repo_url || null,
              duration_weeks: form.duration_weeks || null,
              start_date: data.application?.start_date || row.start_date,
              end_date: data.application?.end_date || row.end_date
            }
            : row
        )
      )

      // Update editing state to reflect the new values
      setEditing((s) => ({
        ...s,
        [id]: {
          status: form.status,
          remarks: form.remarks || '',
          repo_url: form.repo_url || '',
          duration_weeks: form.duration_weeks
        }
      }))

      toast.success(`Application ${form.status === 'accepted' ? 'accepted' : form.status === 'rejected' ? 'rejected' : 'updated'} successfully`)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Update failed')
    } finally {
      setProgress((s) => ({ ...s, [id]: 'view' }))
    }
  }

  // Bulk actions
  async function bulkUpdateStatus(status: string) {
    if (selectedRows.size === 0) {
      toast.error('Please select applications to update')
      return
    }

    try {
      const promises = Array.from(selectedRows).map(async (id) => {
        const res = await apiFetch('/api/admin/internship-applications', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, status })
        })
        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error || 'Update failed')
        }
        return res.json()
      })

      await Promise.all(promises)

      // Update local state
      setRows(prevRows =>
        prevRows.map(row =>
          selectedRows.has(row.id) ? { ...row, status } : row
        )
      )

      setSelectedRows(new Set())
      toast.success(`${selectedRows.size} applications updated to ${status}`)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Bulk update failed')
    }
  }

  // Export to CSV
  function exportToCSV() {
    const headers = ['Email', 'Internship ID', 'Domain', 'Level', 'Status', 'Remarks', 'Repo URL', 'Duration', 'Start Date', 'End Date', 'Submitted']
    const csvData = filteredRows.map(row => [
      row.email,
      row.internship_id,
      row.domain,
      row.level,
      row.status,
      row.remarks || '',
      row.repo_url || '',
      row.duration_weeks ? `${row.duration_weeks} weeks` : '',
      row.start_date ? new Date(row.start_date).toLocaleDateString() : '',
      row.end_date ? new Date(row.end_date).toLocaleDateString() : '',
      new Date(row.created_at).toLocaleString()
    ])

    const csvContent = [headers, ...csvData].map(row =>
      row.map(cell => `"${cell}"`).join(',')
    ).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `internship-applications-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  function getStatusIcon(status: string) {
    switch (status) {
      case 'accepted': return <CheckCircle2 className="w-4 h-4 text-green-600" />
      case 'rejected': return <XCircle className="w-4 h-4 text-red-600" />
      case 'reviewed': return <AlertCircle className="w-4 h-4 text-blue-600" />
      default: return <Clock className="w-4 h-4 text-gray-600" />
    }
  }

  function getStatusBadge(status: string) {
    const variants = {
      accepted: 'bg-green-100 text-green-800 border-green-200',
      rejected: 'bg-red-100 text-red-800 border-red-200',
      reviewed: 'bg-blue-100 text-blue-800 border-blue-200',
      submitted: 'bg-gray-100 text-gray-800 border-gray-200'
    }
    return variants[status as keyof typeof variants] || variants.submitted
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header with Stats */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Internship Applications</h1>
            <p className="text-muted-foreground">Manage and review internship applications</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportToCSV} disabled={loading}>
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
            <Button onClick={load} disabled={loading}>
              {loading ? 'Loading...' : 'Refresh'}
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                <div>
                  <p className="text-sm font-medium">Total</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-600" />
                <div>
                  <p className="text-sm font-medium">Submitted</p>
                  <p className="text-2xl font-bold">{stats.submitted}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-blue-600" />
                <div>
                  <p className="text-sm font-medium">Reviewed</p>
                  <p className="text-2xl font-bold">{stats.reviewed}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <div>
                  <p className="text-sm font-medium">Accepted</p>
                  <p className="text-2xl font-bold">{stats.accepted}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <XCircle className="w-4 h-4 text-red-600" />
                <div>
                  <p className="text-sm font-medium">Rejected</p>
                  <p className="text-2xl font-bold">{stats.rejected}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by email, domain, or internship ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="reviewed">Reviewed</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>

              <Select value={domainFilter} onValueChange={setDomainFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Domain" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Domains</SelectItem>
                  {uniqueDomains.map(domain => (
                    <SelectItem key={domain} value={domain}>{domain}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={levelFilter} onValueChange={setLevelFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  {uniqueLevels.map(level => (
                    <SelectItem key={level} value={level}>{level}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={`${sortBy}-${sortOrder}`} onValueChange={(value) => {
                const [field, order] = value.split('-')
                setSortBy(field as typeof sortBy)
                setSortOrder(order as typeof sortOrder)
              }}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="created_at-desc">Newest First</SelectItem>
                  <SelectItem value="created_at-asc">Oldest First</SelectItem>
                  <SelectItem value="email-asc">Email A-Z</SelectItem>
                  <SelectItem value="email-desc">Email Z-A</SelectItem>
                  <SelectItem value="status-asc">Status A-Z</SelectItem>
                  <SelectItem value="status-desc">Status Z-A</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedRows.size > 0 && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-900">
                  {selectedRows.size} application{selectedRows.size > 1 ? 's' : ''} selected
                </span>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => bulkUpdateStatus('reviewed')}>
                    Mark as Reviewed
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => bulkUpdateStatus('accepted')} className="text-green-700 border-green-300 hover:bg-green-50">
                    Accept All
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => bulkUpdateStatus('rejected')} className="text-red-700 border-red-300 hover:bg-red-50">
                    Reject All
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setSelectedRows(new Set())}>
                    Clear Selection
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Applications Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedRows.size === filteredRows.length && filteredRows.length > 0}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedRows(new Set(filteredRows.map(r => r.id)))
                        } else {
                          setSelectedRows(new Set())
                        }
                      }}
                    />
                  </TableHead>
                  <TableHead>Applicant</TableHead>
                  <TableHead>Internship Details</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Timeline</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <FileText className="w-8 h-8 text-gray-400" />
                        <p className="text-sm text-muted-foreground">
                          {rows.length === 0 ? 'No applications yet' : 'No applications match your filters'}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredRows.map((r) => (
                  <TableRow key={r.id} className="hover:bg-muted/50">
                    <TableCell>
                      <Checkbox
                        checked={selectedRows.has(r.id)}
                        onCheckedChange={(checked) => {
                          const newSelected = new Set(selectedRows)
                          if (checked) {
                            newSelected.add(r.id)
                          } else {
                            newSelected.delete(r.id)
                          }
                          setSelectedRows(newSelected)
                        }}
                      />
                    </TableCell>

                    {/* Applicant Info */}
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">{r.email}</div>
                        <div className="text-xs text-muted-foreground">
                          Applied {new Date(r.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </TableCell>

                    {/* Internship Details */}
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium text-sm">{r.internship_id}</div>
                        <div className="flex gap-2">
                          <Badge variant="secondary" className="text-xs">{r.domain}</Badge>
                          <Badge variant="outline" className="text-xs">{r.level}</Badge>
                        </div>
                      </div>
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      {progress[r.id] === 'view' ? (
                        <div className="flex items-center gap-2">
                          {getStatusIcon(editing[r.id]?.status || r.status)}
                          <Badge className={`capitalize ${getStatusBadge(editing[r.id]?.status || r.status)}`}>
                            {editing[r.id]?.status || r.status}
                          </Badge>
                        </div>
                      ) : (
                        <Select
                          value={editing[r.id]?.status || r.status}
                          onValueChange={(value) => setEditing((s) => ({ ...s, [r.id]: { ...(s[r.id] || { status: r.status, remarks: r.remarks || '' }), status: value } }))}
                        >
                          <SelectTrigger className="w-[140px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="submitted">Submitted</SelectItem>
                            <SelectItem value="reviewed">Reviewed</SelectItem>
                            <SelectItem value="accepted">Accepted</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </TableCell>

                    {/* Progress Info */}
                    <TableCell>
                      <div className="space-y-2">
                        {progress[r.id] === 'view' ? (
                          <>
                            {(editing[r.id]?.repo_url || r.repo_url) && (
                              <div className="text-xs">
                                <a href={editing[r.id]?.repo_url || r.repo_url!} target="_blank" className="text-primary hover:underline flex items-center gap-1">
                                  <FileText className="w-3 h-3" />
                                  Repository
                                </a>
                              </div>
                            )}
                            {(editing[r.id]?.duration_weeks || r.duration_weeks) && (
                              <div className="text-xs text-muted-foreground flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {editing[r.id]?.duration_weeks || r.duration_weeks} weeks
                              </div>
                            )}
                            {(editing[r.id]?.remarks || r.remarks) && (
                              <div className="text-xs text-muted-foreground max-w-[200px] truncate" title={editing[r.id]?.remarks || r.remarks || ''}>
                                {editing[r.id]?.remarks || r.remarks}
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="space-y-2">
                            <Input
                              value={editing[r.id]?.repo_url ?? ''}
                              onChange={(e) => setEditing((s) => ({ ...s, [r.id]: { ...(s[r.id] || { status: r.status }), repo_url: e.target.value } }))}
                              placeholder="Repository URL"
                              className="text-xs"
                            />
                            <Select
                              value={editing[r.id]?.duration_weeks?.toString() ?? ''}
                              onValueChange={(value) => setEditing((s) => ({ ...s, [r.id]: { ...(s[r.id] || { status: r.status }), duration_weeks: value ? Number(value) : undefined } }))}
                            >
                              <SelectTrigger className="text-xs">
                                <SelectValue placeholder="Duration" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="4">4 weeks</SelectItem>
                                <SelectItem value="6">6 weeks</SelectItem>
                              </SelectContent>
                            </Select>
                            <Textarea
                              value={editing[r.id]?.remarks ?? ''}
                              onChange={(e) => setEditing((s) => ({ ...s, [r.id]: { ...(s[r.id] || { status: r.status }), remarks: e.target.value } }))}
                              placeholder="Remarks..."
                              className="text-xs min-h-[60px]"
                            />
                          </div>
                        )}
                      </div>
                    </TableCell>

                    {/* Timeline */}
                    <TableCell>
                      <div className="space-y-1 text-xs text-muted-foreground">
                        {r.start_date && (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Start: {new Date(r.start_date).toLocaleDateString()}
                          </div>
                        )}
                        {r.end_date && (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            End: {new Date(r.end_date).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </TableCell>

                    {/* Actions */}
                    <TableCell>
                      <div className="flex gap-1">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="ghost" onClick={() => setViewingApplication(r)}>
                              <Eye className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Application Details</DialogTitle>
                            </DialogHeader>
                            {viewingApplication && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="text-sm font-medium">Email</label>
                                    <p className="text-sm text-muted-foreground">{viewingApplication.email}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Internship ID</label>
                                    <p className="text-sm text-muted-foreground">{viewingApplication.internship_id}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Domain</label>
                                    <p className="text-sm text-muted-foreground">{viewingApplication.domain}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Level</label>
                                    <p className="text-sm text-muted-foreground">{viewingApplication.level}</p>
                                  </div>
                                </div>
                                {viewingApplication.cover_note && (
                                  <div>
                                    <label className="text-sm font-medium">Cover Note</label>
                                    <div className="mt-1 p-3 bg-muted rounded-md text-sm">
                                      {viewingApplication.cover_note}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>

                        {progress[r.id] === 'view' ? (
                          <Button size="sm" variant="ghost" onClick={() => setProgress((s) => ({ ...s, [r.id]: 'edit' }))}>
                            <Pencil className="w-4 h-4" />
                          </Button>
                        ) : (
                          <div className="flex gap-1">
                            <Button size="sm" variant="ghost" onClick={() => save(r.id)} disabled={progress[r.id] === 'saving'}>
                              <Check className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => setProgress((s) => ({ ...s, [r.id]: 'view' }))}>
                              ×
                            </Button>
                          </div>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Results Summary */}
          {filteredRows.length > 0 && (
            <div className="p-4 border-t bg-muted/30">
              <p className="text-sm text-muted-foreground">
                Showing {filteredRows.length} of {rows.length} applications
                {searchTerm && ` matching "${searchTerm}"`}
                {statusFilter !== 'all' && ` with status "${statusFilter}"`}
                {domainFilter !== 'all' && ` in domain "${domainFilter}"`}
                {levelFilter !== 'all' && ` at level "${levelFilter}"`}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}


