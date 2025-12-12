"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useAuth } from "@/lib/hooks/useAuth"
import { Clock, PlayCircle, StopCircle, Loader2 } from "lucide-react"

type AttendanceRecord = {
    id: string
    check_in: string
    check_out: string | null
}

export function AttendanceWidget() {
    const { user } = useAuth()
    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState(false)
    const [currentSession, setCurrentSession] = useState<AttendanceRecord | null>(null)
    const [elapsedTime, setElapsedTime] = useState<string>("00:00:00")
    const [error, setError] = useState<string | null>(null)

    const supabase = createClient()

    // Fetch current status
    useEffect(() => {
        if (!user) return

        const fetchStatus = async () => {
            try {
                setLoading(true)
                const { data, error } = await supabase
                    .from("attendance_logs")
                    .select("*")
                    .eq("user_id", user.id)
                    .is("check_out", null)
                    .maybeSingle()

                if (error) throw error
                setCurrentSession(data)
            } catch (err: any) {
                console.error("Error fetching attendance:", err)
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }

        fetchStatus()
    }, [user, supabase])

    // Timer for elapsed time
    useEffect(() => {
        if (!currentSession) {
            setElapsedTime("00:00:00")
            return
        }

        const interval = setInterval(() => {
            const start = new Date(currentSession.check_in).getTime()
            const now = new Date().getTime()
            const diff = now - start

            const hours = Math.floor(diff / (1000 * 60 * 60))
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
            const seconds = Math.floor((diff % (1000 * 60)) / 1000)

            setElapsedTime(
                `${hours.toString().padStart(2, "0")}:${minutes
                    .toString()
                    .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
            )
        }, 1000)

        return () => clearInterval(interval)
    }, [currentSession])

    const handleClockIn = async () => {
        if (!user) return
        setError(null)
        try {
            setActionLoading(true)
            const { data, error } = await supabase
                .from("attendance_logs")
                .insert([{ user_id: user.id }])
                .select()
                .single()

            if (error) throw error
            setCurrentSession(data)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setActionLoading(false)
        }
    }

    const handleClockOut = async () => {
        if (!user || !currentSession) return
        setError(null)
        try {
            setActionLoading(true)
            const { error } = await supabase
                .from("attendance_logs")
                .update({ check_out: new Date().toISOString() })
                .eq("id", currentSession.id)

            if (error) throw error
            setCurrentSession(null)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setActionLoading(false)
        }
    }

    if (loading) {
        return (
            <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-sm h-full flex items-center justify-center p-8">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </Card>
        )
    }

    return (
        <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-sm h-full relative overflow-hidden group">
            {/* Ambient Background Glow */}
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full blur-[80px] opacity-20 transition-colors duration-1000 ${currentSession ? 'bg-green-500' : 'bg-blue-500'}`}></div>

            <CardContent className="h-full flex flex-col justify-between p-6 relative z-10">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-zinc-400 font-medium flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            Attendance Status
                        </h3>
                        <div className="mt-1 flex items-center gap-2">
                            <span className={`relative flex h-2.5 w-2.5`}>
                                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${currentSession ? 'bg-green-400' : 'bg-red-400 hidden'}`}></span>
                                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${currentSession ? 'bg-green-500' : 'bg-zinc-500'}`}></span>
                            </span>
                            <span className={`text-sm font-medium ${currentSession ? 'text-green-400' : 'text-zinc-500'}`}>
                                {currentSession ? 'Currently Working' : 'Not Checked In'}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col items-center justify-center py-6">
                    <div className="text-5xl md:text-6xl font-mono font-bold text-white tracking-widest drop-shadow-lg tabular-nums">
                        {elapsedTime}
                    </div>
                    <p className="text-zinc-500 text-xs font-medium uppercase tracking-[0.2em] mt-2">
                        Session Duration
                    </p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 p-2 rounded text-red-400 text-xs text-center mb-2">
                        {error}
                    </div>
                )}

                <div className="mt-auto">
                    {!currentSession ? (
                        <Button
                            onClick={handleClockIn}
                            className="w-full h-14 text-lg bg-blue-600 hover:bg-blue-500 transition-all shadow-[0_0_20px_rgba(37,99,235,0.2)] hover:shadow-[0_0_30px_rgba(37,99,235,0.4)]"
                            disabled={actionLoading}
                        >
                            {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <PlayCircle className="mr-2 w-5 h-5" />}
                            Clock In
                        </Button>
                    ) : (
                        <Button
                            onClick={handleClockOut}
                            variant="destructive"
                            className="w-full h-14 text-lg bg-red-600 hover:bg-red-500 transition-all shadow-[0_0_20px_rgba(220,38,38,0.2)] hover:shadow-[0_0_30px_rgba(220,38,38,0.4)]"
                            disabled={actionLoading}
                        >
                            {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <StopCircle className="mr-2 w-5 h-5" />}
                            Clock Out
                        </Button>
                    )}
                    {currentSession && (
                        <p className="text-center text-xs text-zinc-600 mt-3">
                            Started at {new Date(currentSession.check_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
