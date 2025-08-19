const express = require('express');
const { query, validationResult } = require('express-validator');
const Campaign = require('../models/Campaign');
const Event = require('../models/Event');
const { getAnalytics } = require('../config/elasticsearch');
const { cache } = require('../config/redis');
const { asyncHandler, validationError, businessError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

const router = express.Router();

// Validation rules
const timeRangeValidation = [
  query('timeRange').optional().isIn(['1h', '24h', '7d', '30d']).withMessage('Invalid time range'),
  query('startDate').optional().isISO8601().withMessage('Invalid start date'),
  query('endDate').optional().isISO8601().withMessage('Invalid end date'),
  query('campaignId').optional().isMongoId().withMessage('Invalid campaign ID')
];

// @route   GET /api/v1/analytics/overview
// @desc    Get overview analytics
// @access  Private
router.get('/overview', timeRangeValidation, asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw validationError(errors.array());
  }

  const { timeRange = '24h', startDate, endDate, campaignId } = req.query;

  // Try to get from cache first
  const cacheKey = `analytics:overview:${timeRange}:${campaignId || 'all'}:${startDate || 'none'}:${endDate || 'none'}`;
  let overview = await cache.get(cacheKey);

  if (!overview) {
    // Build date filter
    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      };
    } else {
      const now = new Date();
      let startTime;
      
      switch (timeRange) {
        case '1h':
          startTime = new Date(now.getTime() - 60 * 60 * 1000);
          break;
        case '24h':
          startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case '7d':
          startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          startTime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      }
      
      dateFilter = {
        createdAt: { $gte: startTime }
      };
    }

    // Build campaign filter
    const campaignFilter = campaignId ? { _id: campaignId } : {};

    // Get campaign performance summary
    const campaignSummary = await Campaign.aggregate([
      { $match: { ...campaignFilter, ...dateFilter } },
      {
        $group: {
          _id: null,
          totalCampaigns: { $sum: 1 },
          totalImpressions: { $sum: '$performance.impressions' },
          totalClicks: { $sum: '$performance.clicks' },
          totalConversions: { $sum: '$performance.conversions' },
          totalSpend: { $sum: '$performance.spend' },
          totalRevenue: { $sum: '$performance.revenue' },
          avgCTR: { $avg: '$performance.ctr' },
          avgCPC: { $avg: '$performance.cpc' },
          avgCPA: { $avg: '$performance.cpa' },
          avgROAS: { $avg: '$performance.roas' }
        }
      }
    ]);

    // Get event statistics from Elasticsearch
    let eventStats = null;
    try {
      const filters = {};
      if (campaignId) filters.campaignId = campaignId;
      
      eventStats = await getAnalytics(filters, timeRange);
    } catch (error) {
      logger.error('Elasticsearch analytics failed:', error);
      // Fallback to MongoDB
      const eventSummary = await Event.aggregate([
        { $match: { ...campaignFilter, ...dateFilter } },
        {
          $group: {
            _id: null,
            totalImpressions: {
              $sum: { $cond: [{ $eq: ['$eventType', 'impression'] }, 1, 0] }
            },
            totalClicks: {
              $sum: { $cond: [{ $eq: ['$eventType', 'click'] }, 1, 0] }
            },
            totalConversions: {
              $sum: { $cond: [{ $eq: ['$eventType', 'conversion'] }, 1, 0] }
            },
            totalValue: { $sum: '$value' },
            totalConversionValue: { $sum: '$conversionValue' }
          }
        }
      ]);
      
      eventStats = eventSummary[0] || {};
    }

    // Calculate metrics
    const summary = campaignSummary[0] || {};
    const impressions = eventStats?.aggregations?.total_impressions?.doc_count || summary.totalImpressions || 0;
    const clicks = eventStats?.aggregations?.total_clicks?.doc_count || summary.totalClicks || 0;
    const conversions = eventStats?.aggregations?.total_conversions?.doc_count || summary.totalConversions || 0;
    const spend = summary.totalSpend || 0;
    const revenue = summary.totalRevenue || 0;

    overview = {
      totalImpressions: impressions,
      totalClicks: clicks,
      totalConversions: conversions,
      totalSpend: spend,
      totalRevenue: revenue,
      ctr: impressions > 0 ? ((clicks / impressions) * 100).toFixed(2) : '0.00',
      cpc: clicks > 0 ? (spend / clicks).toFixed(2) : '0.00',
      cpa: conversions > 0 ? (spend / conversions).toFixed(2) : '0.00',
      roas: spend > 0 ? (revenue / spend).toFixed(2) : '0.00',
      totalCampaigns: summary.totalCampaigns || 0
    };

    // Cache for 5 minutes
    await cache.set(cacheKey, overview, 300);
  }

  res.json({
    success: true,
    data: overview
  });
}));

