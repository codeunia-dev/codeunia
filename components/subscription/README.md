# Subscription Management System

This directory contains components and utilities for managing company subscriptions and enforcing tier limits.

## Components

### UpgradePrompt
Displays upgrade prompts when subscription limits are reached.

**Props:**
- `currentTier`: Current subscription tier
- `reason`: Reason for upgrade prompt
- `limitType`: Type of limit reached ('events' | 'team_members')
- `currentUsage`: Current usage count
- `limit`: Maximum allowed by tier
- `onUpgrade`: Callback for upgrade action
- `variant`: Display variant ('inline' | 'modal' | 'banner')

**Usage:**
```tsx
<UpgradePrompt
  currentTier="free"
  reason="You've reached your monthly event limit"
  limitType="events"
  currentUsage={2}
  limit={2}
  onUpgrade={() => router.push('/subscription')}
  variant="modal"
/>
```

### SubscriptionManagement
Full subscription management interface showing current plan, usage, and upgrade options.

**Props:**
- `company`: Company object
- `userRole`: Current user's role in the company

**Usage:**
```tsx
<SubscriptionManagement company={company} userRole="owner" />
```

### SubscriptionExpiryWarning
Warning banner/card for expiring subscriptions.

**Props:**
- `daysUntilExpiry`: Number of days until subscription expires
- `companySlug`: Company slug for navigation
- `variant`: Display variant ('banner' | 'card')

**Usage:**
```tsx
<SubscriptionExpiryWarning
  daysUntilExpiry={5}
  companySlug="acme-corp"
  variant="banner"
/>
```

## Hooks

### useSubscription
Hook for fetching and managing subscription data.

**Returns:**
- `usage`: Current subscription usage data
- `loading`: Loading state
- `error`: Error message if any
- `checkLimit`: Function to check if action is allowed
- `showUpgradePrompt`: Function to show upgrade toast
- `refetch`: Function to refetch usage data

**Usage:**
```tsx
const { usage, checkLimit, showUpgradePrompt } = useSubscription(companySlug)

if (!checkLimit('create_event')) {
  showUpgradePrompt('create_event')
  return
}
```

## Services

### SubscriptionService
Server-side service for subscription operations.

**Methods:**
- `getSubscriptionUsage(companyId)`: Get current usage and limits
- `checkSubscriptionLimit(companyId, action)`: Check if action is allowed
- `updateSubscriptionTier(companyId, tier, expiresAt?)`: Update subscription tier
- `cancelSubscription(companyId)`: Cancel subscription (downgrade to free)
- `suspendSubscription(companyId)`: Suspend subscription
- `reactivateSubscription(companyId)`: Reactivate suspended subscription
- `getExpiringSubscriptions(daysThreshold)`: Get subscriptions expiring soon
- `getRecommendedUpgrade(companyId)`: Get recommended upgrade tier

## API Routes

### GET /api/companies/[slug]/subscription/usage
Get subscription usage for a company.

**Response:**
```json
{
  "success": true,
  "usage": {
    "events_this_month": 2,
    "team_members": 1,
    "limits": {
      "events_per_month": 2,
      "team_members": 1,
      "auto_approval": false,
      "api_access": false,
      "custom_branding": false,
      "priority_support": false
    },
    "can_create_event": false,
    "can_add_team_member": false,
    "events_remaining": 0,
    "team_members_remaining": 0,
    "subscription_expires_soon": false,
    "days_until_expiry": null
  }
}
```

### POST /api/companies/[slug]/subscription/upgrade
Upgrade subscription tier (owner only).

**Request:**
```json
{
  "tier": "basic" | "pro" | "enterprise"
}
```

**Response:**
```json
{
  "success": true,
  "company": { ... },
  "message": "Successfully upgraded to basic plan"
}
```

### POST /api/companies/[slug]/subscription/cancel
Cancel subscription (owner only).

**Response:**
```json
{
  "success": true,
  "company": { ... },
  "message": "Subscription cancelled successfully"
}
```

## Subscription Tiers

### Free
- 2 events per month
- 1 team member
- Manual approval required
- No API access
- No custom branding
- Standard support

### Basic ($49/month)
- 10 events per month
- Up to 3 team members
- Manual approval required
- No API access
- Custom branding
- Email support

### Pro ($149/month)
- Unlimited events
- Up to 10 team members
- Auto-approval for events
- API access
- Custom branding
- Priority support
- Advanced analytics

### Enterprise (Custom pricing)
- Unlimited events
- Unlimited team members
- Auto-approval for events
- API access
- Custom branding
- Priority support
- Dedicated account manager
- Custom integrations
- SLA guarantee
- White-label options

## Enforcement Points

Subscription limits are enforced at:

1. **Event Creation** (`POST /api/events`)
   - Checks `events_per_month` limit
   - Returns 403 with upgrade prompt if limit reached

2. **Team Member Invitation** (`POST /api/companies/[slug]/members/invite`)
   - Checks `team_members` limit
   - Returns 403 with upgrade prompt if limit reached

3. **Dashboard UI**
   - Shows usage progress bars
   - Displays expiry warnings
   - Disables actions when limits reached

## Integration Example

```tsx
// In event creation form
import { useSubscription } from '@/hooks/useSubscription'
import { UpgradePrompt } from '@/components/subscription'

function CreateEventForm({ companySlug }) {
  const { usage, checkLimit, showUpgradePrompt } = useSubscription(companySlug)
  const [showUpgrade, setShowUpgrade] = useState(false)

  const handleSubmit = async (data) => {
    // Check limit before submitting
    if (!checkLimit('create_event')) {
      setShowUpgrade(true)
      return
    }

    // Proceed with event creation
    const response = await fetch('/api/events', {
      method: 'POST',
      body: JSON.stringify(data)
    })

    if (response.status === 403) {
      const error = await response.json()
      if (error.upgrade_required) {
        setShowUpgrade(true)
      }
    }
  }

  return (
    <>
      {showUpgrade && usage && (
        <UpgradePrompt
          currentTier={usage.limits.tier}
          reason="You've reached your event limit"
          limitType="events"
          currentUsage={usage.events_this_month}
          limit={usage.limits.events_per_month}
          onUpgrade={() => router.push(`/dashboard/company/${companySlug}/subscription`)}
          variant="modal"
        />
      )}
      <form onSubmit={handleSubmit}>
        {/* Form fields */}
      </form>
    </>
  )
}
```

## Testing

To test subscription enforcement:

1. Create a company with free tier
2. Create 2 events (should succeed)
3. Try to create 3rd event (should show upgrade prompt)
4. Upgrade to basic tier
5. Create more events (should succeed up to 10)
6. Test team member limits similarly

## Notes

- Platform admins bypass all subscription limits
- CodeUnia events (is_codeunia_event=true) bypass limits
- Subscription checks are performed server-side for security
- Client-side checks provide better UX but are not relied upon for enforcement
