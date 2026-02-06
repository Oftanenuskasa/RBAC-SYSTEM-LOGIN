#!/bin/bash

echo "🔧 Fixing the View Reports button..."

# Use sed to add onClick to the button
sed -i '101,103s/<button className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700">\s*View Reports\s*<\/button>/<button onClick={() => router.push("\/dashboard\/admin\/reports")} className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700">\n              View Reports\n            <\/button>/' app/dashboard/admin/page.jsx

echo "✅ Button updated!"
echo ""
echo "Verifying the change..."
grep -n -A3 -B1 "View Reports" app/dashboard/admin/page.jsx
