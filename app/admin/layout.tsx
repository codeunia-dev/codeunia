'use client'
import React, { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sidebar } from "@/components/admin/Sidebar"
import {
  Code2,
  Clock,
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
  ClipboardCheck,
  Award,
  Crown,
  LifeBuoy,
  Building2,
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
        title: "Companies",
        url: "/admin/companies",
        icon: Building2,
      },
      {
        title: "Moderation",
        url: "/admin/moderation",
        icon: Shield,
      },
      {
        title: "Blog Posts",
        url: "/admin/blog-posts",
        icon: FileText,
      },
      {
        title: "Tests",
        url: "/admin/test",
        icon: ClipboardCheck,
      },
      {
        title: "Hackathons",
        url: "/admin/hackathons",
        icon: Calendar,
      },
      {
        title: "Events",
        url: "/admin/events",
        icon: Calendar,
      },
      {
        title: "Internships",
        url: "/admin/internships",
        icon: Handshake,
      },
      {
        title: "Applications",
        url: "/admin/internship-applications",
        icon: ClipboardCheck,
      },
      {
        title: "Certificates",
        url: "/admin/certificates",
        icon: Award,
      },
      {
        title: "Attendance",
        url: "/admin/attendance",
        icon: Clock,
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
      {
        title: "Core Team",
        url: "/admin/forms/core-team",
        icon: Crown,
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
        title: "Support Tickets",
        url: "/admin/support",
        icon: LifeBuoy,
      },
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
  const { user, loading, error, is_admin } = useAuth()

  // Prevent hydration mismatch by using a consistent initial state
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold mb-2 text-red-600">Authentication Error</h1>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button asChild>
            <Link href="/auth/signin">Sign In</Link>
          </Button>
        </div>
      </div>
    )
  }

  if (!is_admin) {
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