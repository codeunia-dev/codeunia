# Email Templates

This directory contains email notification templates for the multi-company event hosting feature.

## Templates

### Company Registration & Verification

1. **company-registration-confirmation.tsx**
   - Sent when a company completes registration
   - Confirms receipt and explains the verification process
   - Requirements: 11.1

2. **company-verification-approved.tsx**
   - Sent when a company is verified by admin
   - Provides next steps and dashboard access
   - Requirements: 11.2

3. **company-verification-rejected.tsx**
   - Sent when company verification is rejected
   - Includes rejection reason and resubmission instructions
   - Requirements: 11.3

### Event Management

4. **event-submitted.tsx**
   - Sent when an event is submitted for approval
   - Explains the review process and timeline
   - Requirements: 11.4

5. **event-approved.tsx**
   - Sent when an event is approved by admin
   - Includes event URL and promotion tips
   - Requirements: 11.5

6. **event-rejected.tsx**
   - Sent when an event is rejected
   - Includes rejection reason and edit instructions
   - Requirements: 11.5

### Team Management

7. **team-invitation.tsx**
   - Sent when a user is invited to join a company team
   - Includes role description and acceptance link
   - Requirements: 11.6

### Admin Notifications

8. **new-registration-notification.tsx**
   - Sent to admins when a new company registers
   - Includes company details and verification link
   - Requirements: 11.1

## Usage

```typescript
import {
  getCompanyRegistrationConfirmationEmail,
  getCompanyVerificationApprovedEmail,
  getEventApprovedEmail,
  // ... other templates
} from '@/lib/email/templates'

// Example: Send company registration confirmation
const emailContent = getCompanyRegistrationConfirmationEmail({
  companyName: 'Acme Corp',
  contactEmail: 'contact@acme.com',
  dashboardUrl: 'https://codeunia.com/dashboard/company',
})

await sendCompanyEmail({
  to: 'contact@acme.com',
  subject: emailContent.subject,
  html: emailContent.html,
})
```

## Template Structure

All templates follow a consistent structure:

1. **Header**: CodeUnia branding with gradient background
2. **Content**: Main message with clear formatting
3. **Call-to-Action**: Prominent buttons for primary actions
4. **Footer**: Support contact and copyright information

## Design Guidelines

- Use inline CSS for email client compatibility
- Maintain responsive design with table-based layouts
- Use CodeUnia brand colors (blue gradient: #3b82f6 to #8b5cf6)
- Include clear call-to-action buttons
- Provide helpful context and next steps
- Keep content concise and scannable

## Email Service

Templates are sent using the Resend email service. Configure the following environment variables:

- `RESEND_API_KEY`: Your Resend API key
- `COMPANY_FROM_EMAIL`: Sender email address (default: noreply@codeunia.com)
