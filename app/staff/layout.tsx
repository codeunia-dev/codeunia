'use client'
import type React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { StaffSidebar, SidebarGroupType } from "@/components/staff/StaffSidebar"
import {
    LayoutDashboard,
    History,
    User,
    LogOut,
    CalendarDays,
    ClipboardList,
    MessageSquare,
    Bell,
    FileText,
    Book,
    Settings
} from "lucide-react"
import { useAuth } from "@/lib/hooks/useAuth"

const sidebarItems: SidebarGroupType[] = [
    {
        title: "Main",
        items: [
            {
                title: "Dashboard",
                url: "/staff/dashboard",
                icon: LayoutDashboard,
            },
            {
                title: "My History",
                url: "/staff/history",
                icon: History,
            },
        ],
    },
    {
        title: "Work",
        items: [
            {
                title: "Schedule",
                url: "/staff/schedule",
                icon: CalendarDays,
            },
            {
                title: "My Tasks",
                url: "/staff/tasks",
                icon: ClipboardList,
            },
            {
                title: "My Leaves",
                url: "/staff/leaves",
                icon: CalendarDays,
            },
        ],
    },
    {
        title: "Communication",
        items: [
            {
                title: "Messages",
                url: "/staff/messages",
                icon: MessageSquare,
            },
            {
                title: "Announcements",
                url: "/staff/announcements",
                icon: Bell,
            },
        ],
    },
    {
        title: "Resources",
        items: [
            {
                title: "Documents",
                url: "/staff/documents",
                icon: FileText,
            },
            {
                title: "Guidelines",
                url: "/staff/guidelines",
                icon: Book,
            },
        ],
    },
    {
        title: "Account",
        items: [
            {
                title: "Profile",
                url: "/protected/profile/view",
                icon: User,
            },
            {
                title: "Settings",
                url: "/staff/settings",
                icon: Settings,
            },
        ],
    },
]

export default function StaffLayout({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth()

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-black">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
        )
    }

    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-screen px-4 bg-black text-white">
                <div className="text-center max-w-md">
                    <h1 className="text-2xl font-bold mb-2">Authentication Required</h1>
                    <p className="text-zinc-400 mb-4">Please sign in to access the staff portal.</p>
                    <Button asChild className="bg-blue-600 hover:bg-blue-700">
                        <Link href="/auth/signin">Sign In</Link>
                    </Button>
                </div>
            </div>
        )
    }

    const avatar = user?.user_metadata?.first_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "S"
    const name = user?.user_metadata?.first_name || "Staff Member"
    const email = user?.email || "staff@codeunia.com"

    return (
        <StaffSidebar
            avatar={avatar}
            name={name}
            email={email}
            sidebarItems={sidebarItems}
        >
            <div className="bg-black min-h-screen w-full">
                {children}
            </div>
        </StaffSidebar>
    )
}
