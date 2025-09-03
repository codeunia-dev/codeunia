#!/bin/bash

# Production Cache Clear Script
# Run this script after any deployment or major update

set -e  # Exit on any error

echo "🚀 Starting Production Cache Clearing Process..."
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${2}${1}${NC}"
}

# 1. Clear local development cache
print_status "🗑️  Clearing local Next.js cache..." $BLUE
rm -rf .next
print_status "✅ Local cache cleared!" $GREEN

# 2. Clear npm cache
print_status "📦 Clearing npm cache..." $BLUE
npm cache clean --force
print_status "✅ npm cache cleared!" $GREEN

# 3. Run production cache invalidation
print_status "🌐 Running production cache invalidation..." $BLUE
node scripts/production-cache-invalidation.js
if [ $? -eq 0 ]; then
    print_status "✅ Production cache invalidation completed!" $GREEN
else
    print_status "⚠️  Production cache invalidation had some issues" $YELLOW
fi

# 4. Clear browser instructions
echo ""
print_status "📱 Manual Browser Cache Clearing Instructions:" $BOLD
print_status "1. Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)" $YELLOW
print_status "2. Clear all browser data for your domain" $YELLOW
print_status "3. Or use Incognito/Private browsing for immediate results" $YELLOW

echo ""
print_status "🎉 Cache clearing process completed!" $GREEN
print_status "Your website should now serve fresh content immediately." $GREEN
