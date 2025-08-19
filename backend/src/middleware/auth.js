const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { cache } = require('../config/redis');
const logger = require('../utils/logger');

// Authentication middleware
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    // Check cache first
    const cachedUser = await cache.get(`auth:${token}`);
    if (cachedUser) {
      req.user = cachedUser;
      return next();
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. User not found.'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated.'
      });
    }

    // Cache user for 5 minutes
    await cache.set(`auth:${token}`, user, 300);
    
    req.user = user;
    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token.'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired.'
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Authentication failed.'
    });
  }
};

// Role-based authorization middleware
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.'
      });
    }

    next();
  };
};

// Permission-based authorization middleware
const hasPermission = (resource, action) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    if (!req.user.hasPermission(resource, action)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Permission required: ${resource}:${action}`
      });
    }

    next();
  };
};

// Optional authentication middleware (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return next();
    }

    // Check cache first
    const cachedUser = await cache.get(`auth:${token}`);
    if (cachedUser) {
      req.user = cachedUser;
      return next();
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user
    const user = await User.findById(decoded.id).select('-password');
    if (user && user.isActive) {
      // Cache user for 5 minutes
      await cache.set(`auth:${token}`, user, 300);
      req.user = user;
    }
    
    next();
  } catch (error) {
    // Don't fail on token errors, just continue without user
    logger.debug('Optional auth error (non-critical):', error);
    next();
  }
};

// API key authentication middleware
const apiKeyAuth = async (req, res, next) => {
  try {
    const apiKey = req.header('X-API-Key');
    
    if (!apiKey) {
      return res.status(401).json({
        success: false,
        message: 'API key required.'
      });
    }

    // Check cache first
    const cachedApiKey = await cache.get(`apikey:${apiKey}`);
    if (cachedApiKey) {
      req.apiKey = cachedApiKey;
      return next();
    }

    // Find user by API key
    const user = await User.findOne({
      'apiKeys.key': apiKey,
      'apiKeys.isActive': true
    }).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid API key.'
      });
    }

    // Get API key details
    const apiKeyData = user.apiKeys.find(key => key.key === apiKey);
    
    // Update last used
    await User.updateOne(
      { 'apiKeys.key': apiKey },
      { $set: { 'apiKeys.$.lastUsed': new Date() } }
    );

    const apiKeyInfo = {
      user: user,
      permissions: apiKeyData.permissions,
      name: apiKeyData.name
    };

    // Cache API key for 1 hour
    await cache.set(`apikey:${apiKey}`, apiKeyInfo, 3600);
    
    req.apiKey = apiKeyInfo;
    next();
  } catch (error) {
    logger.error('API key authentication error:', error);
    return res.status(500).json({
      success: false,
      message: 'API key authentication failed.'
    });
  }
};

// Rate limiting middleware for API keys
const apiKeyRateLimit = (maxRequests = 1000, windowMs = 15 * 60 * 1000) => {
  return async (req, res, next) => {
    if (!req.apiKey) {
      return next();
    }

    const key = `ratelimit:apikey:${req.apiKey.user._id}`;
    
    try {
      const current = await cache.incr(key, windowMs / 1000);
      
      if (current > maxRequests) {
        return res.status(429).json({
          success: false,
          message: 'Rate limit exceeded. Please try again later.'
        });
      }

      // Set rate limit headers
      res.set({
        'X-RateLimit-Limit': maxRequests,
        'X-RateLimit-Remaining': Math.max(0, maxRequests - current),
        'X-RateLimit-Reset': Math.floor(Date.now() / 1000) + windowMs / 1000
      });

      next();
    } catch (error) {
      logger.error('Rate limiting error:', error);
      next(); // Continue on error
    }
  };
};

// Logout middleware (invalidate token)
const logout = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (token) {
      // Remove from cache
      await cache.del(`auth:${token}`);
    }
    
    next();
  } catch (error) {
    logger.error('Logout error:', error);
    next();
  }
};

module.exports = {
  authMiddleware,
  authorize,
  hasPermission,
  optionalAuth,
  apiKeyAuth,
  apiKeyRateLimit,
  logout
};
