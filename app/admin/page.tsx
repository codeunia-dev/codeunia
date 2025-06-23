"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Users,
  FileText,
  Calendar,
  TrendingUp,
  Activity,
  IndianRupee,
  Eye,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react"

const dashboardStats = [
  {
    title: "Total Users",
    value: "11,111",
    change: "+12.5%",
    trend: "up",
    icon: Users,
    color: "text-blue-600",
    bgColor: "bg-blue-50 dark:bg-blue-950/20",
  },
  {
    title: "Active Projects",
    value: "11,111",
    change: "+8.2%",
    trend: "up",
    icon: FileText,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50 dark:bg-emerald-950/20",
  },
  {
    title: "Monthly Revenue",
    value: "11,111",
    change: "+15.3%",
    trend: "up",
    icon: IndianRupee,
    color: "text-green-600",
    bgColor: "bg-green-50 dark:bg-green-950/20",
  },
  {
    title: "Page Views",
    value: "11,111",
    change: "-2.1%",
    trend: "down",
    icon: Eye,
    color: "text-purple-600",
    bgColor: "bg-purple-50 dark:bg-purple-950/20",
  },
]

const recentActivities = [
  {
    id: 1,
    type: "user_signup",
    message: "New user registered: akshay@gmail.com",
    timestamp: "2 minutes ago",
    status: "success",
  },
  {
    id: 2,
    type: "blog_published",
    message: "Blog post 'React 18 Features' published by Akshay",
    timestamp: "15 minutes ago",
    status: "success",
  },
  {
    id: 3,
    type: "event_created",
    message: "New hackathon 'Summer Challenge 2025' created",
    timestamp: "1 hour ago",
    status: "info",
  },
  {
    id: 4,
    type: "security_alert",
    message: "Multiple failed login attempts detected",
    timestamp: "2 hours ago",
    status: "warning",
  }
]

const topContent = [
  {
    title: "Building Scalable APIs with Node.js",
    views: "12.5K",
    engagement: "94%",
    author: "Akshay Kumar",
    status: "published",
  },
  {
    title: "React 18 Features You Should Know",
    views: "8.2K",
    engagement: "87%",
    author: "Akshay Kumar",
    status: "published",
  },
  {
    title: "Advanced TypeScript Patterns",
    views: "6.8K",
    engagement: "91%",
    author: "Akshay Kumar",
    status: "draft",
  },
  {
    title: "Machine Learning with Python",
    views: "9.1K",
    engagement: "89%",
    author: "Akshay Kumar",
    status: "published",
  },
]

const systemHealth = [
  {
    service: "API Server",
    status: "healthy",
    uptime: "99.9%",
    responseTime: "45ms",
  },
  {
    service: "Database",
    status: "healthy",
    uptime: "99.8%",
    responseTime: "12ms",
  },
  {
    service: "CDN",
    status: "healthy",
    uptime: "100%",
    responseTime: "23ms",
  },
  {
    service: "Email Service",
    status: "warning",
    uptime: "98.5%",
    responseTime: "156ms",
  },
]

