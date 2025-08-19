const express = require('express');
const { body, query, validationResult } = require('express-validator');
const { asyncHandler, validationError, businessError } = require('../middleware/errorHandler');
const { authorize } = require('../middleware/auth');
const { cache } = require('../config/redis');
const logger = require('../utils/logger');

const router = express.Router();

// @route   GET /api/v1/reports/performance
// @desc    Generate performance report
// @access  Private
router.get('/performance', asyncHandler(async (req, res) => {
  const {
    startDate,
    endDate,
    campaignId,
    platform,
    format = 'json'
  } = req.query;

  if (!startDate || !endDate) {
    throw businessError('Start date and end date are required');
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (start >= end) {
    throw businessError('End date must be after start date');
  }

  // Try to get from cache first
  const cacheKey = `report:performance:${startDate}:${endDate}:${campaignId || 'all'}:${platform || 'all'}`;
  let report = await cache.get(cacheKey);

  if (!report) {
    const Campaign = require('../models/Campaign');
    const Event = require('../models/Event');

    // Build query
    const query = {
      createdAt: { $gte: start, $lte: end }
    };

    if (campaignId) query._id = campaignId;
    if (platform) query.platform = platform;

    // Get campaign data
    const campaigns = await Campaign.find(query);
    const campaignIds = campaigns.map(c => c._id);

    // Get event data
    const eventQuery = {
      timestamp: { $gte: start, $lte: end }
    };

    if (campaignIds.length > 0) {
      eventQuery.campaignId = { $in: campaignIds };
    }

    const events = await Event.find(eventQuery);

    // Calculate metrics
    const totalImpressions = events.filter(e => e.eventType === 'impression').length;
    const totalClicks = events.filter(e => e.eventType === 'click').length;
    const totalConversions = events.filter(e => e.eventType === 'conversion').length;
    const totalSpend = events.reduce((sum, e) => sum + (e.value || 0), 0);
    const totalRevenue = events.reduce((sum, e) => sum + (e.conversionValue || 0), 0);

    // Campaign breakdown
    const campaignBreakdown = campaigns.map(campaign => {
      const campaignEvents = events.filter(e => e.campaignId.toString() === campaign._id.toString());
      const impressions = campaignEvents.filter(e => e.eventType === 'impression').length;
      const clicks = campaignEvents.filter(e => e.eventType === 'click').length;
      const conversions = campaignEvents.filter(e => e.eventType === 'conversion').length;
      const spend = campaignEvents.reduce((sum, e) => sum + (e.value || 0), 0);
      const revenue = campaignEvents.reduce((sum, e) => sum + (e.conversionValue || 0), 0);

      return {
        id: campaign._id,
        name: campaign.name,
        platform: campaign.platform,
        status: campaign.status,
        impressions,
        clicks,
        conversions,
        spend,
        revenue,
        ctr: impressions > 0 ? ((clicks / impressions) * 100).toFixed(2) : '0.00',
        cpc: clicks > 0 ? (spend / clicks).toFixed(2) : '0.00',
        cpa: conversions > 0 ? (spend / conversions).toFixed(2) : '0.00',
        roas: spend > 0 ? (revenue / spend).toFixed(2) : '0.00'
      };
    });

    // Platform breakdown
    const platformBreakdown = {};
    campaigns.forEach(campaign => {
      if (!platformBreakdown[campaign.platform]) {
        platformBreakdown[campaign.platform] = {
          platform: campaign.platform,
          campaigns: 0,
          impressions: 0,
          clicks: 0,
          conversions: 0,
          spend: 0,
          revenue: 0
        };
      }
      platformBreakdown[campaign.platform].campaigns++;
    });

    events.forEach(event => {
      const campaign = campaigns.find(c => c._id.toString() === event.campaignId.toString());
      if (campaign && platformBreakdown[campaign.platform]) {
        if (event.eventType === 'impression') platformBreakdown[campaign.platform].impressions++;
        if (event.eventType === 'click') platformBreakdown[campaign.platform].clicks++;
        if (event.eventType === 'conversion') platformBreakdown[campaign.platform].conversions++;
        platformBreakdown[campaign.platform].spend += event.value || 0;
        platformBreakdown[campaign.platform].revenue += event.conversionValue || 0;
      }
    });

    // Calculate platform metrics
    Object.values(platformBreakdown).forEach(platform => {
      platform.ctr = platform.impressions > 0 ? ((platform.clicks / platform.impressions) * 100).toFixed(2) : '0.00';
      platform.cpc = platform.clicks > 0 ? (platform.spend / platform.clicks).toFixed(2) : '0.00';
      platform.cpa = platform.conversions > 0 ? (platform.spend / platform.conversions).toFixed(2) : '0.00';
      platform.roas = platform.spend > 0 ? (platform.revenue / platform.spend).toFixed(2) : '0.00';
    });

    report = {
      period: {
        startDate,
        endDate,
        duration: Math.ceil((end - start) / (1000 * 60 * 60 * 24))
      },
      summary: {
        totalCampaigns: campaigns.length,
        totalImpressions,
        totalClicks,
        totalConversions,
        totalSpend,
        totalRevenue,
        overallCTR: totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : '0.00',
        overallCPC: totalClicks > 0 ? (totalSpend / totalClicks).toFixed(2) : '0.00',
        overallCPA: totalConversions > 0 ? (totalSpend / totalConversions).toFixed(2) : '0.00',
        overallROAS: totalSpend > 0 ? (totalRevenue / totalSpend).toFixed(2) : '0.00'
      },
      campaignBreakdown,
      platformBreakdown: Object.values(platformBreakdown),
      generatedAt: new Date().toISOString()
    };

    // Cache for 1 hour
    await cache.set(cacheKey, report, 3600);
  }

  // Return in requested format
  if (format === 'csv') {
    // Convert to CSV format
    const csvData = convertToCSV(report);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="performance-report-${startDate}-${endDate}.csv"`);
    return res.send(csvData);
  }

  res.json({
    success: true,
    data: report
  });
}));

// @route   GET /api/v1/reports/campaign/:id
// @desc    Generate campaign-specific report
// @access  Private
router.get('/campaign/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { startDate, endDate, format = 'json' } = req.query;

  if (!startDate || !endDate) {
    throw businessError('Start date and end date are required');
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (start >= end) {
    throw businessError('End date must be after start date');
  }

  const Campaign = require('../models/Campaign');
  const Event = require('../models/Event');

  // Get campaign
  const campaign = await Campaign.findById(id);
  if (!campaign) {
    throw businessError('Campaign not found', 404);
  }

  // Get events for this campaign
  const events = await Event.find({
    campaignId: id,
    timestamp: { $gte: start, $lte: end }
  });

  // Calculate metrics
  const impressions = events.filter(e => e.eventType === 'impression').length;
  const clicks = events.filter(e => e.eventType === 'click').length;
  const conversions = events.filter(e => e.eventType === 'conversion').length;
  const spend = events.reduce((sum, e) => sum + (e.value || 0), 0);
  const revenue = events.reduce((sum, e) => sum + (e.conversionValue || 0), 0);

  // Daily breakdown
  const dailyBreakdown = {};
  const currentDate = new Date(start);
  
  while (currentDate <= end) {
    const dateKey = currentDate.toISOString().split('T')[0];
    dailyBreakdown[dateKey] = {
      date: dateKey,
      impressions: 0,
      clicks: 0,
      conversions: 0,
      spend: 0,
      revenue: 0
    };
    currentDate.setDate(currentDate.getDate() + 1);
  }

  events.forEach(event => {
    const dateKey = event.timestamp.toISOString().split('T')[0];
    if (dailyBreakdown[dateKey]) {
      if (event.eventType === 'impression') dailyBreakdown[dateKey].impressions++;
      if (event.eventType === 'click') dailyBreakdown[dateKey].clicks++;
      if (event.eventType === 'conversion') dailyBreakdown[dateKey].conversions++;
      dailyBreakdown[dateKey].spend += event.value || 0;
      dailyBreakdown[dateKey].revenue += event.conversionValue || 0;
    }
  });

  // Calculate daily metrics
  Object.values(dailyBreakdown).forEach(day => {
    day.ctr = day.impressions > 0 ? ((day.clicks / day.impressions) * 100).toFixed(2) : '0.00';
    day.cpc = day.clicks > 0 ? (day.spend / day.clicks).toFixed(2) : '0.00';
    day.cpa = day.conversions > 0 ? (day.spend / day.conversions).toFixed(2) : '0.00';
    day.roas = day.spend > 0 ? (day.revenue / day.spend).toFixed(2) : '0.00';
  });

  const report = {
    campaign: {
      id: campaign._id,
      name: campaign.name,
      platform: campaign.platform,
      status: campaign.status,
      budget: campaign.budget,
      schedule: campaign.schedule
    },
    period: {
      startDate,
      endDate,
      duration: Math.ceil((end - start) / (1000 * 60 * 60 * 24))
    },
    summary: {
      impressions,
      clicks,
      conversions,
      spend,
      revenue,
      ctr: impressions > 0 ? ((clicks / impressions) * 100).toFixed(2) : '0.00',
      cpc: clicks > 0 ? (spend / clicks).toFixed(2) : '0.00',
      cpa: conversions > 0 ? (spend / conversions).toFixed(2) : '0.00',
      roas: spend > 0 ? (revenue / spend).toFixed(2) : '0.00',
      budgetUtilization: campaign.budget.total > 0 ? ((spend / campaign.budget.total) * 100).toFixed(2) : '0.00'
    },
    dailyBreakdown: Object.values(dailyBreakdown),
    generatedAt: new Date().toISOString()
  };

  // Return in requested format
  if (format === 'csv') {
    const csvData = convertCampaignToCSV(report);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="campaign-report-${campaign.name}-${startDate}-${endDate}.csv"`);
    return res.send(csvData);
  }

  res.json({
    success: true,
    data: report
  });
}));