// @route   GET /api/v1/analytics/hourly
// @desc    Get hourly performance data
// @access  Private
router.get('/hourly', timeRangeValidation, asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw validationError(errors.array());
  }

  const { timeRange = '24h', startDate, endDate, campaignId } = req.query;

  // Try to get from cache first
  const cacheKey = `analytics:hourly:${timeRange}:${campaignId || 'all'}:${startDate || 'none'}:${endDate || 'none'}`;
  let hourlyData = await cache.get(cacheKey);

  if (!hourlyData) {
    // Build date filter
    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        timestamp: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      };
    } else {
      const now = new Date();
      let startTime;
      
      switch (timeRange) {
        case '1h':
          startTime = new Date(now.getTime() - 60 * 60 * 1000);
          break;
        case '24h':
          startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case '7d':
          startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          startTime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      }
      
      dateFilter = {
        timestamp: { $gte: startTime }
      };
    }

    // Build campaign filter
    const campaignFilter = campaignId ? { campaignId } : {};

    // Get hourly data from Elasticsearch
    let esHourlyData = null;
    try {
      const filters = {};
      if (campaignId) filters.campaignId = campaignId;
      
      const analytics = await getAnalytics(filters, timeRange);
      esHourlyData = analytics?.aggregations?.events_by_hour?.buckets || [];
    } catch (error) {
      logger.error('Elasticsearch hourly analytics failed:', error);
      // Fallback to MongoDB
      const mongoHourlyData = await Event.aggregate([
        { $match: { ...campaignFilter, ...dateFilter } },
        {
          $group: {
            _id: {
              year: { $year: '$timestamp' },
              month: { $month: '$timestamp' },
              day: { $dayOfMonth: '$timestamp' },
              hour: { $hour: '$timestamp' }
            },
            impressions: {
              $sum: { $cond: [{ $eq: ['$eventType', 'impression'] }, 1, 0] }
            },
            clicks: {
              $sum: { $cond: [{ $eq: ['$eventType', 'click'] }, 1, 0] }
            },
            conversions: {
              $sum: { $cond: [{ $eq: ['$eventType', 'conversion'] }, 1, 0] }
            },
            spend: { $sum: '$value' }
          }
        },
        {
          $sort: {
            '_id.year': 1,
            '_id.month': 1,
            '_id.day': 1,
            '_id.hour': 1
          }
        }
      ]);
      
      esHourlyData = mongoHourlyData.map(item => ({
        key_as_string: `${item._id.year}-${String(item._id.month).padStart(2, '0')}-${String(item._id.day).padStart(2, '0')} ${String(item._id.hour).padStart(2, '0')}:00:00`,
        doc_count: item.impressions + item.clicks + item.conversions,
        impressions: { value: item.impressions },
        clicks: { value: item.clicks },
        conversions: { value: item.conversions },
        spend: { value: item.spend }
      }));
    }

    // Format hourly data
    hourlyData = esHourlyData.map(bucket => {
      const date = new Date(bucket.key_as_string);
      return {
        hour: `${date.getHours()}:00`,
        impressions: bucket.impressions?.value || 0,
        clicks: bucket.clicks?.value || 0,
        conversions: bucket.conversions?.value || 0,
        spend: bucket.spend?.value || 0
      };
    });

    // Fill missing hours with zeros
    if (timeRange === '24h') {
      const filledData = [];
      for (let i = 0; i < 24; i++) {
        const hour = `${i}:00`;
        const existing = hourlyData.find(d => d.hour === hour);
        filledData.push(existing || {
          hour,
          impressions: 0,
          clicks: 0,
          conversions: 0,
          spend: 0
        });
      }
      hourlyData = filledData;
    }

    // Cache for 5 minutes
    await cache.set(cacheKey, hourlyData, 300);
  }

  res.json({
    success: true,
    data: hourlyData
  });
}));

