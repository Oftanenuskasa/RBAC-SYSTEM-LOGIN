const { PrismaClient, Role } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting complete database seed...');
  
  // Seed users
  console.log('📝 Seeding users...');
  
  // Admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: adminPassword,
      name: 'Administrator',
      role: Role.ADMIN
    }
  });
  console.log('✅ Admin user: admin@example.com (admin123)');
  
  // Manager user
  const managerPassword = await bcrypt.hash('manager123', 10);
  await prisma.user.upsert({
    where: { email: 'manager@example.com' },
    update: {},
    create: {
      email: 'manager@example.com',
      password: managerPassword,
      name: 'Test Manager',
      role: Role.MANAGER
    }
  });
  console.log('✅ Manager user: manager@example.com (manager123)');
  
  // Regular user
  const userPassword = await bcrypt.hash('user123', 10);
  await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      password: userPassword,
      name: 'Test User',
      role: Role.USER
    }
  });
  console.log('✅ Regular user: user@example.com (user123)');
  
  // Seed system settings
  console.log('📝 Seeding system settings...');
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
  
  // Seed sample audit logs
  console.log('📝 Seeding sample audit logs...');
  const logCount = await prisma.auditLog.count();
  
  if (logCount === 0) {
    await prisma.auditLog.createMany({
      data: [
        {
          action: 'System initialized',
          details: 'System settings and users seeded',
          userName: 'System'
        },
        {
          action: 'Admin logged in',
          userName: 'Administrator'
        },
        {
          action: 'System settings page accessed',
          userName: 'Administrator'
        }
      ]
    });
    console.log('✅ Sample audit logs created');
  } else {
    console.log('✅ Audit logs already exist');
  }
  
  console.log('\n🎉 Database seeding completed successfully!');
  console.log('👉 You can now log in with:');
  console.log('   - Admin: admin@example.com / admin123');
  console.log('   - Manager: manager@example.com / manager123');
  console.log('   - User: user@example.com / user123');
}

main()
  .catch(e => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
