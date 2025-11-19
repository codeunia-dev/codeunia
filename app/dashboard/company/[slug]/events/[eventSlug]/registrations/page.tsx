'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { useCompanyContext } from '@/contexts/CompanyContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    ArrowLeft,
    Search,
    Download,
    Users,
    CheckCircle,
    Clock,
    XCircle,
    DollarSign,
    Calendar,
} from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import { MasterRegistration } from '@/lib/services/master-registrations'

interface EnrichedRegistration extends MasterRegistration {
    profile_name?: string
    profile_avatar?: string
}

export default function EventRegistrationsPage() {
    const params = useParams()
    const { currentCompany } = useCompanyContext()
    const eventSlug = params.eventSlug as string

    const [registrations, setRegistrations] = useState<EnrichedRegistration[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState<string>('all')
    const [paymentFilter, setPaymentFilter] = useState<string>('all')
    const [total, setTotal] = useState(0)
    const [eventTitle, setEventTitle] = useState('')
    const [exporting, setExporting] = useState(false)

    const fetchRegistrations = useCallback(async () => {
        if (!currentCompany || !eventSlug) return

        try {
            setLoading(true)
            const params = new URLSearchParams()

            if (searchTerm) params.append('search', searchTerm)
            if (statusFilter && statusFilter !== 'all') params.append('status', statusFilter)
            if (paymentFilter && paymentFilter !== 'all') params.append('payment_status', paymentFilter)
            params.append('limit', '100')

            const response = await fetch(`/api/events/${eventSlug}/registrations?${params.toString()}`)

            if (!response.ok) {
                throw new Error('Failed to fetch registrations')
            }

            const data = await response.json()
            setRegistrations(data.registrations || [])
            setTotal(data.total || 0)
            setEventTitle(data.event?.title || '')
        } catch (error) {
            console.error('Error fetching registrations:', error)
            toast.error('Failed to load registrations')
        } finally {
            setLoading(false)
        }
    }, [currentCompany, eventSlug, searchTerm, statusFilter, paymentFilter])

    useEffect(() => {
        fetchRegistrations()
    }, [fetchRegistrations])

    const handleExportCSV = async () => {
        try {
            setExporting(true)
            const response = await fetch(`/api/events/${eventSlug}/registrations/export`)

            if (!response.ok) {
                throw new Error('Failed to export registrations')
            }

            const blob = await response.blob()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `${eventSlug}-registrations-${new Date().toISOString().split('T')[0]}.csv`
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            document.body.removeChild(a)

            toast.success('Registrations exported successfully')
        } catch (error) {
            console.error('Error exporting registrations:', error)
            toast.error('Failed to export registrations')
        } finally {
            setExporting(false)
        }
    }

    const handleUpdateStatus = async (registrationId: number, status: string) => {
        try {
            const response = await fetch(`/api/events/${eventSlug}/registrations`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ registration_id: registrationId, status })
            })

            if (!response.ok) {
                throw new Error('Failed to update status')
            }

            toast.success('Status updated successfully')
            fetchRegistrations()
        } catch (error) {
            console.error('Error updating status:', error)
            toast.error('Failed to update status')
        }
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'registered':
                return (
                    <Badge className="bg-green-500/10 text-green-600 border-green-500/20 pointer-events-none">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Registered
                    </Badge>
                )
            case 'pending':
                return (
                    <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20 pointer-events-none">
                        <Clock className="h-3 w-3 mr-1" />
                        Pending
                    </Badge>
                )
            case 'cancelled':
                return (
                    <Badge className="bg-red-500/10 text-red-600 border-red-500/20 pointer-events-none">
                        <XCircle className="h-3 w-3 mr-1" />
                        Cancelled
                    </Badge>
                )
            case 'attended':
                return (
                    <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20 pointer-events-none">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Attended
                    </Badge>
                )
            case 'no_show':
                return (
                    <Badge className="bg-gray-500/10 text-gray-600 border-gray-500/20 pointer-events-none">
                        No Show
                    </Badge>
                )
            default:
                return <Badge variant="outline" className="pointer-events-none">{status}</Badge>
        }
    }

    const getPaymentBadge = (paymentStatus: string) => {
        switch (paymentStatus) {
            case 'paid':
                return (
                    <Badge className="bg-green-500/10 text-green-600 border-green-500/20 pointer-events-none">
                        <DollarSign className="h-3 w-3 mr-1" />
                        Paid
                    </Badge>
                )
            case 'pending':
                return (
                    <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20 pointer-events-none">
                        <Clock className="h-3 w-3 mr-1" />
                        Pending
                    </Badge>
                )
            case 'failed':
                return (
                    <Badge className="bg-red-500/10 text-red-600 border-red-500/20 pointer-events-none">
                        Failed
                    </Badge>
                )
            case 'not_applicable':
                return (
                    <Badge variant="outline" className="pointer-events-none">
                        N/A
                    </Badge>
                )
            default:
                return <Badge variant="outline" className="pointer-events-none">{paymentStatus}</Badge>
        }
    }

    if (!currentCompany) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href={`/dashboard/company/${currentCompany.slug}/events`}>
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Events
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Event Registrations</h1>
                        <p className="text-muted-foreground mt-1">
                            {eventTitle}
                        </p>
                    </div>
                </div>
                <Button onClick={handleExportCSV} disabled={exporting || registrations.length === 0}>
                    <Download className="h-4 w-4 mr-2" />
                    {exporting ? 'Exporting...' : 'Export CSV'}
                </Button>
            </div>

            {/* Stats Card */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Registrations</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{total}</div>
                </CardContent>
            </Card>

            {/* Filters */}
            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Search by name, email, or phone..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="registered">Registered</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="attended">Attended</SelectItem>
                        <SelectItem value="no_show">No Show</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by payment" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Payments</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="failed">Failed</SelectItem>
                        <SelectItem value="not_applicable">N/A</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Registrations Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Registrations ({registrations.length})</CardTitle>
                    <CardDescription>
                        Manage and view all event registrations
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    ) : registrations.length === 0 ? (
                        <div className="text-center py-12">
                            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                                No registrations found
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400">
                                {searchTerm || statusFilter !== 'all' || paymentFilter !== 'all'
                                    ? 'Try adjusting your filters'
                                    : 'No one has registered for this event yet'}
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Participant</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Phone</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Payment</TableHead>
                                        <TableHead>Registered</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {registrations.map((registration) => (
                                        <TableRow key={registration.id}>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-medium">
                                                        {registration.profile_name || registration.full_name || registration.email || `User ${registration.user_id.substring(0, 8)}`}
                                                    </span>
                                                    {registration.experience_level && (
                                                        <span className="text-sm text-gray-500">
                                                            {registration.experience_level}
                                                        </span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {registration.email ? (
                                                    <span className="text-sm">{registration.email}</span>
                                                ) : (
                                                    <span className="text-sm text-gray-400">-</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {registration.phone ? (
                                                    <span className="text-sm">{registration.phone}</span>
                                                ) : (
                                                    <span className="text-sm text-gray-400">-</span>
                                                )}
                                            </TableCell>
                                            <TableCell>{getStatusBadge(registration.status)}</TableCell>
                                            <TableCell>
                                                <div className="flex flex-col gap-1">
                                                    {getPaymentBadge(registration.payment_status)}
                                                    {registration.payment_amount && (
                                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                                            ₹{registration.payment_amount / 100}
                                                        </span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1 text-sm">
                                                    <Calendar className="h-3 w-3 text-gray-400" />
                                                    {new Date(registration.created_at).toLocaleDateString()}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Select
                                                    value={registration.status}
                                                    onValueChange={(value) => handleUpdateStatus(registration.id, value)}
                                                >
                                                    <SelectTrigger className="w-[130px]">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="registered">Registered</SelectItem>
                                                        <SelectItem value="attended">Attended</SelectItem>
                                                        <SelectItem value="no_show">No Show</SelectItem>
                                                        <SelectItem value="cancelled">Cancelled</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
