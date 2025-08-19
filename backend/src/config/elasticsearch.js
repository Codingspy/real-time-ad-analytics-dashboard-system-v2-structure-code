const { Client } = require('@elastic/elasticsearch');
const logger = require('../utils/logger');

// Create Elasticsearch client
const elasticsearchClient = new Client({
  node: process.env.ELASTICSEARCH_NODE || 'http://localhost:9200',
  auth: {
    username: process.env.ELASTICSEARCH_USERNAME || 'elastic',
    password: process.env.ELASTICSEARCH_PASSWORD || 'changeme'
  },
  maxRetries: 3,
  requestTimeout: 10000,
  sniffOnStart: true
});

// Initialize Elasticsearch index
const initializeElasticsearch = async () => {
  try {
    const indexName = process.env.ELASTICSEARCH_INDEX || 'ad-analytics-events';
    
    // Check if index exists
    const indexExists = await elasticsearchClient.indices.exists({
      index: indexName
    });

    if (!indexExists.body) {
      // Create index with mapping
      await elasticsearchClient.indices.create({
        index: indexName,
        body: {
          settings: {
            number_of_shards: 1,
            number_of_replicas: 1,
            analysis: {
              analyzer: {
                text_analyzer: {
                  type: 'custom',
                  tokenizer: 'standard',
                  filter: ['lowercase', 'stop', 'snowball']
                }
              }
            }
          },
          mappings: {
            properties: {
              eventId: { type: 'keyword' },
              eventType: { type: 'keyword' },
              campaignId: { type: 'keyword' },
              userId: { type: 'keyword' },
              timestamp: { type: 'date' },
              value: { type: 'float' },
              currency: { type: 'keyword' },
              platform: { type: 'keyword' },
              device: { type: 'keyword' },
              browser: { type: 'keyword' },
              os: { type: 'keyword' },
              country: { type: 'keyword' },
              city: { type: 'keyword' },
              ip: { type: 'ip' },
              userAgent: { type: 'text', analyzer: 'text_analyzer' },
              referrer: { type: 'text' },
              landingPage: { type: 'text' },
              conversionValue: { type: 'float' },
              metadata: { type: 'object', dynamic: true }
            }
          }
        }
      });

      logger.info(`Elasticsearch index '${indexName}' created successfully`);
    } else {
      logger.info(`Elasticsearch index '${indexName}' already exists`);
    }

    // Create aliases for time-based indices
    const aliasName = `${indexName}-current`;
    const aliasExists = await elasticsearchClient.indices.existsAlias({
      name: aliasName
    });

    if (!aliasExists.body) {
      await elasticsearchClient.indices.putAlias({
        index: indexName,
        name: aliasName
      });
      logger.info(`Elasticsearch alias '${aliasName}' created`);
    }

  } catch (error) {
    logger.error('Error initializing Elasticsearch:', error);
    throw error;
  }
};

// Index event data
const indexEvent = async (eventData) => {
  try {
    const indexName = process.env.ELASTICSEARCH_INDEX || 'ad-analytics-events';
    
    const response = await elasticsearchClient.index({
      index: indexName,
      body: {
        ...eventData,
        timestamp: eventData.timestamp || new Date().toISOString()
      }
    });

    logger.debug('Event indexed successfully:', response.body._id);
    return response.body._id;
  } catch (error) {
    logger.error('Error indexing event:', error);
    throw error;
  }
};

// Search events
const searchEvents = async (query) => {
  try {
    const indexName = process.env.ELASTICSEARCH_INDEX || 'ad-analytics-events';
    
    const response = await elasticsearchClient.search({
      index: indexName,
      body: query
    });

    return response.body;
  } catch (error) {
    logger.error('Error searching events:', error);
    throw error;
  }
};

// Get analytics aggregations
const getAnalytics = async (filters = {}, timeRange = '24h') => {
  try {
    const indexName = process.env.ELASTICSEARCH_INDEX || 'ad-analytics-events';
    
    const now = new Date();
    const timeFilter = {};
    
    switch (timeRange) {
      case '1h':
        timeFilter.gte = new Date(now.getTime() - 60 * 60 * 1000).toISOString();
        break;
      case '24h':
        timeFilter.gte = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
        break;
      case '7d':
        timeFilter.gte = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
        break;
      case '30d':
        timeFilter.gte = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
        break;
      default:
        timeFilter.gte = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
    }
    
    timeFilter.lte = now.toISOString();

    const query = {
      query: {
        bool: {
          must: [
            { range: { timestamp: timeFilter } },
            ...Object.entries(filters).map(([key, value]) => ({ term: { [key]: value } }))
          ]
        }
      },
      aggs: {
        total_impressions: {
          filter: { term: { eventType: 'impression' } }
        },
        total_clicks: {
          filter: { term: { eventType: 'click' } }
        },
        total_conversions: {
          filter: { term: { eventType: 'conversion' } }
        },
        total_value: {
          sum: { field: 'value' }
        },
        events_by_hour: {
          date_histogram: {
            field: 'timestamp',
            calendar_interval: 'hour',
            format: 'yyyy-MM-dd HH:mm:ss'
          }
        },
        events_by_type: {
          terms: { field: 'eventType' }
        },
        events_by_campaign: {
          terms: { field: 'campaignId' }
        },
        events_by_device: {
          terms: { field: 'device' }
        },
        events_by_country: {
          terms: { field: 'country' }
        }
      },
      size: 0
    };

    const response = await elasticsearchClient.search({
      index: indexName,
      body: query
    });

    return response.body;
  } catch (error) {
    logger.error('Error getting analytics:', error);
    throw error;
  }
};

// Bulk index events
const bulkIndexEvents = async (events) => {
  try {
    const indexName = process.env.ELASTICSEARCH_INDEX || 'ad-analytics-events';
    
    const body = events.flatMap(event => [
      { index: { _index: indexName } },
      {
        ...event,
        timestamp: event.timestamp || new Date().toISOString()
      }
    ]);

    const response = await elasticsearchClient.bulk({ body });
    
    if (response.body.errors) {
      const errors = response.body.items.filter(item => item.index.error);
      logger.error('Bulk indexing errors:', errors);
    }

    logger.info(`Bulk indexed ${events.length} events`);
    return response.body;
  } catch (error) {
    logger.error('Error bulk indexing events:', error);
    throw error;
  }
};

module.exports = {
  elasticsearchClient,
  initializeElasticsearch,
  indexEvent,
  searchEvents,
  getAnalytics,
  bulkIndexEvents
};
