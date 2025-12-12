"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/lib/hooks/useAuth"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

interface ApplyLeaveDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function ApplyLeaveDialog({ open, onOpenChange }: ApplyLeaveDialogProps) {
    const { user } = useAuth()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        leaveType: "",
        startDate: "",
        endDate: "",
        reason: ""
    })

    const supabase = createClient()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!user) return

        if (!formData.leaveType || !formData.startDate || !formData.endDate || !formData.reason) {
            toast.error("Please fill in all fields")
            return
        }

        setLoading(true)
        try {
            const { error } = await supabase
                .from("leave_requests")
                .insert({
                    user_id: user.id,
                    leave_type: formData.leaveType,
                    start_date: formData.startDate,
                    end_date: formData.endDate,
                    reason: formData.reason
                })

            if (error) throw error

            toast.success("Leave application submitted successfully")
            onOpenChange(false)
            setFormData({ leaveType: "", startDate: "", endDate: "", reason: "" }) // Reset
        } catch (error) {
            console.error("Error applying for leave:", error)
            toast.error("Failed to apply for leave")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px] bg-zinc-950 border-zinc-800 text-white">
                <DialogHeader>
                    <DialogTitle>Apply for Leave</DialogTitle>
                    <DialogDescription className="text-zinc-400">
                        Submit a new leave request for approval.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    <div className="space-y-2">
                        <Label htmlFor="leave-type" className="text-zinc-300">Leave Type</Label>
                        <Select
                            value={formData.leaveType}
                            onValueChange={(value) => setFormData(prev => ({ ...prev, leaveType: value }))}
                        >
                            <SelectTrigger id="leave-type" className="bg-zinc-900 border-zinc-700 text-white">
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-900 border-zinc-700 text-white">
                                <SelectItem value="Sick">Sick Leave</SelectItem>
                                <SelectItem value="Casual">Casual Leave</SelectItem>
                                <SelectItem value="Emergency">Emergency Leave</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="start-date" className="text-zinc-300">Start Date</Label>
                            <Input
                                id="start-date"
                                type="date"
                                className="bg-zinc-900 border-zinc-700 text-white"
                                value={formData.startDate}
                                onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="end-date" className="text-zinc-300">End Date</Label>
                            <Input
                                id="end-date"
                                type="date"
                                className="bg-zinc-900 border-zinc-700 text-white"
                                value={formData.endDate}
                                onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="reason" className="text-zinc-300">Reason</Label>
                        <Textarea
                            id="reason"
                            placeholder="Please provide a reason..."
                            className="bg-zinc-900 border-zinc-700 text-white resize-none h-24"
                            value={formData.reason}
                            onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                        />
                    </div>

                    <DialogFooter className="mt-6">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => onOpenChange(false)}
                            className="text-zinc-400 hover:text-white hover:bg-zinc-800"
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-500 text-white"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Submitting...
                                </>
                            ) : (
                                "Submit Application"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
