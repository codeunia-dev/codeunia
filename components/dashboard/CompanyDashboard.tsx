'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import Link from 'next/link'
import {
  Calendar,
  Users,
  Eye,
  AlertCircle,
  CheckCircle,
  Clock,
  Plus,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  FileText,
  Trophy,
} from 'lucide-react'
import { Company } from '@/types/company'
import { format, formatDistanceToNow } from 'date-fns'
import { useCompanyContext } from '@/contexts/CompanyContext'

interface CompanyDashboardStats {
  totalEvents: number
  totalHackathons: number
  totalRegistrations: number
  totalViews: number
  totalClicks: number
  pendingApprovals: number
  eventMetrics: {
    views: number
    registrations: number
    clicks: number
  }
  hackathonMetrics: {
    views: number
    registrations: number
    clicks: number
  }
  recentChange?: {
    events: number
    registrations: number
    views: number
  }
}

interface RecentActivity {
  id: string
  type: 'event_created' | 'event_approved' | 'event_rejected' | 'hackathon_created' | 'hackathon_approved' | 'hackathon_rejected' | 'registration' | 'member_joined'
  title: string
  description: string
  timestamp: string
  icon: React.ComponentType<{ className?: string }>
  iconColor: string
}

interface UpcomingEvent {
  id: string
  title: string
  slug: string
  date: string
  location: string
  registrations: number
  capacity: number
  approval_status: string
}

interface UpcomingHackathon {
  id: string
  title: string
  slug: string
  date: string
  mode: string
  registrations: number
  max_team_size: number
  approval_status: string
}

interface CompanyDashboardProps {
  company: Company
}

