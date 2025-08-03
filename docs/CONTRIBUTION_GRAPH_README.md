# GitHub-Style Contribution Graph Implementation

This implementation adds a GitHub-style contribution graph to the Codeunia user dashboard, tracking user activity over the past 365 days.

## Features

- **365-day activity heatmap** similar to GitHub's contribution graph
- **Activity tracking** for various user actions:
  - Test registrations and completions
  - Hackathon participation
  - Daily logins
  - Profile updates
  - Certificate earnings
  - MCQ practice sessions
- **Interactive tooltips** showing activity details on hover
- **Activity filtering** by type
- **Streak tracking** (current and longest streaks)
- **Real-time updates** with automatic activity logging

## Database Setup

### 1. Run the Database Migration

Execute the updated `database-migration.sql` file in your Supabase SQL Editor. This will:

- Create the `user_activity` table
- Add necessary indexes for performance
- Set up Row Level Security (RLS) policies
- Create triggers for automatic activity logging

### 2. Verify the Setup

Check that the following tables and triggers were created:

```sql
-- Check if user_activity table exists
SELECT * FROM information_schema.tables WHERE table_name = 'user_activity';

-- Check if triggers exist
SELECT * FROM information_schema.triggers WHERE event_object_table = 'user_activity';
```

## Activity Types

The system tracks the following activity types:

| Activity Type | Description | Auto-logged |
|---------------|-------------|-------------|
| `test_registration` | User registers for a test | ✅ |
| `test_completion` | User completes a test | ✅ |
| `certificate_earned` | User earns a certificate | ✅ |
| `daily_login` | User logs in (once per day) | ✅ |
| `profile_update` | User updates their profile | ✅ |
| `mcq_practice` | User practices MCQ questions | Manual |
| `hackathon_registration` | User registers for hackathon | Manual |
| `hackathon_participation` | User participates in hackathon | Manual |

## Components

### 1. ContributionGraph Component
- **Location**: `components/ui/contribution-graph.tsx`
- **Features**: Calendar grid, tooltips, filtering, stats display

### 2. Activity Service
- **Location**: `lib/services/activity.ts`
- **Features**: Data fetching, activity logging, streak calculation

### 3. Custom Hook
- **Location**: `hooks/useContributionGraph.ts`
- **Features**: State management, data fetching, activity logging

### 4. API Endpoints
- **Location**: `app/api/user/activity/route.ts`
- **Features**: GET (fetch activity), POST (log activity)

## Integration Points

### 1. Dashboard Integration
The contribution graph is integrated into:
- Main dashboard (`app/protected/page.tsx`)
- Profile view (`components/users/ProfileView.tsx`)

### 2. Activity Logging
Automatic activity logging is implemented for:
- Test registrations (via database trigger)
- Test completions (via database trigger)
- Certificate earnings (via database trigger)
- Daily logins (via hook)
- Profile updates (via component)

## Usage Examples

### Logging Custom Activities

```typescript
import { activityService } from '@/lib/services/activity'

// Log MCQ practice activity
await activityService.logMcqPractice(userId, 10)

// Log hackathon registration
await activityService.logActivity(userId, 'hackathon_registration', {
  hackathon_id: 'hackathon-123',
  hackathon_name: 'Summer Hackathon 2025'
})
```

### Using the Hook

```typescript
import { useContributionGraph } from '@/hooks/useContributionGraph'

function MyComponent() {
  const {
    data,
    loading,
    handleFilterChange,
    refresh,
    logProfileUpdate
  } = useContributionGraph()

  // Use the data and functions as needed
}
```

## Customization

### Adding New Activity Types

1. Update the `ActivityType` in `types/profile.ts`
2. Add the new type to the database migration
3. Update the activity service and components

### Styling

The contribution graph uses Tailwind CSS classes and can be customized by modifying:
- Color intensity in `getColorIntensity()` function
- Activity type colors in `ACTIVITY_TYPE_COLORS`
- Component styling in the JSX

### Performance

The implementation includes:
- Database indexes for fast queries
- Client-side caching via React hooks
- Efficient data processing with useMemo
- Pagination support for large datasets

## Security

- Row Level Security (RLS) ensures users can only see their own activity
- API endpoints require authentication
- Activity data is validated before storage

## Future Enhancements

1. **Admin Dashboard**: View activity analytics for all users
2. **Activity Export**: Allow users to export their activity data
3. **Achievement System**: Badges and rewards based on activity
4. **Social Features**: Share activity with friends
5. **Mobile Optimization**: Responsive design for mobile devices
6. **Activity Insights**: AI-powered activity recommendations

## Troubleshooting

### Common Issues

1. **No activity showing**: Check if the user_activity table exists and has data
2. **Permission errors**: Verify RLS policies are correctly set up
3. **Performance issues**: Ensure database indexes are created
4. **Styling issues**: Check if Tailwind CSS classes are available

### Debug Mode

Enable debug logging by adding console.log statements in the activity service:

```typescript
// In lib/services/activity.ts
console.log('Logging activity:', { userId, activityType, activityData })
```

## Support

For issues or questions about the contribution graph implementation, please refer to the main project documentation or create an issue in the repository. 