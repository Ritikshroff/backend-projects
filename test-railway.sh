#!/bin/bash

# Backend API Testing Script
# Railway URL: https://backend-projects-production.up.railway.app

BASE_URL="https://backend-projects-production.up.railway.app"

echo "🚀 Testing Backend API on Railway..."
echo "=================================="
echo ""

# Test 1: Health Check
echo "1️⃣  Testing Root Endpoint (/)..."
curl -s "$BASE_URL/" | jq '.' || echo "❌ Root endpoint failed"
echo ""

# Test 2: Health endpoint
echo "2️⃣  Testing Health Endpoint (/health)..."
curl -s "$BASE_URL/health" | jq '.' || echo "❌ Health endpoint failed"
echo ""

# Test 3: Check if user routes exist (should return 404 for GET, but confirms route exists)
echo "3️⃣  Testing User Routes (/api/v1/users/register)..."
echo "Note: This should return 404 because register is POST only"
curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" "$BASE_URL/api/v1/users/register"
echo ""

# Test 4: Check posts routes
echo "4️⃣  Testing Posts Routes (/api/v1/posts/feed)..."
echo "Note: This requires authentication, so it should return 401"
curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" "$BASE_URL/api/v1/posts/feed"
echo ""

echo "=================================="
echo "✅ Basic connectivity tests complete!"
echo ""
echo "📝 Available Endpoints:"
echo "  - POST $BASE_URL/api/v1/users/register"
echo "  - POST $BASE_URL/api/v1/users/login"
echo "  - POST $BASE_URL/api/v1/users/logout"
echo "  - GET  $BASE_URL/api/v1/posts/feed"
echo "  - POST $BASE_URL/api/v1/posts"
echo ""
echo "💡 Use Postman or Thunder Client to test POST endpoints with proper data"
