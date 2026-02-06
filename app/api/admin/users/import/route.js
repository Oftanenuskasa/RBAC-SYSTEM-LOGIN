import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-123';

// Verify admin middleware
async function verifyAdmin(request) {
  try {
    const cookieHeader = request.headers.get('cookie');
    let token = null;
    
    if (cookieHeader) {
      const cookies = cookieHeader.split(';').map(cookie => cookie.trim());
      const authCookie = cookies.find(cookie => cookie.startsWith('auth-token='));
      if (authCookie) {
        token = authCookie.split('=')[1];
      }
    }
    
    if (!token) {
      return { error: 'No token provided', status: 401 };
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== 'ADMIN') {
      return { error: 'Admin access required', status: 403 };
    }
    
    return { user: decoded };
  } catch (error) {
    console.error('Token verification error:', error);
    return { error: 'Invalid token', status: 401 };
  }
}

// Smart CSV parser that handles multiple formats
function parseCSV(csvText) {
  const lines = csvText.split('\n').filter(line => line.trim());
  const users = [];
  
  if (lines.length === 0) return users;
  
  // Get headers and clean them
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''));
  console.log('📋 CSV Headers detected:', headers);
  
  // Determine CSV format
  const hasPassword = headers.some(h => h.includes('password'));
  const hasId = headers.some(h => h === 'id');
  const hasCreatedAt = headers.some(h => h.includes('created'));
  
  console.log('🔍 Format detection:', { hasPassword, hasId, hasCreatedAt });
  
  if (hasId && hasCreatedAt) {
    console.log('📤 Detected EXPORT format (with IDs and timestamps)');
  } else if (hasPassword) {
    console.log('📥 Detected IMPORT format (with passwords)');
  } else {
    console.log('❓ Unknown format, trying basic import');
  }
  
  // Find column indices
  const nameIndex = headers.findIndex(h => 
    h.includes('name') || h.includes('fullname') || h.includes('username')
  );
  const emailIndex = headers.findIndex(h => 
    h.includes('email') || h.includes('mail')
  );
  const roleIndex = headers.findIndex(h => 
    h.includes('role') || h.includes('type') || h.includes('permission')
  );
  const passwordIndex = headers.findIndex(h => 
    h.includes('password') || h.includes('pass') || h.includes('pwd')
  );
  
  console.log('📍 Column indices:', { 
    nameIndex, 
    emailIndex, 
    roleIndex, 
    passwordIndex 
  });
  
  // Process each row
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;
    
    // Parse CSV with quotes handling
    const values = [];
    let current = '';
    let inQuotes = false;
    
    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());
    
    console.log(`📝 Row ${i} parsed values:`, values);
    
    // Extract data based on indices
    const name = nameIndex >= 0 ? values[nameIndex] : '';
    const email = emailIndex >= 0 ? values[emailIndex] : '';
    let role = roleIndex >= 0 ? values[roleIndex] : 'USER';
    const password = passwordIndex >= 0 ? values[passwordIndex] : '';
    
    // Clean values
    const cleanName = name.replace(/"/g, '').trim();
    const cleanEmail = email.replace(/"/g, '').trim().toLowerCase();
    let cleanRole = role.replace(/"/g, '').trim().toUpperCase();
    const cleanPassword = password.replace(/"/g, '').trim();
    
    // Validate and fix role
    const validRoles = ['USER', 'MANAGER', 'ADMIN'];
    if (!validRoles.includes(cleanRole)) {
      console.log(`⚠️ Invalid role "${cleanRole}", defaulting to USER`);
      cleanRole = 'USER';
    }
    
    // Generate password if needed
    let finalPassword = cleanPassword;
    if (!finalPassword || finalPassword === '') {
      finalPassword = `ImportedPass${Date.now().toString().slice(-6)}`;
      console.log(`🔐 Generated password for ${cleanEmail}`);
    }
    
    if (cleanEmail && cleanName) {
      users.push({
        name: cleanName,
        email: cleanEmail,
        role: cleanRole,
        password: finalPassword
      });
      
      console.log(`👤 Added user: ${cleanEmail} as ${cleanRole}`);
    } else {
      console.log(`⚠️ Skipping row ${i}: missing email or name`);
    }
  }
  
  return users;
}

export async function POST(request) {
  try {
    console.log('📥 Starting user import...');
    
    // Verify admin
    const auth = await verifyAdmin(request);
    if (auth.error) {
      console.log('❌ Auth error:', auth.error);
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    
    // Get form data
    const formData = await request.formData();
    const file = formData.get('file');
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }
    
    // Read file content
    const text = await file.text();
    console.log('📄 First 3 lines of file:');
    text.split('\n').slice(0, 3).forEach((line, i) => {
      console.log(`  ${i}: ${line}`);
    });
    
    // Parse CSV
    const usersData = parseCSV(text);
    console.log(`📊 Successfully parsed ${usersData.length} users`);
    
    if (usersData.length === 0) {
      return NextResponse.json(
        { error: 'No valid users found in file. Please check CSV format.' },
        { status: 400 }
      );
    }
    
    // Process users in database
    const results = {
      created: [],
      updated: [],
      errors: []
    };
    
    // Process each user
    for (const userData of usersData) {
      try {
        // Check if user exists
        const existingUser = await prisma.user.findUnique({
          where: { email: userData.email }
        });
        
        if (existingUser) {
          // Update existing user
          console.log(`🔄 Updating: ${userData.email} (${existingUser.role} → ${userData.role})`);
          
          const updateData = {
            name: userData.name,
            role: userData.role,
            updatedAt: new Date()
          };
          
          // Only update password if it's not a generic one
          if (!userData.password.startsWith('TempPass') && !userData.password.startsWith('ImportedPass')) {
            updateData.password = await bcrypt.hash(userData.password, 10);
            console.log(`   ↪ Password updated`);
          }
          
          const updatedUser = await prisma.user.update({
            where: { email: userData.email },
            data: updateData,
            select: {
              id: true,
              email: true,
              name: true,
              role: true,
              updatedAt: true
            }
          });
          
          results.updated.push(updatedUser);
          console.log(`✅ Updated: ${updatedUser.email} as ${updatedUser.role}`);
          
        } else {
          // Create new user
          console.log(`📝 Creating: ${userData.email} as ${userData.role}`);
          
          const hashedPassword = await bcrypt.hash(userData.password, 10);
          
          const newUser = await prisma.user.create({
            data: {
              name: userData.name,
              email: userData.email,
              password: hashedPassword,
              role: userData.role
            },
            select: {
              id: true,
              email: true,
              name: true,
              role: true,
              createdAt: true
            }
          });
          
          results.created.push(newUser);
          console.log(`✅ Created: ${newUser.email} as ${newUser.role}`);
        }
        
      } catch (error) {
        console.error(`❌ Error processing ${userData.email}:`, error.message);
        results.errors.push({
          email: userData.email,
          error: error.message
        });
      }
    }
    
    // Summary
    console.log('🎉 Import Summary:', {
      created: results.created.length,
      updated: results.updated.length,
      errors: results.errors.length
    });
    
    return NextResponse.json({
      success: true,
      message: `Import completed! ${results.created.length} created, ${results.updated.length} updated, ${results.errors.length} errors`,
      summary: {
        totalProcessed: usersData.length,
        created: results.created.length,
        updated: results.updated.length,
        errors: results.errors.length
      },
      created: results.created.map(u => ({ email: u.email, role: u.role })),
      updated: results.updated.map(u => ({ email: u.email, role: u.role })),
      errors: results.errors
    });
    
  } catch (error) {
    console.error('❌ Import failed:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Import failed',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
