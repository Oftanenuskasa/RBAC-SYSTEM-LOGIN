import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-123';

// Middleware to verify admin
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
    
    console.log('🔐 Token from cookie:', token ? 'Found' : 'Not found');
    
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

// GET - List all users
export async function GET(request) {
  try {
    console.log('🔍 Fetching users from database...');
    
    const auth = await verifyAdmin(request);
    if (auth.error) {
      console.log('❌ Auth error:', auth.error);
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    // Fetch users from PostgreSQL
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    console.log(`✅ Found ${users.length} users in database`);
    return NextResponse.json({ 
      success: true, 
      users,
      count: users.length 
    });

  } catch (error) {
    console.error('❌ Error fetching users:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch users' 
    }, { status: 500 });
  }
}

// POST - Create new user
export async function POST(request) {
  try {
    console.log('📝 Creating new user...');
    
    const auth = await verifyAdmin(request);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await request.json();
    const { email, password, name, role } = body;

    console.log('📦 User data:', { email, name, role });

    // Validation
    if (!email || !password || !name || !role) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save to PostgreSQL database
    const newUser = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        name,
        role,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    console.log('✅ User created in database:', newUser.email);
    
    return NextResponse.json({
      success: true,
      message: 'User created successfully',
      user: newUser,
    });

  } catch (error) {
    console.error('❌ Error creating user:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}
