const { PrismaClient, Role } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedSettings() {
  console.log('🌱 Seeding system settings...');
  
  // Check if settings already exist
  const existingSettings = await prisma.systemSettings.findFirst();
  
  if (!existingSettings) {
    await prisma.systemSettings.create({
      data: {
        siteName: 'RBAC System',
        maintenanceMode: false,
        userRegistration: true,
        defaultUserRole: Role.USER,
        sessionTimeout: 24,
        emailNotifications: true,
        auditLogging: true
      }
    });
    console.log('✅ System settings created');
  } else {
    console.log('✅ System settings already exist');
  }
}

seedSettings()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
