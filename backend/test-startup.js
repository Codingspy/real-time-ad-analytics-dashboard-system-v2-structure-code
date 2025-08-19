const dotenv = require('dotenv');
const mongoose = require('mongoose');

// Load environment variables
dotenv.config();

console.log('🔍 Testing Server Startup Components...');
console.log('=====================================');

const testStartup = async () => {
  try {
    console.log('\n📋 Environment Check:');
    console.log('NODE_ENV:', process.env.NODE_ENV);
    console.log('PORT:', process.env.PORT);
    console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Set' : 'NOT SET');
    console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Set' : 'NOT SET');
    
    // Test 1: Basic modules
    console.log('\n1. Testing basic modules...');
    const express = require('express');
    console.log('✅ Express loaded');
    
    const { Client } = require('@elastic/elasticsearch');
    console.log('✅ Elasticsearch client loaded');
    
    const redis = require('redis');
    console.log('✅ Redis client loaded');
    
    // Test 2: MongoDB connection
    console.log('\n2. Testing MongoDB connection...');
    if (!process.env.MONGODB_URI) {
      console.log('❌ MONGODB_URI not set');
      return;
    }
    
    await mongoose.connect(process.env.MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      bufferCommands: false
    });
    console.log('✅ MongoDB connected');
    await mongoose.connection.close();
    
    // Test 3: Redis connection
    console.log('\n3. Testing Redis connection...');
    const redisClient = redis.createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      password: process.env.REDIS_PASSWORD
    });
    
    await redisClient.connect();
    console.log('✅ Redis connected');
    await redisClient.disconnect();
    
    // Test 4: Elasticsearch connection
    console.log('\n4. Testing Elasticsearch connection...');
    const elasticsearchClient = new Client({
      node: process.env.ELASTICSEARCH_NODE || 'http://localhost:9200',
      auth: {
        username: process.env.ELASTICSEARCH_USERNAME || 'elastic',
        password: process.env.ELASTICSEARCH_PASSWORD || 'changeme'
      },
      maxRetries: 3,
      requestTimeout: 10000
    });
    
    try {
      const esInfo = await elasticsearchClient.info();
      if (esInfo && esInfo.body && esInfo.body.version) {
        console.log('✅ Elasticsearch connected, version:', esInfo.body.version.number);
      } else {
        console.log('✅ Elasticsearch connected (version info not available)');
      }
    } catch (esError) {
      console.log('⚠️ Elasticsearch connection failed:', esError.message);
      console.log('   This is okay - server can run without Elasticsearch');
    }
    
    // Test 5: Load server modules
    console.log('\n5. Testing server module loading...');
    const { connectDB } = require('./src/config/database');
    console.log('✅ Database config loaded');
    
    const User = require('./src/models/User');
    console.log('✅ User model loaded');
    
    const logger = require('./src/utils/logger');
    console.log('✅ Logger loaded');
    
    console.log('\n🎯 All startup tests passed!');
    console.log('Server should start successfully now.');
    
  } catch (error) {
    console.log('\n❌ Startup test failed:');
    console.log('Error:', error.message);
    console.log('Stack:', error.stack);
  }
};

testStartup();
