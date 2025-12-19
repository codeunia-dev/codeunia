"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/lib/hooks/useAuth"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Plus, Loader2, Pencil } from "lucide-react"

type Task = {
    id: string
    title: string
    description: string | null
    status: 'todo' | 'in-progress' | 'done'
    priority: 'low' | 'medium' | 'high'
    due_date: string | null
}

interface TaskDialogProps {
    task?: Task // If provided, we are in Edit mode
    trigger?: React.ReactNode
    onTaskSaved: () => void
}

export function TaskDialog({ task, trigger, onTaskSaved }: TaskDialogProps) {
    const { user } = useAuth()
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const supabase = createClient()

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        priority: "medium" as "low" | "medium" | "high",
        due_date: "",
    })

    // Initialize form if in Edit mode
    useEffect(() => {
        if (task && open) {
            setFormData({
                title: task.title,
                description: task.description || "",
                priority: task.priority,
                due_date: task.due_date ? task.due_date.split('T')[0] : "",
            })
        }
    }, [task, open])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!user) return

        if (!formData.title.trim()) {
            toast.error("Please enter a task title")
            return
        }

        setLoading(true)
        try {
            let isoDate = null;
            if (formData.due_date) {
                const dateObj = new Date(formData.due_date);
                if (!isNaN(dateObj.getTime())) {
                    isoDate = dateObj.toISOString();
                }
            }

            if (task?.id) {
                // UPDATE Mode
                const { error } = await supabase
                    .from("tasks")
                    .update({
                        title: formData.title.trim(),
                        description: formData.description.trim() || null,
                        priority: formData.priority,
                        due_date: isoDate,
                    })
                    .eq("id", task.id)

                if (error) throw error
                toast.success("Task updated!")
            } else {
                // CREATE Mode
                const { error } = await supabase
                    .from("tasks")
                    .insert({
                        user_id: user.id,
                        title: formData.title.trim(),
                        description: formData.description.trim() || null,
                        priority: formData.priority,
                        status: "todo",
                        due_date: isoDate,
                    })

                if (error) throw error
                toast.success("Task created!")
            }

            setOpen(false)
            onTaskSaved()

            // Clear form only on create
            if (!task) {
                setFormData({
                    title: "",
                    description: "",
                    priority: "medium",
                    due_date: "",
                })
            }
        } catch (err: any) {
            console.error("Error saving task:", err)
            toast.error(err.message || "Failed to save task")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
                        <Plus className="w-4 h-4" />
                        New Task
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-zinc-950 border-zinc-800 text-white">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold">
                        {task ? "Edit Task" : "Create New Task"}
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                    <div className="space-y-2">
                        <Label htmlFor="title" className="text-zinc-400">Task Title</Label>
                        <Input
                            id="title"
                            placeholder="e.g., Update staff guidelines"
                            className="bg-zinc-900/50 border-zinc-800 text-white focus:ring-blue-500/20"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description" className="text-zinc-400">Description (Optional)</Label>
                        <Textarea
                            id="description"
                            placeholder="Add more details about this task..."
                            className="bg-zinc-900/50 border-zinc-800 text-white focus:ring-blue-500/20 min-h-[100px]"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="priority" className="text-zinc-400">Priority</Label>
                            <Select
                                value={formData.priority}
                                onValueChange={(val: any) => setFormData({ ...formData, priority: val })}
                            >
                                <SelectTrigger className="bg-zinc-900/50 border-zinc-800 text-white">
                                    <SelectValue placeholder="Select priority" />
                                </SelectTrigger>
                                <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                                    <SelectItem value="low">Low</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="high">High</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="due_date" className="text-zinc-400">Due Date</Label>
                            <Input
                                id="due_date"
                                type="date"
                                className="bg-zinc-900/50 border-zinc-800 text-white focus:ring-blue-500/20"
                                value={formData.due_date}
                                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setOpen(false)}
                            className="text-zinc-400 hover:text-white hover:bg-zinc-900"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="bg-blue-600 hover:bg-blue-700 text-white min-w-[100px]"
                        >
                            {loading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                task ? "Save Changes" : "Create Task"
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
