"use client"

import { useState, useEffect, useCallback } from "react"
import { Hackathon } from "@/types/hackathons"
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
  Calendar,
  MapPin,
  Eye,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"
import Link from "next/link"

interface HackathonWithCompany extends Hackathon {
  company?: Company
}

interface ModerationAction {
  type: "approve" | "reject"
  hackathonId: number
  reason?: string
}

export function HackathonModerationQueue() {
  const [hackathons, setHackathons] = useState<HackathonWithCompany[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<number | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [showActionDialog, setShowActionDialog] = useState(false)
  const [pendingAction, setPendingAction] = useState<ModerationAction | null>(null)
  const [actionReason, setActionReason] = useState("")

  const itemsPerPage = 10

  const fetchHackathons = useCallback(async () => {
    try {
      setLoading(true)
      const offset = (currentPage - 1) * itemsPerPage
      const response = await fetch(
        `/api/admin/moderation/hackathons?limit=${itemsPerPage}&offset=${offset}`
      )

      if (!response.ok) {
        throw new Error("Failed to fetch hackathons")
      }

      const data = await response.json()
      if (data.success) {
        setHackathons(data.data.hackathons)
        setTotalPages(Math.ceil(data.data.total / itemsPerPage))
      }
    } catch (error) {
      console.error("Error fetching hackathons:", error)
      toast.error("Failed to load hackathons")
    } finally {
      setLoading(false)
    }
  }, [currentPage])

  useEffect(() => {
    fetchHackathons()
  }, [fetchHackathons])

  const handleAction = (type: "approve" | "reject", hackathonId: number) => {
    setPendingAction({ type, hackathonId })
    setActionReason("")
    setShowActionDialog(true)
  }

  const executeAction = async () => {
    if (!pendingAction) return

    try {
      setActionLoading(pendingAction.hackathonId)
      setShowActionDialog(false)

      const response = await fetch(`/api/admin/moderation/hackathons/${pendingAction.hackathonId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: pendingAction.type,
          reason: actionReason || undefined,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to execute action")
      }

      toast.success(
        pendingAction.type === "approve"
          ? "Hackathon approved successfully"
          : "Hackathon rejected"
      )

      // Refresh the list
      await fetchHackathons()
    } catch (error) {
      console.error("Error executing action:", error)
      toast.error("Failed to execute action")
    } finally {
      setActionLoading(null)
      setPendingAction(null)
      setActionReason("")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
      </div>
    )
  }

  if (hackathons.length === 0) {
    return (
      <div className="text-center py-12">
        <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">
          All caught up!
        </h3>
        <p className="text-zinc-500 dark:text-zinc-400">
          No hackathons pending review at the moment.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-zinc-50 dark:bg-zinc-800/50">
              <TableHead className="font-bold">Hackathon</TableHead>
              <TableHead className="font-bold">Company</TableHead>
              <TableHead className="font-bold">Date</TableHead>
              <TableHead className="font-bold">Location</TableHead>
              <TableHead className="font-bold">Submitted</TableHead>
              <TableHead className="font-bold text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {hackathons.map((hackathon) => (
              <TableRow key={hackathon.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30">
                <TableCell>
                  <div className="space-y-1">
                    <div className="font-medium text-zinc-900 dark:text-white">
                      {hackathon.title}
                    </div>
                    <div className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-1">
                      {hackathon.excerpt}
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="outline" className="text-xs">
                        {hackathon.category}
                      </Badge>
                      {hackathon.prize && (
                        <Badge variant="outline" className="text-xs text-green-600">
                          {hackathon.prize}
                        </Badge>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {hackathon.company?.logo_url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={hackathon.company.logo_url}
                        alt={hackathon.company.name}
                        className="h-8 w-8 rounded object-cover"
                      />
                    )}
                    <span className="font-medium text-zinc-900 dark:text-white">
                      {hackathon.company?.name || hackathon.organizer}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-zinc-400" />
                    {format(new Date(hackathon.date), "MMM dd, yyyy")}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-zinc-400" />
                    {hackathon.location}
                  </div>
                </TableCell>
                <TableCell className="text-sm text-zinc-500 dark:text-zinc-400">
                  {hackathon.created_at
                    ? format(new Date(hackathon.created_at), "MMM dd, yyyy")
                    : "N/A"}
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-2">
                    <Link href={`/admin/moderation/${hackathon.id}`} target="_blank">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAction("approve", hackathon.id!)}
                      disabled={actionLoading === hackathon.id}
                      className="text-green-600 hover:text-green-700 hover:bg-green-50"
                    >
                      {actionLoading === hackathon.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAction("reject", hackathon.id!)}
                      disabled={actionLoading === hackathon.id}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-zinc-500 dark:text-zinc-400">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Action Dialog */}
      <AlertDialog open={showActionDialog} onOpenChange={setShowActionDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pendingAction?.type === "approve" ? "Approve Hackathon" : "Reject Hackathon"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingAction?.type === "approve"
                ? "This hackathon will be published and visible to all users."
                : "This hackathon will be rejected and the company will be notified."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {pendingAction?.type === "reject" && (
            <div className="space-y-2">
              <Label htmlFor="reason">Rejection Reason *</Label>
              <Textarea
                id="reason"
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                placeholder="Explain why this hackathon is being rejected..."
                rows={4}
              />
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={executeAction}
              disabled={pendingAction?.type === "reject" && !actionReason}
              className={
                pendingAction?.type === "approve"
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-600 hover:bg-red-700"
              }
            >
              {pendingAction?.type === "approve" ? "Approve" : "Reject"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