export function CompanyDashboard({ company }: CompanyDashboardProps) {
  const { userRole } = useCompanyContext()
  const [stats, setStats] = useState<CompanyDashboardStats | null>(null)
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [upcomingEvents, setUpcomingEvents] = useState<UpcomingEvent[]>([])
  const [upcomingHackathons, setUpcomingHackathons] = useState<UpcomingHackathon[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Check permissions based on role
  const canManageEvents = userRole && ['owner', 'admin', 'editor'].includes(userRole)
  const canManageTeam = userRole && ['owner', 'admin'].includes(userRole)

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch analytics for stats
      const analyticsResponse = await fetch(
        `/api/companies/${company.slug}/analytics?start_date=${new Date(
          Date.now() - 30 * 24 * 60 * 60 * 1000
        ).toISOString()}&end_date=${new Date().toISOString()}`
      )

      if (!analyticsResponse.ok) {
        throw new Error('Failed to fetch analytics')
      }

      const analyticsData = await analyticsResponse.json()

      console.log('Analytics data:', analyticsData)

      // Fetch events for upcoming events and pending approvals
      const eventsResponse = await fetch(
        `/api/companies/${company.slug}/events?limit=100`
      )

      if (!eventsResponse.ok) {
        throw new Error('Failed to fetch events')
      }

      const eventsData = await eventsResponse.json()

      // Fetch hackathons for total count
      const hackathonsResponse = await fetch(
        `/api/companies/${company.slug}/hackathons?limit=100`
      )

      if (!hackathonsResponse.ok) {
        throw new Error('Failed to fetch hackathons')
      }

      const hackathonsData = await hackathonsResponse.json()

      console.log('Hackathons data:', hackathonsData)
      console.log('Hackathons array:', hackathonsData.hackathons)

      // Calculate stats
      /* eslint-disable @typescript-eslint/no-explicit-any */
      const pendingEvents = eventsData.events?.filter(
        (e: any) => e.approval_status === 'pending'
      ) || []

      const approvedEvents = eventsData.events?.filter(
        (e: any) => e.approval_status === 'approved'
      ) || []

      const approvedHackathons = hackathonsData.hackathons?.filter(
        (h: any) => h.approval_status === 'approved'
      ) || []

      const upcomingEventsData = eventsData.events
        ?.filter((e: any) => {
          const eventDate = new Date(e.date)
          return eventDate > new Date() && e.approval_status === 'approved'
        })
        .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(0, 5) || []

      const upcomingHackathonsData = hackathonsData.hackathons
        ?.filter((h: any) => {
          const hackathonDate = new Date(h.date)
          return hackathonDate > new Date() && h.approval_status === 'approved'
        })
        .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(0, 5) || []

      console.log('Upcoming hackathons data:', upcomingHackathonsData)

      // Calculate total registrations from both events and hackathons
      const eventRegistrations = eventsData.events?.reduce(
        (sum: number, e: any) => sum + (e.registered || 0),
        0
      ) || 0

      const hackathonRegistrations = hackathonsData.hackathons?.reduce(
        (sum: number, h: any) => sum + (h.registered || 0),
        0
      ) || 0

      const totalRegistrations = eventRegistrations + hackathonRegistrations
      /* eslint-enable @typescript-eslint/no-explicit-any */

      // Calculate actual views and clicks from events and hackathons
      /* eslint-disable @typescript-eslint/no-explicit-any */
      const eventViews = eventsData.events?.reduce(
        (sum: number, e: any) => sum + (e.views || 0),
        0
      ) || 0

      const eventClicks = eventsData.events?.reduce(
        (sum: number, e: any) => sum + (e.clicks || 0),
        0
      ) || 0

      const hackathonViews = hackathonsData.hackathons?.reduce(
        (sum: number, h: any) => sum + (h.views || 0),
        0
      ) || 0

      const hackathonClicks = hackathonsData.hackathons?.reduce(
        (sum: number, h: any) => sum + (h.clicks || 0),
        0
      ) || 0
      /* eslint-enable @typescript-eslint/no-explicit-any */

      // Use actual views and clicks from events/hackathons tables, not analytics
      const totalViews = eventViews + hackathonViews
      const totalClicks = eventClicks + hackathonClicks

      setStats({
        totalEvents: approvedEvents.length,
        totalHackathons: approvedHackathons.length,
        totalRegistrations: totalRegistrations,
        totalViews: totalViews,
        totalClicks: totalClicks,
        pendingApprovals: pendingEvents.length,
        eventMetrics: {
          views: eventViews,
          registrations: eventRegistrations,
          clicks: eventClicks,
        },
        hackathonMetrics: {
          views: hackathonViews,
          registrations: hackathonRegistrations,
          clicks: hackathonClicks,
        },
        recentChange: {
          events: 0, // Could calculate from analytics
          registrations: 0,
          views: 0,
        },
      })

      setUpcomingEvents(upcomingEventsData)
      setUpcomingHackathons(upcomingHackathonsData)

      // Generate recent activity from events and hackathons
      const activities: RecentActivity[] = []

      // Add recent events
      const recentEvents = eventsData.events?.slice(0, 3) || []
      /* eslint-disable @typescript-eslint/no-explicit-any */
      recentEvents.forEach((event: any) => {
        if (event.approval_status === 'approved') {
          activities.push({
            id: event.id as string,
            type: 'event_approved',
            title: 'Event Approved',
            description: `${event.title} was approved and is now live`,
            timestamp: (event.approved_at || event.created_at) as string,
            icon: CheckCircle,
            iconColor: 'text-green-400',
          })
        } else if (event.approval_status === 'pending') {
          activities.push({
            id: event.id as string,
            type: 'event_created',
            title: 'Event Created',
            description: `${event.title} is pending approval`,
            timestamp: event.created_at as string,
            icon: Clock,
            iconColor: 'text-yellow-400',
          })
        } else if (event.approval_status === 'rejected') {
          activities.push({
            id: event.id as string,
            type: 'event_rejected',
            title: 'Event Rejected',
            description: `${event.title} was rejected`,
            timestamp: event.updated_at as string,
            icon: AlertCircle,
            iconColor: 'text-red-400',
          })
        }
      })

      // Add recent hackathons
      const recentHackathons = hackathonsData.hackathons?.slice(0, 3) || []
      recentHackathons.forEach((hackathon: any) => {
        if (hackathon.approval_status === 'approved') {
          activities.push({
            id: hackathon.id as string,
            type: 'hackathon_approved',
            title: 'Hackathon Approved',
            description: `${hackathon.title} was approved and is now live`,
            timestamp: (hackathon.approved_at || hackathon.created_at) as string,
            icon: Trophy,
            iconColor: 'text-orange-400',
          })
        } else if (hackathon.approval_status === 'pending') {
          activities.push({
            id: hackathon.id as string,
            type: 'hackathon_created',
            title: 'Hackathon Created',
            description: `${hackathon.title} is pending approval`,
            timestamp: hackathon.created_at as string,
            icon: Clock,
            iconColor: 'text-yellow-400',
          })
        } else if (hackathon.approval_status === 'rejected') {
          activities.push({
            id: hackathon.id as string,
            type: 'hackathon_rejected',
            title: 'Hackathon Rejected',
            description: `${hackathon.title} was rejected`,
            timestamp: hackathon.updated_at as string,
            icon: AlertCircle,
            iconColor: 'text-red-400',
          })
        }
      })
      /* eslint-enable @typescript-eslint/no-explicit-any */

      // Sort by timestamp
      activities.sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )

      setRecentActivity(activities.slice(0, 5))
    } catch (err) {
      console.error('Error fetching dashboard data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }, [company])

  useEffect(() => {
    if (company) {
      fetchDashboardData()
    }
  }, [company, fetchDashboardData])

  if (loading) {
    return <DashboardSkeleton />
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="bg-gradient-to-br from-zinc-900 to-zinc-800 border-zinc-700">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-400">
              <AlertCircle className="h-5 w-5" />
              <p>{error}</p>
            </div>
            <Button onClick={fetchDashboardData} className="mt-4" variant="outline">
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!stats) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* Overview Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <StatsCard
          title="Total Events"
          value={stats.totalEvents}
          icon={Calendar}
          iconColor="text-purple-400"
          description="Events hosted"
          change={stats.recentChange?.events}
        />
        <StatsCard
          title="Total Hackathons"
          value={stats.totalHackathons}
          icon={Trophy}
          iconColor="text-orange-400"
          description="Hackathons hosted"
        />
        <StatsCard
          title="Total Views"
          value={stats.totalViews}
          icon={Eye}
          iconColor="text-blue-400"
          description="Last 30 days"
          change={stats.recentChange?.views}
        />
        <StatsCard
          title="Registrations"
          value={stats.totalRegistrations}
          icon={Users}
          iconColor="text-green-400"
          description="Total participants"
          change={stats.recentChange?.registrations}
        />
        <StatsCard
          title="Pending Approval"
          value={stats.pendingApprovals}
          icon={Clock}
          iconColor="text-yellow-400"
          description="Awaiting review"
          highlight={stats.pendingApprovals > 0}
        />
      </div>

      {/* Separate Event and Hackathon Metrics */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Event Metrics Card */}
        <Card className="bg-gradient-to-br from-purple-900/20 to-purple-800/10 border-purple-700/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Calendar className="h-5 w-5 text-purple-400" />
              Event Metrics
            </CardTitle>
            <CardDescription>Performance data for your events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-purple-400" />
                  <span className="text-sm text-zinc-300">Views</span>
                </div>
                <span className="text-lg font-semibold text-white">
                  {stats.eventMetrics.views.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-purple-400" />
                  <span className="text-sm text-zinc-300">Registrations</span>
                </div>
                <span className="text-lg font-semibold text-white">
                  {stats.eventMetrics.registrations.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-purple-400" />
                  <span className="text-sm text-zinc-300">Clicks</span>
                </div>
                <span className="text-lg font-semibold text-white">
                  {stats.eventMetrics.clicks.toLocaleString()}
                </span>
              </div>
              {stats.eventMetrics.views > 0 && (
                <div className="pt-2 border-t border-purple-700/30">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-400">Conversion Rate</span>
                    <span className="text-purple-300 font-medium">
                      {((stats.eventMetrics.registrations / stats.eventMetrics.views) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Hackathon Metrics Card */}
        <Card className="bg-gradient-to-br from-orange-900/20 to-orange-800/10 border-orange-700/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Trophy className="h-5 w-5 text-orange-400" />
              Hackathon Metrics
            </CardTitle>
            <CardDescription>Performance data for your hackathons</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-orange-400" />
                  <span className="text-sm text-zinc-300">Views</span>
                </div>
                <span className="text-lg font-semibold text-white">
                  {stats.hackathonMetrics.views.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-orange-400" />
                  <span className="text-sm text-zinc-300">Registrations</span>
                </div>
                <span className="text-lg font-semibold text-white">
                  {stats.hackathonMetrics.registrations.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-orange-400" />
                  <span className="text-sm text-zinc-300">Clicks</span>
                </div>
                <span className="text-lg font-semibold text-white">
                  {stats.hackathonMetrics.clicks.toLocaleString()}
                </span>
              </div>
              {stats.hackathonMetrics.views > 0 && (
                <div className="pt-2 border-t border-orange-700/30">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-400">Conversion Rate</span>
                    <span className="text-orange-300 font-medium">
                      {((stats.hackathonMetrics.registrations / stats.hackathonMetrics.views) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Activity */}
        <Card className="bg-gradient-to-br from-zinc-900 to-zinc-800 border-zinc-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white flex items-center gap-2">
                  <Activity className="h-5 w-5 text-purple-400" />
                  Recent Activity
                </CardTitle>
                <CardDescription>Latest updates from events and hackathons</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {recentActivity.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No recent activity</p>
                <p className="text-sm">Create your first event or hackathon to get started</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <ActivityItem key={activity.id} activity={activity} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card className="bg-gradient-to-br from-zinc-900 to-zinc-800 border-zinc-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-purple-400" />
                  Upcoming Events
                </CardTitle>
                <CardDescription>Your next scheduled events</CardDescription>
              </div>
              <Button asChild size="sm" variant="ghost">
                <Link href={`/dashboard/company/${company.slug}/events`}>
                  View All
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {upcomingEvents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No upcoming events</p>
                <Button asChild className="mt-4" size="sm">
                  <Link href={`/dashboard/company/${company.slug}/events/create`}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Event
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingEvents.map((event) => (
                  <UpcomingEventItem
                    key={event.id}
                    event={event}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Hackathons */}
      <Card className="bg-gradient-to-br from-zinc-900 to-zinc-800 border-zinc-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white flex items-center gap-2">
                <Trophy className="h-5 w-5 text-orange-400" />
                Upcoming Hackathons
              </CardTitle>
              <CardDescription>Your next scheduled hackathons</CardDescription>
            </div>
            <Button asChild size="sm" variant="ghost">
              <Link href={`/dashboard/company/${company.slug}/hackathons`}>
                View All
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {upcomingHackathons.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Trophy className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No upcoming hackathons</p>
              <Button asChild className="mt-4" size="sm">
                <Link href={`/dashboard/company/${company.slug}/hackathons/create`}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Hackathon
                </Link>
              </Button>
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {upcomingHackathons.map((hackathon) => (
                <UpcomingHackathonItem
                  key={hackathon.id}
                  hackathon={hackathon}
                  companySlug={company.slug}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="bg-gradient-to-br from-zinc-900 to-zinc-800 border-zinc-700">
        <CardHeader>
          <CardTitle className="text-white">Quick Actions</CardTitle>
          <CardDescription>Common tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {canManageEvents && (
              <>
                <QuickActionButton
                  href={`/dashboard/company/${company.slug}/events/create`}
                  icon={Calendar}
                  title="Create Event"
                  description="Host a new event"
                />
                <QuickActionButton
                  href={`/dashboard/company/${company.slug}/hackathons/create`}
                  icon={Trophy}
                  title="Create Hackathon"
                  description="Launch a coding challenge"
                />
              </>
            )}
            {canManageTeam && (
              <QuickActionButton
                href={`/dashboard/company/${company.slug}/team`}
                icon={Users}
                title="Invite Team Member"
                description="Add someone to your team"
              />
            )}
            <QuickActionButton
              href={`/dashboard/company/${company.slug}/analytics`}
              icon={BarChart3}
              title="View Analytics"
              description="Track your performance"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Stats Card Component
interface StatsCardProps {
  title: string
  value: number
  icon: React.ComponentType<{ className?: string }>
  iconColor: string
  description: string
  change?: number
  highlight?: boolean
}

function StatsCard({
  title,
  value,
  icon: Icon,
  iconColor,
  description,
  change,
  highlight,
}: StatsCardProps) {
  const isPositive = change && change > 0
  const isNegative = change && change < 0

  return (
    <Card
      className={`bg-gradient-to-br from-zinc-900 to-zinc-800 border-zinc-700 ${
        highlight ? 'ring-2 ring-yellow-400/50' : ''
      }`}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-zinc-200">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${iconColor}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-white">{value.toLocaleString()}</div>
        <div className="flex items-center gap-2 mt-1">
          <p className="text-xs text-muted-foreground">{description}</p>
          {change !== undefined && change !== 0 && (
            <div
              className={`flex items-center text-xs ${
                isPositive ? 'text-green-400' : isNegative ? 'text-red-400' : 'text-zinc-400'
              }`}
            >
              {isPositive && <ArrowUpRight className="h-3 w-3" />}
              {isNegative && <ArrowDownRight className="h-3 w-3" />}
              <span>{Math.abs(change)}%</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Activity Item Component
interface ActivityItemProps {
  activity: RecentActivity
}

function ActivityItem({ activity }: ActivityItemProps) {
  const Icon = activity.icon

  return (
    <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-zinc-800/50 transition-colors">
      <div className={`mt-0.5 ${activity.iconColor}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white">{activity.title}</p>
        <p className="text-sm text-muted-foreground truncate">{activity.description}</p>
        <p className="text-xs text-zinc-500 mt-1">
          {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
        </p>
      </div>
    </div>
  )
}

// Upcoming Event Item Component
interface UpcomingEventItemProps {
  event: UpcomingEvent
}

function UpcomingEventItem({ event }: UpcomingEventItemProps) {
  const registrationPercentage = event.capacity
    ? (event.registrations / event.capacity) * 100
    : 0

  return (
    <div className="block p-3 rounded-lg border border-zinc-800">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white truncate">{event.title}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {format(new Date(event.date), 'MMM dd, yyyy • h:mm a')}
          </p>
          <p className="text-xs text-zinc-500">{event.location}</p>
        </div>
        <Badge variant="secondary" className="text-xs">
          {event.registrations}/{event.capacity || '∞'}
        </Badge>
      </div>
      {event.capacity && (
        <div className="mt-2">
          <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-purple-600 transition-all"
              style={{ width: `${Math.min(registrationPercentage, 100)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

// Upcoming Hackathon Item Component
interface UpcomingHackathonItemProps {
  hackathon: UpcomingHackathon
  companySlug: string
}

function UpcomingHackathonItem({ hackathon, companySlug }: UpcomingHackathonItemProps) {
  return (
    <Link
      href={`/dashboard/company/${companySlug}/hackathons/${hackathon.id}`}
      className="block p-4 rounded-lg border border-zinc-800 hover:border-orange-500 hover:bg-zinc-800/50 transition-all group"
    >
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-orange-500/10 text-orange-400 group-hover:bg-orange-500/20 transition-colors">
          <Trophy className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white truncate group-hover:text-orange-300 transition-colors">
            {hackathon.title}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {format(new Date(hackathon.date), 'MMM dd, yyyy')}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="secondary" className="text-xs capitalize">
              {hackathon.mode || 'Online'}
            </Badge>
            <span className="text-xs text-zinc-500">
              {hackathon.registrations || 0} teams registered
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}

// Quick Action Button Component
interface QuickActionButtonProps {
  href: string
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
}

function QuickActionButton({ href, icon: Icon, title, description }: QuickActionButtonProps) {
  return (
    <Link
      href={href}
      className="flex items-start gap-3 p-4 rounded-lg border border-zinc-700 hover:border-purple-500 hover:bg-zinc-800/50 transition-all group"
    >
      <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 group-hover:bg-purple-500/20 transition-colors">
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-white group-hover:text-purple-300 transition-colors">
          {title}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
    </Link>
  )
}

// Dashboard Skeleton Loader
function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Stats Cards Skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="bg-gradient-to-br from-zinc-900 to-zinc-800 border-zinc-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24 bg-zinc-700" />
              <Skeleton className="h-4 w-4 rounded bg-zinc-700" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 bg-zinc-700" />
              <Skeleton className="h-3 w-32 mt-2 bg-zinc-700" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid Skeleton */}
      <div className="grid gap-6 md:grid-cols-2">
        {[...Array(2)].map((_, i) => (
          <Card key={i} className="bg-gradient-to-br from-zinc-900 to-zinc-800 border-zinc-700">
            <CardHeader>
              <Skeleton className="h-6 w-40 bg-zinc-700" />
              <Skeleton className="h-4 w-32 mt-2 bg-zinc-700" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[...Array(3)].map((_, j) => (
                  <div key={j} className="flex items-start gap-3">
                    <Skeleton className="h-10 w-10 rounded bg-zinc-700" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-full bg-zinc-700" />
                      <Skeleton className="h-3 w-3/4 bg-zinc-700" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions Skeleton */}
      <Card className="bg-gradient-to-br from-zinc-900 to-zinc-800 border-zinc-700">
        <CardHeader>
          <Skeleton className="h-6 w-32 bg-zinc-700" />
          <Skeleton className="h-4 w-48 mt-2 bg-zinc-700" />
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-24 bg-zinc-700 rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
