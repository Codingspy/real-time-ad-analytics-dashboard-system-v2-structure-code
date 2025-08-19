const express = require('express');
const { body, validationResult } = require('express-validator');
const Event = require('../models/Event');
const Campaign = require('../models/Campaign');
const { asyncHandler, validationError, businessError } = require('../middleware/errorHandler');
const { indexEvent, bulkIndexEvents } = require('../config/elasticsearch');
const { cache } = require('../config/redis');
const logger = require('../utils/logger');
const UAParser = require('ua-parser-js');

const router = express.Router();

// Validation rules
const eventValidation = [
  body('eventType').isIn(['impression', 'click', 'conversion', 'view', 'scroll', 'hover', 'form_submit', 'purchase']).withMessage('Invalid event type'),
  body('campaignId').isMongoId().withMessage('Valid campaign ID is required'),
  body('value').optional().isFloat({ min: 0 }).withMessage('Value must be a positive number'),
  body('conversionValue').optional().isFloat({ min: 0 }).withMessage('Conversion value must be a positive number'),
  body('platform').optional().isIn(['google', 'facebook', 'instagram', 'linkedin', 'twitter', 'tiktok', 'youtube', 'other']).withMessage('Invalid platform'),
  body('device').optional().isIn(['desktop', 'mobile', 'tablet', 'other']).withMessage('Invalid device type')
];

// Helper function to extract user agent info
const parseUserAgent = (userAgent) => {
  const parser = new UAParser(userAgent);
  const result = parser.getResult();
  
  return {
    browser: {
      name: result.browser.name || 'unknown',
      version: result.browser.version || 'unknown',
      engine: result.engine.name || 'unknown'
    },
    os: {
      name: result.os.name || 'unknown',
      version: result.os.version || 'unknown',
      platform: result.device.type || 'desktop'
    }
  };
};

// Helper function to detect device type
const detectDevice = (userAgent) => {
  const parser = new UAParser(userAgent);
  const device = parser.getDevice();
  
  if (device.type === 'mobile') return 'mobile';
  if (device.type === 'tablet') return 'tablet';
  if (device.type === 'console' || device.type === 'smarttv') return 'other';
  return 'desktop';
};

// Helper function to get client IP
const getClientIP = (req) => {
  return req.headers['x-forwarded-for']?.split(',')[0] || 
         req.headers['x-real-ip'] || 
         req.connection.remoteAddress || 
         req.socket.remoteAddress || 
         req.ip || 
         'unknown';
};

