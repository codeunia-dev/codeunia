"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/lib/hooks/useAuth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    Calendar,
    ChevronLeft,
    ChevronRight,
    Clock,
    CalendarDays,
    Info
} from "lucide-react"
import {
    format,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    addWeeks,
    subWeeks,
    isSameDay,
    isToday,
    parseISO,
    isSameMonth
} from "date-fns"

type Shift = {
    id: string
    title: string
    start_time: string
    end_time: string
    type: 'Regular' | 'Overtime' | 'OnCall'
}

type Leave = {
    id: string
    start_date: string
    end_date: string
    leave_type: string
    status: string
}

export default function SchedulePage() {
    const { user, loading: authLoading } = useAuth()
    const [currentDate, setCurrentDate] = useState(new Date())
    const [shifts, setShifts] = useState<Shift[]>([])
    const [leaves, setLeaves] = useState<Leave[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        if (!user) return

        const fetchSchedule = async () => {
            setLoading(true)
            try {
                // Determine date range for current view (give buffer +1/-1 week)
                const start = startOfWeek(subWeeks(currentDate, 1), { weekStartsOn: 1 })
                const end = endOfWeek(addWeeks(currentDate, 1), { weekStartsOn: 1 })

                // Fetch Shifts
                const { data: shiftsData, error: shiftsError } = await supabase
                    .from("shifts")
                    .select("*")
                    .eq("user_id", user.id)
                    .gte("start_time", start.toISOString())
                    .lte("end_time", end.toISOString())

                if (shiftsError && shiftsError.code !== '42P01') throw shiftsError // Ignore table not found for dev

                // Fetch Leaves
                const { data: leavesData, error: leavesError } = await supabase
                    .from("leave_requests")
                    .select("*")
                    .eq("user_id", user.id)
                    .neq("status", "rejected")
                    .gte("end_date", start.toISOString()) // Overlap check simplified

                if (leavesError) throw leavesError

                setShifts(shiftsData || [])
                setLeaves(leavesData || [])

            } catch (err) {
                console.error("Error fetching schedule:", err)
            } finally {
                setLoading(false)
            }
        }

        fetchSchedule()
    }, [user, currentDate, supabase])

    const nextWeek = () => setCurrentDate(addWeeks(currentDate, 1))
    const prevWeek = () => setCurrentDate(subWeeks(currentDate, 1))
    const resetToToday = () => setCurrentDate(new Date())

    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }) // Monday
    const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 })
    const days = eachDayOfInterval({ start: weekStart, end: weekEnd })

    if (authLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
        )
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-10 px-4 md:px-0 pt-6">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
                        My <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Schedule</span>
                    </h1>
                    <p className="text-zinc-400">
                        View your upcoming shifts and time off.
                    </p>
                </div>
                <div className="flex items-center gap-2 bg-zinc-900/50 p-1 rounded-lg border border-zinc-800">
                    <Button variant="ghost" size="icon" onClick={prevWeek} className="h-8 w-8 text-zinc-400 hover:text-white">
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" onClick={resetToToday} className="h-8 text-sm font-medium text-zinc-300 hover:text-white px-3">
                        {format(currentDate, "MMMM yyyy")}
                    </Button>
                    <Button variant="ghost" size="icon" onClick={nextWeek} className="h-8 w-8 text-zinc-400 hover:text-white">
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </header>

            {/* Weekly Calendar Grid */}
            <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                {days.map((day, i) => {
                    const isTodayDate = isToday(day)
                    const isCurrentMonth = isSameMonth(day, currentDate)

                    // Find shifts for this day
                    const dayShifts = shifts.filter(s => isSameDay(parseISO(s.start_time), day))

                    // Find leaves for this day
                    const dayLeaves = leaves.filter(l => {
                        const start = parseISO(l.start_date)
                        const end = parseISO(l.end_date)
                        // Simple check: is day between start and end (inclusive)
                        // Compare just dates to avoid time issues
                        const target = format(day, 'yyyy-MM-dd')
                        return target >= l.start_date && target <= l.end_date
                    })

                    return (
                        <Card
                            key={i}
                            className={`
                                border-zinc-800 backdrop-blur-sm overflow-hidden min-h-[200px] flex flex-col
                                ${isTodayDate ? 'bg-zinc-800/40 border-blue-500/30 ring-1 ring-blue-500/20' : 'bg-zinc-900/50'}
                                ${!isCurrentMonth ? 'opacity-50' : ''}
                            `}
                        >
                            <CardHeader className="p-3 border-b border-zinc-800/50">
                                <div className="flex items-baseline justify-between">
                                    <span className="text-sm font-medium text-zinc-400 uppercase">{format(day, "EEE")}</span>
                                    <span className={`text-lg font-bold ${isTodayDate ? 'text-blue-400' : 'text-zinc-200'}`}>
                                        {format(day, "d")}
                                    </span>
                                </div>
                            </CardHeader>
                            <CardContent className="p-2 flex-1 space-y-2">
                                {/* Shifts */}
                                {dayShifts.map(shift => (
                                    <div key={shift.id} className="bg-blue-600/10 border border-blue-600/20 p-2 rounded text-xs">
                                        <div className="font-semibold text-blue-400 mb-0.5">{shift.title}</div>
                                        <div className="flex items-center gap-1 text-zinc-400">
                                            <Clock className="w-3 h-3" />
                                            {format(parseISO(shift.start_time), "HH:mm")} - {format(parseISO(shift.end_time), "HH:mm")}
                                        </div>
                                    </div>
                                ))}

                                {/* Leaves */}
                                {dayLeaves.map(leave => (
                                    <div key={leave.id} className="bg-yellow-600/10 border border-yellow-600/20 p-2 rounded text-xs">
                                        <div className="font-semibold text-yellow-400 mb-0.5">On Leave</div>
                                        <div className="text-zinc-400">{leave.leave_type}</div>
                                    </div>
                                ))}

                                {/* Empty State (if weekday and no activity) */}
                                {dayShifts.length === 0 && dayLeaves.length === 0 && day.getDay() !== 0 && (
                                    <div className="h-full flex items-center justify-center p-4">
                                        <span className="text-zinc-700 text-xs text-center">—</span>
                                    </div>
                                )}

                                {/* Sunday indicator */}
                                {day.getDay() === 0 && dayShifts.length === 0 && (
                                    <div className="h-full flex flex-col items-center justify-center p-2 opacity-50">
                                        <CalendarDays className="w-6 h-6 text-zinc-700 mb-1" />
                                        <span className="text-zinc-600 text-xs font-medium">Weekly Off</span>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            {/* Legend / Info */}
            <div className="flex gap-6 justify-center md:justify-start text-xs text-zinc-500">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-blue-500/20 border border-blue-500/30"></div>
                    <span>Scheduled Shift</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-yellow-500/20 border border-yellow-500/30"></div>
                    <span>On Leave</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-zinc-800 border-zinc-700"></div>
                    <span>Weekly Off</span>
                </div>
            </div>
        </div>
    )
}
