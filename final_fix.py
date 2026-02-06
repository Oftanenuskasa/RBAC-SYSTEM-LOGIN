with open('app/dashboard/admin/page.jsx', 'r') as f:
    content = f.read()

# Find the exact problematic section
problem_section = '''          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">📊 Reports & Analytics</h3>
            <button onClick={() => router.push("/dashboard/admin/reports")} className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700">
            <button className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700">
            </button>
          </div>'''

# Replace with the correct structure
correct_section = '''          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">📊 Reports & Analytics</h3>
            <p className="text-gray-600 mb-4">View system reports and analytics</p>
            <button 
              onClick={() => router.push('/dashboard/admin/reports')}
              className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700"
            >
              View Reports
            </button>
          </div>'''

content = content.replace(problem_section, correct_section)

with open('app/dashboard/admin/page.jsx', 'w') as f:
    f.write(content)

print("✅ Fixed the button structure!")
