"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
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
  Building2,
  Mail,
  Globe,
  MapPin,
  ArrowLeft,
  CheckCircle,
  XCircle,
  FileText,
  Download,
  ExternalLink,
  Calendar,
  User,
  AlertCircle,
} from "lucide-react"
import { toast } from "sonner"
import { apiFetch } from "@/lib/api-fetch"
import type { Company } from "@/types/company"

interface CompanyWithRelations extends Company {
  verified_by_profile?: {
    id: string
    email: string
    first_name?: string
    last_name?: string
  }
  settings?: {
    rejected_at?: string
    rejection_reason?: string
    rejection_notes?: string
    rejected_by?: string
    [key: string]: unknown
  }
}

export default function CompanyVerificationPage() {
  const params = useParams()
  const router = useRouter()
  const companyId = params.id as string

  const [company, setCompany] = useState<CompanyWithRelations | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [verificationNotes, setVerificationNotes] = useState("")
  const [rejectionReason, setRejectionReason] = useState("")
  const [confirmAction, setConfirmAction] = useState<'verify' | 'reject' | null>(null)
  const [documentUrls, setDocumentUrls] = useState<string[]>([])

  const fetchCompanyDetails = useCallback(async () => {
    try {
      setLoading(true)
      
      const response = await apiFetch(`/api/admin/companies/${companyId}`)
      if (!response.ok) {
        throw new Error("Failed to fetch company details")
      }
      const data = await response.json()
      setCompany(data.data.company)

      // Get signed URLs for verification documents
      if (data.data.company.verification_documents && data.data.company.verification_documents.length > 0) {
        const urls = await Promise.all(
          data.data.company.verification_documents.map(async (path: string) => {
            try {
              const urlResponse = await apiFetch(`/api/companies/${data.data.company.slug}/documents?path=${encodeURIComponent(path)}`)
              if (urlResponse.ok) {
                const urlData = await urlResponse.json()
                return urlData.url
              }
              return null
            } catch (error) {
              console.error("Error fetching document URL:", error)
              return null
            }
          })
        )
        setDocumentUrls(urls.filter(Boolean))
      }
    } catch (error) {
      toast.error("Failed to fetch company details")
      console.error("Fetch error:", error)
    } finally {
      setLoading(false)
    }
  }, [companyId])

  useEffect(() => {
    if (companyId) {
      fetchCompanyDetails()
    }
  }, [companyId, fetchCompanyDetails])

  const handleVerify = async () => {
    try {
      setActionLoading(true)
      const response = await apiFetch(`/api/admin/companies/${companyId}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: verificationNotes }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to verify company")
      }

      toast.success("Company has been verified successfully")
      router.push(`/admin/companies/${companyId}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to verify company")
      console.error("Verify error:", error)
    } finally {
      setActionLoading(false)
      setConfirmAction(null)
    }
  }

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error("Please provide a rejection reason")
      return
    }

    try {
      setActionLoading(true)
      const response = await apiFetch(`/api/admin/companies/${companyId}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: rejectionReason }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to reject company")
      }

      toast.success("Company verification has been rejected")
      router.push(`/admin/companies/${companyId}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to reject company")
      console.error("Reject error:", error)
    } finally {
      setActionLoading(false)
      setConfirmAction(null)
    }
  }

  const downloadDocument = async (url: string, index: number) => {
    try {
      const response = await fetch(url)
      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = `verification-document-${index + 1}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(downloadUrl)
      toast.success("Document downloaded")
    } catch (error) {
      toast.error("Failed to download document")
      console.error("Download error:", error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!company) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Company Not Found</h2>
          <p className="text-muted-foreground mb-4">The company you&apos;re looking for doesn&apos;t exist.</p>
          <Button onClick={() => router.push("/admin/companies")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Companies
          </Button>
        </div>
      </div>
    )
  }

  const isAlreadyProcessed = company.verification_status !== 'pending'

  return (
    <div className="bg-black space-y-8 min-h-screen px-4 py-8 md:px-8 lg:px-16">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.push(`/admin/companies/${companyId}`)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Company Verification</h1>
            <p className="text-zinc-400 text-sm">{company.name}</p>
          </div>
        </div>
        <Badge
          className={
            company.verification_status === "verified"
              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
              : company.verification_status === "rejected"
              ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
              : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
          }
        >
          {company.verification_status === "verified" && <CheckCircle className="h-3 w-3 mr-1" />}
          {company.verification_status === "rejected" && <XCircle className="h-3 w-3 mr-1" />}
          {company.verification_status.charAt(0).toUpperCase() + company.verification_status.slice(1)}
        </Badge>
      </div>

      {/* Alert for already processed */}
      {isAlreadyProcessed && (
        <Card className="border-yellow-500/50 bg-yellow-50/10">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
              <div>
                <h3 className="font-semibold text-yellow-500">Already Processed</h3>
                <p className="text-sm text-zinc-400 mt-1">
                  This company has already been {company.verification_status}. 
                  {company.verified_at && ` Processed on ${new Date(company.verified_at).toLocaleDateString()}.`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Column - Company Information */}
        <div className="space-y-6">
          {/* Company Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Company Information
              </CardTitle>
              <CardDescription>Review the company&apos;s registration details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-xs text-muted-foreground">Company Name</Label>
                <p className="text-sm font-medium mt-1">{company.name}</p>
              </div>

              {company.legal_name && (
                <div>
                  <Label className="text-xs text-muted-foreground">Legal Name</Label>
                  <p className="text-sm font-medium mt-1">{company.legal_name}</p>
                </div>
              )}

              <Separator />

              <div>
                <Label className="text-xs text-muted-foreground">Email</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm">{company.email}</p>
                </div>
              </div>

              {company.phone && (
                <div>
                  <Label className="text-xs text-muted-foreground">Phone</Label>
                  <p className="text-sm mt-1">{company.phone}</p>
                </div>
              )}

              <div>
                <Label className="text-xs text-muted-foreground">Website</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  {company.website ? (
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                    >
                      {company.website}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : (
                    <p className="text-sm">—</p>
                  )}
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Industry</Label>
                  <p className="text-sm mt-1">{company.industry || "—"}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Company Size</Label>
                  <p className="text-sm mt-1 capitalize">{company.company_size || "—"}</p>
                </div>
              </div>

              {company.description && (
                <>
                  <Separator />
                  <div>
                    <Label className="text-xs text-muted-foreground">Description</Label>
                    <p className="text-sm mt-1 text-zinc-300">{company.description}</p>
                  </div>
                </>
              )}

              {company.address && (
                <>
                  <Separator />
                  <div>
                    <Label className="text-xs text-muted-foreground">Address</Label>
                    <div className="flex items-start gap-2 mt-1">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <p className="text-sm">
                        {[
                          company.address.street,
                          company.address.city,
                          company.address.state,
                          company.address.country,
                          company.address.zip,
                        ]
                          .filter(Boolean)
                          .join(", ")}
                      </p>
                    </div>
                  </div>
                </>
              )}

              <Separator />

              <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                <div>
                  <Label className="text-xs text-muted-foreground">Registered</Label>
                  <div className="flex items-center gap-1 mt-1">
                    <Calendar className="h-3 w-3" />
                    <span>{new Date(company.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                {company.verified_at && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Verified</Label>
                    <div className="flex items-center gap-1 mt-1">
                      <Calendar className="h-3 w-3" />
                      <span>{new Date(company.verified_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Verification Documents */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Verification Documents
              </CardTitle>
              <CardDescription>Review uploaded verification documents</CardDescription>
            </CardHeader>
            <CardContent>
              {!company.verification_documents || company.verification_documents.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-sm font-semibold mb-2">No Documents Uploaded</h3>
                  <p className="text-xs text-muted-foreground">
                    This company hasn&apos;t uploaded any verification documents
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {company.verification_documents.map((doc, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded">
                          <FileText className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Document {index + 1}</p>
                          <p className="text-xs text-muted-foreground">
                            {doc.split('/').pop()?.substring(0, 30)}...
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {documentUrls[index] && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(documentUrls[index], '_blank')}
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => downloadDocument(documentUrls[index], index)}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Verification Actions */}
        <div className="space-y-6">
          {/* Verification History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Verification History
              </CardTitle>
              <CardDescription>Track of verification status changes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-500/10 rounded-full">
                    <Calendar className="h-4 w-4 text-blue-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Company Registered</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(company.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>

                {company.verified_at && (
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-green-500/10 rounded-full">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Company Verified</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(company.verified_at).toLocaleString()}
                      </p>
                      {company.verified_by_profile && (
                        <p className="text-xs text-muted-foreground mt-1">
                          By: {company.verified_by_profile.email}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {company.verification_status === 'rejected' && company.settings?.rejected_at && (
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-red-500/10 rounded-full">
                      <XCircle className="h-4 w-4 text-red-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Verification Rejected</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(company.settings.rejected_at).toLocaleString()}
                      </p>
                      {company.settings.rejection_reason && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Reason: {company.settings.rejection_reason}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Verification Form */}
          {!isAlreadyProcessed && (
            <Card>
              <CardHeader>
                <CardTitle>Verification Decision</CardTitle>
                <CardDescription>Approve or reject this company&apos;s verification</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="notes">Verification Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Add any internal notes about this verification..."
                    value={verificationNotes}
                    onChange={(e) => setVerificationNotes(e.target.value)}
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground">
                    These notes are for internal use only and won&apos;t be shared with the company
                  </p>
                </div>

                <Separator />

                <div className="space-y-3">
                  <Button
                    onClick={() => setConfirmAction('verify')}
                    disabled={actionLoading}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Verify Company
                  </Button>

                  <Button
                    onClick={() => setConfirmAction('reject')}
                    disabled={actionLoading}
                    variant="destructive"
                    className="w-full"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject Verification
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Rejection Form */}
          {confirmAction === 'reject' && (
            <Card className="border-red-500/50">
              <CardHeader>
                <CardTitle className="text-red-500">Rejection Reason</CardTitle>
                <CardDescription>Provide a reason for rejecting this verification</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="rejection-reason">Reason *</Label>
                  <Textarea
                    id="rejection-reason"
                    placeholder="Explain why this company's verification is being rejected..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows={4}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    This reason will be sent to the company via email
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Confirmation Dialogs */}
      <AlertDialog open={confirmAction === 'verify'} onOpenChange={() => setConfirmAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Verify Company</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to verify {company.name}? This will:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Grant them access to create and manage events</li>
                <li>Display a verification badge on their profile</li>
                <li>Send them a confirmation email</li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleVerify}
              className="bg-green-600 hover:bg-green-700"
              disabled={actionLoading}
            >
              {actionLoading ? "Verifying..." : "Verify Company"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={confirmAction === 'reject'} onOpenChange={() => setConfirmAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Verification</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reject {company.name}&apos;s verification? This will:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Prevent them from creating events</li>
                <li>Send them a rejection email with your reason</li>
                <li>Allow them to resubmit their application</li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReject}
              className="bg-red-600 hover:bg-red-700"
              disabled={actionLoading || !rejectionReason.trim()}
            >
              {actionLoading ? "Rejecting..." : "Reject Verification"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
