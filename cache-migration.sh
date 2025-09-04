#!/bin/bash

# Unified Cache Migration Script
# This script helps migrate from fragmented cache system to unified cache system

echo "🔄 Starting Unified Cache Migration..."

BACKUP_DIR="cache-migration-backup-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"

echo "📦 Creating backup..."

# Backup existing files
cp app/api/leaderboard/route.ts "$BACKUP_DIR/"
cp app/api/hackathons/route.ts "$BACKUP_DIR/"
cp app/api/tests/public/route.ts "$BACKUP_DIR/"
cp app/api/verify-certificate/route.ts "$BACKUP_DIR/"

echo "✅ Backup created in $BACKUP_DIR"

# Phase 1: Test unified API routes by renaming
echo "🧪 Phase 1: Testing unified routes..."

# Rename original routes to .original
mv app/api/leaderboard/route.ts app/api/leaderboard/route.original.ts
mv app/api/hackathons/route.ts app/api/hackathons/route.original.ts
mv app/api/tests/public/route.ts app/api/tests/public/route.original.ts
mv app/api/verify-certificate/route.ts app/api/verify-certificate/route.original.ts

# Rename unified routes to active
mv app/api/leaderboard/route.unified.ts app/api/leaderboard/route.ts
mv app/api/hackathons/route.unified.ts app/api/hackathons/route.ts
mv app/api/tests/public/route.unified.ts app/api/tests/public/route.ts
mv app/api/verify-certificate/route.unified.ts app/api/verify-certificate/route.ts

echo "🔄 Routes switched to unified versions"
echo "🏗️  Run 'npm run build' to test the unified system"
echo "📝 If successful, you can delete the .original.ts files"
echo "🔙 If issues arise, run the rollback script"

# Create rollback script
cat > cache-migration-rollback.sh << 'EOF'
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
EOF

chmod +x cache-migration-rollback.sh

echo "✅ Migration Phase 1 complete!"
echo "📋 Next steps:"
echo "   1. Run 'npm run build' to test"
echo "   2. If successful, proceed to Phase 2 (remove old cache libraries)"
echo "   3. If issues, run './cache-migration-rollback.sh'"
