const dotenv = require('dotenv');
const mongoose = require('mongoose');

// Load environment variables
dotenv.config();

console.log('🔍 Backend Diagnostic Script');
console.log('============================');

// Check environment variables
console.log('\n📋 Environment Variables:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Set' : 'NOT SET');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Set' : 'NOT SET');
console.log('CORS_ORIGIN:', process.env.CORS_ORIGIN);

// Check if .env file exists
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  console.log('✅ .env file exists');
} else {
  console.log('❌ .env file missing');
}

// Test MongoDB connection
console.log('\n🗄️ Testing MongoDB Connection...');
const testMongoConnection = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      console.log('❌ MONGODB_URI not set');
      return;
    }
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connection successful');
    await mongoose.connection.close();
  } catch (error) {
    console.log('❌ MongoDB connection failed:', error.message);
  }
};

// Test required modules
console.log('\n📦 Testing Required Modules...');
const modules = [
  'express',
  'mongoose',
  'bcryptjs',
  'jsonwebtoken',
  'cors',
  'helmet',
  'express-rate-limit',
  'express-validator',
  'dotenv',
  'morgan',
  'compression',
  'multer',
  'nodemailer',
  '@elastic/elasticsearch',
  'winston',
  'socket.io',
  'redis',
  'joi',
  'uuid',
  'moment',
  'lodash',
  'ua-parser-js'
];

modules.forEach(module => {
  try {
    require(module);
    console.log(`✅ ${module}`);
  } catch (error) {
    console.log(`❌ ${module}: ${error.message}`);
  }
});

// Test server startup
console.log('\n🚀 Testing Server Startup...');
const testServerStartup = async () => {
  try {
    // Test if we can require the server file
    const serverPath = path.join(__dirname, 'src', 'server.js');
    if (fs.existsSync(serverPath)) {
      console.log('✅ server.js file exists');
    } else {
      console.log('❌ server.js file missing');
      return;
    }

    // Test if we can require the main modules
    const User = require('./src/models/User');
    console.log('✅ User model loaded');
    
    const { connectDB } = require('./src/config/database');
    console.log('✅ Database config loaded');
    
    console.log('✅ All core modules loaded successfully');
    
  } catch (error) {
    console.log('❌ Server startup test failed:', error.message);
    console.log('Stack trace:', error.stack);
  }
};

// Run all tests
const runDiagnostics = async () => {
  await testMongoConnection();
  await testServerStartup();
  
  console.log('\n🎯 Diagnostic Complete!');
  console.log('Check the output above for any ❌ errors.');
};

runDiagnostics();
