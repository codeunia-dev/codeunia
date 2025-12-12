"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    CalendarPlus,
    FileText,
    MessageSquarePlus,
    UserCog,
    HelpCircle,
    FileBadge
} from "lucide-react"
import { ApplyLeaveDialog } from "./ApplyLeaveDialog"

export function QuickActions() {
    const [isApplyLeaveOpen, setIsApplyLeaveOpen] = useState(false)

    const actions = [
        {
            label: "Apply Leave",
            icon: CalendarPlus,
            variant: "default" as const,
            onClick: () => setIsApplyLeaveOpen(true)
        },
        { label: "Submit Report", icon: FileText, variant: "secondary" as const },
        { label: "New Request", icon: MessageSquarePlus, variant: "secondary" as const },
        { label: "Update Profile", icon: UserCog, variant: "ghost" as const },
        { label: "View Policies", icon: FileBadge, variant: "ghost" as const },
        { label: "Get Help", icon: HelpCircle, variant: "ghost" as const },
    ]

    return (
        <>
            <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-sm h-full">
                <CardHeader>
                    <CardTitle className="text-lg font-medium text-white">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-3">
                    {actions.map((action, i) => (
                        <Button
                            key={i}
                            variant={action.variant}
                            onClick={action.onClick}
                            className={`w-full justify-start gap-2 h-auto py-3 ${action.variant === 'secondary' ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300' :
                                action.variant === 'ghost' ? 'hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200' :
                                    'bg-blue-600 hover:bg-blue-500 text-white'
                                }`}
                        >
                            <action.icon className="w-4 h-4" />
                            <span className="truncate">{action.label}</span>
                        </Button>
                    ))}
                </CardContent>
            </Card>

            <ApplyLeaveDialog
                open={isApplyLeaveOpen}
                onOpenChange={setIsApplyLeaveOpen}
            />
        </>
    )
}
