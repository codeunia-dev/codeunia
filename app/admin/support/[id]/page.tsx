'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { 
  ArrowLeft, 
  Mail, 
  Bug, 
  Clock, 
  User,
  Calendar,
  MessageSquare,
  Save,
  Send
} from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

interface SupportTicket {
  id: string
  user_id: string
  type: 'contact' | 'bug'
  subject: string
  message: string
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  created_at: string
  updated_at: string
  user?: {
    id: string
    email: string
    first_name?: string
    last_name?: string
    avatar_url?: string
  }
}

export default function TicketDetailPage() {
  const params = useParams()
  const router = useRouter()
  const ticketId = params.id as string

  const [ticket, setTicket] = useState<SupportTicket | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [notes, setNotes] = useState('')
  const [reply, setReply] = useState('')
  const [sendingReply, setSendingReply] = useState(false)

  useEffect(() => {
    fetchTicket()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticketId])

  const fetchTicket = async () => {
    try {
      const response = await fetch(`/api/admin/support/tickets/${ticketId}`)
      if (response.ok) {
        const data = await response.json()
        setTicket(data.ticket)
      } else {
        toast.error('Failed to load ticket')
        router.push('/admin/support')
      }
    } catch (error) {
      console.error('Error fetching ticket:', error)
      toast.error('Failed to load ticket')
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (newStatus: string) => {
    setUpdating(true)
    try {
      const response = await fetch(`/api/admin/support/tickets/${ticketId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        toast.success('Status updated successfully')
        fetchTicket()
      } else {
        toast.error('Failed to update status')
      }
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error('Failed to update status')
    } finally {
      setUpdating(false)
    }
  }

  const sendReply = async () => {
    if (!reply.trim()) {
      toast.error('Please enter a reply message')
      return
    }

    setSendingReply(true)
    try {
      const response = await fetch(`/api/admin/support/tickets/${ticketId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: reply }),
      })

      if (response.ok) {
        toast.success('Reply sent successfully!')
        setReply('')
        
        // Update status to "in_progress" if it's "open"
        if (ticket?.status === 'open') {
          try {
            const statusResponse = await fetch(`/api/admin/support/tickets/${ticketId}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ status: 'in_progress' }),
            })

            if (statusResponse.ok) {
              toast.success('Status updated to In Progress')
            } else {
              console.error('Failed to update status')
              toast.error('Reply sent, but failed to update status')
            }
          } catch (statusError) {
            console.error('Error updating status:', statusError)
            toast.error('Reply sent, but failed to update status')
          }
        }
        
        // Refresh ticket data
        await fetchTicket()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to send reply')
      }
    } catch (error) {
      console.error('Error sending reply:', error)
      toast.error('Failed to send reply')
    } finally {
      setSendingReply(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-red-500/10 text-red-400 border-red-500/20'
      case 'in_progress': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
      case 'resolved': return 'bg-green-500/10 text-green-400 border-green-500/20'
      case 'closed': return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
      default: return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
    }
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-96" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-64" />
            <Skeleton className="h-48" />
          </div>
        </div>
      </div>
    )
  }

  if (!ticket) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Ticket not found</p>
            <Button asChild className="mt-4">
              <Link href="/admin/support">Back to Tickets</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/admin/support">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Ticket Details</h1>
          <p className="text-sm text-muted-foreground">ID: {ticket.id}</p>
        </div>
        <Badge className={getStatusColor(ticket.status)}>
          {ticket.status.replace('_', ' ')}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Ticket Info */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                {ticket.type === 'bug' ? (
                  <Bug className="h-5 w-5 text-red-500" />
                ) : (
                  <Mail className="h-5 w-5 text-blue-500" />
                )}
                <CardTitle>{ticket.subject}</CardTitle>
              </div>
              <CardDescription>
                {ticket.type === 'bug' ? 'Bug Report' : 'Support Request'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none">
                <p className="whitespace-pre-wrap">{ticket.message}</p>
              </div>
            </CardContent>
          </Card>

          {/* Reply to User */}
          <Card className="border-blue-500/20 bg-blue-500/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5 text-blue-500" />
                Reply to User
              </CardTitle>
              <CardDescription>
                Send a response directly to {ticket.user?.email || 'the user'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Type your response here... This will be sent via email to the user."
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                rows={6}
                className="resize-none"
                disabled={sendingReply}
              />
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  {reply.length}/2000 characters
                </p>
                <div className="flex gap-2">
                  <Button 
                    variant="outline"
                    onClick={() => setReply('')}
                    disabled={!reply.trim() || sendingReply}
                  >
                    Clear
                  </Button>
                  <Button 
                    onClick={sendReply}
                    disabled={!reply.trim() || sendingReply || reply.length > 2000}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {sendingReply ? 'Sending...' : 'Send Reply'}
                  </Button>
                </div>
              </div>
              {ticket.status === 'open' && (
                <p className="text-xs text-muted-foreground bg-yellow-500/10 border border-yellow-500/20 rounded p-2">
                  💡 Tip: Sending a reply will automatically change the status to &quot;In Progress&quot;
                </p>
              )}
            </CardContent>
          </Card>

          {/* Internal Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Internal Notes
              </CardTitle>
              <CardDescription>
                Add notes visible only to admins (not sent to user)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Add internal notes about this ticket..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                className="resize-none"
              />
              <Button 
                onClick={() => {
                  toast.info('Internal notes feature coming soon')
                  setNotes('')
                }}
                disabled={!notes.trim()}
              >
                <Save className="h-4 w-4 mr-2" />
                Save Note
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* User Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">User Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                  {ticket.user?.first_name?.[0] || ticket.user?.email[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">
                    {ticket.user?.first_name && ticket.user?.last_name
                      ? `${ticket.user.first_name} ${ticket.user.last_name}`
                      : 'Unknown User'}
                  </p>
                  <p className="text-sm text-muted-foreground truncate">
                    {ticket.user?.email || 'No email'}
                  </p>
                </div>
              </div>
              <Button variant="outline" className="w-full" asChild>
                <Link href={`/admin/users?search=${ticket.user?.email}`}>
                  <User className="h-4 w-4 mr-2" />
                  View User Profile
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Ticket Metadata */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Ticket Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <div>
                  <p className="font-medium text-foreground">Created</p>
                  <p>{new Date(ticket.created_at).toLocaleString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <div>
                  <p className="font-medium text-foreground">Last Updated</p>
                  <p>{new Date(ticket.updated_at).toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Status Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Update Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant={ticket.status === 'open' ? 'default' : 'outline'}
                className="w-full justify-start"
                onClick={() => updateStatus('open')}
                disabled={updating || ticket.status === 'open'}
              >
                Open
              </Button>
              <Button
                variant={ticket.status === 'in_progress' ? 'default' : 'outline'}
                className="w-full justify-start"
                onClick={() => updateStatus('in_progress')}
                disabled={updating || ticket.status === 'in_progress'}
              >
                In Progress
              </Button>
              <Button
                variant={ticket.status === 'resolved' ? 'default' : 'outline'}
                className="w-full justify-start"
                onClick={() => updateStatus('resolved')}
                disabled={updating || ticket.status === 'resolved'}
              >
                Resolved
              </Button>
              <Button
                variant={ticket.status === 'closed' ? 'default' : 'outline'}
                className="w-full justify-start"
                onClick={() => updateStatus('closed')}
                disabled={updating || ticket.status === 'closed'}
              >
                Closed
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