// @route   POST /api/v1/events/track
// @desc    Track a single event
// @access  Public
router.post('/track', eventValidation, asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw validationError(errors.array());
  }

  const {
    eventType,
    campaignId,
    value = 0,
    conversionValue = 0,
    platform,
    device: deviceType,
    sessionId,
    userId,
    referrer,
    landingPage,
    conversionData,
    adData,
    pageData,
    userData,
    technicalData,
    metadata
  } = req.body;

  // Verify campaign exists and is active
  const campaign = await Campaign.findById(campaignId);
  if (!campaign) {
    throw businessError('Campaign not found');
  }

  if (!campaign.isActive()) {
    throw businessError('Campaign is not active');
  }

  // Extract user agent information
  const userAgent = req.headers['user-agent'] || '';
  const uaInfo = parseUserAgent(userAgent);
  const detectedDevice = deviceType || detectDevice(userAgent);

  // Get client IP
  const clientIP = getClientIP(req);

  // Create event
  const event = new Event({
    eventType,
    campaignId,
    userId,
    sessionId,
    value,
    currency: campaign.budget.currency,
    platform: platform || campaign.platform,
    device: detectedDevice,
    browser: uaInfo.browser,
    os: uaInfo.os,
    ip: clientIP,
    userAgent,
    referrer,
    landingPage,
    conversionValue,
    conversionData,
    adData,
    pageData,
    userData,
    technicalData,
    metadata
  });

  await event.save();

  // Update campaign performance metrics
  const performanceUpdate = {};
  switch (eventType) {
    case 'impression':
      performanceUpdate.impressions = 1;
      break;
    case 'click':
      performanceUpdate.clicks = 1;
      performanceUpdate.spend = value;
      break;
    case 'conversion':
      performanceUpdate.conversions = 1;
      performanceUpdate.revenue = conversionValue;
      break;
  }

  if (Object.keys(performanceUpdate).length > 0) {
    await campaign.updatePerformance(performanceUpdate);
  }

  // Index event in Elasticsearch (async)
  try {
    await indexEvent({
      eventId: event.eventId,
      eventType: event.eventType,
      campaignId: event.campaignId,
      userId: event.userId,
      timestamp: event.timestamp,
      value: event.value,
      currency: event.currency,
      platform: event.platform,
      device: event.device,
      browser: event.browser,
      os: event.os,
      country: event.location?.country,
      city: event.location?.city,
      ip: event.ip,
      userAgent: event.userAgent,
      referrer: event.referrer,
      landingPage: event.landingPage,
      conversionValue: event.conversionValue,
      metadata: event.metadata
    });
  } catch (error) {
    logger.error('Elasticsearch indexing failed:', error);
    // Don't fail the request if Elasticsearch fails
  }

  // Emit real-time event via Socket.IO
  const io = req.app.get('io');
  if (io) {
    io.to(`campaign-${campaignId}`).emit('event', {
      type: eventType,
      campaignId,
      timestamp: event.timestamp,
      value,
      conversionValue
    });
  }

  // Cache event for real-time analytics
  const cacheKey = `recent_events:${campaignId}`;
  const recentEvents = await cache.get(cacheKey) || [];
  recentEvents.unshift({
    eventId: event.eventId,
    eventType: event.eventType,
    timestamp: event.timestamp,
    value: event.value,
    conversionValue: event.conversionValue
  });

  // Keep only last 100 events
  if (recentEvents.length > 100) {
    recentEvents.splice(100);
  }

  await cache.set(cacheKey, recentEvents, 3600); // Cache for 1 hour

  logger.logBusinessEvent('ad_event_tracked', {
    eventId: event.eventId,
    eventType: event.eventType,
    campaignId: event.campaignId,
    platform: event.platform,
    device: event.device,
    value: event.value,
    conversionValue: event.conversionValue
  });

  res.status(201).json({
    success: true,
    message: 'Event tracked successfully',
    data: {
      eventId: event.eventId,
      timestamp: event.timestamp
    }
  });
}));

// @route   POST /api/v1/events/bulk
// @desc    Track multiple events
// @access  Public
router.post('/bulk', asyncHandler(async (req, res) => {
  const { events } = req.body;

  if (!Array.isArray(events) || events.length === 0) {
    throw businessError('Events array is required and must not be empty');
  }

  if (events.length > 1000) {
    throw businessError('Maximum 1000 events allowed per request');
  }

  const trackedEvents = [];
  const errors = [];

  // Process events in batches
  for (let i = 0; i < events.length; i++) {
    try {
      const eventData = events[i];
      
      // Basic validation
      if (!eventData.eventType || !eventData.campaignId) {
        errors.push({ index: i, error: 'Missing required fields: eventType, campaignId' });
        continue;
      }

      // Verify campaign exists
      const campaign = await Campaign.findById(eventData.campaignId);
      if (!campaign || !campaign.isActive()) {
        errors.push({ index: i, error: 'Campaign not found or inactive' });
        continue;
      }

      // Extract user agent information
      const userAgent = req.headers['user-agent'] || '';
      const uaInfo = parseUserAgent(userAgent);
      const detectedDevice = eventData.device || detectDevice(userAgent);
      const clientIP = getClientIP(req);

      // Create event
      const event = new Event({
        eventType: eventData.eventType,
        campaignId: eventData.campaignId,
        userId: eventData.userId,
        sessionId: eventData.sessionId,
        value: eventData.value || 0,
        currency: campaign.budget.currency,
        platform: eventData.platform || campaign.platform,
        device: detectedDevice,
        browser: uaInfo.browser,
        os: uaInfo.os,
        ip: clientIP,
        userAgent,
        referrer: eventData.referrer,
        landingPage: eventData.landingPage,
        conversionValue: eventData.conversionValue || 0,
        conversionData: eventData.conversionData,
        adData: eventData.adData,
        pageData: eventData.pageData,
        userData: eventData.userData,
        technicalData: eventData.technicalData,
        metadata: eventData.metadata
      });

      await event.save();
      trackedEvents.push(event);

      // Update campaign performance
      const performanceUpdate = {};
      switch (eventData.eventType) {
        case 'impression':
          performanceUpdate.impressions = 1;
          break;
        case 'click':
          performanceUpdate.clicks = 1;
          performanceUpdate.spend = eventData.value || 0;
          break;
        case 'conversion':
          performanceUpdate.conversions = 1;
          performanceUpdate.revenue = eventData.conversionValue || 0;
          break;
      }

      if (Object.keys(performanceUpdate).length > 0) {
        await campaign.updatePerformance(performanceUpdate);
      }

    } catch (error) {
      errors.push({ index: i, error: error.message });
    }
  }

  // Bulk index in Elasticsearch
  if (trackedEvents.length > 0) {
    try {
      const esEvents = trackedEvents.map(event => ({
        eventId: event.eventId,
        eventType: event.eventType,
        campaignId: event.campaignId,
        userId: event.userId,
        timestamp: event.timestamp,
        value: event.value,
        currency: event.currency,
        platform: event.platform,
        device: event.device,
        browser: event.browser,
        os: event.os,
        country: event.location?.country,
        city: event.location?.city,
        ip: event.ip,
        userAgent: event.userAgent,
        referrer: event.referrer,
        landingPage: event.landingPage,
        conversionValue: event.conversionValue,
        metadata: event.metadata
      }));

      await bulkIndexEvents(esEvents);
    } catch (error) {
      logger.error('Bulk Elasticsearch indexing failed:', error);
    }
  }

  logger.logBusinessEvent('bulk_events_tracked', {
    totalEvents: events.length,
    successfulEvents: trackedEvents.length,
    failedEvents: errors.length
  });

  res.status(201).json({
    success: true,
    message: `Processed ${events.length} events`,
    data: {
      successful: trackedEvents.length,
      failed: errors.length,
      errors: errors.length > 0 ? errors : undefined,
      eventIds: trackedEvents.map(e => e.eventId)
    }
  });
}));

