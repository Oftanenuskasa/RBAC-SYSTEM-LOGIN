import re

with open('app/dashboard/admin/page.jsx', 'r') as f:
    lines = f.readlines()

# Find and fix line 101-103
for i in range(len(lines)):
    if i >= 100 and i <= 102:  # Lines 101-103 (0-indexed)
        if 'View Reports' in lines[i]:
            # This is line 103 (View Reports line)
            lines[i-2] = '            <button onClick={() => router.push("/dashboard/admin/reports")} className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700">\n'
            lines[i] = '              View Reports\n'
            lines[i+1] = '            </button>\n'

with open('app/dashboard/admin/page.jsx', 'w') as f:
    f.writelines(lines)

print("✅ Button fixed manually!")
