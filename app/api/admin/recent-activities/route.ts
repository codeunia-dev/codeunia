import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
    try {
        const supabase = await createClient()

        // Check if user is admin
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { data: profile } = await supabase
            .from("profiles")
            .select("is_admin")
            .eq("id", user.id)
            .single()

        if (!profile?.is_admin) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }

        const activities: Array<{
            type: string
            message: string
            timestamp: string
            status: string
            created_at: string
        }> = []

        // Fetch recent user signups (last 7 days to ensure we have data)
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

        const { data: recentUsers } = await supabase
            .from("profiles")
            .select("email, created_at")
            .gte("created_at", sevenDaysAgo)
            .order("created_at", { ascending: false })
            .limit(3)

        if (recentUsers) {
            recentUsers.forEach(user => {
                activities.push({
                    type: "user_signup",
                    message: `New user registered: ${user.email}`,
                    timestamp: getTimeAgo(user.created_at),
                    status: "success",
                    created_at: user.created_at
                })
            })
        }

        // Fetch recent blog posts
        const { data: recentBlogs } = await supabase
            .from("blogs")
            .select("title, author, date")
            .order("date", { ascending: false })
            .limit(3)

        if (recentBlogs) {
            recentBlogs.forEach(blog => {
                activities.push({
                    type: "blog_published",
                    message: `Blog post "${blog.title}" published by ${blog.author}`,
                    timestamp: getTimeAgo(blog.date),
                    status: "success",
                    created_at: blog.date
                })
            })
        }

        // Fetch recent events
        const { data: recentEvents } = await supabase
            .from("events")
            .select("title, created_at")
            .order("created_at", { ascending: false })
            .limit(2)

        if (recentEvents) {
            recentEvents.forEach(event => {
                activities.push({
                    type: "event_created",
                    message: `New event "${event.title}" created`,
                    timestamp: getTimeAgo(event.created_at),
                    status: "info",
                    created_at: event.created_at
                })
            })
        }

        // Fetch recent hackathons
        const { data: recentHackathons } = await supabase
            .from("hackathons")
            .select("title, created_at")
            .order("created_at", { ascending: false })
            .limit(2)

        if (recentHackathons) {
            recentHackathons.forEach(hackathon => {
                activities.push({
                    type: "event_created",
                    message: `New hackathon "${hackathon.title}" created`,
                    timestamp: getTimeAgo(hackathon.created_at),
                    status: "info",
                    created_at: hackathon.created_at
                })
            })
        }

        // Sort all activities by timestamp and limit to 5
        activities.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        const topActivities = activities.slice(0, 5).map((activity, index) => ({
            id: index + 1,
            type: activity.type,
            message: activity.message,
            timestamp: activity.timestamp,
            status: activity.status
        }))

        return NextResponse.json({ activities: topActivities })
    } catch (error) {
        console.error("Recent activities error:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

function getTimeAgo(dateString: string): string {
    const date = new Date(dateString)
    const now = new Date()
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (seconds < 60) return `${seconds} seconds ago`
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`
    return `${Math.floor(seconds / 604800)} weeks ago`
}