// Helper function to convert report to CSV
const convertToCSV = (report) => {
  const headers = [
    'Campaign Name',
    'Platform',
    'Status',
    'Impressions',
    'Clicks',
    'Conversions',
    'Spend',
    'Revenue',
    'CTR',
    'CPC',
    'CPA',
    'ROAS'
  ];

  const rows = report.campaignBreakdown.map(campaign => [
    campaign.name,
    campaign.platform,
    campaign.status,
    campaign.impressions,
    campaign.clicks,
    campaign.conversions,
    campaign.spend,
    campaign.revenue,
    campaign.ctr,
    campaign.cpc,
    campaign.cpa,
    campaign.roas
  ]);

  return [headers, ...rows].map(row => row.join(',')).join('\n');
};

// Helper function to convert campaign report to CSV
const convertCampaignToCSV = (report) => {
  const headers = [
    'Date',
    'Impressions',
    'Clicks',
    'Conversions',
    'Spend',
    'Revenue',
    'CTR',
    'CPC',
    'CPA',
    'ROAS'
  ];

  const rows = report.dailyBreakdown.map(day => [
    day.date,
    day.impressions,
    day.clicks,
    day.conversions,
    day.spend,
    day.revenue,
    day.ctr,
    day.cpc,
    day.cpa,
    day.roas
  ]);

  return [headers, ...rows].map(row => row.join(',')).join('\n');
};

module.exports = router;
