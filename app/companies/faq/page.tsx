import { Metadata } from 'next'
import { CompanyFAQ } from '@/components/help/CompanyFAQ'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Company FAQ - CodeUnia',
  description: 'Frequently asked questions about company registration, event creation, and platform features on CodeUnia.',
}

export default function CompanyFAQPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <Link href="/companies">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Companies
          </Button>
        </Link>
      </div>

      <CompanyFAQ />

      {/* Additional Resources */}
      <div className="mt-12 border-t pt-8">
        <h3 className="text-xl font-semibold mb-4">Additional Resources</h3>
        <div className="grid gap-4 md:grid-cols-3">
          <Link
            href="/docs/company-registration-guide"
            className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
          >
            <h4 className="font-semibold mb-2">Registration Guide</h4>
            <p className="text-sm text-muted-foreground">
              Step-by-step guide to registering your company
            </p>
          </Link>
          <Link
            href="/docs/event-creation-guide"
            className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
          >
            <h4 className="font-semibold mb-2">Event Creation Guide</h4>
            <p className="text-sm text-muted-foreground">
              Learn how to create and manage events
            </p>
          </Link>
          <Link
            href="/docs/team-management-guide"
            className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
          >
            <h4 className="font-semibold mb-2">Team Management Guide</h4>
            <p className="text-sm text-muted-foreground">
              Manage your team members and roles
            </p>
          </Link>
        </div>
      </div>
    </div>
  )
}
