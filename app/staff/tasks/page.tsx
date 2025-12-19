"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/lib/hooks/useAuth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    ClipboardList,
    Clock,
    CheckCircle2,
    Circle,
    AlertCircle,
    Calendar,
    ArrowRight,
    Pencil
} from "lucide-react"
import { format } from "date-fns"
import { TaskDialog } from "@/components/staff/TaskDialog"

type Task = {
    id: string
    title: string
    description: string | null
    status: 'todo' | 'in-progress' | 'done'
    priority: 'low' | 'medium' | 'high'
    due_date: string | null
    created_at: string
}

export default function MyTasksPage() {
    const { user, loading: authLoading } = useAuth()
    const [tasks, setTasks] = useState<Task[]>([])
    const [loading, setLoading] = useState(true)

    // Stable supabase instance
    const supabase = useMemo(() => createClient(), []);

    const fetchTasks = useCallback(async () => {
        if (!user) return
        setLoading(true)
        try {
            const { data, error } = await supabase
                .from("tasks")
                .select("*")
                .eq("user_id", user.id)
                .order("due_date", { ascending: true }) // Earliest due first

            if (error && error.code !== '42P01') throw error // Ignore missing table for now

            setTasks(data || [])
        } catch (err) {
            console.error("Error fetching tasks:", err)
        } finally {
            setLoading(false)
        }
    }, [user, supabase])

    useEffect(() => {
        if (!user) return
        fetchTasks()
    }, [user, fetchTasks])

    const updateStatus = async (taskId: string, newStatus: Task['status']) => {
        // Optimistic update
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t))

        try {
            const { error } = await supabase
                .from("tasks")
                .update({ status: newStatus })
                .eq("id", taskId)

            if (error) throw error
        } catch (err) {
            console.error("Error updating status:", err)
            // Revert on error (could fetch again)
            fetchTasks()
        }
    }

    if (authLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
        )
    }

    const columns: { id: Task['status'], title: string, icon: any, color: string }[] = [
        { id: 'todo', title: 'To Do', icon: Circle, color: 'text-zinc-400' },
        { id: 'in-progress', title: 'In Progress', icon: Clock, color: 'text-blue-400' },
        { id: 'done', title: 'Done', icon: CheckCircle2, color: 'text-emerald-400' },
    ]

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-10 px-4 md:px-0 pt-6">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
                        My <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Tasks</span>
                    </h1>
                    <p className="text-zinc-400">
                        Manage your assignments and track progress.
                    </p>
                </div>
                <TaskDialog onTaskSaved={fetchTasks} />
            </header>

            {/* Kanban Board */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {columns.map(col => {
                    const colTasks = tasks.filter(t => t.status === col.id)

                    return (
                        <div key={col.id} className="space-y-4">
                            {/* Column Header */}
                            <div className="flex items-center justify-between p-2 rounded-lg bg-zinc-900/50 border border-zinc-800">
                                <div className="flex items-center gap-2 font-semibold text-zinc-200">
                                    <col.icon className={`w-5 h-5 ${col.color}`} />
                                    {col.title}
                                    <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full">
                                        {colTasks.length}
                                    </span>
                                </div>
                            </div>

                            {/* Task List */}
                            <div className="space-y-3 min-h-[200px]">
                                {colTasks.length === 0 ? (
                                    <div className="h-full border-2 border-dashed border-zinc-800/50 rounded-xl flex items-center justify-center p-8">
                                        <p className="text-zinc-600 text-sm italic">No tasks</p>
                                    </div>
                                ) : (
                                    colTasks.map(task => (
                                        <Card key={task.id} className="bg-zinc-900/80 border-zinc-800/80 hover:border-blue-500/30 transition-all group">
                                            <CardContent className="p-4 space-y-3">
                                                {/* Priority & Due Date & Edit */}
                                                <div className="flex items-center justify-between text-xs">
                                                    <div className="flex items-center gap-2">
                                                        <span className={`
                                                            px-2 py-0.5 rounded font-medium uppercase tracking-wider
                                                            ${task.priority === 'high' ? 'bg-red-500/10 text-red-500' :
                                                                task.priority === 'medium' ? 'bg-orange-500/10 text-orange-400' :
                                                                    'bg-blue-500/10 text-blue-400'}
                                                        `}>
                                                            {task.priority}
                                                        </span>
                                                        {task.due_date && (
                                                            <span className="flex items-center gap-1 text-zinc-500">
                                                                <Calendar className="w-3 h-3" />
                                                                {format(new Date(task.due_date), "MMM d")}
                                                            </span>
                                                        )}
                                                    </div>

                                                    <TaskDialog
                                                        task={task}
                                                        onTaskSaved={fetchTasks}
                                                        trigger={
                                                            <Button size="icon" variant="ghost" className="h-6 w-6 text-zinc-600 hover:text-white hover:bg-zinc-800">
                                                                <Pencil className="w-3 h-3" />
                                                            </Button>
                                                        }
                                                    />
                                                </div>

                                                {/* Content */}
                                                <div>
                                                    <h3 className="font-medium text-zinc-200 group-hover:text-blue-400 transition-colors">
                                                        {task.title}
                                                    </h3>
                                                    {task.description && (
                                                        <p className="text-sm text-zinc-500 mt-1 line-clamp-2">
                                                            {task.description}
                                                        </p>
                                                    )}
                                                </div>

                                                {/* Action Buttons (Move Status) */}
                                                <div className="pt-2 border-t border-zinc-800/50 flex justify-end">
                                                    {task.status === 'todo' && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-7 text-xs hover:bg-blue-500/10 hover:text-blue-400"
                                                            onClick={() => updateStatus(task.id, 'in-progress')}
                                                        >
                                                            Start Working <ArrowRight className="w-3 h-3 ml-1" />
                                                        </Button>
                                                    )}
                                                    {task.status === 'in-progress' && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-7 text-xs hover:bg-emerald-500/10 hover:text-emerald-400"
                                                            onClick={() => updateStatus(task.id, 'done')}
                                                        >
                                                            Mark Done <CheckCircle2 className="w-3 h-3 ml-1" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
