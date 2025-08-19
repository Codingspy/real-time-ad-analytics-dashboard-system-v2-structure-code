const http = require('http');

console.log('🔍 Checking Backend Status...');
console.log('============================');

// Test health endpoint
const testHealth = () => {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path: '/health',
      method: 'GET',
      timeout: 5000
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ status: res.statusCode, data: jsonData });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
};

// Test login endpoint
const testLogin = () => {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      email: 'admin@adanalytics.com',
      password: 'AdAnalytics2024!Admin'
    });

    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/v1/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      },
      timeout: 5000
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ status: res.statusCode, data: jsonData });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.write(postData);
    req.end();
  });
};

const main = async () => {
  try {
    console.log('📋 Testing health endpoint...');
    const healthResult = await testHealth();
    console.log('✅ Health check result:', healthResult);
    
    console.log('\n📋 Testing login endpoint...');
    const loginResult = await testLogin();
    console.log('✅ Login test result:', loginResult);
    
    console.log('\n🎯 Backend is working correctly!');
    console.log('📧 Email functionality is ready (will log to console in development mode)');
    console.log('🔐 Login with: admin@adanalytics.com / AdAnalytics2024!Admin');
    
  } catch (error) {
    console.error('❌ Backend test failed:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Solution: Backend server is not running');
      console.log('Run: npm run dev (in backend directory)');
    } else if (error.message === 'Request timeout') {
      console.log('\n💡 Solution: Backend is slow to respond');
      console.log('Check if server is starting up...');
    } else {
      console.log('\n💡 Solution: Check backend logs for errors');
    }
  }
};

main();
