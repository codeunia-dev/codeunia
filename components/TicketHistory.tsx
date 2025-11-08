'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { MessageSquare, Clock, ChevronRight } from 'lucide-react'
import Link from 'next/link'

interface SupportTicket {
  id: string
  subject: string
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  created_at: string
  updated_at: string
}

export default function TicketHistory() {
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTickets()
  }, [])

  const fetchTickets = async () => {
    try {
      const response = await fetch('/api/support/tickets')
      if (response.ok) {
        const data = await response.json()
        setTickets(data.tickets)
      } else {
        toast.error('Failed to load ticket history')
      }
    } catch (error) {
      console.error('Error fetching tickets:', error)
      toast.error('Failed to load ticket history')
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
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-blue-400" />
            My Support Tickets
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 bg-zinc-800" />
          ))}
        </CardContent>
      </Card>
    )
  }

  if (tickets.length === 0) {
    return null
  }

  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-blue-400" />
          My Support Tickets
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {tickets.map((ticket) => (
          <Link href={`/protected/help/ticket/${ticket.id}`} key={ticket.id}>
            <div className="flex items-center justify-between p-3 rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer">
              <div className="flex-1">
                <p className="text-white font-medium">{ticket.subject}</p>
                <div className="flex items-center gap-4 text-xs text-zinc-400 mt-1">
                  <Badge className={getStatusColor(ticket.status)}>{ticket.status.replace('_', ' ')}</Badge>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>Last updated: {new Date(ticket.updated_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-zinc-500" />
            </div>
          </Link>
        ))}
      </CardContent>
    </Card>
  )
}
