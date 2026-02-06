import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-123';

const users = [
  {
    id: '1',
    email: 'admin@example.com',
    password: 'password123',
    name: 'Admin User',
    role: 'ADMIN'
  },
  {
    id: '2',
    email: 'manager@example.com',
    password: 'password123',
    name: 'Manager User',
    role: 'MANAGER'
  },
  {
    id: '3',
    email: 'user@example.com',
    password: 'password123',
    name: 'Regular User',
    role: 'USER'
  }
];

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    console.log('Login attempt for:', email);

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password required' },
        { status: 400 }
      );
    }

    const user = users.find(u => u.email === email);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    if (user.password !== password) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    console.log('Login successful! Role:', user.role);

    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        name: user.name, 
        role: user.role 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Create response with cookie
    const response = NextResponse.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      token: token // Also return token in response for debugging
    });

    // Set cookie - make it less restrictive
    response.cookies.set({
      name: 'auth-token',
      value: token,
      httpOnly: false, // Changed to false so JavaScript can read it
      secure: false,   // Changed to false for localhost
      sameSite: 'lax', // Changed to lax
      maxAge: 24 * 60 * 60,
      path: '/',
    });

    console.log('Cookie set successfully');
    return response;

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}
