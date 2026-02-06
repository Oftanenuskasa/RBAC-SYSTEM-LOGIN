#!/bin/bash

echo "🔍 Testing API connection..."
echo "============================="

# Test 1: Check if server is running
echo "\n1️⃣  Testing if server is running..."
curl -s http://localhost:3000/api/health > /dev/null
if [ $? -eq 0 ]; then
    echo "✅ Server is running"
else
    echo "❌ Server is not running"
    echo "Start the server with: npm run dev"
    exit 1
fi

# Test 2: Try login
echo "\n2️⃣  Testing login..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}')
  
echo "Login response: $LOGIN_RESPONSE"

# Extract token from response (simple grep approach)
TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
if [ -n "$TOKEN" ]; then
    echo "✅ Got auth token"
    echo "Token preview: ${TOKEN:0:20}..."
    
    # Test 3: Get users
    echo "\n3️⃣  Testing users API..."
    USERS_RESPONSE=$(curl -s http://localhost:3000/api/admin/users \
      -H "Cookie: auth-token=$TOKEN")
    
    echo "Users API response: $USERS_RESPONSE"
else
    echo "❌ Failed to get token"
    echo "Check if admin user exists and password is correct"
    echo "Run: node seed.js to create admin user"
fi

echo "\n============================="
echo "Test completed!"
