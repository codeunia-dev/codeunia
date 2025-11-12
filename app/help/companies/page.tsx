import { Metadata } from 'next'
import Link from 'next/link'
import { 
  BookOpen, 
  Users, 
  Calendar, 
  Shield, 
  HelpCircle, 
  FileText,
  BarChart,
  CreditCard
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Company Help Center - CodeUnia',
  description: 'Comprehensive guides and documentation for companies hosting events on CodeUnia.',
}

const guides = [
  {
    title: 'Company Registration Guide',
    description: 'Learn how to register your company and get verified on CodeUnia',
    icon: BookOpen,
    href: '/docs/company-registration-guide',
    color: 'text-blue-500',
  },
  {
    title: 'Event Creation Guide',
    description: 'Step-by-step guide to creating and managing events',
    icon: Calendar,
    href: '/docs/event-creation-guide',
    color: 'text-green-500',
  },
  {
    title: 'Team Management Guide',
    description: 'Manage team members, roles, and permissions',
    icon: Users,
    href: '/docs/team-management-guide',
    color: 'text-purple-500',
  },
  {
    title: 'Moderation Guidelines',
    description: 'Understand the event approval and moderation process',
    icon: Shield,
    href: '/docs/moderation-guidelines',
    color: 'text-orange-500',
  },
]

const quickLinks = [
  {
    title: 'Frequently Asked Questions',
    description: 'Find answers to common questions',
    icon: HelpCircle,
    href: '/companies/faq',
  },
  {
    title: 'Analytics & Reporting',
    description: 'Track your event performance',
    icon: BarChart,
    href: '/dashboard/company',
  },
  {
    title: 'Subscription Plans',
    description: 'Compare plans and upgrade',
    icon: CreditCard,
    href: '/dashboard/company/subscription',
  },
  {
    title: 'API Documentation',
    description: 'Integrate with CodeUnia API',
    icon: FileText,
    href: '/docs/api-documentation',
  },
]

export default function CompanyHelpCenter() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">
          Company Help Center
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Everything you need to know about hosting events on CodeUnia
        </p>
      </div>

      {/* Main Guides */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Getting Started Guides</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {guides.map((guide) => {
            const Icon = guide.icon
            return (
              <Link key={guide.href} href={guide.href}>
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-lg bg-muted ${guide.color}`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="mb-2">{guide.title}</CardTitle>
                        <CardDescription>{guide.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Quick Links */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Quick Links</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {quickLinks.map((link) => {
            const Icon = link.icon
            return (
              <Link key={link.href} href={link.href}>
                <Card className="h-full hover:bg-muted/50 transition-colors cursor-pointer">
                  <CardContent className="pt-6">
                    <Icon className="h-8 w-8 mb-3 text-primary" />
                    <h3 className="font-semibold mb-1">{link.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {link.description}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Common Topics */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Common Topics</h2>
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Registration & Verification</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/companies/faq#verification" className="block text-sm text-primary hover:underline">
                How long does verification take?
              </Link>
              <Link href="/companies/faq#documents" className="block text-sm text-primary hover:underline">
                What documents do I need?
              </Link>
              <Link href="/companies/faq#rejected" className="block text-sm text-primary hover:underline">
                What if my registration is rejected?
              </Link>
              <Link href="/companies/faq#multiple" className="block text-sm text-primary hover:underline">
                Can I register multiple companies?
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Event Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/companies/faq#approval-time" className="block text-sm text-primary hover:underline">
                How long does event approval take?
              </Link>
              <Link href="/companies/faq#edit-event" className="block text-sm text-primary hover:underline">
                Can I edit events after approval?
              </Link>
              <Link href="/companies/faq#recurring" className="block text-sm text-primary hover:underline">
                How do I create recurring events?
              </Link>
              <Link href="/companies/faq#image-size" className="block text-sm text-primary hover:underline">
                What image size should I use?
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Subscription & Billing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/companies/faq#tiers" className="block text-sm text-primary hover:underline">
                What are the subscription tiers?
              </Link>
              <Link href="/companies/faq#upgrade" className="block text-sm text-primary hover:underline">
                How do I upgrade my plan?
              </Link>
              <Link href="/companies/faq#auto-approval" className="block text-sm text-primary hover:underline">
                What is auto-approval?
              </Link>
              <Link href="/companies/faq#expired" className="block text-sm text-primary hover:underline">
                What happens if my subscription expires?
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Video Tutorials */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Video Tutorials</h2>
        <Card>
          <CardContent className="pt-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <h3 className="font-semibold">Getting Started with CodeUnia</h3>
                <p className="text-sm text-muted-foreground">
                  A comprehensive walkthrough of company registration and your first event
                </p>
                <Button variant="outline" size="sm" disabled>
                  Coming Soon
                </Button>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">Managing Your Team</h3>
                <p className="text-sm text-muted-foreground">
                  Learn how to invite members and assign roles effectively
                </p>
                <Button variant="outline" size="sm" disabled>
                  Coming Soon
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contact Support */}
      <Card className="bg-primary text-primary-foreground">
        <CardHeader>
          <CardTitle>Still need help?</CardTitle>
          <CardDescription className="text-primary-foreground/80">
            Our support team is here to assist you
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-semibold mb-2">Email Support</h4>
              <p className="text-sm text-primary-foreground/80 mb-2">
                Get help from our support team within 24 hours
              </p>
              <a
                href="mailto:support@codeunia.com"
                className="text-sm underline hover:no-underline"
              >
                support@codeunia.com
              </a>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Priority Support</h4>
              <p className="text-sm text-primary-foreground/80 mb-2">
                Pro and Enterprise customers get priority support
              </p>
              <Link href="/dashboard/company/subscription" className="text-sm underline hover:no-underline">
                Upgrade for Priority Support →
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
