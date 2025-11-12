"use client"

import { useState } from "react"
import { Event } from "@/types/events"
import { Company } from "@/types/company"
import { ModerationLog } from "@/types/company"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Building2,
  Calendar,
  MapPin,
  Users,
  Clock,
  Tag,
  DollarSign,
  ExternalLink,
  Loader2,
  FileText,
  History,
  Shield,
} from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"

interface AutomatedCheckResult {
  passed: boolean
  issues: string[]
}

interface EventReviewProps {
  event: Event
  company?: Company
  automatedChecks?: AutomatedCheckResult
  moderationHistory?: ModerationLog[]
  onApprove: (notes?: string) => Promise<void>
  onReject: (reason: string) => Promise<void>
  onRequestChanges: (feedback: string) => Promise<void>
}

export function EventReview({
  event,
  company,
  automatedChecks,
  moderationHistory = [],
  onApprove,
  onReject,
  onRequestChanges,
}: EventReviewProps) {
  const [actionType, setActionType] = useState<"approve" | "reject" | "request-changes" | null>(null)
  const [actionText, setActionText] = useState("")
  const [loading, setLoading] = useState(false)

  const handleAction = async () => {
    if (!actionType) return

    try {
      setLoading(true)

      switch (actionType) {
        case "approve":
          await onApprove(actionText || undefined)
          toast.success("Event approved successfully")
          break
        case "reject":
          if (!actionText.trim()) {
            toast.error("Please provide a reason for rejection")
            return
          }
          await onReject(actionText)
          toast.success("Event rejected")
          break
        case "request-changes":
          if (!actionText.trim()) {
            toast.error("Please provide feedback for changes")
            return
          }
          await onRequestChanges(actionText)
          toast.success("Changes requested")
          break
      }

      // Close dialog and reset
      setActionType(null)
      setActionText("")
    } catch (error) {
      console.error("Error performing action:", error)
      toast.error(`Failed to ${actionType} event`)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { color: string; icon: React.ReactNode }> = {
      pending: { color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200", icon: <Clock className="h-3 w-3" /> },
      approved: { color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200", icon: <CheckCircle className="h-3 w-3" /> },
      rejected: { color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200", icon: <XCircle className="h-3 w-3" /> },
      changes_requested: { color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200", icon: <AlertCircle className="h-3 w-3" /> },
    }

    const variant = variants[status] || variants.pending

    return (
      <Badge className={`${variant.color} flex items-center gap-1`}>
        {variant.icon}
        {status.replace("_", " ").toUpperCase()}
      </Badge>
    )
  }

  const getCheckStatusBadge = (checks?: AutomatedCheckResult) => {
    if (!checks) {
      return (
        <Badge variant="outline" className="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">
          <AlertCircle className="h-3 w-3 mr-1" />
          Not Checked
        </Badge>
      )
    }

    if (checks.passed) {
      return (
        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
          <CheckCircle className="h-3 w-3 mr-1" />
          All Checks Passed
        </Badge>
      )
    }

    return (
      <Badge variant="destructive" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
        <XCircle className="h-3 w-3 mr-1" />
        {checks.issues.length} Issue{checks.issues.length !== 1 ? "s" : ""} Found
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      {/* Event Header */}
      <Card className="border-0 shadow-lg rounded-2xl bg-gradient-to-br from-zinc-100/80 to-zinc-200/60 dark:from-zinc-900/60 dark:to-zinc-800/40">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                <CardTitle className="text-2xl font-bold text-zinc-900 dark:text-white">
                  {event.title}
                </CardTitle>
                {getStatusBadge(event.approval_status)}
              </div>
              <CardDescription className="text-zinc-600 dark:text-zinc-300 text-base">
                {event.excerpt || event.description.substring(0, 150) + "..."}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Company Information */}
      {company && (
        <Card className="border-0 shadow-lg rounded-2xl bg-gradient-to-br from-purple-100/80 to-purple-200/60 dark:from-purple-900/60 dark:to-purple-800/40">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <Building2 className="h-5 w-5 text-purple-600" />
              Company Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              {company.logo_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={company.logo_url}
                  alt={company.name}
                  className="h-16 w-16 rounded-lg object-cover border-2 border-white dark:border-zinc-700 shadow-md"
                />
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
                    {company.name}
                  </h3>
                  {company.verification_status === "verified" && (
                    <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      <Shield className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-zinc-600 dark:text-zinc-300">
                  {company.industry} • {company.company_size}
                </p>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Subscription: {company.subscription_tier}
                </p>
              </div>
            </div>
            {company.website && (
              <a
                href={company.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
              >
                {company.website}
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </CardContent>
        </Card>
      )}

      {/* Automated Checks */}
      <Card className="border-0 shadow-lg rounded-2xl bg-gradient-to-br from-zinc-100/80 to-zinc-200/60 dark:from-zinc-900/60 dark:to-zinc-800/40">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600" />
              Automated Checks
            </CardTitle>
            {getCheckStatusBadge(automatedChecks)}
          </div>
        </CardHeader>
        <CardContent>
          {automatedChecks && !automatedChecks.passed && automatedChecks.issues.length > 0 ? (
            <div className="space-y-2">
              {automatedChecks.issues.map((issue, index) => (
                <div
                  key={index}
                  className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800"
                >
                  <XCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-red-800 dark:text-red-200">{issue}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <p className="text-sm text-green-800 dark:text-green-200">
                All automated checks passed successfully
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Event Details */}
      <Card className="border-0 shadow-lg rounded-2xl bg-gradient-to-br from-zinc-100/80 to-zinc-200/60 dark:from-zinc-900/60 dark:to-zinc-800/40">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            Event Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-zinc-500 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Date & Time</p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  {event.date ? format(new Date(event.date), "MMMM d, yyyy") : "N/A"}
                </p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">{event.time}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-zinc-500 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Location</p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">{event.location}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Users className="h-5 w-5 text-zinc-500 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Capacity</p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  {event.capacity} participants
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-zinc-500 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Duration</p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">{event.duration}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Tag className="h-5 w-5 text-zinc-500 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Category</p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">{event.category}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <DollarSign className="h-5 w-5 text-zinc-500 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Price</p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">{event.price}</p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-200 dark:border-zinc-700">
            <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">Description</p>
            <div
              className="text-sm text-zinc-600 dark:text-zinc-400 prose prose-sm dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: event.description }}
            />
          </div>

          {event.image && (
            <div className="pt-4 border-t border-zinc-200 dark:border-zinc-700">
              <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">Event Image</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={event.image}
                alt={event.title}
                className="w-full max-w-2xl rounded-lg border border-zinc-200 dark:border-zinc-700"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Moderation History */}
      {moderationHistory.length > 0 && (
        <Card className="border-0 shadow-lg rounded-2xl bg-gradient-to-br from-zinc-100/80 to-zinc-200/60 dark:from-zinc-900/60 dark:to-zinc-800/40">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <History className="h-5 w-5 text-blue-600" />
              Moderation History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {moderationHistory.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start gap-3 p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs">
                        {log.action.toUpperCase()}
                      </Badge>
                      <span className="text-xs text-zinc-500 dark:text-zinc-400">
                        {log.created_at ? format(new Date(log.created_at), "MMM d, yyyy 'at' h:mm a") : "N/A"}
                      </span>
                    </div>
                    {log.reason && (
                      <p className="text-sm text-zinc-600 dark:text-zinc-300">{log.reason}</p>
                    )}
                    {log.notes && log.notes !== log.reason && (
                      <p className="text-sm text-zinc-500 dark:text-zinc-400 italic">{log.notes}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      {event.approval_status === "pending" || event.approval_status === "changes_requested" ? (
        <Card className="border-0 shadow-lg rounded-2xl bg-gradient-to-br from-zinc-100/80 to-zinc-200/60 dark:from-zinc-900/60 dark:to-zinc-800/40">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                size="lg"
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                onClick={() => setActionType("approve")}
              >
                <CheckCircle className="h-5 w-5 mr-2" />
                Approve Event
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="flex-1 border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                onClick={() => setActionType("request-changes")}
              >
                <AlertCircle className="h-5 w-5 mr-2" />
                Request Changes
              </Button>
              <Button
                size="lg"
                variant="destructive"
                className="flex-1"
                onClick={() => setActionType("reject")}
              >
                <XCircle className="h-5 w-5 mr-2" />
                Reject Event
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-0 shadow-lg rounded-2xl bg-gradient-to-br from-zinc-100/80 to-zinc-200/60 dark:from-zinc-900/60 dark:to-zinc-800/40">
          <CardContent className="pt-6">
            <div className="text-center py-4">
              <p className="text-zinc-600 dark:text-zinc-300">
                This event has already been {event.approval_status.replace("_", " ")}.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Dialog */}
      <AlertDialog open={actionType !== null} onOpenChange={() => setActionType(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionType === "approve"
                ? "Approve Event"
                : actionType === "reject"
                ? "Reject Event"
                : "Request Changes"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionType === "approve"
                ? "This event will be published and visible to all users."
                : actionType === "reject"
                ? "The event will be rejected and the company will be notified."
                : "The company will be asked to make changes before resubmitting."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="action-text">
                {actionType === "approve"
                  ? "Notes (optional)"
                  : actionType === "reject"
                  ? "Reason for rejection *"
                  : "Feedback for changes *"}
              </Label>
              <Textarea
                id="action-text"
                placeholder={
                  actionType === "approve"
                    ? "Add any notes about this approval..."
                    : actionType === "reject"
                    ? "Explain why this event is being rejected..."
                    : "Describe what changes are needed..."
                }
                value={actionText}
                onChange={(e) => setActionText(e.target.value)}
                rows={4}
                className="resize-none"
              />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleAction} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  {actionType === "approve"
                    ? "Approve"
                    : actionType === "reject"
                    ? "Reject"
                    : "Request Changes"}
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
