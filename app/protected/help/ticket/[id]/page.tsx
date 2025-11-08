'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowLeft, MessageSquare, Clock, Calendar, Bug, Mail } from 'lucide-react'
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
        <Skeleton className="h-96" />
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
          <h1 className="text-2xl font-bold">Ticket Details</h1>
          <p className="text-sm text-muted-foreground">ID: {ticket.id}</p>
        </div>
        <Badge className={getStatusColor(ticket.status)}>
          {ticket.status.replace('_', ' ')}
        </Badge>
      </div>

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
          <div className="flex items-center gap-4 text-xs text-zinc-400 mt-4">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>Created: {new Date(ticket.created_at).toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>Last updated: {new Date(ticket.updated_at).toLocaleString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {ticket.replies && ticket.replies.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-purple-500" />
              Reply History
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {ticket.replies.map((reply) => (
              <div key={reply.id} className="border-l-4 border-purple-500/30 bg-purple-500/5 rounded-r-lg p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white text-sm font-semibold">
                    {reply.admin?.first_name?.[0] || 'A'}
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {reply.admin?.first_name && reply.admin?.last_name
                        ? `${reply.admin.first_name} ${reply.admin.last_name}`
                        : 'Support Team'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(reply.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="pl-10">
                  <p className="text-sm text-foreground whitespace-pre-wrap">
                    {reply.message}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