export default function AdminDashboard() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [animatedStats, setAnimatedStats] = useState(dashboardStats.map(() => 0))

  useEffect(() => {
   
    localStorage.setItem("isAdmin", "true")

    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

   
    dashboardStats.forEach((stat, i) => {
      const value = parseInt(stat.value.replace(/[^\d]/g, ""))
      const step = Math.ceil(value / 30)
      const interval = setInterval(() => {
        setAnimatedStats((prev) => {
          const updated = [...prev]
          updated[i] = Math.min(updated[i] + step, value)
          return updated
        })
      }, 20)
      setTimeout(() => clearInterval(interval), 600)
    })

    return () => clearInterval(timer)
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case "info":
        return <Activity className="h-4 w-4 text-blue-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getServiceStatusBadge = (status: string) => {
    switch (status) {
      case "healthy":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Healthy</Badge>
      case "warning":
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Warning</Badge>
      case "error":
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">Error</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  return (
    <div className="space-y-14 min-h-screen px-4 py-8 md:px-8 lg:px-16 relative overflow-x-hidden">
     
      <div className="pointer-events-none fixed inset-0 z-0 opacity-60 select-none" aria-hidden>
        <svg width="100%" height="100%" className="w-full h-full">
          <defs>
            <radialGradient id="bgPattern" cx="50%" cy="50%" r="80%">
              <stop offset="0%" stopColor="#a5b4fc" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#818cf8" stopOpacity="0.04" />
            </radialGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#bgPattern)" />
        </svg>
      </div>

      
      <div className="flex items-center justify-between pb-6 border-b border-zinc-800/60 relative z-10">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white drop-shadow-sm flex items-center gap-3">
            <span className="inline-block w-2 h-8 bg-gradient-to-b from-purple-400 to-blue-400 rounded-full mr-2" />
            Dashboard Overview
          </h1>
          <p className="text-zinc-400 mt-1 font-medium">Welcome back! Here&#39;s what&#39;s happening with codeunia today.</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-zinc-400">Current Time</p>
          <p className="text-lg font-semibold text-white bg-zinc-900/60 px-3 py-1 rounded-lg shadow-inner border border-zinc-800 inline-block">
            {currentTime.toLocaleTimeString()}
          </p>
        </div>
      </div>

      
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 relative z-10">
        {dashboardStats.map((stat, i) => (
          <div className="group" key={stat.title}>
            <Card
              className={
                `border-0 shadow-2xl rounded-2xl transition-transform duration-300 hover:-translate-y-2 hover:shadow-[0_8px_32px_0_rgba(99,102,241,0.18)] bg-clip-padding backdrop-blur-xl ` +
                (
                  stat.title === "Total Users"
                    ? "bg-gradient-to-br from-blue-100/80 to-blue-200/60 dark:from-blue-900/60 dark:to-blue-800/40"
                    : stat.title === "Active Projects"
                    ? "bg-gradient-to-br from-emerald-100/80 to-emerald-200/60 dark:from-emerald-900/60 dark:to-emerald-800/40"
                    : stat.title === "Monthly Revenue"
                    ? "bg-gradient-to-br from-green-100/80 to-green-200/60 dark:from-green-900/60 dark:to-green-800/40"
                    : stat.title === "Page Views"
                    ? "bg-gradient-to-br from-purple-100/80 to-purple-200/60 dark:from-purple-900/60 dark:to-purple-800/40"
                    : "bg-white/10 dark:bg-zinc-900/60"
                )
              }
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                <CardTitle className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2 tracking-tight">
                  {stat.title}
                </CardTitle>
                <div className="p-3 rounded-xl bg-gradient-to-br from-white/80 to-zinc-100/40 dark:from-zinc-800/80 dark:to-zinc-900/40 shadow-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <stat.icon className={`h-6 w-6 ${stat.color} drop-shadow`} />
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-3xl font-extrabold text-zinc-900 dark:text-white flex items-end gap-2 tracking-tight">
                  {stat.value.match(/\d/) ? (
                    <span>{animatedStats[i].toLocaleString()}</span>
                  ) : (
                    <span>{stat.value}</span>
                  )}
                </div>
                <div className="flex items-center text-xs mt-1">
                  {stat.trend === "up" ? (
                    <ArrowUpRight className="h-4 w-4 text-green-500 mr-1 animate-bounce" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 text-red-500 mr-1 animate-bounce" />
                  )}
                  <span className={stat.trend === "up" ? "text-green-500 font-semibold" : "text-red-500 font-semibold"}>{stat.change}</span>
                  <span className="ml-1 text-zinc-500">from last month</span>
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>

     
      <div className="flex items-center gap-3 mt-10 mb-2 relative z-10">
        <span className="inline-block w-1.5 h-6 bg-gradient-to-b from-pink-400 to-yellow-400 rounded-full" />
        <h2 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight">Platform Insights</h2>
      </div>

      <div className="grid gap-8 md:grid-cols-2 relative z-10">
      
        <Card className="border-0 shadow-2xl rounded-2xl bg-gradient-to-br from-pink-100/80 to-pink-200/60 dark:from-pink-900/60 dark:to-pink-800/40 relative overflow-hidden group">
          <CardHeader>
            <CardTitle className="flex items-center text-zinc-900 dark:text-zinc-100 font-bold">
              <Activity className="h-5 w-5 mr-2 text-blue-400" />
              Recent Activity
            </CardTitle>
            <CardDescription className="text-zinc-500 dark:text-zinc-300 font-medium">Latest platform activities and events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  {getStatusIcon(activity.status)}
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-semibold leading-none text-zinc-900 dark:text-zinc-100">{activity.message}</p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-300">{activity.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4 border-pink-300 dark:border-pink-700 bg-white/60 dark:bg-zinc-900/60 text-pink-700 dark:text-pink-200 hover:bg-pink-200/40 dark:hover:bg-pink-800/40 transition-colors font-semibold rounded-lg shadow group-hover:scale-105">
              View All Activities
            </Button>
          </CardContent>
        </Card>

       
        <Card className="border-0 shadow-2xl rounded-2xl bg-gradient-to-br from-yellow-100/80 to-yellow-200/60 dark:from-yellow-900/60 dark:to-yellow-800/40 relative overflow-hidden group">
          <CardHeader>
            <CardTitle className="flex items-center text-zinc-900 dark:text-zinc-100 font-bold">
              <Activity className="h-5 w-5 mr-2 text-green-400" />
              System Health
            </CardTitle>
            <CardDescription className="text-zinc-500 dark:text-zinc-300 font-medium">Current status of all system services</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {systemHealth.map((service) => (
                <div key={service.service} className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{service.service}</p>
                    <div className="flex items-center space-x-2 text-xs text-zinc-500 dark:text-zinc-300">
                      <span>Uptime: {service.uptime}</span>
                      <span>•</span>
                      <span>Response: {service.responseTime}</span>
                    </div>
                  </div>
                  {getServiceStatusBadge(service.status)}
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4 border-yellow-300 dark:border-yellow-700 bg-white/60 dark:bg-zinc-900/60 text-yellow-700 dark:text-yellow-200 hover:bg-yellow-200/40 dark:hover:bg-yellow-800/40 transition-colors font-semibold rounded-lg shadow group-hover:scale-105">
              View System Details
            </Button>
          </CardContent>
        </Card>
      </div>

     
      <div className="flex items-center gap-3 mt-10 mb-2 relative z-10">
        <span className="inline-block w-1.5 h-6 bg-gradient-to-b from-cyan-400 to-purple-400 rounded-full" />
        <h2 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight">Top Performing Content</h2>
      </div>

      <Card className="border-0 shadow-2xl rounded-2xl bg-gradient-to-br from-cyan-100/80 to-cyan-200/60 dark:from-cyan-900/60 dark:to-cyan-800/40 relative overflow-hidden group">
        <CardHeader>
          <CardTitle className="flex items-center text-zinc-900 dark:text-zinc-100 font-bold">
            <TrendingUp className="h-5 w-5 mr-2 text-purple-400" />
            Top Performing Content
          </CardTitle>
          <CardDescription className="text-zinc-500 dark:text-zinc-300 font-medium">Most popular blog posts and articles this month</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-zinc-700 dark:text-zinc-200 font-semibold">Title</TableHead>
                <TableHead className="text-zinc-700 dark:text-zinc-200 font-semibold">Author</TableHead>
                <TableHead className="text-zinc-700 dark:text-zinc-200 font-semibold">Views</TableHead>
                <TableHead className="text-zinc-700 dark:text-zinc-200 font-semibold">Engagement</TableHead>
                <TableHead className="text-zinc-700 dark:text-zinc-200 font-semibold">Status</TableHead>
                <TableHead className="text-right text-zinc-700 dark:text-zinc-200 font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topContent.map((content, index) => (
                <TableRow key={index} className="hover:bg-purple-700/10 transition-colors">
                  <TableCell className="font-semibold text-zinc-900 dark:text-zinc-100">{content.title}</TableCell>
                  <TableCell className="text-zinc-800 dark:text-zinc-200">{content.author}</TableCell>
                  <TableCell className="text-zinc-800 dark:text-zinc-200">{content.views}</TableCell>
                  <TableCell className="text-zinc-800 dark:text-zinc-200">{content.engagement}</TableCell>
                  <TableCell>
                    <Badge
                      variant={content.status === "published" ? "default" : "secondary"}
                      className={
                        content.status === "published"
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : "bg-zinc-700 text-zinc-200"
                      }
                    >
                      {content.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="hover:bg-purple-700/20 text-purple-400 font-semibold">
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      
      <div className="flex items-center gap-3 mt-10 mb-2 relative z-10">
        <span className="inline-block w-1.5 h-6 bg-gradient-to-b from-blue-400 to-pink-400 rounded-full" />
        <h2 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight">Quick Actions</h2>
      </div>

      <div className="grid gap-8 md:grid-cols-3 relative z-10">
        <Card className="border-0 shadow-2xl rounded-2xl bg-gradient-to-br from-blue-200/80 to-indigo-200/60 dark:from-blue-900/60 dark:to-indigo-800/40 card-hover cursor-pointer transition-transform duration-300 hover:-translate-y-2 hover:shadow-[0_8px_32px_0_rgba(99,102,241,0.18)] relative overflow-hidden group">
          <CardHeader className="text-center relative z-10">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-xl group-hover:scale-110 transition-transform">
              <FileText className="h-8 w-8 text-white drop-shadow" />
            </div>
            <CardTitle className="text-lg text-zinc-900 dark:text-white font-bold">Create Blog Post</CardTitle>
            <CardDescription className="text-zinc-700 dark:text-zinc-200 font-medium">Write and publish new content</CardDescription>
          </CardHeader>
        </Card>

        <Card className="border-0 shadow-2xl rounded-2xl bg-gradient-to-br from-emerald-200/80 to-teal-200/60 dark:from-emerald-900/60 dark:to-teal-800/40 card-hover cursor-pointer transition-transform duration-300 hover:-translate-y-2 hover:shadow-[0_8px_32px_0_rgba(16,185,129,0.18)] relative overflow-hidden group">
          <CardHeader className="text-center relative z-10">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-xl group-hover:scale-110 transition-transform">
              <Calendar className="h-8 w-8 text-white drop-shadow" />
            </div>
            <CardTitle className="text-lg text-zinc-900 dark:text-white font-bold">Schedule Event</CardTitle>
            <CardDescription className="text-zinc-700 dark:text-zinc-200 font-medium">Create new hackathons and workshops</CardDescription>
          </CardHeader>
        </Card>

        <Card className="border-0 shadow-2xl rounded-2xl bg-gradient-to-br from-purple-200/80 to-pink-200/60 dark:from-purple-900/60 dark:to-pink-800/40 card-hover cursor-pointer transition-transform duration-300 hover:-translate-y-2 hover:shadow-[0_8px_32px_0_rgba(168,85,247,0.18)] relative overflow-hidden group">
          <CardHeader className="text-center relative z-10">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-xl group-hover:scale-110 transition-transform">
              <Users className="h-8 w-8 text-white drop-shadow" />
            </div>
            <CardTitle className="text-lg text-zinc-900 dark:text-white font-bold">Manage Users</CardTitle>
            <CardDescription className="text-zinc-700 dark:text-zinc-200 font-medium">View and moderate user accounts</CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  )
}