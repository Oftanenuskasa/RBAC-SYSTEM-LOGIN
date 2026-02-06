const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');
  
  // List all current users
  const currentUsers = await prisma.user.findMany();
  console.log('📋 Current users:', currentUsers.length);
  currentUsers.forEach(user => {
    console.log(`  - ${user.email} (${user.name}) [${user.role}]`);
  });
  
  // Check if admin exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: 'admin@example.com' }
  });
  
  if (existingAdmin) {
    console.log('\n✅ Admin user already exists');
    console.log('   Email:', existingAdmin.email);
    console.log('   Name:', existingAdmin.name);
    console.log('   Role:', existingAdmin.role);
    
    // Test the password
    const isValid = await bcrypt.compare('admin123', existingAdmin.password);
    console.log('   Password "admin123" is valid:', isValid);
    
    if (!isValid) {
      console.log('⚠️  Password mismatch! Updating password...');
      const newHashedPassword = await bcrypt.hash('admin123', 10);
      await prisma.user.update({
        where: { email: 'admin@example.com' },
        data: { password: newHashedPassword }
      });
      console.log('✅ Password updated');
    }
  } else {
    console.log('\n📝 Creating admin user...');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const admin = await prisma.user.create({
      data: {
        email: 'admin@example.com',
        password: hashedPassword,
        name: 'Administrator',
        role: 'ADMIN'
      }
    });
    console.log('✅ Admin user created');
    console.log('   Email:', admin.email);
    console.log('   Name:', admin.name);
    console.log('   Role:', admin.role);
  }
  
  // Create a test manager user
  const existingManager = await prisma.user.findUnique({
    where: { email: 'manager@example.com' }
  });
  
  if (!existingManager) {
    const managerPassword = await bcrypt.hash('manager123', 10);
    await prisma.user.create({
      data: {
        email: 'manager@example.com',
        password: managerPassword,
        name: 'Test Manager',
        role: 'MANAGER'
      }
    });
    console.log('✅ Manager user created: manager@example.com');
  }
  
  // Create a test regular user
  const existingUser = await prisma.user.findUnique({
    where: { email: 'user@example.com' }
  });
  
  if (!existingUser) {
    const userPassword = await bcrypt.hash('user123', 10);
    await prisma.user.create({
      data: {
        email: 'user@example.com',
        password: userPassword,
        name: 'Test User',
        role: 'USER'
      }
    });
    console.log('✅ Regular user created: user@example.com');
  }
  
  // Final list of all users
  const finalUsers = await prisma.user.findMany();
  console.log('\n🎉 Final user list:');
  finalUsers.forEach(user => {
    console.log(`  - ${user.email} (${user.name}) [${user.role}]`);
  });
}

main()
  .catch(e => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
