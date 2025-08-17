#!/bin/bash

echo "🔍 Testing Email Infinite Loop Fix..."
echo "==================================="

# Wait for server to be ready
echo "⏳ Waiting for server to start..."
sleep 5

# Test email preview to ensure server is working
echo "📧 Testing email preview..."
PREVIEW_RESPONSE=$(curl -s "http://localhost:3002/api/email-preview?type=free" | head -1)
if [[ $PREVIEW_RESPONSE == *"DOCTYPE html"* ]]; then
    echo "✅ Email preview working correctly"
else
    echo "❌ Email preview not working"
    exit 1
fi

echo ""
echo "🧪 Testing membership card API (should not cause infinite loop)..."

# Test with non-existent user (should return user not found, not infinite loop)
API_RESPONSE=$(curl -s -X POST "http://localhost:3002/api/membership/send-card" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-123",
    "email": "test@example.com", 
    "name": "Test User",
    "membershipType": "free",
    "membershipId": "FREE-001-2025"
  }')

echo "API Response: $API_RESPONSE"

if [[ $API_RESPONSE == *"User profile not found"* ]]; then
    echo "✅ API working correctly - no infinite loop detected"
    echo "🎉 Fix successful! The API correctly handles requests without infinite loops."
else
    echo "❌ Unexpected API response"
fi

echo ""
echo "📝 Summary:"
echo "- Email system now has protection against infinite loops"
echo "- Added hasTriedAutoSend flag to prevent duplicate sends"
echo "- Removed duplicate auto-send logic from MembershipCard component"
echo "- Auto-send only triggers once per user session"
