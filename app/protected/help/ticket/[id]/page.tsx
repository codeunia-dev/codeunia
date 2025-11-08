'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowLeft, MessageSquare, Bug, Mail, User, PlusCircle, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

interface TicketReply {
  id: string
  admin_id: string
  message: string
  created_at: string
  admin?: {
    first_name?: string
    last_name?: string
    avatar_url?: string
  }
}

interface SupportTicket {
  id: string
  subject: string
  message: string
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  created_at: string
  updated_at: string
  type: 'contact' | 'bug'
  replies?: TicketReply[]
}

export default function UserTicketDetailPage() {
  const params = useParams()
  const router = useRouter()
  const ticketId = params.id as string

  const [ticket, setTicket] = useState<SupportTicket | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (ticketId) {
      fetchTicket()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticketId])

  const fetchTicket = async () => {
    try {
      const response = await fetch(`/api/support/tickets/${ticketId}`)
      if (response.ok) {
        const data = await response.json()
        setTicket(data.ticket)
      } else {
        toast.error('Failed to load ticket details')
        router.push('/protected/help')
      }
    } catch (error) {
      console.error('Error fetching ticket:', error)
      toast.error('Failed to load ticket details')
    } finally {
      setLoading(false)
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
            <Skeleton className="h-48" />
            <Skeleton className="h-64" />
          </div>
          <div className="space-y-6">
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
              <Link href="/protected/help">Back to Help Center</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/protected/help">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold flex items-center gap-3">
            {ticket.type === 'bug' ? (
              <Bug className="h-6 w-6 text-red-500" />
            ) : (
              <Mail className="h-6 w-6 text-blue-500" />
            )}
            {ticket.subject}
          </h1>
        </div>
        <Badge className={getStatusColor(ticket.status)}>
          {ticket.status.replace('_', ' ')}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Original Message */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <User className="h-5 w-5 text-blue-400" />
                Your Initial Request
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-zinc-300">{ticket.message}</p>
            </CardContent>
          </Card>

          {/* Reply History */}
          {ticket.replies && ticket.replies.length > 0 && (
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-purple-400" />
                  Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {ticket.replies.map((reply) => (
                  <div key={reply.id} className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white text-lg font-semibold flex-shrink-0">
                      {reply.admin?.first_name?.[0] || 'S'}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-white font-medium">
                          {reply.admin?.first_name && reply.admin?.last_name
                            ? `${reply.admin.first_name} ${reply.admin.last_name}`
                            : 'Support Team'}
                        </p>
                        <p className="text-xs text-zinc-400">
                          {new Date(reply.created_at).toLocaleString()}
                        </p>
                      </div>
                      <div className="mt-2 p-4 rounded-lg bg-zinc-800">
                        <p className="text-zinc-300 whitespace-pre-wrap">{reply.message}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          {/* Ticket Details */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-base text-white">Ticket Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex justify-between">
                <span className="text-zinc-400">Ticket ID</span>
                <span className="text-white font-mono text-xs">{ticket.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Status</span>
                <Badge className={getStatusColor(ticket.status)}>{ticket.status.replace('_', ' ')}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Created</span>
                <span className="text-white">{new Date(ticket.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Last Updated</span>
                <span className="text-white">{new Date(ticket.updated_at).toLocaleDateString()}</span>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-base text-white">Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full border-red-500/50 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                onClick={() => toast.info('This feature is coming soon!')}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Close Ticket
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/protected/help">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Create a New Ticket
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
