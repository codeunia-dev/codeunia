'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { MessageSquare, Clock, ChevronRight, Inbox } from 'lucide-react'
import Link from 'next/link'

type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed'

interface SupportTicket {
  id: string
  subject: string
  status: TicketStatus
  created_at: string
  updated_at: string
}

export default function TicketHistory() {
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<TicketStatus | 'all'>('all')

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

  const filteredTickets = useMemo(() => {
    if (filter === 'all') {
      return tickets
    }
    return tickets.filter((ticket) => ticket.status === filter)
  }, [tickets, filter])

  const statusCounts = useMemo(() => {
    return tickets.reduce((acc, ticket) => {
      acc[ticket.status] = (acc[ticket.status] || 0) + 1
      return acc
    }, {} as Record<TicketStatus, number>)
  }, [tickets])

  if (loading) {
    return (
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
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

  const filterOptions: (TicketStatus | 'all')[] = ['all', 'open', 'in_progress', 'resolved', 'closed']

  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-white flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-blue-400" />
              My Support Tickets
            </CardTitle>
            <CardDescription className="mt-1">
              Track the status of your support requests.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 mt-4 sm:mt-0 flex-wrap">
            {filterOptions.map((status) => {
              const count = status === 'all' ? tickets.length : statusCounts[status as TicketStatus] || 0
              if (count === 0 && status !== 'all') return null
              
              return (
                <Button
                  key={status}
                  variant={filter === status ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter(status)}
                  className={`transition-all ${
                    filter === status
                      ? 'bg-blue-600 text-white'
                      : 'border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white'
                  }`}
                >
                  {status.replace('_', ' ')}
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                    filter === status ? 'bg-blue-800' : 'bg-zinc-700'
                  }`}>
                    {count}
                  </span>
                </Button>
              )
            })}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 max-h-96 overflow-y-auto">
        {filteredTickets.length > 0 ? (
          filteredTickets.map((ticket) => (
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
          ))
        ) : (
          <div className="flex flex-col items-center justify-center text-center py-12">
            <Inbox className="h-12 w-12 text-zinc-600" />
            <p className="mt-4 text-white font-medium">No tickets found</p>
            <p className="text-zinc-400 text-sm">
              There are no tickets with the status &quot;{filter.replace('_', ' ')}&quot;.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
