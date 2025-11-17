'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Company, CompanyMember } from '@/types/company'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Skeleton } from '@/components/ui/skeleton'
import {
  UserPlus,
  Mail,
  MoreVertical,
  Shield,
  Edit,
  Trash2,
  Clock,
  CheckCircle,
  AlertCircle,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface TeamManagementProps {
  company: Company
  companySlug: string
  currentUserRole: string
}

export function TeamManagement({
  company,
  companySlug,
  currentUserRole,
}: TeamManagementProps) {
  // company parameter is kept for future use
  console.log('Company:', company.name)
  const [members, setMembers] = useState<CompanyMember[]>([])
  const [loading, setLoading] = useState(true)
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)
  const [roleDialogOpen, setRoleDialogOpen] = useState(false)
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false)
  const [selectedMember, setSelectedMember] = useState<CompanyMember | null>(null)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<'admin' | 'editor' | 'viewer'>('viewer')
  const [newRole, setNewRole] = useState<'owner' | 'admin' | 'editor' | 'viewer'>('viewer')
  const [submitting, setSubmitting] = useState(false)

  // Check if current user can manage team
  const canManageTeam = ['owner', 'admin'].includes(currentUserRole)
  const canUpdateRoles = currentUserRole === 'owner'
  const canRemoveMembers = currentUserRole === 'owner'
  
  // Debug logging
  console.log('TeamManagement - currentUserRole:', currentUserRole)
  console.log('TeamManagement - canManageTeam:', canManageTeam)
  console.log('TeamManagement - members count:', members.length)

  // Fetch team members
  const fetchMembers = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/companies/${companySlug}/members`)
      if (!response.ok) {
        throw new Error('Failed to fetch team members')
      }
      const data = await response.json()
      setMembers(data.members || [])
    } catch (error) {
      console.error('Error fetching members:', error)
      toast.error('Failed to load team members')
    } finally {
      setLoading(false)
    }
  }, [companySlug])

  useEffect(() => {
    fetchMembers()
  }, [fetchMembers])

  // Handle invite member
  const handleInvite = async () => {
    if (!inviteEmail) {
      toast.error('Please enter an email address')
      return
    }

    try {
      setSubmitting(true)
      const response = await fetch(`/api/companies/${companySlug}/members/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: inviteEmail,
          role: inviteRole,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        console.error('Invite error response:', data)
        
        // Check if it's a team limit error
        if (data.upgrade_required) {
          toast.error('Team Member Limit Reached', {
            description: `${data.error} (${data.current_usage}/${data.limit}). Please upgrade your plan to add more members.`,
            duration: 6000,
          })
        } else {
          toast.error(data.error || 'Failed to invite member')
        }
        return
      }

      toast.success('Team member invited successfully')

      setInviteDialogOpen(false)
      setInviteEmail('')
      setInviteRole('viewer')
      fetchMembers()
    } catch (error) {
      console.error('Error inviting member:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to invite member')
    } finally {
      setSubmitting(false)
    }
  }

  // Handle update role
  const handleUpdateRole = async () => {
    if (!selectedMember) return

    try {
      setSubmitting(true)
      const response = await fetch(
        `/api/companies/${companySlug}/members/${selectedMember.user_id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ role: newRole }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update role')
      }

      toast.success('Member role updated successfully')

      setRoleDialogOpen(false)
      setSelectedMember(null)
      fetchMembers()
    } catch (error) {
      console.error('Error updating role:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to update role')
    } finally {
      setSubmitting(false)
    }
  }

  // Handle remove member
  const handleRemove = async () => {
    if (!selectedMember) return

    try {
      setSubmitting(true)
      const response = await fetch(
        `/api/companies/${companySlug}/members/${selectedMember.user_id}`,
        {
          method: 'DELETE',
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to remove member')
      }

      toast.success('Member removed successfully')

      setRemoveDialogOpen(false)
      setSelectedMember(null)
      fetchMembers()
    } catch (error) {
      console.error('Error removing member:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to remove member')
    } finally {
      setSubmitting(false)
    }
  }

  // Open role dialog
  const openRoleDialog = (member: CompanyMember) => {
    setSelectedMember(member)
    setNewRole(member.role as 'owner' | 'admin' | 'editor' | 'viewer')
    setRoleDialogOpen(true)
  }

  // Open remove dialog
  const openRemoveDialog = (member: CompanyMember) => {
    setSelectedMember(member)
    setRemoveDialogOpen(true)
  }

  // Get role badge variant
  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'owner':
        return 'default'
      case 'admin':
        return 'secondary'
      case 'editor':
        return 'outline'
      default:
        return 'outline'
    }
  }

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
            <CheckCircle className="w-3 h-3 mr-1" />
            Active
          </Badge>
        )
      case 'pending':
        return (
          <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        )
      case 'suspended':
        return (
          <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">
            <AlertCircle className="w-3 h-3 mr-1" />
            Suspended
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header with invite button */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white">Team Members</CardTitle>
              <CardDescription>
                {canManageTeam 
                  ? 'Manage your team members and their roles' 
                  : 'View your team members and their roles'}
              </CardDescription>
            </div>
            {canManageTeam && (
              <Button onClick={() => setInviteDialogOpen(true)}>
                <UserPlus className="w-4 h-4 mr-2" />
                Invite Member
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
              ))}
            </div>
          ) : members.length === 0 ? (
            <div className="text-center py-12">
              <UserPlus className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">No team members yet</h3>
              <p className="text-muted-foreground mb-4">
                Invite team members to collaborate on events
              </p>
              {canManageTeam && (
                <Button onClick={() => setInviteDialogOpen(true)}>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Invite Your First Member
                </Button>
              )}
            </div>
          ) : (
            <div className="rounded-md border border-zinc-800">
              <Table>
                <TableHeader>
                  <TableRow className="border-zinc-800 hover:bg-zinc-800/50">
                    <TableHead className="text-zinc-400">Member</TableHead>
                    <TableHead className="text-zinc-400">Role</TableHead>
                    <TableHead className="text-zinc-400">Status</TableHead>
                    <TableHead className="text-zinc-400">Joined</TableHead>
                    {(canUpdateRoles || canRemoveMembers) && (
                      <TableHead className="text-zinc-400 text-right">Actions</TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members.map((member) => (
                    <TableRow key={member.id} className="border-zinc-800 hover:bg-zinc-800/50">
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarImage src={member.user?.avatar_url} />
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {member.user?.first_name?.[0]?.toUpperCase() ||
                                member.user?.email?.[0]?.toUpperCase() ||
                                'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium text-white">
                              {member.user?.first_name && member.user?.last_name
                                ? `${member.user.first_name} ${member.user.last_name}`
                                : member.user?.first_name || 'Unknown User'}
                            </div>
                            <div className="text-sm text-muted-foreground flex items-center">
                              <Mail className="w-3 h-3 mr-1" />
                              {member.user?.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getRoleBadgeVariant(member.role)}>
                          <Shield className="w-3 h-3 mr-1" />
                          {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(member.status)}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {member.joined_at
                          ? new Date(member.joined_at).toLocaleDateString()
                          : 'Pending'}
                      </TableCell>
                      {(canUpdateRoles || canRemoveMembers) && (
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-800">
                              <DropdownMenuLabel className="text-zinc-400">Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator className="bg-zinc-800" />
                              {canUpdateRoles && (
                                <DropdownMenuItem
                                  onClick={() => openRoleDialog(member)}
                                  className="text-white hover:bg-zinc-800"
                                >
                                  <Edit className="w-4 h-4 mr-2" />
                                  Update Role
                                </DropdownMenuItem>
                              )}
                              {canRemoveMembers && (
                                <DropdownMenuItem
                                  onClick={() => openRemoveDialog(member)}
                                  className="text-red-500 hover:bg-zinc-800 hover:text-red-400"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Remove Member
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Activity Log Card */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white">Recent Activity</CardTitle>
          <CardDescription>Team member activity and changes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>Activity logs coming soon</p>
          </div>
        </CardContent>
      </Card>

      {/* Invite Member Dialog */}
      <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
          <DialogHeader>
            <DialogTitle>Invite Team Member</DialogTitle>
            <DialogDescription>
              Send an invitation to join your team. They must have a Codeunia account.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="member@example.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              <Select value={inviteRole} onValueChange={(value: any) => setInviteRole(value)}>
                <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800">
                  <SelectItem value="viewer">Viewer - View only</SelectItem>
                  <SelectItem value="editor">Editor - Create drafts</SelectItem>
                  <SelectItem value="admin">Admin - Full event management</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {inviteRole === 'viewer' && 'Can view company events and analytics'}
                {inviteRole === 'editor' && 'Can create draft events'}
                {inviteRole === 'admin' && 'Can create, edit, and manage events'}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setInviteDialogOpen(false)}
              disabled={submitting}
              className="bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700"
            >
              Cancel
            </Button>
            <Button onClick={handleInvite} disabled={submitting}>
              {submitting ? 'Sending...' : 'Send Invitation'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Role Dialog */}
      <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
          <DialogHeader>
            <DialogTitle>Update Member Role</DialogTitle>
            <DialogDescription>
              Change the role and permissions for {selectedMember?.user?.first_name || 'this member'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="newRole">New Role</Label>
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              <Select value={newRole} onValueChange={(value: any) => setNewRole(value)}>
                <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800">
                  <SelectItem value="owner">Owner - Full control</SelectItem>
                  <SelectItem value="admin">Admin - Full event management</SelectItem>
                  <SelectItem value="editor">Editor - Create drafts</SelectItem>
                  <SelectItem value="viewer">Viewer - View only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRoleDialogOpen(false)}
              disabled={submitting}
              className="bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700"
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateRole} disabled={submitting}>
              {submitting ? 'Updating...' : 'Update Role'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Member Confirmation Dialog */}
      <AlertDialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
        <AlertDialogContent className="bg-zinc-900 border-zinc-800 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Team Member?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Are you sure you want to remove{' '}
              <span className="font-semibold text-white">
                {selectedMember?.user?.first_name || selectedMember?.user?.email}
              </span>{' '}
              from your team? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={submitting}
              className="bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemove}
              disabled={submitting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {submitting ? 'Removing...' : 'Remove Member'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
