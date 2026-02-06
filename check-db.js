const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function checkDatabase() {
  console.log('🔍 Checking database...');
  
  try {
    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connected');
    
    // Count all users
    const userCount = await prisma.user.count();
    console.log(`📊 Total users in database: ${userCount}`);
    
    // List all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' }
    });
    
    console.log('\n📋 User list:');
    users.forEach(user => {
      console.log(`  - ${user.email} (${user.name}) - ${user.role} - ${user.createdAt}`);
    });
    
    // Check admin specifically
    const admin = await prisma.user.findUnique({
      where: { email: 'admin@example.com' }
    });
    
    if (admin) {
      console.log('\n✅ Admin user found:');
      console.log(`   Email: ${admin.email}`);
      console.log(`   Name: ${admin.name}`);
      console.log(`   Role: ${admin.role}`);
      console.log(`   ID: ${admin.id}`);
      
      // Test password
      const isValid = await bcrypt.compare('admin123', admin.password);
      console.log(`   Password "admin123" is valid: ${isValid}`);
      
      if (!isValid) {
        console.log('\n⚠️  Password mismatch! Updating password...');
        const newHash = await bcrypt.hash('admin123', 10);
        await prisma.user.update({
          where: { email: 'admin@example.com' },
          data: { password: newHash }
        });
        console.log('✅ Password updated to "admin123"');
      }
    } else {
      console.log('\n❌ Admin user not found! Creating now...');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await prisma.user.create({
        data: {
          email: 'admin@example.com',
          password: hashedPassword,
          name: 'Administrator',
          role: 'ADMIN'
        }
      });
      console.log('✅ Admin user created');
    }
    
  } catch (error) {
    console.error('❌ Database error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();
