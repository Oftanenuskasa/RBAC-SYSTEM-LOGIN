import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function GET(request) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json({ user: null });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    
    if (!decoded) {
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({
      user: {
        id: decoded.id,
        email: decoded.email,
        name: decoded.name,
        role: decoded.role,
      },
    });

  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json({ user: null });
  } finally {
    await prisma.$disconnect();
  }
}
