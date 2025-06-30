'use client'
import type React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sidebar } from "@/components/admin/Sidebar"
import {
  Code2,
  LayoutDashboard,
  Users,
  FileText,
  Calendar,
  BarChart3,
  Settings,
  Shield,
  MessageSquare,
  Trophy,
  Database,
  Handshake,
  Target,
  GraduationCap,
  Gavel,
  HandHeart,
} from "lucide-react"
import { useAuth } from "@/lib/hooks/useAuth"


export type SidebarGroupType = {
  title: string;
  items: {
    title: string;
    url: string;
    icon: React.ElementType;
  }[];
};

const sidebarItems: SidebarGroupType[] = [
  {
    title: "Dashboard",
    items: [
      {
        title: "Overview",
        url: "/admin",
        icon: Code2,
      },
    ],
  },
  {
    title: "Management",
    items: [
      {
        title: "Users",
        url: "/admin/users",
        icon: Users,
      },
      {
        title: "Blog Posts",
        url: "/admin/blog-posts",
        icon: FileText,
      },
      {
        title: "Events",
        url: "/admin/events",
        icon: Calendar,
      },
    ],
  },
  {
    title: "Form Entries",
    items: [
      {
        title: "Collaboration",
        url: "/admin/forms/collaboration",
        icon: Handshake,
      },
      {
        title: "Sponsorship",
        url: "/admin/forms/sponsorship",
        icon: Target,
      },
      {
        title: "Mentor",
        url: "/admin/forms/mentor",
        icon: GraduationCap,
      },
      {
        title: "Judges",
        url: "/admin/forms/judges",
        icon: Gavel,
      },
      {
        title: "Volunteer",
        url: "/admin/forms/volunteer",
        icon: HandHeart,
      },
    ],
  },
  {
    title: "Analytics",
    items: [
      {
        title: "Reports",
        url: "/admin/reports",
        icon: BarChart3,
      },
      {
        title: "Statistics",
        url: "/admin/statistics",
        icon: Database,
      },
    ],
  },
  {
    title: "Settings",
    items: [
      {
        title: "General",
        url: "/admin/settings",
        icon: Settings,
      },
      {
        title: "Roles & Permissions",
        url: "/admin/roles",
        icon: Shield,
      },
      {
        title: "System",
        url: "/admin/system",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    title: "Support",
    items: [
      {
        title: "Messages",
        url: "/admin/messages",
        icon: MessageSquare,
      },
      {
        title: "Leaderboard",
        url: "/admin/leaderboard",
        icon: Trophy,
      },
    ],
  },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, isAdmin } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold mb-2">Unauthorized</h1>
          <p className="text-muted-foreground mb-4">You do not have access to this page.</p>
          <Button asChild>
            <Link href="/">Go Home</Link>
          </Button>
        </div>
      </div>
    )
  }


  const avatar = user?.user_metadata?.first_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "A"
  const name = user?.user_metadata?.first_name || user?.email || "Admin"
  const email = user?.email || "admin@codeunia.com"
  const role = user?.user_metadata?.role || "Admin"

  return (
    <Sidebar
      avatar={avatar}
      name={name}
      email={email}
      role={role}
      sidebarItems={sidebarItems}
    >
      <div className="bg-black min-h-screen w-full">
        {children}
      </div>
    </Sidebar>
  )
}