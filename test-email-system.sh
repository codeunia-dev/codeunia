#!/bin/bash

# Test the Membership Card Email API
echo "🧪 Testing Membership Card Email System..."
echo "======================================"

# Base URL for the API
API_URL="http://localhost:3001/api/membership/send-card"

echo ""
echo "1️⃣ Testing Free Membership Email:"
echo "--------------------------------"

curl -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-123",
    "email": "test@example.com",
    "name": "Test User",
    "membershipType": "free",
    "membershipId": "FREE-001-2025"
  }' | jq '.'

echo ""
echo ""
echo "2️⃣ Testing Premium Membership Email:"
echo "-----------------------------------"

curl -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-456",
    "email": "premium@example.com",
    "name": "Premium User",
    "membershipType": "premium",
    "membershipId": "PREM-002-2025"
  }' | jq '.'

echo ""
echo ""
echo "3️⃣ Testing Missing Fields (Error Case):"
echo "--------------------------------------"

curl -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "incomplete@example.com"
  }' | jq '.'

echo ""
echo ""
echo "✅ Test completed! Check your email inbox and server logs for results."
echo "📧 If emails were sent successfully, you should see them in the test email addresses."
echo "🔍 Check the terminal running 'npm run dev' for any error logs."
