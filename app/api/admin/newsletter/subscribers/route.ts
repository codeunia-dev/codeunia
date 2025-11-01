import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createClient()

    // Check if user is admin
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single()

    if (!profile?.is_admin) {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      )
    }

    // Fetch all subscribers
    const { data: subscribers, error } = await supabase
      .from("newsletter_subscriptions")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Fetch subscribers error:", error)
      return NextResponse.json(
        { error: "Failed to fetch subscribers" },
        { status: 500 }
      )
    }

    // Calculate stats
    const stats = {
      total: subscribers.length,
      subscribed: subscribers.filter(s => s.status === "subscribed").length,
      unsubscribed: subscribers.filter(s => s.status === "unsubscribed").length,
    }

    return NextResponse.json({ subscribers, stats })
  } catch (error) {
    console.error("Newsletter subscribers error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
