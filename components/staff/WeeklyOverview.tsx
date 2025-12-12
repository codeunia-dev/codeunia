"use client"

import { useEffect, useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/lib/hooks/useAuth"
import { startOfWeek, endOfWeek, eachDayOfInterval, format, isSameDay } from "date-fns"

type DailyStat = {
    day: string
    date: Date
    hours: number
    isToday: boolean
}

export function WeeklyOverview() {
    const { user } = useAuth()
    const [weeklyStats, setWeeklyStats] = useState<DailyStat[]>([])
    const [loading, setLoading] = useState(true)
    const [maxHours, setMaxHours] = useState(10)

    const supabase = createClient()

    useEffect(() => {
        if (!user) return

        const fetchWeeklyData = async () => {
            try {
                // 1. Determine Date Range (Mon-Sun)
                const today = new Date()
                const start = startOfWeek(today, { weekStartsOn: 1 }) // Monday
                const end = endOfWeek(today, { weekStartsOn: 1 })   // Sunday

                // 2. Fetch Logs
                const { data, error } = await supabase
                    .from("attendance_logs")
                    .select("check_in, total_hours")
                    .eq("user_id", user.id)
                    .gte("check_in", start.toISOString())
                    .lte("check_in", end.toISOString())

                if (error) throw error

                // 3. Process Data
                const daysInWeek = eachDayOfInterval({ start, end })

                const stats: DailyStat[] = daysInWeek.map(day => {
                    // Find all logs for this specific day
                    const dayLogs = data?.filter(log => {
                        const match = isSameDay(new Date(log.check_in), day)
                        return match
                    }) || []

                    // Sum total hours (handle potential nulls)
                    const totalHours = dayLogs.reduce((acc, log) => acc + (log.total_hours || 0), 0)

                    return {
                        day: format(day, "EEE"), // Mon, Tue...
                        date: day,
                        hours: Number(totalHours.toFixed(1)),
                        isToday: isSameDay(day, today)
                    }
                })

                setWeeklyStats(stats)

                // Dynamic max scale (at least 8, or highest day + buffer)
                const highestDay = Math.max(...stats.map(s => s.hours))
                setMaxHours(Math.max(8, Math.ceil(highestDay * 1.2)))

            } catch (err) {
                console.error("Error fetching weekly overview:", err)
            } finally {
                setLoading(false)
            }
        }

        fetchWeeklyData()
    }, [user, supabase])

    if (loading) {
        return (
            <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-sm h-full flex items-center justify-center min-h-[200px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </Card>
        )
    }

    return (
        <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-sm h-full">
            <CardHeader>
                <CardTitle className="text-lg font-medium text-white flex justify-between items-center">
                    Weekly Activity
                    <span className="text-xs font-normal text-zinc-500 bg-zinc-800/50 px-2 py-1 rounded">Current Week</span>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex justify-between gap-2 h-[140px] mt-2">
                    {weeklyStats.map((d, i) => {
                        const height = Math.min((d.hours / maxHours) * 100, 100)
                        return (
                            <div key={i} className="flex flex-col items-center gap-2 flex-1 group cursor-default h-full">
                                <div className="w-full relative flex-1 bg-zinc-800/30 rounded-lg overflow-hidden flex items-end">
                                    <div
                                        className={`w-full transition-all duration-700 ease-out rounded-t-lg ${d.isToday
                                            ? 'bg-purple-500/80 group-hover:bg-purple-400'
                                            : d.hours > 0
                                                ? 'bg-blue-600/80 group-hover:bg-blue-500'
                                                : 'bg-transparent'
                                            }`}
                                        style={{ height: `${height}%` }}
                                    ></div>

                                    {/* Tooltip */}
                                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-900 text-xs px-2 py-1 rounded border border-zinc-700 whitespace-nowrap z-10 shadow-xl pointer-events-none">
                                        <span className="font-bold text-white">{d.hours}</span> hrs
                                        <div className="text-[10px] text-zinc-400">{format(d.date, "MMM d")}</div>
                                    </div>
                                </div>
                                <span className={`text-xs font-medium ${d.isToday ? 'text-purple-400' : d.hours > 0 ? 'text-zinc-300' : 'text-zinc-600'}`}>
                                    {d.day}
                                </span>
                            </div>
                        )
                    })}
                </div>
            </CardContent>
        </Card>
    )
}
