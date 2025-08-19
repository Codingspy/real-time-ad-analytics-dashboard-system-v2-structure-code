const { Client } = require('@elastic/elasticsearch');
require('dotenv').config();

console.log('🔍 Testing Elasticsearch Connection...');
console.log('=====================================');

const testElasticsearch = async () => {
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

    console.log('\n🔌 Testing connection...');
    
    // Test basic connection
    const info = await client.info();
    console.log('✅ Elasticsearch connected successfully!');
    
    // Debug: Log the response structure
    console.log('Response structure:', JSON.stringify(info, null, 2));
    
    // Safely access version information
    if (info && info.body && info.body.version) {
      console.log('Version:', info.body.version.number);
    } else {
      console.log('Version: Not available');
    }
    
    if (info && info.body && info.body.cluster_name) {
      console.log('Cluster Name:', info.body.cluster_name);
    } else {
      console.log('Cluster Name: Not available');
    }
    
    if (info && info.body && info.body.name) {
      console.log('Node Name:', info.body.name);
    } else {
      console.log('Node Name: Not available');
    }
    
    // Test index operations
    const indexName = process.env.ELASTICSEARCH_INDEX || 'ad-analytics-events';
    console.log('\n📊 Testing index operations...');
    
    // Check if index exists
    const indexExists = await client.indices.exists({ index: indexName });
    if (indexExists.body) {
      console.log(`✅ Index '${indexName}' exists`);
      
      // Get index stats
      const stats = await client.indices.stats({ index: indexName });
      console.log('Index stats:', {
        docs: stats.body.indices[indexName].total.docs.count,
        size: stats.body.indices[indexName].total.store.size_in_bytes
      });
    } else {
      console.log(`⚠️ Index '${indexName}' does not exist`);
      
      // Create index
      console.log('Creating index...');
      await client.indices.create({
        index: indexName,
        body: {
          settings: {
            number_of_shards: 1,
            number_of_replicas: 1
          },
          mappings: {
            properties: {
              eventId: { type: 'keyword' },
              eventType: { type: 'keyword' },
              timestamp: { type: 'date' },
              value: { type: 'float' }
            }
          }
        }
      });
      console.log(`✅ Index '${indexName}' created successfully`);
    }
    
    // Test document indexing
    console.log('\n📝 Testing document indexing...');
    const testDoc = {
      eventId: 'test-123',
      eventType: 'test',
      timestamp: new Date().toISOString(),
      value: 100.50
    };
    
    const indexResult = await client.index({
      index: indexName,
      body: testDoc
    });
    
    console.log('✅ Document indexed successfully');
    console.log('Document ID:', indexResult.body._id);
    
    // Test search
    console.log('\n🔍 Testing search functionality...');
    const searchResult = await client.search({
      index: indexName,
      body: {
        query: {
          match: {
            eventType: 'test'
          }
        }
      }
    });
    
    console.log('✅ Search completed successfully');
    console.log('Total hits:', searchResult.body.hits.total.value);
    
    console.log('\n🎯 All Elasticsearch tests passed!');
    console.log('Elasticsearch is ready for use.');
    
  } catch (error) {
    console.log('\n❌ Elasticsearch test failed:');
    console.log('Error:', error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 Solution: Make sure Docker is running and Elasticsearch container is started');
      console.log('Run: docker-compose up -d (from project root)');
    } else if (error.message.includes('authentication')) {
      console.log('\n💡 Solution: Check Elasticsearch credentials in .env file');
    }
  }
};

testElasticsearch();