// @route   GET /api/v1/analytics/campaigns
// @desc    Get campaign performance data
// @access  Private
router.get('/campaigns', timeRangeValidation, asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw validationError(errors.array());
  }

  const { timeRange = '24h', startDate, endDate, limit = 10 } = req.query;

  // Try to get from cache first
  const cacheKey = `analytics:campaigns:${timeRange}:${limit}:${startDate || 'none'}:${endDate || 'none'}`;
  let campaignData = await cache.get(cacheKey);

  if (!campaignData) {
    // Build date filter
    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      };
    } else {
      const now = new Date();
      let startTime;
      
      switch (timeRange) {
        case '1h':
          startTime = new Date(now.getTime() - 60 * 60 * 1000);
          break;
        case '24h':
          startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case '7d':
          startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          startTime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      }
      
      dateFilter = {
        createdAt: { $gte: startTime }
      };
    }

    // Get campaign performance
    const campaigns = await Campaign.find(dateFilter)
      .sort({ 'performance.impressions': -1 })
      .limit(parseInt(limit))
      .select('name performance platform status');

    campaignData = campaigns.map(campaign => ({
      name: campaign.name,
      impressions: campaign.performance.impressions,
      clicks: campaign.performance.clicks,
      conversions: campaign.performance.conversions,
      spend: campaign.performance.spend,
      platform: campaign.platform,
      status: campaign.status
    }));

    // Cache for 5 minutes
    await cache.set(cacheKey, campaignData, 300);
  }

  res.json({
    success: true,
    data: campaignData
  });
}));

// @route   GET /api/v1/analytics/devices
// @desc    Get device breakdown data
// @access  Private
router.get('/devices', timeRangeValidation, asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw validationError(errors.array());
  }

  const { timeRange = '24h', startDate, endDate, campaignId } = req.query;

  // Try to get from cache first
  const cacheKey = `analytics:devices:${timeRange}:${campaignId || 'all'}:${startDate || 'none'}:${endDate || 'none'}`;
  let deviceData = await cache.get(cacheKey);

  if (!deviceData) {
    // Build date filter
    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        timestamp: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      };
    } else {
      const now = new Date();
      let startTime;
      
      switch (timeRange) {
        case '1h':
          startTime = new Date(now.getTime() - 60 * 60 * 1000);
          break;
        case '24h':
          startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case '7d':
          startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          startTime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      }
      
      dateFilter = {
        timestamp: { $gte: startTime }
      };
    }

    // Build campaign filter
    const campaignFilter = campaignId ? { campaignId } : {};

    // Get device breakdown from Elasticsearch
    let esDeviceData = null;
    try {
      const filters = {};
      if (campaignId) filters.campaignId = campaignId;
      
      const analytics = await getAnalytics(filters, timeRange);
      esDeviceData = analytics?.aggregations?.events_by_device?.buckets || [];
    } catch (error) {
      logger.error('Elasticsearch device analytics failed:', error);
      // Fallback to MongoDB
      const mongoDeviceData = await Event.aggregate([
        { $match: { ...campaignFilter, ...dateFilter } },
        {
          $group: {
            _id: '$device',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } }
      ]);
      
      esDeviceData = mongoDeviceData.map(item => ({
        key: item._id,
        doc_count: item.count
      }));
    }

    // Calculate percentages
    const total = esDeviceData.reduce((sum, device) => sum + device.doc_count, 0);
    
    deviceData = esDeviceData.map(device => ({
      name: device.key.charAt(0).toUpperCase() + device.key.slice(1),
      value: total > 0 ? Math.round((device.doc_count / total) * 100) : 0,
      color: getDeviceColor(device.key)
    }));

    // Cache for 5 minutes
    await cache.set(cacheKey, deviceData, 300);
  }

  res.json({
    success: true,
    data: deviceData
  });
}));

