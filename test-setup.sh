#!/bin/bash

echo "Checking required files..."

# Check if files exist
files=(
  "lib/prisma.js"
  "app/api/admin/users/route.js"
  "app/api/admin/users/[id]/route.js"
  "app/api/auth/login/route.js"
  "app/api/auth/logout/route.js"
  "app/dashboard/admin/page.jsx"
  "app/dashboard/admin/users/page.jsx"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "✓ $file"
  else
    echo "✗ $file (missing)"
  fi
done

echo ""
echo "Setup steps:"
echo "1. Make sure bcryptjs is installed: npm install bcryptjs"
echo "2. Generate Prisma client: npx prisma generate"
echo "3. Push database schema: npx prisma db push"
echo "4. Start development server: npm run dev"
echo ""
echo "Access points:"
echo "- Admin Dashboard: http://localhost:3000/dashboard/admin"
echo "- User Management: http://localhost:3000/dashboard/admin/users"
echo ""
echo "Default login: admin@example.com / password123"
