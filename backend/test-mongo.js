const mongoose = require('mongoose');
require('dotenv').config();

console.log('🔍 Testing MongoDB Connection...');
console.log('===============================');

const testConnection = async () => {
  try {
    console.log('📋 Environment Check:');
    console.log('NODE_ENV:', process.env.NODE_ENV);
    console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Set' : 'NOT SET');
    
    if (!process.env.MONGODB_URI) {
      console.log('❌ MONGODB_URI not set in environment variables');
      return;
    }

    console.log('\n🔌 Attempting to connect to MongoDB...');
    
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      bufferCommands: false
    });

    console.log('✅ MongoDB Connected Successfully!');
    console.log('Host:', conn.connection.host);
    console.log('Database:', conn.connection.name);
    console.log('Port:', conn.connection.port);

    // Test a simple operation
    console.log('\n🧪 Testing database operation...');
    const collections = await conn.connection.db.listCollections().toArray();
    console.log('✅ Database operation successful');
    console.log('Collections found:', collections.length);

    await mongoose.connection.close();
    console.log('\n✅ Connection test completed successfully!');
    
  } catch (error) {
    console.log('❌ MongoDB connection failed:');
    console.log('Error:', error.message);
    console.log('Stack:', error.stack);
  }
};

testConnection();
