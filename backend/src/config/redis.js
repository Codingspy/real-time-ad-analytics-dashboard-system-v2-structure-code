const redis = require('redis');
const logger = require('../utils/logger');

// Create Redis client
const redisClient = redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  password: process.env.REDIS_PASSWORD || undefined,
  retry_strategy: (options) => {
    if (options.error && options.error.code === 'ECONNREFUSED') {
      logger.error('Redis server refused connection');
      return new Error('Redis server refused connection');
    }
    if (options.total_retry_time > 1000 * 60 * 60) {
      logger.error('Redis retry time exhausted');
      return new Error('Redis retry time exhausted');
    }
    if (options.attempt > 10) {
      logger.error('Redis max retry attempts reached');
      return undefined;
    }
    return Math.min(options.attempt * 100, 3000);
  }
});

// Handle Redis events
redisClient.on('connect', () => {
  logger.info('Redis client connected');
});

redisClient.on('ready', () => {
  logger.info('Redis client ready');
});

redisClient.on('error', (err) => {
  logger.error('Redis client error:', err);
});

redisClient.on('end', () => {
  logger.warn('Redis client connection ended');
});

redisClient.on('reconnecting', () => {
  logger.info('Redis client reconnecting...');
});

// Cache helper functions
const cache = {
  // Set cache with expiration
  set: async (key, value, expireSeconds = 3600) => {
    try {
      const serializedValue = typeof value === 'object' ? JSON.stringify(value) : value;
      await redisClient.setEx(key, expireSeconds, serializedValue);
      logger.debug(`Cache set: ${key}`);
    } catch (error) {
      logger.error('Cache set error:', error);
    }
  },

  // Get cache value
  get: async (key) => {
    try {
      const value = await redisClient.get(key);
      if (value) {
        try {
          return JSON.parse(value);
        } catch {
          return value;
        }
      }
      return null;
    } catch (error) {
      logger.error('Cache get error:', error);
      return null;
    }
  },

  // Delete cache key
  del: async (key) => {
    try {
      await redisClient.del(key);
      logger.debug(`Cache deleted: ${key}`);
    } catch (error) {
      logger.error('Cache delete error:', error);
    }
  },

  // Set multiple cache keys
  mset: async (keyValuePairs, expireSeconds = 3600) => {
    try {
      const pipeline = redisClient.multi();
      
      Object.entries(keyValuePairs).forEach(([key, value]) => {
        const serializedValue = typeof value === 'object' ? JSON.stringify(value) : value;
        pipeline.setEx(key, expireSeconds, serializedValue);
      });
      
      await pipeline.exec();
      logger.debug(`Cache mset: ${Object.keys(keyValuePairs).length} keys`);
    } catch (error) {
      logger.error('Cache mset error:', error);
    }
  },

  // Get multiple cache keys
  mget: async (keys) => {
    try {
      const values = await redisClient.mGet(keys);
      return values.map(value => {
        if (value) {
          try {
            return JSON.parse(value);
          } catch {
            return value;
          }
        }
        return null;
      });
    } catch (error) {
      logger.error('Cache mget error:', error);
      return keys.map(() => null);
    }
  },

  // Check if key exists
  exists: async (key) => {
    try {
      const result = await redisClient.exists(key);
      return result === 1;
    } catch (error) {
      logger.error('Cache exists error:', error);
      return false;
    }
  },

  // Increment counter
  incr: async (key, expireSeconds = 3600) => {
    try {
      const pipeline = redisClient.multi();
      pipeline.incr(key);
      pipeline.expire(key, expireSeconds);
      const results = await pipeline.exec();
      return results[0];
    } catch (error) {
      logger.error('Cache incr error:', error);
      return 0;
    }
  },

  // Set hash field
  hset: async (key, field, value, expireSeconds = 3600) => {
    try {
      const serializedValue = typeof value === 'object' ? JSON.stringify(value) : value;
      const pipeline = redisClient.multi();
      pipeline.hSet(key, field, serializedValue);
      pipeline.expire(key, expireSeconds);
      await pipeline.exec();
      logger.debug(`Cache hset: ${key}.${field}`);
    } catch (error) {
      logger.error('Cache hset error:', error);
    }
  },

  // Get hash field
  hget: async (key, field) => {
    try {
      const value = await redisClient.hGet(key, field);
      if (value) {
        try {
          return JSON.parse(value);
        } catch {
          return value;
        }
      }
      return null;
    } catch (error) {
      logger.error('Cache hget error:', error);
      return null;
    }
  },

  // Get all hash fields
  hgetall: async (key) => {
    try {
      const hash = await redisClient.hGetAll(key);
      const result = {};
      
      for (const [field, value] of Object.entries(hash)) {
        try {
          result[field] = JSON.parse(value);
        } catch {
          result[field] = value;
        }
      }
      
      return result;
    } catch (error) {
      logger.error('Cache hgetall error:', error);
      return {};
    }
  },

  // Clear all cache
  flushall: async () => {
    try {
      await redisClient.flushAll();
      logger.info('Cache flushed');
    } catch (error) {
      logger.error('Cache flushall error:', error);
    }
  }
};

module.exports = { redisClient, cache };
