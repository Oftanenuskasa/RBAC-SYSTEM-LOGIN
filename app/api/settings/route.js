import { NextResponse } from 'next/server';
import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Fetch system settings
export async function GET() {
  try {
    let settings = await prisma.systemSettings.findFirst();
    
    // If no settings exist, create default ones
    if (!settings) {
      settings = await prisma.systemSettings.create({
        data: {
          siteName: 'RBAC System',
          maintenanceMode: false,
          userRegistration: true,
          defaultUserRole: Role.USER,
          sessionTimeout: 24,
          emailNotifications: true,
          auditLogging: true,
        }
      });
    }
    
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

// POST - Update system settings
export async function POST(request) {
  try {
    const data = await request.json();
    
    // Check if settings exist
    let existing = await prisma.systemSettings.findFirst();
    
    let settings;
    if (existing) {
      // Update existing settings
      settings = await prisma.systemSettings.update({
        where: { id: existing.id },
        data: {
          siteName: data.siteName,
          maintenanceMode: data.maintenanceMode,
          userRegistration: data.userRegistration,
          defaultUserRole: data.defaultUserRole,
          sessionTimeout: data.sessionTimeout,
          emailNotifications: data.emailNotifications,
          auditLogging: data.auditLogging,
        }
      });
    } else {
      // Create new settings
      settings = await prisma.systemSettings.create({
        data: {
          siteName: data.siteName || 'RBAC System',
          maintenanceMode: data.maintenanceMode || false,
          userRegistration: data.userRegistration || true,
          defaultUserRole: data.defaultUserRole || Role.USER,
          sessionTimeout: data.sessionTimeout || 24,
          emailNotifications: data.emailNotifications || true,
          auditLogging: data.auditLogging || true,
        }
      });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Settings updated',
      settings 
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}
