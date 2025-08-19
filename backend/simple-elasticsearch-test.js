const { Client } = require('@elastic/elasticsearch');
require('dotenv').config();

console.log('🔍 Simple Elasticsearch Connection Test');
console.log('=====================================');

const simpleTest = async () => {
  try {
    console.log('📋 Environment Check:');
    console.log('ELASTICSEARCH_NODE:', process.env.ELASTICSEARCH_NODE || 'http://localhost:9200');
    console.log('ELASTICSEARCH_USERNAME:', process.env.ELASTICSEARCH_USERNAME || 'elastic');
    console.log('ELASTICSEARCH_PASSWORD:', process.env.ELASTICSEARCH_PASSWORD ? 'Set' : 'NOT SET');
    
    // Create Elasticsearch client
    const client = new Client({
      node: process.env.ELASTICSEARCH_NODE || 'http://localhost:9200',
      auth: {
        username: process.env.ELASTICSEARCH_USERNAME || 'elastic',
        password: process.env.ELASTICSEARCH_PASSWORD || 'changeme'
      },
      maxRetries: 3,
      requestTimeout: 10000
    });

    console.log('\n🔌 Testing basic connection...');
    
    // Simple ping test
    const pingResult = await client.ping();
    console.log('✅ Ping successful:', pingResult);
    
    // Simple info test
    const info = await client.info();
    console.log('✅ Info request successful');
    console.log('Raw response:', info);
    
    // Try to access version safely
    try {
      if (info && info.body && info.body.version && info.body.version.number) {
        console.log('✅ Version:', info.body.version.number);
      } else if (info && info.version && info.version.number) {
        console.log('✅ Version:', info.version.number);
      } else {
        console.log('⚠️ Version info not in expected format');
        console.log('Available keys:', Object.keys(info));
        if (info.body) {
          console.log('Body keys:', Object.keys(info.body));
        }
      }
    } catch (versionError) {
      console.log('⚠️ Could not extract version:', versionError.message);
    }
    
    console.log('\n🎯 Basic connection test passed!');
    console.log('Elasticsearch is running and accessible.');
    
  } catch (error) {
    console.log('\n❌ Elasticsearch test failed:');
    console.log('Error:', error.message);
    console.log('Full error:', error);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 Solution: Make sure Docker is running and Elasticsearch container is started');
      console.log('Run: docker-compose up -d (from project root)');
    } else if (error.message.includes('authentication')) {
      console.log('\n💡 Solution: Check Elasticsearch credentials in .env file');
    } else if (error.message.includes('version')) {
      console.log('\n💡 Solution: This is a response parsing issue, but connection is working');
    }
  }
};

simpleTest();
