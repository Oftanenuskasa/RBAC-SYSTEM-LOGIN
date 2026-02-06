import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Fetch audit logs
export async function GET() {
  try {
    const logs = await prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        user: {
          select: {
            name: true,
            email: true,
            role: true
          }
        }
      }
    });
    
    return NextResponse.json(logs);
  } catch (error) {
    console.error('Error fetching logs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch logs' },
      { status: 500 }
    );
  }
}

// POST - Create audit log
export async function POST(request) {
  try {
    const data = await request.json();
    
    const log = await prisma.auditLog.create({
      data: {
        action: data.action,
        details: data.details,
        userId: data.userId,
        userName: data.userName,
      }
    });
    
    return NextResponse.json(log);
  } catch (error) {
    console.error('Error creating log:', error);
    return NextResponse.json(
      { error: 'Failed to create log' },
      { status: 500 }
    );
  }
}

// DELETE - Clear audit logs
export async function DELETE() {
  try {
    await prisma.auditLog.deleteMany();
    
    return NextResponse.json({ 
      success: true, 
      message: 'All logs cleared' 
    });
  } catch (error) {
    console.error('Error clearing logs:', error);
    return NextResponse.json(
      { error: 'Failed to clear logs' },
      { status: 500 }
    );
  }
}
