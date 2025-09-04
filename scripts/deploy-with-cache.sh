#!/bin/bash

# Production Deployment Script with Cache Management
# This script handles deployment with automatic cache invalidation and warming

set -e  # Exit on any error

echo "🚀 Starting production deployment..."

# 1. Build the application
echo "📦 Building application..."
npm run build

# 2. Purge CDN cache for immediate updates
echo "🧹 Purging CDN cache..."
curl -X POST "${DEPLOY_HOOK_URL}/api/webhooks/cache-purge" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${WEBHOOK_SECRET}" \
  -d '{
    "action": "deploy",
    "source": "deployment-script",
    "data": {
      "buildId": "'${BUILD_ID:-$(date +%s)}'",
      "environment": "production"
    }
  }' || echo "⚠️  Cache purge failed, continuing deployment..."

# 3. Deploy to your platform (customize as needed)
echo "🌐 Deploying to production..."
# For Vercel:
# vercel --prod
# For custom server:
# npm run start

echo "✅ Deployment completed!"

# 4. Warm cache with critical endpoints
echo "🔥 Warming cache..."
sleep 5  # Wait for deployment to be live

SITE_URL="${NEXT_PUBLIC_SITE_URL:-https://codeunia.com}"

# Warm critical pages
curl -s "${SITE_URL}/" > /dev/null || echo "Failed to warm homepage"
curl -s "${SITE_URL}/hackathons" > /dev/null || echo "Failed to warm hackathons"
curl -s "${SITE_URL}/events" > /dev/null || echo "Failed to warm events"
curl -s "${SITE_URL}/leaderboard" > /dev/null || echo "Failed to warm leaderboard"

# Warm critical API endpoints
curl -s "${SITE_URL}/api/hackathons" > /dev/null || echo "Failed to warm hackathons API"
curl -s "${SITE_URL}/api/events" > /dev/null || echo "Failed to warm events API"
curl -s "${SITE_URL}/api/leaderboard/stats" > /dev/null || echo "Failed to warm leaderboard API"

echo "🔥 Cache warming completed!"
echo "🎉 Deployment and cache management completed successfully!"
