'use client'
import type React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { StudentSidebar } from "@/components/users/StudentSidebar"
import {
  LayoutDashboard,
  BookOpen,
  Calendar,
  Shield,
  MessageSquare,
  Trophy,
  Database,
  Target,
  GraduationCap,
  Handshake,
  Heart,
  Award,
  FileText,
  Users,
  Lightbulb,
  Code,
  Briefcase,
  Star,
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
        url: "/protected",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    title: "Learning",
    items: [
      {
        title: "My Courses",
        url: "/protected/courses",
        icon: BookOpen,
      },
      {
        title: "Assignments",
        url: "/protected/assignments",
        icon: FileText,
      },
      {
        title: "Grades & Progress",
        url: "/protected/grades",
        icon: Trophy,
      },
      {
        title: "Study Materials",
        url: "/protected/materials",
        icon: Lightbulb,
      },
    ],
  },
  {
    title: "Activities",
    items: [
      {
        title: "Hackathons",
        url: "/protected/hackathons",
        icon: Code,
      },
      {
        title: "Events & Workshops",
        url: "/protected/events",
        icon: Calendar,
      },
      {
        title: "Projects",
        url: "/protected/projects",
        icon: Briefcase,
      },
      {
        title: "Achievements",
        url: "/protected/achievements",
        icon: Star,
      },
    ],
  },
  {
    title: "Community",
    items: [
      {
        title: "Study Groups",
        url: "/protected/study-groups",
        icon: Users,
      },
      {
        title: "Mentorship",
        url: "/protected/mentorship",
        icon: GraduationCap,
      },
      {
        title: "Collaborations",
        url: "/protected/collaborations",
        icon: Handshake,
      },
      {
        title: "Volunteering",
        url: "/protected/volunteering",
        icon: Heart,
      },
    ],
  },
  {
    title: "Career",
    items: [
      {
        title: "Internships",
        url: "/protected/internships",
        icon: Briefcase,
      },
      {
        title: "Job Opportunities",
        url: "/protected/jobs",
        icon: Target,
      },
      {
        title: "Resume Builder",
        url: "/protected/resume",
        icon: FileText,
      },
      {
        title: "Skills Assessment",
        url: "/protected/skills",
        icon: Award,
      },
    ],
  },
  {
    title: "Analytics",
    items: [
      {
        title: "Learning Progress",
        url: "/protected/progress",
        icon: Database,
      },
      {
        title: "Performance Reports",
        url: "/protected/reports",
        icon: Target,
      },
    ],
  },
  {
    title: "Support",
    items: [
      {
        title: "Messages",
        url: "/protected/messages",
        icon: MessageSquare,
      },
      {
        title: "Help Center",
        url: "/protected/help",
        icon: Shield,
      },
    ],
  },
]

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold mb-2">Authentication Required</h1>
          <p className="text-muted-foreground mb-4">Please sign in to access this page.</p>
          <Button asChild>
            <Link href="/auth/signin">Sign In</Link>
          </Button>
        </div>
      </div>
    )
  }

  const avatar = user?.user_metadata?.first_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "S"
  const name = user?.user_metadata?.first_name || user?.email || "Student"
  const email = user?.email || "student@codeunia.com"

  return (
    <StudentSidebar
      avatar={avatar}
      name={name}
      email={email}
      sidebarItems={sidebarItems}
    >
      <div className="bg-black min-h-screen w-full">
        {children}
      </div>
    </StudentSidebar>
  )
}
