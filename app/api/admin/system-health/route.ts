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

        const healthChecks = []

        // Check Database
        const dbStart = Date.now()
        const { error: dbError } = await supabase
            .from("profiles")
            .select("id")
            .limit(1)
        const dbTime = Date.now() - dbStart

        healthChecks.push({
            service: "Database",
            status: dbError ? "error" : dbTime < 100 ? "healthy" : "warning",
            uptime: dbError ? "Down" : "Operational",
            responseTime: `${dbTime}ms`
        })

        // Check API Server (this endpoint itself)
        const apiTime = Date.now() - dbStart
        healthChecks.push({
            service: "API Server",
            status: "healthy",
            uptime: "Operational",
            responseTime: `${apiTime}ms`
        })

        // Check Supabase Storage
        const storageStart = Date.now()
        const { error: storageError } = await supabase.storage
            .from("blog-images")
            .list("public", { limit: 1 })
        const storageTime = Date.now() - storageStart

        healthChecks.push({
            service: "Storage (CDN)",
            status: storageError ? "error" : storageTime < 300 ? "healthy" : "warning",
            uptime: storageError ? "Down" : "Operational",
            responseTime: `${storageTime}ms`
        })

        // Check Email Service (Resend)
        const resendConfigured = !!process.env.RESEND_API_KEY
        healthChecks.push({
            service: "Email Service",
            status: resendConfigured ? "healthy" : "warning",
            uptime: resendConfigured ? "Configured" : "Not Configured",
            responseTime: resendConfigured ? "Ready" : "N/A"
        })

        return NextResponse.json({ health: healthChecks })
    } catch (error) {
        console.error("System health error:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
