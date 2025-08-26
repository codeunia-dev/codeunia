'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { Check, Pencil } from 'lucide-react'
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
  const [loading, setLoading] = useState(false)
  const [editing, setEditing] = useState<Record<string, { status: string; remarks?: string; repo_url?: string; duration_weeks?: number }>>({})
  const [progress, setProgress] = useState<Record<string, 'view' | 'edit' | 'saving'>>({})

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

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Internship Applications (Admin)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-3">
            <Button variant="outline" onClick={load} disabled={loading}>Refresh</Button>
          </div>
          <div className="overflow-x-auto border rounded-xl">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Internship</TableHead>
                  <TableHead>Domain</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Remarks</TableHead>
                  <TableHead>Repo URL</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Start</TableHead>
                  <TableHead>End</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.length === 0 ? (
                  <TableRow><TableCell colSpan={8} className="text-center text-sm text-muted-foreground">No applications yet</TableCell></TableRow>
                ) : rows.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="text-sm">{r.email}</TableCell>
                    <TableCell className="text-sm">{r.internship_id}</TableCell>
                    <TableCell className="text-sm">{r.domain}</TableCell>
                    <TableCell className="text-sm">{r.level}</TableCell>
                    <TableCell className="text-sm w-[160px]">
                      {progress[r.id] === 'view' ? (
                        <div className={`capitalize px-2 py-1 rounded text-xs font-medium ${
                          (editing[r.id]?.status || r.status) === 'accepted' ? 'bg-green-100 text-green-800' :
                          (editing[r.id]?.status || r.status) === 'rejected' ? 'bg-red-100 text-red-800' :
                          (editing[r.id]?.status || r.status) === 'reviewed' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {editing[r.id]?.status || r.status}
                        </div>
                      ) : (
                        <select
                          className="border rounded-md px-2 py-1 bg-background w-full"
                          value={editing[r.id]?.status || r.status}
                          onChange={(e) => setEditing((s) => ({ ...s, [r.id]: { ...(s[r.id] || { status: r.status, remarks: r.remarks || '' }), status: e.target.value } }))}
                        >
                          <option value="submitted">Submitted</option>
                          <option value="reviewed">Reviewed</option>
                          <option value="accepted">Accepted</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      )}
                    </TableCell>
                    <TableCell className="w-[220px]">
                      {progress[r.id] === 'view' ? (
                        <div className="text-sm">{(editing[r.id]?.remarks ?? r.remarks ?? '').trim() || '—'}</div>
                      ) : (
                        <Input
                          value={editing[r.id]?.remarks ?? ''}
                          onChange={(e) => setEditing((s) => ({ ...s, [r.id]: { ...(s[r.id] || { status: r.status }), remarks: e.target.value } }))}
                          placeholder="Remarks (optional)"
                        />
                      )}
                    </TableCell>
                    <TableCell className="w-[280px]">
                      {progress[r.id] === 'view' ? (
                        (editing[r.id]?.repo_url || r.repo_url) ? (
                          <a href={editing[r.id]?.repo_url || r.repo_url!} target="_blank" className="text-primary underline break-all">{editing[r.id]?.repo_url || r.repo_url}</a>
                        ) : '—'
                      ) : (
                        <Input
                          value={editing[r.id]?.repo_url ?? ''}
                          onChange={(e) => setEditing((s) => ({ ...s, [r.id]: { ...(s[r.id] || { status: r.status }), repo_url: e.target.value } }))}
                          placeholder="https://github.com/org/repo"
                        />
                      )}
                    </TableCell>
                    <TableCell className="w-[120px]">
                      {progress[r.id] === 'view' ? (
                        (editing[r.id]?.duration_weeks || r.duration_weeks) ? `${editing[r.id]?.duration_weeks || r.duration_weeks} weeks` : '—'
                      ) : (
                        <select
                          className="border rounded-md px-2 py-1 bg-background w-full"
                          value={editing[r.id]?.duration_weeks ?? ''}
                          onChange={(e) => setEditing((s) => ({ ...s, [r.id]: { ...(s[r.id] || { status: r.status }), duration_weeks: e.target.value ? Number(e.target.value) : undefined } }))}
                        >
                          <option value="">Select</option>
                          <option value="4">4 weeks</option>
                          <option value="6">6 weeks</option>
                        </select>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{r.start_date ? new Date(r.start_date).toLocaleDateString() : '—'}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{r.end_date ? new Date(r.end_date).toLocaleDateString() : '—'}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleString()}</TableCell>
                    <TableCell className="w-[140px]">
                      {progress[r.id] === 'view' ? (
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => setProgress((s) => ({ ...s, [r.id]: 'edit' }))}>
                            <Pencil className="w-4 h-4 mr-1" /> Edit
                          </Button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => save(r.id)} disabled={progress[r.id] === 'saving'}>
                            <Check className="w-4 h-4 mr-1" /> {progress[r.id] === 'saving' ? 'Saving...' : 'Save'}
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setProgress((s) => ({ ...s, [r.id]: 'view' }))}>Cancel</Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


