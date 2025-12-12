"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Clock, CheckCircle2, CalendarDays } from "lucide-react"

export function DashboardStats() {
    const stats = [
        {
            label: "Weekly Hours",
            value: "32.5",
            subtext: "/ 40 hrs target",
            icon: Clock,
            color: "text-blue-400",
            bg: "bg-blue-500/10",
            border: "border-blue-500/20"
        },
        {
            label: "Attendance",
            value: "98%",
            subtext: "On time arrival",
            icon: CheckCircle2,
            color: "text-green-400",
            bg: "bg-green-500/10",
            border: "border-green-500/20"
        },
        {
            label: "Next Shift",
            value: "Mon, 9:00",
            subtext: "Regular Shift",
            icon: CalendarDays,
            color: "text-purple-400",
            bg: "bg-purple-500/10",
            border: "border-purple-500/20"
        }
    ]

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {stats.map((stat, i) => (
                <Card key={i} className="bg-zinc-900/50 border-zinc-800 backdrop-blur-sm hover:bg-zinc-900/80 transition-colors">
                    <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm font-medium text-zinc-400">{stat.label}</p>
                                <div className="mt-2 flex items-baseline gap-2">
                                    <span className="text-2xl font-bold text-white">{stat.value}</span>
                                    <span className="text-xs text-zinc-500">{stat.subtext}</span>
                                </div>
                            </div>
                            <div className={`p-3 rounded-xl ${stat.bg} ${stat.border} border`}>
                                <stat.icon className={`w-5 h-5 ${stat.color}`} />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
