"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/lib/hooks/useAuth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Calendar,
    CalendarClock,
    CheckCircle2,
    XCircle,
    Clock
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { format, differenceInBusinessDays, parseISO } from "date-fns"

type LeaveRequest = {
    id: string
    leave_type: string
    start_date: string
    end_date: string
    reason: string
    status: 'pending' | 'approved' | 'rejected'
    created_at: string
}

export default function MyLeavesPage() {
    const { user, loading: authLoading } = useAuth()
    const [leaves, setLeaves] = useState<LeaveRequest[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        if (!user) return

        const fetchLeaves = async () => {
            try {
                const { data, error } = await supabase
                    .from("leave_requests")
                    .select("*")
                    .eq("user_id", user.id)
                    .order("created_at", { ascending: false })

                if (error) throw error
                setLeaves(data || [])
            } catch (err) {
                console.error("Error fetching leave requests:", err)
            } finally {
                setLoading(false)
            }
        }

        fetchLeaves()
    }, [user, supabase])

    if (authLoading || loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
        )
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-10 px-4 md:px-0">
            <header>
                <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
                    My Leave <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Requests</span>
                </h1>
                <p className="text-zinc-400">
                    Track the status of your leave applications.
                </p>
            </header>

            <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-sm overflow-hidden">
                <CardHeader className="border-b border-zinc-800/50 bg-zinc-900/50">
                    <CardTitle className="text-lg font-medium text-white flex items-center gap-2">
                        <CalendarClock className="w-5 h-5 text-blue-400" />
                        Application History
                    </CardTitle>
                </CardHeader>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-zinc-900/80 text-zinc-400 font-medium">
                            <tr className="border-b border-zinc-800">
                                <th className="px-6 py-4">Applied On</th>
                                <th className="px-6 py-4">Leave Type</th>
                                <th className="px-6 py-4">Duration</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Reason</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800">
                            {leaves.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                                        No leave requests found. start by applying for one!
                                    </td>
                                </tr>
                            ) : (
                                leaves.map((leave) => {
                                    const appliedDate = format(parseISO(leave.created_at), "MMM d, yyyy")
                                    const startDate = format(parseISO(leave.start_date), "MMM d")
                                    const endDate = format(parseISO(leave.end_date), "MMM d, yyyy")
                                    const days = differenceInBusinessDays(parseISO(leave.end_date), parseISO(leave.start_date)) + 1

                                    return (
                                        <tr key={leave.id} className="group hover:bg-zinc-800/30 transition-colors">
                                            <td className="px-6 py-4 text-zinc-400">{appliedDate}</td>
                                            <td className="px-6 py-4">
                                                <Badge variant="outline" className="bg-zinc-800/50 border-zinc-700 text-zinc-300 pointer-events-none">
                                                    {leave.leave_type}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4 text-zinc-300">
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{days} Day{days > 1 ? 's' : ''}</span>
                                                    <span className="text-xs text-zinc-500">{startDate} - {endDate}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full w-fit border ${leave.status === 'approved'
                                                        ? "bg-green-500/30 text-green-300 border-green-500/50"
                                                        : leave.status === 'rejected'
                                                            ? "bg-red-500/30 text-red-300 border-red-500/50"
                                                            : "bg-yellow-500/30 text-yellow-300 border-yellow-500/50"
                                                    }`}>
                                                    {leave.status === 'approved' && <CheckCircle2 className="w-3.5 h-3.5" />}
                                                    {leave.status === 'rejected' && <XCircle className="w-3.5 h-3.5" />}
                                                    {leave.status === 'pending' && <Clock className="w-3.5 h-3.5" />}
                                                    {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-zinc-500 max-w-xs truncate" title={leave.reason}>
                                                {leave.reason}
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