// @route   GET /api/v1/events/recent
// @desc    Get recent events for a campaign
// @access  Public
router.get('/recent/:campaignId', asyncHandler(async (req, res) => {
  const { campaignId } = req.params;
  const { limit = 50 } = req.query;

  // Verify campaign exists
  const campaign = await Campaign.findById(campaignId);
  if (!campaign) {
    throw businessError('Campaign not found');
  }

  // Try to get from cache first
  const cacheKey = `recent_events:${campaignId}`;
  let recentEvents = await cache.get(cacheKey);

  if (!recentEvents) {
    // Fallback to database
    recentEvents = await Event.find({ campaignId })
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .select('eventId eventType timestamp value conversionValue');
  }

  res.json({
    success: true,
    data: {
      campaignId,
      events: recentEvents.slice(0, parseInt(limit))
    }
  });
}));

// @route   GET /api/v1/events/stats
// @desc    Get event statistics for a campaign
// @access  Public
router.get('/stats/:campaignId', asyncHandler(async (req, res) => {
  const { campaignId } = req.params;
  const { startDate, endDate, eventType } = req.query;

  // Verify campaign exists
  const campaign = await Campaign.findById(campaignId);
  if (!campaign) {
    throw businessError('Campaign not found');
  }

  const filters = { campaignId };
  if (eventType) filters.eventType = eventType;
  if (startDate && endDate) {
    filters.timestamp = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }

  const stats = await Event.getEventStats(filters);
  const hourlyDistribution = await Event.getHourlyDistribution(filters);
  const geographicDistribution = await Event.getGeographicDistribution(filters);

  res.json({
    success: true,
    data: {
      campaignId,
      stats,
      hourlyDistribution,
      geographicDistribution
    }
  });
}));

// @route   GET /api/v1/events/search
// @desc    Search events with filters
// @access  Public
router.get('/search', asyncHandler(async (req, res) => {
  const {
    campaignId,
    eventType,
    platform,
    device,
    startDate,
    endDate,
    page = 1,
    limit = 50
  } = req.query;

  const query = {};

  if (campaignId) query.campaignId = campaignId;
  if (eventType) query.eventType = eventType;
  if (platform) query.platform = platform;
  if (device) query.device = device;
  if (startDate && endDate) {
    query.timestamp = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const events = await Event.find(query)
    .sort({ timestamp: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .populate('campaignId', 'name platform');

  const total = await Event.countDocuments(query);

  res.json({
    success: true,
    data: {
      events,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    }
  });
}));

module.exports = router;
