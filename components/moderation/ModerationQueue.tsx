"use client"

import { useState, useEffect, useCallback } from "react"
import { Event } from "@/types/events"
import { Company } from "@/types/company"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Calendar,
  MapPin,
  Eye,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Filter
} from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"

interface EventWithCompany extends Event {
  company?: Company
  automated_checks?: {
    passed: boolean
    issues: string[]
  }
}

interface ModerationAction {
  type: "approve" | "reject" | "request-changes"
  eventId: number
  reason?: string
}

export function ModerationQueue() {
  const [events, setEvents] = useState<EventWithCompany[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<number | null>(null)
  const [selectedEvents, setSelectedEvents] = useState<Set<number>>(new Set())
  const [sortBy, setSortBy] = useState<string>("date")
  const [filterBy, setFilterBy] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [showActionDialog, setShowActionDialog] = useState(false)
  const [pendingAction, setPendingAction] = useState<ModerationAction | null>(null)
  const [actionReason, setActionReason] = useState("")

  const itemsPerPage = 10

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true)
      const offset = (currentPage - 1) * itemsPerPage
      const response = await fetch(
        `/api/admin/moderation/events?limit=${itemsPerPage}&offset=${offset}`
      )

      if (!response.ok) {
        throw new Error("Failed to fetch events")
      }

      const data = await response.json()
      if (data.success) {
        setEvents(data.data.events)
        setTotalPages(Math.ceil(data.data.total / itemsPerPage))
      }
    } catch (error) {
      console.error("Error fetching events:", error)
      toast.error("Failed to load events")
    } finally {
      setLoading(false)
    }
  }, [currentPage, itemsPerPage])

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  const handleAction = async (action: ModerationAction) => {
    try {
      setActionLoading(action.eventId)

      let endpoint = ""
      let body: Record<string, string> = {}

      switch (action.type) {
        case "approve":
          endpoint = `/api/admin/moderation/events/${action.eventId}/approve`
          body = { notes: action.reason || "" }
          break
        case "reject":
          endpoint = `/api/admin/moderation/events/${action.eventId}/reject`
          body = { reason: action.reason || "Does not meet platform guidelines" }
          break
        case "request-changes":
          endpoint = `/api/admin/moderation/events/${action.eventId}/request-changes`
          body = { feedback: action.reason || "Please review and update your event" }
          break
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        throw new Error(`Failed to ${action.type} event`)
      }

      const data = await response.json()
      if (data.success) {
        toast.success(
          action.type === "approve"
            ? "Event approved successfully"
            : action.type === "reject"
            ? "Event rejected"
            : "Changes requested"
        )

        // Remove the event from the list
        setEvents((prev) => prev.filter((e) => e.id !== action.eventId))
        setSelectedEvents((prev) => {
          const newSet = new Set(prev)
          newSet.delete(action.eventId)
          return newSet
        })
      }
    } catch (error) {
      console.error(`Error ${action.type}ing event:`, error)
      toast.error(`Failed to ${action.type} event`)
    } finally {
      setActionLoading(null)
      setShowActionDialog(false)
      setPendingAction(null)
      setActionReason("")
    }
  }

  const handleBulkAction = async (actionType: "approve" | "reject") => {
    if (selectedEvents.size === 0) {
      toast.error("No events selected")
      return
    }

    const confirmMessage =
      actionType === "approve"
        ? `Approve ${selectedEvents.size} event(s)?`
        : `Reject ${selectedEvents.size} event(s)?`

    if (!confirm(confirmMessage)) {
      return
    }

    try {
      setLoading(true)
      const promises = Array.from(selectedEvents).map((eventId) =>
        handleAction({ type: actionType, eventId })
      )

      await Promise.all(promises)
      toast.success(`${selectedEvents.size} event(s) ${actionType}d successfully`)
      setSelectedEvents(new Set())
    } catch (error) {
      console.error(`Error bulk ${actionType}ing:`, error)
      toast.error(`Failed to ${actionType} some events`)
    } finally {
      setLoading(false)
    }
  }

  const toggleEventSelection = (eventId: number) => {
    setSelectedEvents((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(eventId)) {
        newSet.delete(eventId)
      } else {
        newSet.add(eventId)
      }
      return newSet
    })
  }

  const toggleSelectAll = () => {
    if (selectedEvents.size === events.length) {
      setSelectedEvents(new Set())
    } else {
      setSelectedEvents(new Set(events.filter((e) => e.id !== undefined).map((e) => e.id!)))
    }
  }

  const openActionDialog = (action: ModerationAction) => {
    setPendingAction(action)
    setShowActionDialog(true)
  }

  const confirmAction = () => {
    if (pendingAction) {
      handleAction({ ...pendingAction, reason: actionReason })
    }
  }

  const getStatusBadge = (checks?: { passed: boolean; issues: string[] }) => {
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
          Passed
        </Badge>
      )
    }

    return (
      <Badge variant="destructive" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
        <XCircle className="h-3 w-3 mr-1" />
        {checks.issues.length} Issue{checks.issues.length !== 1 ? "s" : ""}
      </Badge>
    )
  }

  if (loading && events.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    )
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-12">
        <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">
          All caught up!
        </h3>
        <p className="text-zinc-500 dark:text-zinc-400">
          There are no events pending review at the moment.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filters and Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex gap-2 items-center">
          <Filter className="h-4 w-4 text-zinc-500" />
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Submission Date</SelectItem>
              <SelectItem value="event-date">Event Date</SelectItem>
              <SelectItem value="company">Company Name</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterBy} onValueChange={setFilterBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Events</SelectItem>
              <SelectItem value="passed">Passed Checks</SelectItem>
              <SelectItem value="failed">Failed Checks</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {selectedEvents.size > 0 && (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="default"
              onClick={() => handleBulkAction("approve")}
              disabled={loading}
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Approve ({selectedEvents.size})
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => handleBulkAction("reject")}
              disabled={loading}
            >
              <XCircle className="h-4 w-4 mr-1" />
              Reject ({selectedEvents.size})
            </Button>
          </div>
        )}
      </div>

      {/* Events Table */}
      <div className="rounded-lg border border-zinc-800 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-zinc-900/40">
              <TableHead className="w-12">
                <input
                  type="checkbox"
                  checked={selectedEvents.size === events.length && events.length > 0}
                  onChange={toggleSelectAll}
                  className="rounded border-zinc-700"
                />
              </TableHead>
              <TableHead>Event</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Checks</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {events.map((event) => {
              if (!event.id) return null
              return (
              <TableRow key={event.id} className="hover:bg-zinc-900/20">
                <TableCell>
                  <input
                    type="checkbox"
                    checked={selectedEvents.has(event.id)}
                    onChange={() => toggleEventSelection(event.id!)}
                    className="rounded border-zinc-700"
                  />
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="font-semibold text-zinc-900 dark:text-white">
                      {event.title}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-zinc-500">
                      <MapPin className="h-3 w-3" />
                      {event.location}
                    </div>
                    {event.automated_checks && !event.automated_checks.passed && (
                      <div className="text-xs text-red-500">
                        {event.automated_checks.issues.slice(0, 2).join(", ")}
                        {event.automated_checks.issues.length > 2 && "..."}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {event.company?.logo_url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={event.company.logo_url}
                        alt={event.company.name}
                        className="h-6 w-6 rounded object-cover"
                      />
                    )}
                    <div>
                      <div className="font-medium text-zinc-900 dark:text-white text-sm">
                        {event.company?.name || "Unknown"}
                      </div>
                      <div className="text-xs text-zinc-500">
                        {event.company?.subscription_tier || "free"}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-sm text-zinc-700 dark:text-zinc-300">
                    <Calendar className="h-3 w-3" />
                    {event.date ? format(new Date(event.date), "MMM d, yyyy") : "N/A"}
                  </div>
                </TableCell>
                <TableCell>{getStatusBadge(event.automated_checks)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex gap-1 justify-end">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => window.open(`/admin/moderation/${event.id}`, "_self")}
                      disabled={actionLoading === event.id}
                      title="Review Event"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() =>
                        openActionDialog({ type: "approve", eventId: event.id! })
                      }
                      disabled={actionLoading === event.id}
                      title="Approve"
                    >
                      {actionLoading === event.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() =>
                        openActionDialog({ type: "reject", eventId: event.id! })
                      }
                      disabled={actionLoading === event.id}
                      title="Reject"
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        openActionDialog({ type: "request-changes", eventId: event.id! })
                      }
                      disabled={actionLoading === event.id}
                      title="Request Changes"
                    >
                      <AlertCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )
            })}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-zinc-500">
          Page {currentPage} of {totalPages}
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1 || loading}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages || loading}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Action Dialog */}
      <AlertDialog open={showActionDialog} onOpenChange={setShowActionDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pendingAction?.type === "approve"
                ? "Approve Event"
                : pendingAction?.type === "reject"
                ? "Reject Event"
                : "Request Changes"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingAction?.type === "approve"
                ? "This event will be published and visible to all users."
                : pendingAction?.type === "reject"
                ? "The event will be rejected and the company will be notified."
                : "The company will be asked to make changes before resubmitting."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reason">
                {pendingAction?.type === "approve"
                  ? "Notes (optional)"
                  : pendingAction?.type === "reject"
                  ? "Reason for rejection"
                  : "Feedback for changes"}
              </Label>
              <Textarea
                id="reason"
                placeholder={
                  pendingAction?.type === "approve"
                    ? "Add any notes about this approval..."
                    : pendingAction?.type === "reject"
                    ? "Explain why this event is being rejected..."
                    : "Describe what changes are needed..."
                }
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmAction}>
              {pendingAction?.type === "approve"
                ? "Approve"
                : pendingAction?.type === "reject"
                ? "Reject"
                : "Request Changes"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
