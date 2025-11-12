"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useParams } from "next/navigation"
import { Event } from "@/types/events"
import { Company, ModerationLog } from "@/types/company"
import { EventReview } from "@/components/moderation/EventReview"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface AutomatedCheckResult {
  passed: boolean
  issues: string[]
}

interface EventWithCompany extends Event {
  company?: Company
}

export default function EventReviewPage() {
  const router = useRouter()
  const params = useParams()
  const eventId = params.id as string

  const [event, setEvent] = useState<EventWithCompany | null>(null)
  const [automatedChecks, setAutomatedChecks] = useState<AutomatedCheckResult | undefined>()
  const [moderationHistory, setModerationHistory] = useState<ModerationLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchEventDetails = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch event details
      const eventResponse = await fetch(`/api/admin/moderation/events/${eventId}`)
      if (!eventResponse.ok) {
        throw new Error("Failed to fetch event details")
      }

      const eventData = await eventResponse.json()
      if (!eventData.success) {
        throw new Error(eventData.error || "Failed to fetch event details")
      }

      setEvent(eventData.data.event)
      setAutomatedChecks(eventData.data.automatedChecks)
      setModerationHistory(eventData.data.moderationHistory || [])
    } catch (error) {
      console.error("Error fetching event details:", error)
      setError(error instanceof Error ? error.message : "Failed to load event details")
      toast.error("Failed to load event details")
    } finally {
      setLoading(false)
    }
  }, [eventId])

  useEffect(() => {
    if (eventId) {
      fetchEventDetails()
    }
  }, [eventId, fetchEventDetails])

  const handleApprove = async (notes?: string) => {
    try {
      const response = await fetch(`/api/admin/moderation/events/${eventId}/approve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ notes }),
      })

      if (!response.ok) {
        throw new Error("Failed to approve event")
      }

      const data = await response.json()
      if (!data.success) {
        throw new Error(data.error || "Failed to approve event")
      }

      toast.success("Event approved successfully")
      router.push("/admin/moderation")
    } catch (error) {
      console.error("Error approving event:", error)
      throw error
    }
  }

  const handleReject = async (reason: string) => {
    try {
      const response = await fetch(`/api/admin/moderation/events/${eventId}/reject`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reason }),
      })

      if (!response.ok) {
        throw new Error("Failed to reject event")
      }

      const data = await response.json()
      if (!data.success) {
        throw new Error(data.error || "Failed to reject event")
      }

      toast.success("Event rejected")
      router.push("/admin/moderation")
    } catch (error) {
      console.error("Error rejecting event:", error)
      throw error
    }
  }

  const handleRequestChanges = async (feedback: string) => {
    try {
      const response = await fetch(`/api/admin/moderation/events/${eventId}/request-changes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ feedback }),
      })

      if (!response.ok) {
        throw new Error("Failed to request changes")
      }

      const data = await response.json()
      if (!data.success) {
        throw new Error(data.error || "Failed to request changes")
      }

      toast.success("Changes requested")
      router.push("/admin/moderation")
    } catch (error) {
      console.error("Error requesting changes:", error)
      throw error
    }
  }

  if (loading) {
    return (
      <div className="bg-black min-h-screen px-4 py-8 md:px-8 lg:px-16">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
        </div>
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="bg-black min-h-screen px-4 py-8 md:px-8 lg:px-16">
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">
            {error || "Event not found"}
          </h3>
          <Button onClick={() => router.push("/admin/moderation")} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Moderation Queue
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-black min-h-screen px-4 py-8 md:px-8 lg:px-16 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-zinc-800/60 gap-4">
        <div>
          <Button
            variant="ghost"
            onClick={() => router.push("/admin/moderation")}
            className="mb-4 text-zinc-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Queue
          </Button>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white drop-shadow-sm flex items-center gap-3">
            <span className="inline-block w-2 h-6 sm:h-8 bg-gradient-to-b from-purple-400 to-blue-400 rounded-full mr-2" />
            Event Review
          </h1>
          <p className="text-zinc-400 mt-1 font-medium text-sm sm:text-base">
            Review event details and take action
          </p>
        </div>
      </div>

      {/* Event Review Component */}
      <EventReview
        event={event}
        company={event.company}
        automatedChecks={automatedChecks}
        moderationHistory={moderationHistory}
        onApprove={handleApprove}
        onReject={handleReject}
        onRequestChanges={handleRequestChanges}
      />
    </div>
  )
}
