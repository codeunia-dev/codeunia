"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ModerationQueue } from "@/components/moderation/ModerationQueue"
import { AlertCircle, CheckCircle, Clock, Filter } from "lucide-react"

export default function ModerationPage() {
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch moderation stats
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/admin/moderation/events?limit=1000')
        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            setStats({
              pending: data.data.total,
              approved: 0, // Would need separate endpoint for this
              rejected: 0, // Would need separate endpoint for this
            })
          }
        }
      } catch (error) {
        console.error('Error fetching stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  return (
    <div className="bg-black min-h-screen px-4 py-8 md:px-8 lg:px-16 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-zinc-800/60 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white drop-shadow-sm flex items-center gap-3">
            <span className="inline-block w-2 h-6 sm:h-8 bg-gradient-to-b from-purple-400 to-blue-400 rounded-full mr-2" />
            Event Moderation Queue
          </h1>
          <p className="text-zinc-400 mt-1 font-medium text-sm sm:text-base">
            Review and approve events submitted by companies
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:gap-6 md:gap-8 grid-cols-1 sm:grid-cols-3">
        <Card className="border-0 shadow-2xl rounded-2xl bg-gradient-to-br from-yellow-100/80 to-yellow-200/60 dark:from-yellow-900/60 dark:to-yellow-800/40">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              Pending Review
            </CardTitle>
            <div className="p-2 rounded-xl bg-gradient-to-br from-white/80 to-zinc-100/40 dark:from-zinc-800/80 dark:to-zinc-900/40 shadow-lg">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-zinc-900 dark:text-white">
              {loading ? "..." : stats.pending}
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-300 mt-1">
              Events awaiting approval
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-2xl rounded-2xl bg-gradient-to-br from-green-100/80 to-green-200/60 dark:from-green-900/60 dark:to-green-800/40">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              Approved Today
            </CardTitle>
            <div className="p-2 rounded-xl bg-gradient-to-br from-white/80 to-zinc-100/40 dark:from-zinc-800/80 dark:to-zinc-900/40 shadow-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-zinc-900 dark:text-white">
              {loading ? "..." : stats.approved}
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-300 mt-1">
              Events approved in last 24h
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-2xl rounded-2xl bg-gradient-to-br from-red-100/80 to-red-200/60 dark:from-red-900/60 dark:to-red-800/40">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              Rejected Today
            </CardTitle>
            <div className="p-2 rounded-xl bg-gradient-to-br from-white/80 to-zinc-100/40 dark:from-zinc-800/80 dark:to-zinc-900/40 shadow-lg">
              <AlertCircle className="h-5 w-5 text-red-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-zinc-900 dark:text-white">
              {loading ? "..." : stats.rejected}
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-300 mt-1">
              Events rejected in last 24h
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Moderation Queue */}
      <Card className="border-0 shadow-2xl rounded-2xl bg-gradient-to-br from-zinc-100/80 to-zinc-200/60 dark:from-zinc-900/60 dark:to-zinc-800/40">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <Filter className="h-5 w-5 text-purple-400" />
                Pending Events
              </CardTitle>
              <CardDescription className="text-zinc-500 dark:text-zinc-300 font-medium text-sm">
                Review events and take action
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ModerationQueue />
        </CardContent>
      </Card>
    </div>
  )
}
