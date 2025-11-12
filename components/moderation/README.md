# Moderation Components

This directory contains components for the admin moderation system.

## Components

### ModerationQueue

The main component for displaying and managing the event moderation queue.

**Features:**
- Display pending events with company information
- Show automated check results for each event
- Filter and sort events
- Bulk actions (approve/reject multiple events)
- Individual event actions (approve, reject, request changes)
- Pagination support
- Real-time updates

**Usage:**
```tsx
import { ModerationQueue } from "@/components/moderation/ModerationQueue"

export default function ModerationPage() {
  return <ModerationQueue />
}
```

**Props:**
None - the component manages its own state and fetches data from the API.

**API Endpoints Used:**
- `GET /api/admin/moderation/events` - Fetch pending events
- `POST /api/admin/moderation/events/[id]/approve` - Approve an event
- `POST /api/admin/moderation/events/[id]/reject` - Reject an event
- `POST /api/admin/moderation/events/[id]/request-changes` - Request changes

## Automated Checks

The moderation queue displays automated check results for each event:

- **Passed**: All automated checks passed (green badge)
- **Failed**: One or more checks failed (red badge with issue count)
- **Not Checked**: Checks haven't been run yet (gray badge)

Common automated checks include:
- Profanity detection
- Duplicate event detection
- Image quality validation
- Required field validation
- Company verification status

## Actions

### Individual Actions

- **View**: Opens the event in a new tab for preview
- **Approve**: Approves the event and makes it live
- **Reject**: Rejects the event with a reason
- **Request Changes**: Asks the company to make changes before resubmitting

### Bulk Actions

Select multiple events using checkboxes and perform bulk approve or reject operations.

## Filtering and Sorting

**Sort Options:**
- Submission Date (default)
- Event Date
- Company Name

**Filter Options:**
- All Events (default)
- Passed Checks
- Failed Checks

## Future Enhancements

- [ ] Add hackathon moderation support
- [ ] Add moderation history view
- [ ] Add event comparison for duplicate detection
- [ ] Add automated approval for trusted companies
- [ ] Add moderation analytics dashboard
