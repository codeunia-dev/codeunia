"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import { Clock, Download, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"

type AttendanceLog = {
    id: string
    user_id: string
    check_in: string
    check_out: string | null
    total_hours: number | null
    profiles: {
        first_name: string | null
        last_name: string | null
        email: string
    } | null
}

export default function AdminAttendancePage() {
    const [logs, setLogs] = useState<AttendanceLog[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const { data, error } = await supabase
                    .from("attendance_logs")
                    .select(`
            *,
            profiles (
              first_name,
              last_name,
              email
            )
          `)
                    .order("check_in", { ascending: false })
                    .limit(50)

                if (error) throw error
                setLogs(data as any) // Type casting simpler for now
            } catch (err) {
                console.error("Error fetching logs:", err)
            } finally {
                setLoading(false)
            }
        }

        fetchLogs()
    }, [supabase])

    const getStatusBadge = (log: AttendanceLog) => {
        if (!log.check_out) {
            return (
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-green-200 dark:border-green-800 flex w-fit items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                    Online
                </Badge>
            )
        }
        return <Badge variant="outline">Completed</Badge>
    }

    return (
        <div className="bg-black space-y-8 md:space-y-14 min-h-screen px-4 py-8 md:px-8 lg:px-16 relative overflow-x-hidden">
            {/* Background Pattern */}
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

            <div className="flex items-center gap-3 pb-6 border-b border-zinc-800/60 relative z-10 mt-2 mb-4">
                <span className="inline-block w-2 h-6 sm:h-8 bg-gradient-to-b from-blue-400 to-cyan-400 rounded-full mr-2" />
                <div>
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white drop-shadow-sm flex items-center gap-3">
                        Attendance
                    </h1>
                    <p className="text-zinc-400 mt-1 font-medium text-sm sm:text-base">Monitor staff work hours and presence</p>
                </div>
            </div>

            <div className="flex justify-end relative z-10">
                <Button variant="outline" className="text-sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                </Button>
            </div>

            <Card className="border-0 shadow-2xl rounded-2xl bg-gradient-to-br from-zinc-900/60 to-zinc-900/40 relative overflow-hidden z-10">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-blue-400" />
                        Attendance Logs
                    </CardTitle>
                    <CardDescription>Real-time log of staff checks in/out events.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border border-zinc-800">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-zinc-800 hover:bg-zinc-900/50">
                                    <TableHead className="text-zinc-400">Staff Member</TableHead>
                                    <TableHead className="text-zinc-400">Status</TableHead>
                                    <TableHead className="text-zinc-400">Check In</TableHead>
                                    <TableHead className="text-zinc-400">Check Out</TableHead>
                                    <TableHead className="text-zinc-400 text-right">Duration</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    [1, 2, 3].map(i => (
                                        <TableRow key={i} className="border-zinc-800">
                                            <TableCell><div className="h-4 w-32 bg-zinc-800 rounded animate-pulse" /></TableCell>
                                            <TableCell><div className="h-4 w-16 bg-zinc-800 rounded animate-pulse" /></TableCell>
                                            <TableCell><div className="h-4 w-24 bg-zinc-800 rounded animate-pulse" /></TableCell>
                                            <TableCell><div className="h-4 w-24 bg-zinc-800 rounded animate-pulse" /></TableCell>
                                            <TableCell><div className="h-4 w-12 bg-zinc-800 rounded animate-pulse ml-auto" /></TableCell>
                                        </TableRow>
                                    ))
                                ) : logs.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center text-zinc-500">
                                            No logs found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    logs.map((log) => (
                                        <TableRow key={log.id} className="border-zinc-800 hover:bg-zinc-900/50">
                                            <TableCell className="font-medium text-zinc-200">
                                                {log.profiles?.first_name
                                                    ? `${log.profiles.first_name} ${log.profiles.last_name || ''}`
                                                    : log.profiles?.email || 'Unknown User'
                                                }
                                            </TableCell>
                                            <TableCell>{getStatusBadge(log)}</TableCell>
                                            <TableCell className="text-zinc-400">
                                                {new Date(log.check_in).toLocaleString()}
                                            </TableCell>
                                            <TableCell className="text-zinc-400">
                                                {log.check_out ? new Date(log.check_out).toLocaleString() : '—'}
                                            </TableCell>
                                            <TableCell className="text-right font-mono text-zinc-300">
                                                {log.total_hours ? `${log.total_hours.toFixed(2)} hrs` : '—'}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
