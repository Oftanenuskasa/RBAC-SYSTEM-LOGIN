import re

with open('app/dashboard/admin/page.jsx', 'r') as f:
    lines = f.readlines()

# Find and fix the duplicate button issue
for i in range(len(lines)):
    if i >= 100 and i <= 102:  # Lines around the error
        print(f"Line {i+1}: {lines[i].rstrip()}")

# Fix lines 101-103 (0-indexed)
# The problematic lines are:
# 101: <button onClick={() => router.push("/dashboard/admin/reports")} className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700">
# 102: <button className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700">
# 103:   View Reports

# Remove line 102 (the duplicate button opening tag)
lines[101] = ''  # Remove duplicate line (0-indexed line 102)

with open('app/dashboard/admin/page.jsx', 'w') as f:
    f.writelines(lines)

print("✅ Fixed duplicate button tag!")
