const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testAPI() {
  try {
    // First, let's login to get a token
    console.log('🔄 Logging in to get token...');
    
    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@example.com',
        password: 'admin123'
      })
    });
    
    const loginData = await loginResponse.json();
    console.log('Login response:', loginData);
    
    if (loginData.success && loginData.token) {
      console.log('✅ Got token:', loginData.token.substring(0, 20) + '...');
      
      // Now test the users API
      console.log('\n🔄 Testing users API...');
      const response = await fetch('http://localhost:3000/api/admin/users', {
        headers: {
          'Cookie': `auth-token=${loginData.token}`
        }
      });
      
      const data = await response.json();
      console.log('API Status:', response.status);
      console.log('API Response:', data);
      
      if (data.success) {
        console.log(`\n✅ Total users: ${data.count}`);
        console.log('\n📋 User list:');
        data.users?.forEach((user, index) => {
          console.log(`${index + 1}. ${user.name} (${user.email}) - ${user.role}`);
        });
      } else {
        console.error('❌ API Error:', data.error);
      }
    } else {
      console.error('❌ Login failed:', loginData.error);
    }
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAPI();