// @route   GET /api/v1/analytics/geographic
// @desc    Get geographic performance data
// @access  Private
router.get('/geographic', timeRangeValidation, asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw validationError(errors.array());
  }

  const { timeRange = '24h', startDate, endDate, campaignId, limit = 10 } = req.query;

  // Try to get from cache first
  const cacheKey = `analytics:geographic:${timeRange}:${campaignId || 'all'}:${limit}:${startDate || 'none'}:${endDate || 'none'}`;
  let geoData = await cache.get(cacheKey);

  if (!geoData) {
    // Build date filter
    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        timestamp: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      };
    } else {
      const now = new Date();
      let startTime;
      
      switch (timeRange) {
        case '1h':
          startTime = new Date(now.getTime() - 60 * 60 * 1000);
          break;
        case '24h':
          startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case '7d':
          startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          startTime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      }
      
      dateFilter = {
        timestamp: { $gte: startTime }
      };
    }

    // Build campaign filter
    const campaignFilter = campaignId ? { campaignId } : {};

    // Get geographic data from Elasticsearch
    let esGeoData = null;
    try {
      const filters = {};
      if (campaignId) filters.campaignId = campaignId;
      
      const analytics = await getAnalytics(filters, timeRange);
      esGeoData = analytics?.aggregations?.events_by_country?.buckets || [];
    } catch (error) {
      logger.error('Elasticsearch geographic analytics failed:', error);
      // Fallback to MongoDB
      const mongoGeoData = await Event.aggregate([
        { $match: { ...campaignFilter, ...dateFilter } },
        {
          $group: {
            _id: '$location.country',
            impressions: {
              $sum: { $cond: [{ $eq: ['$eventType', 'impression'] }, 1, 0] }
            },
            clicks: {
              $sum: { $cond: [{ $eq: ['$eventType', 'click'] }, 1, 0] }
            },
            conversions: {
              $sum: { $cond: [{ $eq: ['$eventType', 'conversion'] }, 1, 0] }
            }
          }
        },
        { $sort: { impressions: -1 } },
        { $limit: parseInt(limit) }
      ]);
      
      esGeoData = mongoGeoData.map(item => ({
        key: item._id,
        impressions: { value: item.impressions },
        clicks: { value: item.clicks },
        conversions: { value: item.conversions }
      }));
    }

    geoData = esGeoData.map(country => ({
      country: country.key,
      impressions: country.impressions?.value || 0,
      clicks: country.clicks?.value || 0,
      conversions: country.conversions?.value || 0
    }));

    // Cache for 5 minutes
    await cache.set(cacheKey, geoData, 300);
  }

  res.json({
    success: true,
    data: geoData
  });
}));

// @route   GET /api/v1/analytics/realtime
// @desc    Get real-time analytics data
// @access  Private
router.get('/realtime', asyncHandler(async (req, res) => {
  const { campaignId } = req.query;

  // Get real-time data from cache
  const cacheKey = campaignId ? `recent_events:${campaignId}` : 'recent_events:all';
  const recentEvents = await cache.get(cacheKey) || [];

  // Get active campaigns count
  const activeCampaigns = await Campaign.countDocuments({ status: 'active' });

  // Get current hour stats
  const now = new Date();
  const startOfHour = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), 0, 0);
  
  const hourlyStats = await Event.aggregate([
    {
      $match: {
        timestamp: { $gte: startOfHour },
        ...(campaignId && { campaignId })
      }
    },
    {
      $group: {
        _id: null,
        impressions: {
          $sum: { $cond: [{ $eq: ['$eventType', 'impression'] }, 1, 0] }
        },
        clicks: {
          $sum: { $cond: [{ $eq: ['$eventType', 'click'] }, 1, 0] }
        },
        conversions: {
          $sum: { $cond: [{ $eq: ['$eventType', 'conversion'] }, 1, 0] }
        },
        spend: { $sum: '$value' }
      }
    }
  ]);

  const stats = hourlyStats[0] || {
    impressions: 0,
    clicks: 0,
    conversions: 0,
    spend: 0
  };

  res.json({
    success: true,
    data: {
      recentEvents: recentEvents.slice(0, 10),
      activeCampaigns,
      currentHour: {
        impressions: stats.impressions,
        clicks: stats.clicks,
        conversions: stats.conversions,
        spend: stats.spend
      },
      lastUpdate: new Date().toISOString()
    }
  });
}));

// Helper function to get device colors
const getDeviceColor = (device) => {
  const colors = {
    desktop: '#0891b2',
    mobile: '#f59e0b',
    tablet: '#dc2626',
    other: '#6b7280'
  };
  return colors[device] || '#6b7280';
};

module.exports = router;
