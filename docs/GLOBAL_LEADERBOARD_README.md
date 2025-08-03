# Global Leaderboard System for Codeunia

## Overview

The Global Leaderboard System is a modular, platform-wide engagement system that rewards users for their participation across all Codeunia modules. It provides a unified scoring mechanism that reflects user activity and engagement throughout the platform.

## Features

### 🏆 Core Features
- **Global Point System**: Unified scoring across all platform activities
- **Real-time Rankings**: Dynamic leaderboard with automatic rank calculations
- **Badge System**: 5-tier badge system (Bronze → Silver → Gold → Platinum → Diamond)
- **Activity Tracking**: Comprehensive logging of all user activities
- **Modular Design**: Standalone components that can be easily embedded or customized

### 📊 User Experience
- **Profile Integration**: Global score & rank displayed on user profiles
- **Dedicated Leaderboard Page**: Full leaderboard view with filters and search
- **Progress Tracking**: Visual progress indicators for next badge levels
- **Activity History**: Detailed log of all point-earning activities

## Architecture

### Database Schema

#### `user_points` Table
```sql
- id (UUID, Primary Key)
- user_id (UUID, Foreign Key to auth.users)
- total_points (INTEGER, Default: 0)
- rank (INTEGER, Default: 0)
- last_updated (TIMESTAMP)
- created_at (TIMESTAMP)
```

#### `user_activity_log` Table
```sql
- id (UUID, Primary Key)
- user_id (UUID, Foreign Key to auth.users)
- activity_type (TEXT, Constrained to valid activities)
- related_id (UUID, Optional - test_id, blog_id, etc.)
- points_awarded (INTEGER)
- created_at (TIMESTAMP)
```

### Point System

| Activity | Points | Description |
|----------|--------|-------------|
| Daily Login | +5 | Daily login bonus |
| Test Registration | +5 | Registering for any test |
| Test Completion | +10 | Completing a test |
| Hackathon Registration | +5 | Registering for hackathons |
| Hackathon Participation | +10 | Participating in hackathons |
| Blog Read | +2 | Reading blog posts |
| Blog Like | +1 | Liking blog posts |
| Blog Share | +5 | Sharing content on social media |
| Profile Update | +2 | Updating profile information |
| Certificate Earned | +15 | Earning certificates |
| Top 3 Rank | +15 | Achieving top 3 in events |
| User Referral | +10 | Referring new users |

### Badge System

| Badge | Points Required | Description |
|-------|----------------|-------------|
| 🥉 Bronze | 0+ | Getting started on Codeunia |
| 🥈 Silver | 100+ | Active community member |
| 🥇 Gold | 500+ | Dedicated contributor |
| 💎 Platinum | 1000+ | Elite community leader |
| 💎 Diamond | 2500+ | Legendary status |

## Implementation

### Core Components

#### 1. Types (`types/global-leaderboard.ts`)
- Defines all TypeScript interfaces and types
- Activity types, badge types, API response types
- Point system configuration

#### 2. Service (`lib/services/global-leaderboard.ts`)
- Core business logic for points and rankings
- Database operations and calculations
- Badge system management

#### 3. Hook (`hooks/useGlobalLeaderboard.ts`)
- React hook for component integration
- State management and data fetching
- Real-time updates and caching

#### 4. Components
- `GlobalScoreCard`: Profile page integration
- `GlobalLeaderboard`: Full leaderboard page
- Modular design for easy embedding

### API Endpoints

#### `GET /api/leaderboard`
- Fetch leaderboard data with pagination
- Support for filters (time range, badge, search)
- Returns user's current rank and points

#### `POST /api/leaderboard`
- Award points for activities
- Requires activity type and optional related ID
- Automatic rank recalculation

#### `GET /api/leaderboard/stats`
- Global statistics (total users, points, averages)
- User-specific data (rank, points, badge progress)

### Database Functions

#### `award_points_for_activity(user_id, activity_type, related_id)`
- Awards points based on activity type
- Logs activity in user_activity_log
- Updates user's total points

#### `recalculate_user_ranks()`
- Recalculates all user ranks based on total points
- Called automatically via database triggers
- Ensures consistent ranking

#### `increment_points(user_id, points_to_add)`
- Safely increments user points
- Creates user record if doesn't exist
- Updates last_updated timestamp

## Integration Points

### Existing Systems Integration

#### 1. Activity Service Integration
- Modified `lib/services/activity.ts` to award global points
- Automatic point awarding for existing activities
- Backward compatible with existing contribution graph

#### 2. Profile Page Integration
- Added `GlobalScoreCard` to profile settings
- Displays user's rank, points, and badge progress
- Links to full leaderboard and activity log

