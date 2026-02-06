import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-123';

async function verifyAdmin(request) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) return { error: 'No token', status: 401 };

    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== 'ADMIN') return { error: 'Admin required', status: 403 };
    
    return { user: decoded };
  } catch (error) {
    return { error: 'Invalid token', status: 401 };
  }
}

// PUT - Update user
export async function PUT(request, { params }) {
  try {
    console.log('✏️ Updating user...');
    
    const auth = await verifyAdmin(request);
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const { id } = params;
    const body = await request.json();
    const { email, name, role, password } = body;

    console.log('📦 Update data:', { id, email, name, role, hasPassword: !!password });

    // Find existing user
    const existingUser = await prisma.user.findUnique({ where: { id } });
    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Prepare update data
    const updateData = {};
    
    if (email && email !== existingUser.email) {
      // Check if new email is taken
      const emailExists = await prisma.user.findUnique({ 
        where: { email: email.toLowerCase() } 
      });
      if (emailExists) {
        return NextResponse.json({ error: 'Email already in use' }, { status: 409 });
      }
      updateData.email = email.toLowerCase();
    }
    
    if (name) updateData.name = name;
    if (role) updateData.role = role;
    
    if (password && password.trim() !== '') {
      updateData.password = await bcrypt.hash(password, 10);
    }

    // Update in PostgreSQL
    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    console.log('✅ User updated:', updatedUser.email);
    
    return NextResponse.json({
      success: true,
      message: 'User updated',
      user: updatedUser,
    });

  } catch (error) {
    console.error('❌ Update error:', error);
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}

// DELETE - Delete user
export async function DELETE(request, { params }) {
  try {
    console.log('🗑️ Deleting user...');
    
    const auth = await verifyAdmin(request);
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const { id } = params;
    
    console.log('🚨 Deleting user ID:', id);

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { id } });
    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Prevent deleting yourself
    const token = request.cookies.get('auth-token')?.value;
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.id === id) {
      return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 });
    }

    // Delete from PostgreSQL
    await prisma.user.delete({ where: { id } });

    console.log('✅ User deleted:', existingUser.email);
    
    return NextResponse.json({
      success: true,
      message: 'User deleted',
    });

  } catch (error) {
    console.error('❌ Delete error:', error);
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  }
}
