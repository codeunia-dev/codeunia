'use client'

import React, { useState } from 'react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CompanyAnalytics } from '@/types/company'
import { format } from 'date-fns'
import { TrendingUp, Eye, MousePointerClick, Users, Calendar, Download, Trophy } from 'lucide-react'

interface AnalyticsChartsProps {
  analytics: CompanyAnalytics[]
  dateRange: { start: Date; end: Date }
  onExport?: () => void
}

export function AnalyticsCharts({ analytics, dateRange, onExport }: AnalyticsChartsProps) {
  const [chartType, setChartType] = useState<'line' | 'bar' | 'area'>('line')

  // Transform analytics data for charts
  const chartData = analytics.map((record) => ({
    date: format(new Date(record.date), 'MMM dd'),
    fullDate: record.date,
    views: record.total_views,
    clicks: record.total_clicks,
    registrations: record.total_registrations,
    eventsCreated: record.events_created,
    eventsPublished: record.events_published,
    hackathonsCreated: record.hackathons_created,
    hackathonsPublished: record.hackathons_published,
  }))

  // Calculate totals
  const totals = analytics.reduce(
    (acc, record) => ({
      views: acc.views + record.total_views,
      clicks: acc.clicks + record.total_clicks,
      registrations: acc.registrations + record.total_registrations,
      eventsCreated: acc.eventsCreated + record.events_created,
      eventsPublished: acc.eventsPublished + record.events_published,
      hackathonsCreated: acc.hackathonsCreated + record.hackathons_created,
      hackathonsPublished: acc.hackathonsPublished + record.hackathons_published,
    }),
    { views: 0, clicks: 0, registrations: 0, eventsCreated: 0, eventsPublished: 0, hackathonsCreated: 0, hackathonsPublished: 0 }
  )

  // Calculate averages
  const avgViews = analytics.length > 0 ? Math.round(totals.views / analytics.length) : 0
  const avgClicks = analytics.length > 0 ? Math.round(totals.clicks / analytics.length) : 0
  const avgRegistrations =
    analytics.length > 0 ? Math.round(totals.registrations / analytics.length) : 0

  // Calculate click-through rate
  const ctr = totals.views > 0 ? ((totals.clicks / totals.views) * 100).toFixed(2) : '0.00'

  // Calculate conversion rate (registrations / clicks)
  const conversionRate =
    totals.clicks > 0 ? ((totals.registrations / totals.clicks) * 100).toFixed(2) : '0.00'

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <SummaryCard
          title="Total Views"
          value={totals.views}
          average={avgViews}
          icon={Eye}
          iconColor="text-blue-400"
        />
        <SummaryCard
          title="Total Clicks"
          value={totals.clicks}
          average={avgClicks}
          icon={MousePointerClick}
          iconColor="text-purple-400"
        />
        <SummaryCard
          title="Total Registrations"
          value={totals.registrations}
          average={avgRegistrations}
          icon={Users}
          iconColor="text-green-400"
        />
        <SummaryCard
          title="Events Published"
          value={totals.eventsPublished}
          subtitle={`${totals.eventsCreated} created`}
          icon={Calendar}
          iconColor="text-purple-400"
        />
        <SummaryCard
          title="Hackathons Published"
          value={totals.hackathonsPublished}
          subtitle={`${totals.hackathonsCreated} created`}
          icon={Trophy}
          iconColor="text-orange-400"
        />
      </div>

      {/* Engagement Metrics */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-gradient-to-br from-zinc-900 to-zinc-800 border-zinc-700">
          <CardHeader>
            <CardTitle className="text-white text-sm font-medium">Click-Through Rate</CardTitle>
            <CardDescription>Clicks per view</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{ctr}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              {totals.clicks.toLocaleString()} clicks from {totals.views.toLocaleString()} views
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-zinc-900 to-zinc-800 border-zinc-700">
          <CardHeader>
            <CardTitle className="text-white text-sm font-medium">Conversion Rate</CardTitle>
            <CardDescription>Registrations per click</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{conversionRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              {totals.registrations.toLocaleString()} registrations from{' '}
              {totals.clicks.toLocaleString()} clicks
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Event and Hackathon Performance Comparison */}
      <div className="grid gap-4 md:grid-cols-2">
        <EventPerformanceComparison analytics={analytics} />
        <HackathonPerformanceComparison analytics={analytics} />
      </div>

      {/* Main Charts */}
      <Card className="bg-gradient-to-br from-zinc-900 to-zinc-800 border-zinc-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-purple-400" />
                Performance Over Time
              </CardTitle>
              <CardDescription>
                {format(dateRange.start, 'MMM dd, yyyy')} -{' '}
                {format(dateRange.end, 'MMM dd, yyyy')}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 border border-zinc-700 rounded-lg p-1">
                <Button
                  variant={chartType === 'line' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setChartType('line')}
                  className="h-7 px-2"
                >
                  Line
                </Button>
                <Button
                  variant={chartType === 'bar' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setChartType('bar')}
                  className="h-7 px-2"
                >
                  Bar
                </Button>
                <Button
                  variant={chartType === 'area' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setChartType('area')}
                  className="h-7 px-2"
                >
                  Area
                </Button>
              </div>
              {onExport && (
                <Button variant="outline" size="sm" onClick={onExport}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="engagement" className="space-y-4">
            <TabsList className="bg-zinc-800 border-zinc-700">
              <TabsTrigger value="engagement">Overall Engagement</TabsTrigger>
              <TabsTrigger value="events">Events</TabsTrigger>
              <TabsTrigger value="hackathons">Hackathons</TabsTrigger>
            </TabsList>

            <TabsContent value="engagement" className="space-y-4">
              {chartData.length === 0 ? (
                <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                  <p>No data available for the selected date range</p>
                </div>
              ) : chartType === 'line' ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                    <XAxis dataKey="date" stroke="#71717a" style={{ fontSize: '12px' }} />
                    <YAxis stroke="#71717a" style={{ fontSize: '12px' }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="views"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      name="Views"
                      dot={{ fill: '#3b82f6', r: 3 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="clicks"
                      stroke="#a855f7"
                      strokeWidth={2}
                      name="Clicks"
                      dot={{ fill: '#a855f7', r: 3 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="registrations"
                      stroke="#22c55e"
                      strokeWidth={2}
                      name="Registrations"
                      dot={{ fill: '#22c55e', r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : chartType === 'bar' ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                    <XAxis dataKey="date" stroke="#71717a" style={{ fontSize: '12px' }} />
                    <YAxis stroke="#71717a" style={{ fontSize: '12px' }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="views" fill="#3b82f6" name="Views" />
                    <Bar dataKey="clicks" fill="#a855f7" name="Clicks" />
                    <Bar dataKey="registrations" fill="#22c55e" name="Registrations" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                    <XAxis dataKey="date" stroke="#71717a" style={{ fontSize: '12px' }} />
                    <YAxis stroke="#71717a" style={{ fontSize: '12px' }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="views"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      fillOpacity={0.3}
                      name="Views"
                    />
                    <Area
                      type="monotone"
                      dataKey="clicks"
                      stroke="#a855f7"
                      fill="#a855f7"
                      fillOpacity={0.3}
                      name="Clicks"
                    />
                    <Area
                      type="monotone"
                      dataKey="registrations"
                      stroke="#22c55e"
                      fill="#22c55e"
                      fillOpacity={0.3}
                      name="Registrations"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </TabsContent>

            <TabsContent value="events" className="space-y-4">
              {chartData.length === 0 ? (
                <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                  <p>No data available for the selected date range</p>
                </div>
              ) : chartType === 'line' ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                    <XAxis dataKey="date" stroke="#71717a" style={{ fontSize: '12px' }} />
                    <YAxis stroke="#71717a" style={{ fontSize: '12px' }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="eventsCreated"
                      stroke="#eab308"
                      strokeWidth={2}
                      name="Events Created"
                      dot={{ fill: '#eab308', r: 3 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="eventsPublished"
                      stroke="#a855f7"
                      strokeWidth={2}
                      name="Events Published"
                      dot={{ fill: '#a855f7', r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : chartType === 'bar' ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                    <XAxis dataKey="date" stroke="#71717a" style={{ fontSize: '12px' }} />
                    <YAxis stroke="#71717a" style={{ fontSize: '12px' }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="eventsCreated" fill="#eab308" name="Events Created" />
                    <Bar dataKey="eventsPublished" fill="#a855f7" name="Events Published" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                    <XAxis dataKey="date" stroke="#71717a" style={{ fontSize: '12px' }} />
                    <YAxis stroke="#71717a" style={{ fontSize: '12px' }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="eventsCreated"
                      stroke="#eab308"
                      fill="#eab308"
                      fillOpacity={0.3}
                      name="Events Created"
                    />
                    <Area
                      type="monotone"
                      dataKey="eventsPublished"
                      stroke="#a855f7"
                      fill="#a855f7"
                      fillOpacity={0.3}
                      name="Events Published"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </TabsContent>

            <TabsContent value="hackathons" className="space-y-4">
              {chartData.length === 0 ? (
                <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                  <p>No data available for the selected date range</p>
                </div>
              ) : chartType === 'line' ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                    <XAxis dataKey="date" stroke="#71717a" style={{ fontSize: '12px' }} />
                    <YAxis stroke="#71717a" style={{ fontSize: '12px' }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="hackathonsCreated"
                      stroke="#eab308"
                      strokeWidth={2}
                      name="Hackathons Created"
                      dot={{ fill: '#eab308', r: 3 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="hackathonsPublished"
                      stroke="#f97316"
                      strokeWidth={2}
                      name="Hackathons Published"
                      dot={{ fill: '#f97316', r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : chartType === 'bar' ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                    <XAxis dataKey="date" stroke="#71717a" style={{ fontSize: '12px' }} />
                    <YAxis stroke="#71717a" style={{ fontSize: '12px' }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="hackathonsCreated" fill="#eab308" name="Hackathons Created" />
                    <Bar dataKey="hackathonsPublished" fill="#f97316" name="Hackathons Published" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                    <XAxis dataKey="date" stroke="#71717a" style={{ fontSize: '12px' }} />
                    <YAxis stroke="#71717a" style={{ fontSize: '12px' }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="hackathonsCreated"
                      stroke="#eab308"
                      fill="#eab308"
                      fillOpacity={0.3}
                      name="Hackathons Created"
                    />
                    <Area
                      type="monotone"
                      dataKey="hackathonsPublished"
                      stroke="#f97316"
                      fill="#f97316"
                      fillOpacity={0.3}
                      name="Hackathons Published"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

// Summary Card Component
interface SummaryCardProps {
  title: string
  value: number
  average?: number
  subtitle?: string
  icon: React.ComponentType<{ className?: string }>
  iconColor: string
}

function SummaryCard({ title, value, average, subtitle, icon: Icon, iconColor }: SummaryCardProps) {
  return (
    <Card className="bg-gradient-to-br from-zinc-900 to-zinc-800 border-zinc-700">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-zinc-200">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${iconColor}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-white">{value.toLocaleString()}</div>
        {average !== undefined && (
          <p className="text-xs text-muted-foreground mt-1">
            Avg: {average.toLocaleString()} per day
          </p>
        )}
        {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
      </CardContent>
    </Card>
  )
}

// Custom Tooltip Component
interface TooltipPayload {
  color: string
  name: string
  value: number
}

interface CustomTooltipProps {
  active?: boolean
  payload?: TooltipPayload[]
  label?: string
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-3 shadow-lg">
        <p className="text-sm font-medium text-white mb-2">{label}</p>
        {payload.map((entry, index: number) => (
          <div key={index} className="flex items-center gap-2 text-xs">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-zinc-400">{entry.name}:</span>
            <span className="text-white font-medium">{entry.value?.toLocaleString()}</span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

// Event Performance Comparison Component
interface EventPerformanceComparisonProps {
  analytics: CompanyAnalytics[]
}

function EventPerformanceComparison({ analytics }: EventPerformanceComparisonProps) {
  // Calculate performance metrics
  const totalEvents = analytics.reduce((sum, record) => sum + record.events_published, 0)
  const totalViews = analytics.reduce((sum, record) => sum + record.total_views, 0)
  const totalClicks = analytics.reduce((sum, record) => sum + record.total_clicks, 0)
  const totalRegistrations = analytics.reduce((sum, record) => sum + record.total_registrations, 0)

  // Calculate averages per event
  const avgViewsPerEvent = totalEvents > 0 ? Math.round(totalViews / totalEvents) : 0
  const avgClicksPerEvent = totalEvents > 0 ? Math.round(totalClicks / totalEvents) : 0
  const avgRegistrationsPerEvent = totalEvents > 0 ? Math.round(totalRegistrations / totalEvents) : 0

  if (totalEvents === 0) {
    return (
      <Card className="bg-gradient-to-br from-purple-900/20 to-purple-800/10 border-purple-700/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Calendar className="h-5 w-5 text-purple-400" />
            Event Performance Metrics
          </CardTitle>
          <CardDescription>Average performance per published event</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No events published in this period</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-gradient-to-br from-purple-900/20 to-purple-800/10 border-purple-700/50">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Calendar className="h-5 w-5 text-purple-400" />
          Event Performance Metrics
        </CardTitle>
        <CardDescription>Average performance per published event</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-700/30">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Avg Views per Event</p>
              <Eye className="h-4 w-4 text-purple-400" />
            </div>
            <p className="text-2xl font-bold text-white">{avgViewsPerEvent.toLocaleString()}</p>
            <p className="text-xs text-zinc-500 mt-1">
              {totalViews.toLocaleString()} total views across {totalEvents} {totalEvents === 1 ? 'event' : 'events'}
            </p>
          </div>

          <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-700/30">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Avg Clicks per Event</p>
              <MousePointerClick className="h-4 w-4 text-purple-400" />
            </div>
            <p className="text-2xl font-bold text-white">{avgClicksPerEvent.toLocaleString()}</p>
            <p className="text-xs text-zinc-500 mt-1">
              {totalClicks.toLocaleString()} total clicks across {totalEvents} {totalEvents === 1 ? 'event' : 'events'}
            </p>
          </div>

          <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-700/30">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Avg Registrations per Event</p>
              <Users className="h-4 w-4 text-purple-400" />
            </div>
            <p className="text-2xl font-bold text-white">
              {avgRegistrationsPerEvent.toLocaleString()}
            </p>
            <p className="text-xs text-zinc-500 mt-1">
              {totalRegistrations.toLocaleString()} total registrations across {totalEvents} {totalEvents === 1 ? 'event' : 'events'}
            </p>
          </div>
        </div>

        <div className="mt-4 p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
          <div className="flex items-start gap-3">
            <TrendingUp className="h-5 w-5 text-purple-400 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-white">Performance Insights</p>
              <p className="text-xs text-muted-foreground mt-1">
                {totalEvents === 1
                  ? 'You have published 1 event in this period.'
                  : `You have published ${totalEvents} events in this period.`}{' '}
                {avgViewsPerEvent > 100 && 'Your events are getting great visibility! '}
                {avgRegistrationsPerEvent > 10 && 'Strong registration rates indicate high engagement. '}
                {avgClicksPerEvent < avgViewsPerEvent * 0.1 &&
                  'Consider improving your event descriptions to increase click-through rates.'}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Hackathon Performance Comparison Component
interface HackathonPerformanceComparisonProps {
  analytics: CompanyAnalytics[]
}

function HackathonPerformanceComparison({ analytics }: HackathonPerformanceComparisonProps) {
  // Calculate performance metrics
  const totalHackathons = analytics.reduce((sum, record) => sum + record.hackathons_published, 0)
  const totalViews = analytics.reduce((sum, record) => sum + record.total_views, 0)
  const totalClicks = analytics.reduce((sum, record) => sum + record.total_clicks, 0)
  const totalRegistrations = analytics.reduce((sum, record) => sum + record.total_registrations, 0)

  // Calculate averages per hackathon
  const avgViewsPerHackathon = totalHackathons > 0 ? Math.round(totalViews / totalHackathons) : 0
  const avgClicksPerHackathon = totalHackathons > 0 ? Math.round(totalClicks / totalHackathons) : 0
  const avgRegistrationsPerHackathon = totalHackathons > 0 ? Math.round(totalRegistrations / totalHackathons) : 0

  if (totalHackathons === 0) {
    return (
      <Card className="bg-gradient-to-br from-orange-900/20 to-orange-800/10 border-orange-700/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Trophy className="h-5 w-5 text-orange-400" />
            Hackathon Performance Metrics
          </CardTitle>
          <CardDescription>Average performance per published hackathon</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Trophy className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No hackathons published in this period</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-gradient-to-br from-orange-900/20 to-orange-800/10 border-orange-700/50">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Trophy className="h-5 w-5 text-orange-400" />
          Hackathon Performance Metrics
        </CardTitle>
        <CardDescription>Average performance per published hackathon</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-700/30">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Avg Views per Hackathon</p>
              <Eye className="h-4 w-4 text-orange-400" />
            </div>
            <p className="text-2xl font-bold text-white">{avgViewsPerHackathon.toLocaleString()}</p>
            <p className="text-xs text-zinc-500 mt-1">
              {totalViews.toLocaleString()} total views across {totalHackathons} {totalHackathons === 1 ? 'hackathon' : 'hackathons'}
            </p>
          </div>

          <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-700/30">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Avg Clicks per Hackathon</p>
              <MousePointerClick className="h-4 w-4 text-orange-400" />
            </div>
            <p className="text-2xl font-bold text-white">{avgClicksPerHackathon.toLocaleString()}</p>
            <p className="text-xs text-zinc-500 mt-1">
              {totalClicks.toLocaleString()} total clicks across {totalHackathons} {totalHackathons === 1 ? 'hackathon' : 'hackathons'}
            </p>
          </div>

          <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-700/30">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Avg Registrations per Hackathon</p>
              <Users className="h-4 w-4 text-orange-400" />
            </div>
            <p className="text-2xl font-bold text-white">
              {avgRegistrationsPerHackathon.toLocaleString()}
            </p>
            <p className="text-xs text-zinc-500 mt-1">
              {totalRegistrations.toLocaleString()} total registrations across {totalHackathons} {totalHackathons === 1 ? 'hackathon' : 'hackathons'}
            </p>
          </div>
        </div>

        <div className="mt-4 p-4 rounded-lg bg-orange-500/10 border border-orange-500/20">
          <div className="flex items-start gap-3">
            <TrendingUp className="h-5 w-5 text-orange-400 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-white">Performance Insights</p>
              <p className="text-xs text-muted-foreground mt-1">
                {totalHackathons === 1
                  ? 'You have published 1 hackathon in this period.'
                  : `You have published ${totalHackathons} hackathons in this period.`}{' '}
                {avgViewsPerHackathon > 150 && 'Your hackathons are attracting strong interest! '}
                {avgRegistrationsPerHackathon > 15 && 'Excellent team registration rates! '}
                {avgClicksPerHackathon < avgViewsPerHackathon * 0.1 &&
                  'Consider enhancing your hackathon descriptions to boost engagement.'}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
