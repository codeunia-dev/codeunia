'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  Search, 
  Mail, 
  Bug, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Users,
  MessageSquare,
  ChevronRight
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
    email: string
    first_name?: string
    last_name?: string
  }
}

interface Stats {
  total: number
  open: number
  in_progress: number
  resolved: number
  closed: number
  contact: number
  bug: number
}

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [filteredTickets, setFilteredTickets] = useState<SupportTicket[]>([])
  const [stats, setStats] = useState<Stats>({
    total: 0,
    open: 0,
    in_progress: 0,
    resolved: 0,
    closed: 0,
    contact: 0,
    bug: 0
  })
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'contact' | 'bug'>('all')
  const [filterStatus, setFilterStatus] = useState<'all' | 'open' | 'in_progress' | 'resolved' | 'closed'>('all')

  useEffect(() => {
    fetchTickets()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    filterTickets()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tickets, searchQuery, filterType, filterStatus])

  const fetchTickets = async () => {
    try {
      const response = await fetch('/api/admin/support/tickets')
      if (response.ok) {
        const data = await response.json()
        setTickets(data.tickets)
        calculateStats(data.tickets)
      } else {
        toast.error('Failed to load tickets')
      }
    } catch (error) {
      console.error('Error fetching tickets:', error)
      toast.error('Failed to load tickets')
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (ticketList: SupportTicket[]) => {
    const newStats = {
      total: ticketList.length,
      open: ticketList.filter(t => t.status === 'open').length,
      in_progress: ticketList.filter(t => t.status === 'in_progress').length,
      resolved: ticketList.filter(t => t.status === 'resolved').length,
      closed: ticketList.filter(t => t.status === 'closed').length,
      contact: ticketList.filter(t => t.type === 'contact').length,
      bug: ticketList.filter(t => t.type === 'bug').length,
    }
    setStats(newStats)
  }

  const filterTickets = () => {
    let filtered = tickets

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(t => t.type === filterType)
    }

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(t => t.status === filterStatus)
    }

    // Search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(t => 
        t.subject.toLowerCase().includes(query) ||
        t.message.toLowerCase().includes(query) ||
        t.user?.email.toLowerCase().includes(query)
      )
    }

    setFilteredTickets(filtered)
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

  const getTypeIcon = (type: string) => {
    return type === 'bug' ? <Bug className="h-4 w-4" /> : <Mail className="h-4 w-4" />
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32" />)}
        </div>
        <Skeleton className="h-96" />
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Support Tickets</h1>
        <p className="text-sm md:text-base text-muted-foreground">Manage support requests and bug reports</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.contact} contact, {stats.bug} bugs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Open Tickets</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{stats.open}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Requires attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">{stats.in_progress}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Being worked on
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Resolved</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{stats.resolved}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.closed} closed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base md:text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tickets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Type Filter */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">Type</p>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={filterType === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType('all')}
                className="flex-1 sm:flex-none"
              >
                All
              </Button>
              <Button
                variant={filterType === 'contact' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType('contact')}
                className="flex-1 sm:flex-none"
              >
                <Mail className="h-4 w-4 sm:mr-1" />
                <span className="hidden sm:inline">Contact</span>
              </Button>
              <Button
                variant={filterType === 'bug' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType('bug')}
                className="flex-1 sm:flex-none"
              >
                <Bug className="h-4 w-4 sm:mr-1" />
                <span className="hidden sm:inline">Bugs</span>
              </Button>
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">Status</p>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={filterStatus === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('all')}
                className="text-xs"
              >
                All
              </Button>
              <Button
                variant={filterStatus === 'open' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('open')}
                className="text-xs"
              >
                Open
              </Button>
              <Button
                variant={filterStatus === 'in_progress' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('in_progress')}
                className="text-xs"
              >
                In Progress
              </Button>
              <Button
                variant={filterStatus === 'resolved' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('resolved')}
                className="text-xs"
              >
                Resolved
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tickets List */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base md:text-lg">Tickets ({filteredTickets.length})</CardTitle>
          <CardDescription className="text-xs md:text-sm">
            {filterStatus !== 'all' && `Showing ${filterStatus} tickets`}
            {filterType !== 'all' && ` of type ${filterType}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredTickets.length === 0 ? (
            <div className="text-center py-8 md:py-12">
              <MessageSquare className="h-10 w-10 md:h-12 md:w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-sm md:text-base text-muted-foreground">No tickets found</p>
            </div>
          ) : (
            <div className="space-y-2 md:space-y-3">
              {filteredTickets.map((ticket) => (
                <Link
                  key={ticket.id}
                  href={`/admin/support/${ticket.id}`}
                  className="block"
                >
                  <div className="p-3 md:p-4 rounded-lg border hover:border-primary transition-colors cursor-pointer">
                    <div className="flex items-start justify-between gap-2 md:gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <Badge variant="outline" className="gap-1 text-xs">
                            {getTypeIcon(ticket.type)}
                            <span className="hidden sm:inline">{ticket.type}</span>
                          </Badge>
                          <Badge className={`${getStatusColor(ticket.status)} text-xs`}>
                            {ticket.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        <h3 className="font-semibold mb-1 truncate text-sm md:text-base">{ticket.subject}</h3>
                        <p className="text-xs md:text-sm text-muted-foreground line-clamp-2 mb-2">
                          {ticket.message}
                        </p>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1 truncate">
                            <Users className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">{ticket.user?.email || 'Unknown user'}</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3 flex-shrink-0" />
                            {new Date(ticket.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground flex-shrink-0 mt-1" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
