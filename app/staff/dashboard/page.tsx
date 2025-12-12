"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/hooks/useAuth"
import { createClient } from "@/lib/supabase/client"
import { AttendanceWidget } from "@/components/staff/AttendanceWidget"
import { DashboardStats } from "@/components/staff/DashboardStats"
import { QuickActions } from "@/components/staff/QuickActions"
import { WeeklyOverview } from "@/components/staff/WeeklyOverview"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { History, Calendar } from "lucide-react"

type HistoryRecord = {
    id: string
    check_in: string
    check_out: string | null
    total_hours: number | null
}

export default function StaffDashboardPage() {
    const { user, loading } = useAuth()
    const [history, setHistory] = useState<HistoryRecord[]>([])
    const [historyLoading, setHistoryLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        if (!user) return

        const fetchHistory = async () => {
            try {
                const { data, error } = await supabase
                    .from("attendance_logs")
                    .select("*")
                    .eq("user_id", user.id)
                    .not("check_out", "is", null)
                    .order("check_in", { ascending: false })
                    .limit(5)

                if (error) throw error
                setHistory(data || [])
            } catch (err) {
                console.error("Error fetching history:", err)
            } finally {
                setHistoryLoading(false)
            }
        }

        fetchHistory()
    }, [user, supabase])

    if (loading) return null

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-10">
            {/* Header Section */}
            <header className="relative z-10">
                <h1 className="text-4xl font-bold tracking-tight text-white mb-2">
                    Staff <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Dashboard</span>
                </h1>
                <p className="text-zinc-400 text-lg">
                    Welcome back, <span className="text-zinc-200 font-medium">{user?.user_metadata?.first_name || 'Staff Member'}</span>.
                    Manage your workflow and track your progress.
                </p>
            </header>

            {/* Stats Row */}
            <DashboardStats />

            {/* Bento Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 auto-rows-[minmax(180px,auto)]">

                {/* Main Attendance Widget - Spans 2 cols, 2 rows */}
                <div className="lg:col-span-2 lg:row-span-2 h-full min-h-[400px]">
                    <AttendanceWidget />
                </div>

                {/* Quick Actions - 1 col, 1 row */}
                <div className="lg:col-span-1 lg:row-span-1">
                    <QuickActions />
                </div>

                {/* Weekly Overview - 1 col, 1 row */}
                <div className="lg:col-span-1 lg:row-span-1">
                    <WeeklyOverview />
                </div>

                {/* Recent Activity - Full width on mobile/tablet, bottom on desktop */}
                <Card className="lg:col-span-3 bg-zinc-900/50 border-zinc-800 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-xl text-white">
                            <History className="h-5 w-5 text-blue-400" />
                            Recent Activity Log
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {historyLoading ? (
                            <div className="space-y-3">
                                {[1, 2, 3].map(i => <div key={i} className="h-14 bg-zinc-800/50 rounded-lg animate-pulse" />)}
                            </div>
                        ) : history.length === 0 ? (
                            <div className="text-center py-10 text-zinc-500">
                                <Calendar className="h-10 w-10 mx-auto mb-3 opacity-20" />
                                <p>No recent activity found</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {history.map(record => (
                                    <div key={record.id} className="bg-zinc-900/80 border border-zinc-800/60 rounded-xl p-4 flex justify-between items-center transition-all hover:border-zinc-700 hover:bg-zinc-800/50 group">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20 group-hover:border-blue-500/40 transition-colors">
                                                <Calendar className="w-5 h-5 text-blue-400" />
                                            </div>
                                            <div>
                                                <div className="font-medium text-sm text-zinc-200">
                                                    {new Date(record.check_in).toLocaleDateString()}
                                                </div>
                                                <div className="text-xs text-zinc-500">
                                                    {new Date(record.check_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -
                                                    {record.check_out ? new Date(record.check_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '...'}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-blue-400 font-mono font-bold text-sm bg-blue-500/10 px-2 py-1 rounded">
                                                {record.total_hours ? `${record.total_hours.toFixed(2)}h` : '-'}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
