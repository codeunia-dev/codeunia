#!/bin/bash
echo "🔙 Rolling back cache migration..."

# Restore original routes
mv app/api/leaderboard/route.ts app/api/leaderboard/route.unified.ts
mv app/api/hackathons/route.ts app/api/hackathons/route.unified.ts
mv app/api/tests/public/route.ts app/api/tests/public/route.unified.ts
mv app/api/verify-certificate/route.ts app/api/verify-certificate/route.unified.ts

# Restore original routes
mv app/api/leaderboard/route.original.ts app/api/leaderboard/route.ts
mv app/api/hackathons/route.original.ts app/api/hackathons/route.ts
mv app/api/tests/public/route.original.ts app/api/tests/public/route.ts
mv app/api/verify-certificate/route.original.ts app/api/verify-certificate/route.ts

echo "✅ Rollback complete - original routes restored"
