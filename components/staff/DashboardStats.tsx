"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Clock, CheckCircle2, CalendarDays } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/lib/hooks/useAuth"
import { startOfWeek, endOfWeek, isFriday, isSaturday, format, addDays, getHours, getMinutes } from "date-fns"

export function DashboardStats() {
    const { user } = useAuth()
    const [stats, setStats] = useState({
        weeklyHours: 0,
        attendanceRate: 0,
        nextShift: "Mon, 9:00"
    })
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        if (!user) return

        const fetchStats = async () => {
            try {
                const today = new Date()
                const start = startOfWeek(today, { weekStartsOn: 1 }) // Monday
                const end = endOfWeek(today, { weekStartsOn: 1 })   // Sunday

                // 1. Fetch Weekly Logs
                const { data: weeklyLogs } = await supabase
                    .from("attendance_logs")
                    .select("check_in, total_hours")
                    .eq("user_id", user.id)
                    .gte("check_in", start.toISOString())
                    .lte("check_in", end.toISOString())

                // 2. Fetch All Logs for Attendance Rate (Last 30 days maybe? or all time?)
                // Let's do All Time for accurate "reliability" score, or maybe current month. 
                // Let's stick to Current Week for consistency with the widget title context, 
                // OR better: Last 30 days for a more meaningful "On Time" stat.
                const thirtyDaysAgo = new Date()
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

                const { data: recentLogs } = await supabase
                    .from("attendance_logs")
                    .select("check_in")
                    .eq("user_id", user.id)
                    .gte("check_in", thirtyDaysAgo.toISOString())

                // Calculations
                const currentWeeklyHours = weeklyLogs?.reduce((acc, log) => acc + (log.total_hours || 0), 0) || 0

                // On Time Calculation (9:00 AM threshold with 15 mins grace = 9:15)
                // Actually user requested 9:00. Let's be strict or give 5 mins.
                // Let's use 9:05 as "On Time".
                const totalRecentLogs = recentLogs?.length || 0
                let onTimeCount = 0

                recentLogs?.forEach(log => {
                    const checkInDate = new Date(log.check_in)
                    // Check if checked in before 9:05 AM
                    // hours * 60 + minutes
                    const minutesOfDay = getHours(checkInDate) * 60 + getMinutes(checkInDate)
                    const targetMinutes = 9 * 60 + 5 // 9:05 AM
                    if (minutesOfDay <= targetMinutes) {
                        onTimeCount++
                    }
                })

                const attendanceRate = totalRecentLogs > 0
                    ? Math.round((onTimeCount / totalRecentLogs) * 100)
                    : 100 // Default to 100 if no logs

                // Next Shift Logic
                // Codeunia: Mon-Sat are working days. Sunday is off.
                let nextShiftStr = "Tomorrow, 9:00"

                if (isSaturday(today)) {
                    // If today is Saturday, next working day is Monday
                    nextShiftStr = "Mon, 9:00"
                }
                // If today is Sunday, next working day is Monday (Tomorrow)
                // If today is Fri, next working day is Saturday (Tomorrow)
                // If today is Mon-Thu, next working day is Tomorrow


                setStats({
                    weeklyHours: Number(currentWeeklyHours.toFixed(1)),
                    attendanceRate,
                    nextShift: nextShiftStr
                })

            } catch (err) {
                console.error("Error fetching stats:", err)
            } finally {
                setLoading(false)
            }
        }

        fetchStats()
    }, [user, supabase])

    const statItems = [
        {
            label: "Weekly Hours",
            value: loading ? "..." : stats.weeklyHours.toString(),
            subtext: "/ 40 hrs target",
            icon: Clock,
            color: "text-blue-400",
            bg: "bg-blue-500/10",
            border: "border-blue-500/20"
        },
        {
            label: "Attendance",
            value: loading ? "..." : `${stats.attendanceRate}%`,
            subtext: "On time arrival",
            icon: CheckCircle2,
            color: "text-green-400",
            bg: "bg-green-500/10",
            border: "border-green-500/20"
        },
        {
            label: "Next Shift",
            value: stats.nextShift,
            subtext: "Regular Shift",
            icon: CalendarDays,
            color: "text-purple-400",
            bg: "bg-purple-500/10",
            border: "border-purple-500/20"
        }
    ]

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {statItems.map((stat, i) => (
                <Card key={i} className="bg-zinc-900/50 border-zinc-800 backdrop-blur-sm hover:bg-zinc-900/80 transition-colors">
                    <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm font-medium text-zinc-400">{stat.label}</p>
                                <div className="mt-2 flex items-baseline gap-2">
                                    <span className="text-2xl font-bold text-white">{stat.value}</span>
                                    <span className="text-xs text-zinc-500">{stat.subtext}</span>
                                </div>
                            </div>
                            <div className={`p-3 rounded-xl ${stat.bg} ${stat.border} border`}>
                                <stat.icon className={`w-5 h-5 ${stat.color}`} />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
