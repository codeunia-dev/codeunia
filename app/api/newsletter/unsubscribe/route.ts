import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json(
        { error: "Unsubscribe token is required" },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from("newsletter_subscriptions")
      .update({ status: "unsubscribed" })
      .eq("unsubscribe_token", token)
      .eq("status", "subscribed")
      .select()
      .single()

    if (error || !data) {
      return NextResponse.json(
        { error: "Invalid or already used unsubscribe link" },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { message: "Successfully unsubscribed from newsletter" },
      { status: 200 }
    )
  } catch (error) {
    console.error("Unsubscribe error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
