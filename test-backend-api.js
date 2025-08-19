const fetch = require('node-fetch');

console.log('🔍 Testing Backend API Connection...');
console.log('===================================');

const testBackendAPI = async () => {
  try {
    console.log('📋 Testing backend health check...');
    
    // Test health endpoint
    const healthResponse = await fetch('http://localhost:5000/health');
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log('✅ Backend health check passed:', healthData);
    } else {
      console.log('❌ Backend health check failed');
      return;
    }

    console.log('\n📋 Testing login endpoint...');
    
    // Test login with admin credentials
    const loginResponse = await fetch('http://localhost:5000/api/v1/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@adanalytics.com',
        password: 'admin123'
      }),
    });

    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      console.log('✅ Login successful:', {
        success: loginData.success,
        message: loginData.message,
        hasToken: !!loginData.data?.token,
        user: loginData.data?.user?.email
      });
    } else {
      const errorData = await loginResponse.json();
      console.log('❌ Login failed:', errorData);
    }

    console.log('\n🎯 Backend API test completed!');
    
  } catch (error) {
    console.log('❌ Backend API test failed:');
    console.log('Error:', error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 Solution: Make sure the backend server is running');
      console.log('Run: cd backend && npm run dev');
    }
  }
};

testBackendAPI();
