import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    // Validate email
    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      )
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Check if email already exists
    const { data: existingSubscriber, error: checkError } = await supabase
      .from("newsletter_subscriptions")
      .select("email, status")
      .eq("email", email.toLowerCase())
      .single()

    if (checkError && checkError.code !== "PGRST116") {
      console.error("Database check error:", checkError)
      return NextResponse.json(
        { error: "Failed to process subscription" },
        { status: 500 }
      )
    }

    // If subscriber exists
    if (existingSubscriber) {
      if (existingSubscriber.status === "subscribed") {
        return NextResponse.json(
          { error: "This email is already subscribed" },
          { status: 409 }
        )
      } else {
        // Resubscribe
        const { error: updateError } = await supabase
          .from("newsletter_subscriptions")
          .update({ 
            status: "subscribed"
          })
          .eq("email", email.toLowerCase())

        if (updateError) {
          console.error("Resubscribe error:", updateError)
          return NextResponse.json(
            { error: "Failed to resubscribe" },
            { status: 500 }
          )
        }

        return NextResponse.json(
          { message: "Successfully resubscribed to newsletter!" },
          { status: 200 }
        )
      }
    }

    // Add new subscriber
    const { error: insertError } = await supabase
      .from("newsletter_subscriptions")
      .insert({
        email: email.toLowerCase(),
        status: "subscribed",
      })

    if (insertError) {
      console.error("Insert error:", insertError)
      return NextResponse.json(
        { error: "Failed to subscribe" },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { message: "Successfully subscribed to newsletter!" },
      { status: 201 }
    )
  } catch (error) {
    console.error("Newsletter subscription error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