#### 3. Test System Integration
- Test registrations and completions award points
- Top 3 rankings in tests award bonus points
- Integration with existing test leaderboards

### Future Integration Points

#### 1. Blog System
- Blog reads, likes, and shares award points
- Content creation could award additional points

#### 2. Hackathon System
- Registration and participation points
- Achievement-based point bonuses

#### 3. Certificate System
- Certificate generation awards points
- Special certificates could award bonus points

## Security & Performance

### Row Level Security (RLS)
- Users can only view their own points and activity logs
- Admins can view all data
- System functions have appropriate permissions

### Performance Optimizations
- Indexed queries for fast leaderboard retrieval
- Pagination for large datasets
- Caching of frequently accessed data
- Efficient rank calculations via database triggers

### Data Integrity
- Constraint checks on activity types
- Automatic rank recalculation
- Transaction-safe point awarding

## Usage Examples

### Basic Integration

```typescript
import { useGlobalLeaderboard } from '@/hooks/useGlobalLeaderboard'

function MyComponent() {
  const { userRank, userPoints, userBadge, awardPoints } = useGlobalLeaderboard()
  
  const handleTestCompletion = async () => {
    await awardPoints('test_completion', testId)
  }
  
  return (
    <div>
      <p>Your Rank: #{userRank}</p>
      <p>Your Points: {userPoints}</p>
      <p>Your Badge: {userBadge}</p>
    </div>
  )
}
```

### Awarding Points

```typescript
// Award points for test completion
await globalLeaderboardService.awardPoints(userId, 'test_completion', testId)

// Award points for daily login
await globalLeaderboardService.awardPoints(userId, 'daily_login')

// Award points for blog like
await globalLeaderboardService.awardPoints(userId, 'blog_like', blogId)
```

### Fetching Leaderboard

```typescript
const { entries, total } = await globalLeaderboardService.getLeaderboard(
  1, // page
  20, // limit
  {
    timeRange: 'month',
    badge: 'gold',
    search: 'john'
  }
)
```

## Configuration

### Point System Configuration
Points can be easily reconfigured by modifying the `DEFAULT_POINT_SYSTEM` in the service:

```typescript
const DEFAULT_POINT_SYSTEM: PointSystem = {
  daily_login: 5,
  test_registration: 5,
  test_completion: 10,
  // ... other activities
}
```

### Badge System Configuration
Badge thresholds can be modified in the `BADGE_SYSTEM` array:

```typescript
const BADGE_SYSTEM: BadgeInfo[] = [
  {
    type: 'bronze',
    name: 'Bronze',
    description: 'Getting started on Codeunia',
    minPoints: 0,
    color: '#cd7f32',
    icon: '🥉'
  },
  // ... other badges
]
```

## Deployment

### Database Migration
1. Run the `global-leaderboard-migration.sql` script in Supabase
2. Verify all tables, functions, and policies are created
3. Test the system with sample data

### Application Deployment
1. Deploy the new components and services
2. Update existing activity logging to include global points
3. Test integration points with existing systems

### Monitoring
- Monitor point awarding for accuracy
- Track leaderboard performance
- Monitor database query performance
- Set up alerts for system errors

## Future Enhancements

### Planned Features
1. **Regional Leaderboards**: Leaderboards by region/institute
2. **Time-based Competitions**: Monthly/weekly challenges
3. **Achievement System**: Special achievements with bonus points
4. **Social Features**: Friend challenges and comparisons
5. **Analytics Dashboard**: Detailed user engagement analytics

### Technical Improvements
1. **Real-time Updates**: WebSocket integration for live updates
2. **Advanced Filtering**: More sophisticated search and filter options
3. **Performance Optimization**: Additional caching and optimization
4. **Mobile Optimization**: Enhanced mobile experience

## Troubleshooting

### Common Issues

#### Points Not Awarding
- Check activity type is valid
- Verify user exists in user_points table
- Check RLS policies are correct
- Review database function permissions

#### Ranks Not Updating
- Verify trigger is created and enabled
- Check recalculate_user_ranks function
- Monitor for database errors
- Ensure proper indexing

#### Performance Issues
- Check query performance with EXPLAIN
- Verify indexes are being used
- Monitor database connection pool
- Consider pagination for large datasets

### Debug Tools
- Database logs for function execution
- Application logs for point awarding
- Performance monitoring for queries
- Error tracking for system issues

## Support

For issues or questions about the Global Leaderboard System:
1. Check this documentation
2. Review database logs
3. Test with sample data
4. Contact the development team

---

**Note**: This system is designed to be modular and extensible. All components can be easily modified or replaced without affecting other parts of the platform. 