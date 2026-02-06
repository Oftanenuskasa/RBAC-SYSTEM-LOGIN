#!/bin/bash

echo "🔧 Updating Reports button..."

# Create a temporary file
temp_file=$(mktemp)

# Read the file and replace the button
awk '
/View Reports.*button/ {
    in_button = 1
}
in_button && /<\/button>/ {
    print "            <button "
    print "              onClick={() => router.push(\047/dashboard/admin/reports\047)}"
    print "              className=\"w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700\""
    print "            >"
    print "              View Reports"
    print "            </button>"
    in_button = 0
    next
}
!in_button {
    print $0
}
' app/dashboard/admin/page.jsx > "$temp_file"

# Replace the original file
mv "$temp_file" app/dashboard/admin/page.jsx

echo "✅ Button updated!"
echo ""
echo "📋 Verification:"
grep -n -A3 "View Reports" app/dashboard/admin/page.jsx
