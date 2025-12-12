"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

export function WeeklyOverview() {
    // Mock data - would ideally come from DB
    const days = [
        { day: "Mon", hours: 8.5 },
        { day: "Tue", hours: 7.2 },
        { day: "Wed", hours: 8.0 },
        { day: "Thu", hours: 6.5 },
        { day: "Fri", hours: 2.3 }, // Current day partially filled
        { day: "Sat", hours: 0 },
        { day: "Sun", hours: 0 },
    ]

    const maxHours = 10

    return (
        <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-sm h-full">
            <CardHeader>
                <CardTitle className="text-lg font-medium text-white">Weekly Activity</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex items-end justify-between gap-2 h-[140px] mt-2">
                    {days.map((d, i) => {
                        const height = (d.hours / maxHours) * 100
                        return (
                            <div key={i} className="flex flex-col items-center gap-2 flex-1 group cursor-pointer">
                                <div className="w-full relative flex-1 bg-zinc-800/50 rounded-lg overflow-hidden flex items-end">
                                    <div
                                        className={`w-full transition-all duration-500 rounded-lg ${d.hours > 0 ? 'bg-blue-600 group-hover:bg-blue-500' : 'bg-transparent'
                                            }`}
                                        style={{ height: `${height}%` }}
                                    ></div>

                                    {/* Tooltip */}
                                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-800 text-xs px-2 py-1 rounded border border-zinc-700 whitespace-nowrap z-10">
                                        {d.hours} hrs
                                    </div>
                                </div>
                                <span className={`text-xs font-medium ${d.hours > 0 ? 'text-zinc-300' : 'text-zinc-600'}`}>
                                    {d.day}
                                </span>
                            </div>
                        )
                    })}
                </div>
            </CardContent>
        </Card>
    )
}
