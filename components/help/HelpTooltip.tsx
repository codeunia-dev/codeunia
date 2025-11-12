'use client'

import { HelpCircle } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface HelpTooltipProps {
  content: string
  side?: 'top' | 'right' | 'bottom' | 'left'
  className?: string
}

export function HelpTooltip({ content, side = 'top', className = '' }: HelpTooltipProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className={`inline-flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors ${className}`}
            aria-label="Help information"
          >
            <HelpCircle className="h-4 w-4" />
          </button>
        </TooltipTrigger>
        <TooltipContent side={side} className="max-w-xs">
          <p className="text-sm">{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

interface HelpTextProps {
  title: string
  description: string
  side?: 'top' | 'right' | 'bottom' | 'left'
  className?: string
}

export function HelpText({ title, description, side = 'top', className = '' }: HelpTextProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className={`inline-flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors ${className}`}
            aria-label={`Help: ${title}`}
          >
            <HelpCircle className="h-4 w-4" />
          </button>
        </TooltipTrigger>
        <TooltipContent side={side} className="max-w-sm">
          <div className="space-y-1">
            <p className="font-semibold text-sm">{title}</p>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

// Predefined help tooltips for common fields
export const CompanyHelpTooltips = {
  companyName: {
    title: 'Company Name',
    description: 'Your company\'s public display name. This will be visible to all users on the platform.',
  },
  legalName: {
    title: 'Legal Name',
    description: 'Your company\'s official registered name as it appears on legal documents.',
  },
  slug: {
    title: 'Company Slug',
    description: 'A unique URL-friendly identifier for your company. This will be used in your company profile URL.',
  },
  industry: {
    title: 'Industry',
    description: 'Select the primary industry your company operates in. This helps users discover relevant events.',
  },
  companySize: {
    title: 'Company Size',
    description: 'Select the size category that best describes your organization.',
  },
  verificationDocuments: {
    title: 'Verification Documents',
    description: 'Upload official documents to verify your company (business license, tax ID, etc.). Documents are encrypted and stored securely.',
  },
  subscriptionTier: {
    title: 'Subscription Tier',
    description: 'Your current subscription plan determines event limits, team size, and features available.',
  },
}

export const EventHelpTooltips = {
  eventTitle: {
    title: 'Event Title',
    description: 'A clear, descriptive title for your event. Keep it concise and searchable (max 100 characters).',
  },
  eventDescription: {
    title: 'Event Description',
    description: 'Detailed information about your event including agenda, topics, and what attendees will learn. Minimum 200 characters recommended.',
  },
  eventType: {
    title: 'Event Type',
    description: 'Select the format that best describes your event (workshop, webinar, conference, etc.).',
  },
  approvalStatus: {
    title: 'Approval Status',
    description: 'Current moderation status of your event. Events must be approved by platform admins before going live.',
  },
  eventImage: {
    title: 'Event Image',
    description: 'Upload a high-quality banner image (recommended: 1200x630px). This will be displayed on event cards and detail pages.',
  },
  registrationLink: {
    title: 'Registration Link',
    description: 'URL where participants can register for your event. Can be external (Eventbrite, etc.) or use CodeUnia\'s built-in registration.',
  },
  maxParticipants: {
    title: 'Max Participants',
    description: 'Maximum number of attendees for your event. Leave empty for unlimited capacity.',
  },
}

export const TeamHelpTooltips = {
  memberRole: {
    title: 'Member Role',
    description: 'Determines what actions this team member can perform. Owner has full access, Admin can manage events and team, Editor can create drafts, Member has read-only access.',
  },
  invitationEmail: {
    title: 'Invitation Email',
    description: 'Email address of the person you want to invite. They will receive an invitation link to join your company.',
  },
  teamMemberLimit: {
    title: 'Team Member Limit',
    description: 'Your subscription tier determines how many team members you can have. Upgrade to add more members.',
  },
}

export const AnalyticsHelpTooltips = {
  views: {
    title: 'Views',
    description: 'Number of times your event page was viewed by unique visitors.',
  },
  clicks: {
    title: 'Clicks',
    description: 'Number of times the registration button was clicked on your event page.',
  },
  registrations: {
    title: 'Registrations',
    description: 'Total number of participants who registered for your event.',
  },
  conversionRate: {
    title: 'Conversion Rate',
    description: 'Percentage of clicks that resulted in registrations. Higher is better.',
  },
  dateRange: {
    title: 'Date Range',
    description: 'Select the time period for analytics data. Use custom range for specific dates.',
  },
}
