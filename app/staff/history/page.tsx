'use client'

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/lib/hooks/useAuth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Calendar,
    Clock,
    CheckCircle2,
    XCircle,
    Filter,
    ArrowDownUp,
    Download,
    History as HistoryIcon
} from "lucide-react"
import { Button } from "@/components/ui/button"

type AttendanceRecord = {
    id: string
    user_id: string
    check_in: string
    check_out: string | null
    total_hours: number | null
    status?: string // 'Complete' | 'Pending'
    created_at: string
}

export default function StaffHistoryPage() {
    const { user, loading: authLoading } = useAuth()
    const [history, setHistory] = useState<AttendanceRecord[]>([])
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState({
        totalHours: 0,
        daysPresent: 0,
        averageHours: 0
    })

    const supabase = createClient()

    useEffect(() => {
        if (!user) return

        const fetchData = async () => {
            try {
                const { data, error } = await supabase
                    .from("attendance_logs")
                    .select("*")
                    .eq("user_id", user.id)
                    .order("check_in", { ascending: false })

                if (error) throw error

                const records = data || []
                setHistory(records)

                // Calculate stats
                const totalHours = records.reduce((acc, curr) => acc + (curr.total_hours || 0), 0)
                const daysPresent = records.length
                const averageHours = daysPresent > 0 ? totalHours / daysPresent : 0

                setStats({
                    totalHours,
                    daysPresent,
                    averageHours
                })

            } catch (err) {
                console.error("Error fetching history:", err)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [user, supabase])

    if (authLoading || (loading && !history.length)) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
        )
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-10 px-4 md:px-0">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
                        Attendance <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">History</span>
                    </h1>
                    <p className="text-zinc-400">
                        View and track your past attendance records.
                    </p>
                </div>
                {/* <div className="flex gap-2">
                    <Button variant="outline" className="border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800 text-zinc-300">
                        <Filter className="mr-2 h-4 w-4" /> Filter
                    </Button>
                    <Button variant="outline" className="border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800 text-zinc-300">
                        <Download className="mr-2 h-4 w-4" /> Export
                    </Button>
                </div> */}
            </header>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-sm">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-3 rounded-full bg-blue-500/10 border border-blue-500/20">
                            <Clock className="w-6 h-6 text-blue-400" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-zinc-400">Total Hours</p>
                            <h3 className="text-2xl font-bold text-white">{stats.totalHours.toFixed(2)}h</h3>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-sm">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-3 rounded-full bg-green-500/10 border border-green-500/20">
                            <Calendar className="w-6 h-6 text-green-400" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-zinc-400">Days Present</p>
                            <h3 className="text-2xl font-bold text-white">{stats.daysPresent}</h3>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-sm">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-3 rounded-full bg-purple-500/10 border border-purple-500/20">
                            <HistoryIcon className="w-6 h-6 text-purple-400" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-zinc-400">Avg. Daily Hours</p>
                            <h3 className="text-2xl font-bold text-white">{stats.averageHours.toFixed(2)}h</h3>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* History Table */}
            <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-sm overflow-hidden">
                <CardHeader className="border-b border-zinc-800/50 bg-zinc-900/50">
                    <CardTitle className="text-lg font-medium text-white flex items-center gap-2">
                        <HistoryIcon className="w-5 h-5 text-blue-400" />
                        Detailed Logs
                    </CardTitle>
                </CardHeader>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-zinc-900/80 text-zinc-400 font-medium">
                            <tr className="border-b border-zinc-800">
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Check In</th>
                                <th className="px-6 py-4">Check Out</th>
                                <th className="px-6 py-4">Duration</th>
                                <th className="px-6 py-4">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800">
                            {history.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                                        No attendance records found.
                                    </td>
                                </tr>
                            ) : (
                                history.map((record) => {
                                    const date = new Date(record.check_in).toLocaleDateString(undefined, {
                                        weekday: 'short',
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric'
                                    })
                                    const checkInTime = new Date(record.check_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                    const checkOutTime = record.check_out
                                        ? new Date(record.check_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                        : '-'

                                    const isComplete = !!record.check_out

                                    return (
                                        <tr key={record.id} className="group hover:bg-zinc-800/30 transition-colors">
                                            <td className="px-6 py-4 text-zinc-300 font-medium">{date}</td>
                                            <td className="px-6 py-4 text-zinc-400">{checkInTime}</td>
                                            <td className="px-6 py-4 text-zinc-400">{checkOutTime}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 rounded font-mono text-xs font-medium ${record.total_hours && record.total_hours >= 8
                                                        ? "bg-green-500/10 text-green-400 border border-green-500/20"
                                                        : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                                                    }`}>
                                                    {record.total_hours ? `${record.total_hours.toFixed(2)}h` : '-'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className={`flex items-center gap-1.5 text-xs font-medium ${isComplete ? "text-green-400" : "text-yellow-400"
                                                    }`}>
                                                    {isComplete ? (
                                                        <>
                                                            <CheckCircle2 className="w-4 h-4" />
                                                            Completed
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Clock className="w-4 h-4" />
                                                            Active
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    )
}
