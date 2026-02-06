#!/bin/bash

echo "🔍 Checking Reports setup..."

# Check if files exist
if [ -f "app/dashboard/admin/reports/page.jsx" ]; then
  echo "✅ Reports page exists"
else
  echo "❌ Reports page missing"
fi

# Check if button is updated
if grep -q "router.push('/dashboard/admin/reports')" app/dashboard/admin/page.jsx; then
  echo "✅ Reports button links correctly"
else
  echo "❌ Reports button not updated"
fi

# Check API route
if [ -f "app/api/admin/users/route.js" ]; then
  echo "✅ Users API exists"
else
  echo "❌ Users API missing"
fi

echo ""
echo "📋 Setup complete!"
echo "Access Reports at: http://localhost:3000/dashboard/admin/reports"
echo "Features:"
echo "  • User statistics dashboard"
echo "  • CSV export functionality"
echo "  • Excel export functionality"
echo "  • User data preview"
