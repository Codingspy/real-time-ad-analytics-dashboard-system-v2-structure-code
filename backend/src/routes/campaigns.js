const express = require('express');
const { body, query, validationResult } = require('express-validator');
const Campaign = require('../models/Campaign');
const { asyncHandler, validationError, businessError } = require('../middleware/errorHandler');
const { authorize } = require('../middleware/auth');
const { cache } = require('../config/redis');
const logger = require('../utils/logger');

const router = express.Router();

// Validation rules
const campaignValidation = [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Campaign name must be between 2 and 100 characters'),
  body('description').optional().trim().isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),
  body('platform').isIn(['google', 'facebook', 'instagram', 'linkedin', 'twitter', 'tiktok', 'youtube', 'other']).withMessage('Invalid platform'),
  body('type').isIn(['search', 'display', 'social', 'video', 'remarketing', 'affiliate']).withMessage('Invalid campaign type'),
  body('budget.total').isFloat({ min: 0 }).withMessage('Total budget must be a positive number'),
  body('budget.daily').optional().isFloat({ min: 0 }).withMessage('Daily budget must be a positive number'),
  body('schedule.startDate').isISO8601().withMessage('Valid start date is required'),
  body('schedule.endDate').isISO8601().withMessage('Valid end date is required')
];

const updateValidation = [
  body('name').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Campaign name must be between 2 and 100 characters'),
  body('description').optional().trim().isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),
  body('status').optional().isIn(['draft', 'active', 'paused', 'completed', 'archived']).withMessage('Invalid status'),
  body('budget.total').optional().isFloat({ min: 0 }).withMessage('Total budget must be a positive number'),
  body('budget.daily').optional().isFloat({ min: 0 }).withMessage('Daily budget must be a positive number')
];

// @route   GET /api/v1/campaigns
// @desc    Get all campaigns with filters
// @access  Private
router.get('/', asyncHandler(async (req, res) => {
  const {
    status,
    platform,
    search,
    page = 1,
    limit = 20,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;

  // Build query
  const query = {};
  
  if (status) query.status = status;
  if (platform) query.platform = platform;
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }

  // Build sort
  const sort = {};
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

  // Pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);

  // Get campaigns
  const campaigns = await Campaign.find(query)
    .populate('createdBy', 'firstName lastName email')
    .populate('assignedTo', 'firstName lastName email')
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit));

  // Get total count
  const total = await Campaign.countDocuments(query);

  // Calculate pagination info
  const totalPages = Math.ceil(total / parseInt(limit));
  const hasNextPage = parseInt(page) < totalPages;
  const hasPrevPage = parseInt(page) > 1;

  res.json({
    success: true,
    data: {
      campaigns,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages,
        hasNextPage,
        hasPrevPage
      }
    }
  });
}));

// @route   GET /api/v1/campaigns/:id
// @desc    Get campaign by ID
// @access  Private
router.get('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;

  const campaign = await Campaign.findById(id)
    .populate('createdBy', 'firstName lastName email')
    .populate('assignedTo', 'firstName lastName email');

  if (!campaign) {
    throw businessError('Campaign not found', 404);
  }

  res.json({
    success: true,
    data: campaign
  });
}));

// @route   POST /api/v1/campaigns
// @desc    Create a new campaign
// @access  Private
router.post('/', authorize('admin', 'manager'), campaignValidation, asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw validationError(errors.array());
  }

  const campaignData = {
    ...req.body,
    createdBy: req.user._id
  };

  // Validate date range
  const startDate = new Date(campaignData.schedule.startDate);
  const endDate = new Date(campaignData.schedule.endDate);
  
  if (startDate >= endDate) {
    throw businessError('End date must be after start date');
  }

  const campaign = new Campaign(campaignData);
  await campaign.save();

  // Populate created by user
  await campaign.populate('createdBy', 'firstName lastName email');

  logger.logBusinessEvent('campaign_created', {
    campaignId: campaign._id,
    campaignName: campaign.name,
    createdBy: req.user._id,
    platform: campaign.platform
  });

  // Clear cache
  await cache.del('analytics:*');

  res.status(201).json({
    success: true,
    message: 'Campaign created successfully',
    data: campaign
  });
}));

// @route   PUT /api/v1/campaigns/:id
// @desc    Update campaign
// @access  Private
router.put('/:id', authorize('admin', 'manager'), updateValidation, asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw validationError(errors.array());
  }

  const { id } = req.params;
  const updateData = req.body;

  const campaign = await Campaign.findById(id);
  if (!campaign) {
    throw businessError('Campaign not found', 404);
  }

  // Check permissions
  if (req.user.role !== 'admin' && campaign.createdBy.toString() !== req.user._id.toString()) {
    throw businessError('Access denied. You can only edit campaigns you created.', 403);
  }

  // Validate date range if dates are being updated
  if (updateData.schedule?.startDate && updateData.schedule?.endDate) {
    const startDate = new Date(updateData.schedule.startDate);
    const endDate = new Date(updateData.schedule.endDate);
    
    if (startDate >= endDate) {
      throw businessError('End date must be after start date');
    }
  }

  // Update campaign
  Object.assign(campaign, updateData);
  await campaign.save();

  // Populate relations
  await campaign.populate('createdBy', 'firstName lastName email');
  await campaign.populate('assignedTo', 'firstName lastName email');

  logger.logBusinessEvent('campaign_updated', {
    campaignId: campaign._id,
    campaignName: campaign.name,
    updatedBy: req.user._id,
    changes: Object.keys(updateData)
  });

  // Clear cache
  await cache.del('analytics:*');

  res.json({
    success: true,
    message: 'Campaign updated successfully',
    data: campaign
  });
}));

// @route   DELETE /api/v1/campaigns/:id
// @desc    Delete campaign
// @access  Private
router.delete('/:id', authorize('admin', 'manager'), asyncHandler(async (req, res) => {
  const { id } = req.params;

  const campaign = await Campaign.findById(id);
  if (!campaign) {
    throw businessError('Campaign not found', 404);
  }

  // Check permissions
  if (req.user.role !== 'admin' && campaign.createdBy.toString() !== req.user._id.toString()) {
    throw businessError('Access denied. You can only delete campaigns you created.', 403);
  }

  // Check if campaign is active
  if (campaign.status === 'active') {
    throw businessError('Cannot delete active campaign. Please pause it first.');
  }

  await Campaign.findByIdAndDelete(id);

  logger.logBusinessEvent('campaign_deleted', {
    campaignId: campaign._id,
    campaignName: campaign.name,
    deletedBy: req.user._id
  });

  // Clear cache
  await cache.del('analytics:*');

  res.json({
    success: true,
    message: 'Campaign deleted successfully'
  });
}));

// @route   PATCH /api/v1/campaigns/:id/status
// @desc    Update campaign status
// @access  Private
router.patch('/:id/status', authorize('admin', 'manager'), asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['draft', 'active', 'paused', 'completed', 'archived'].includes(status)) {
    throw businessError('Invalid status');
  }

  const campaign = await Campaign.findById(id);
  if (!campaign) {
    throw businessError('Campaign not found', 404);
  }

  // Check permissions
  if (req.user.role !== 'admin' && campaign.createdBy.toString() !== req.user._id.toString()) {
    throw businessError('Access denied. You can only update campaigns you created.', 403);
  }

  const oldStatus = campaign.status;
  campaign.status = status;
  await campaign.save();

  logger.logBusinessEvent('campaign_status_changed', {
    campaignId: campaign._id,
    campaignName: campaign.name,
    oldStatus,
    newStatus: status,
    changedBy: req.user._id
  });

  // Clear cache
  await cache.del('analytics:*');

  res.json({
    success: true,
    message: 'Campaign status updated successfully',
    data: {
      id: campaign._id,
      status: campaign.status
    }
  });
}));

// @route   GET /api/v1/campaigns/:id/performance
// @desc    Get campaign performance metrics
// @access  Private
router.get('/:id/performance', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { timeRange = '24h', startDate, endDate } = req.query;

  const campaign = await Campaign.findById(id);
  if (!campaign) {
    throw businessError('Campaign not found', 404);
  }

  // Try to get from cache first
  const cacheKey = `campaign:performance:${id}:${timeRange}:${startDate || 'none'}:${endDate || 'none'}`;
  let performance = await cache.get(cacheKey);

  if (!performance) {
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

    // Get event statistics
    const Event = require('../models/Event');
    const eventStats = await Event.aggregate([
      { $match: { campaignId: id, ...dateFilter } },
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
          totalValue: { $sum: '$value' },
          totalConversionValue: { $sum: '$conversionValue' }
        }
      }
    ]);

    const stats = eventStats[0] || {
      impressions: 0,
      clicks: 0,
      conversions: 0,
      totalValue: 0,
      totalConversionValue: 0
    };

    // Calculate metrics
    performance = {
      campaignId: id,
      campaignName: campaign.name,
      impressions: stats.impressions,
      clicks: stats.clicks,
      conversions: stats.conversions,
      spend: stats.totalValue,
      revenue: stats.totalConversionValue,
      ctr: stats.impressions > 0 ? ((stats.clicks / stats.impressions) * 100).toFixed(2) : '0.00',
      cpc: stats.clicks > 0 ? (stats.totalValue / stats.clicks).toFixed(2) : '0.00',
      cpa: stats.conversions > 0 ? (stats.totalValue / stats.conversions).toFixed(2) : '0.00',
      roas: stats.totalValue > 0 ? (stats.totalConversionValue / stats.totalValue).toFixed(2) : '0.00',
      budgetSpentPercentage: campaign.budget.total > 0 ? ((stats.totalValue / campaign.budget.total) * 100).toFixed(2) : '0.00',
      remainingBudget: Math.max(0, campaign.budget.total - stats.totalValue)
    };

    // Cache for 5 minutes
    await cache.set(cacheKey, performance, 300);
  }

  res.json({
    success: true,
    data: performance
  });
}));

// @route   GET /api/v1/campaigns/stats/summary
// @desc    Get campaigns summary statistics
// @access  Private
router.get('/stats/summary', asyncHandler(async (req, res) => {
  const { status, platform } = req.query;

  // Build query
  const query = {};
  if (status) query.status = status;
  if (platform) query.platform = platform;

  // Get summary statistics
  const summary = await Campaign.aggregate([
    { $match: query },
    {
      $group: {
        _id: null,
        totalCampaigns: { $sum: 1 },
        activeCampaigns: {
          $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
        },
        pausedCampaigns: {
          $sum: { $cond: [{ $eq: ['$status', 'paused'] }, 1, 0] }
        },
        draftCampaigns: {
          $sum: { $cond: [{ $eq: ['$status', 'draft'] }, 1, 0] }
        },
        totalBudget: { $sum: '$budget.total' },
        totalSpent: { $sum: '$performance.spend' },
        totalImpressions: { $sum: '$performance.impressions' },
        totalClicks: { $sum: '$performance.clicks' },
        totalConversions: { $sum: '$performance.conversions' },
        totalRevenue: { $sum: '$performance.revenue' }
      }
    }
  ]);

  const stats = summary[0] || {
    totalCampaigns: 0,
    activeCampaigns: 0,
    pausedCampaigns: 0,
    draftCampaigns: 0,
    totalBudget: 0,
    totalSpent: 0,
    totalImpressions: 0,
    totalClicks: 0,
    totalConversions: 0,
    totalRevenue: 0
  };

  // Calculate additional metrics
  stats.budgetUtilization = stats.totalBudget > 0 ? ((stats.totalSpent / stats.totalBudget) * 100).toFixed(2) : '0.00';
  stats.overallCTR = stats.totalImpressions > 0 ? ((stats.totalClicks / stats.totalImpressions) * 100).toFixed(2) : '0.00';
  stats.overallCPC = stats.totalClicks > 0 ? (stats.totalSpent / stats.totalClicks).toFixed(2) : '0.00';
  stats.overallCPA = stats.totalConversions > 0 ? (stats.totalSpent / stats.totalConversions).toFixed(2) : '0.00';
  stats.overallROAS = stats.totalSpent > 0 ? (stats.totalRevenue / stats.totalSpent).toFixed(2) : '0.00';

  res.json({
    success: true,
    data: stats
  });
}));

// @route   POST /api/v1/campaigns/:id/assign
// @desc    Assign users to campaign
// @access  Private
router.post('/:id/assign', authorize('admin', 'manager'), asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { userIds } = req.body;

  if (!Array.isArray(userIds)) {
    throw businessError('userIds must be an array');
  }

  const campaign = await Campaign.findById(id);
  if (!campaign) {
    throw businessError('Campaign not found', 404);
  }

  // Check permissions
  if (req.user.role !== 'admin' && campaign.createdBy.toString() !== req.user._id.toString()) {
    throw businessError('Access denied. You can only assign users to campaigns you created.', 403);
  }

  // Validate user IDs
  const User = require('../models/User');
  const users = await User.find({ _id: { $in: userIds } });
  if (users.length !== userIds.length) {
    throw businessError('Some user IDs are invalid');
  }

  campaign.assignedTo = userIds;
  await campaign.save();

  // Populate assigned users
  await campaign.populate('assignedTo', 'firstName lastName email');

  logger.logBusinessEvent('campaign_users_assigned', {
    campaignId: campaign._id,
    campaignName: campaign.name,
    assignedBy: req.user._id,
    assignedUsers: userIds
  });

  res.json({
    success: true,
    message: 'Users assigned to campaign successfully',
    data: {
      campaignId: campaign._id,
      assignedTo: campaign.assignedTo
    }
  });
}));

// @route   POST /api/v1/campaigns/:id/notes
// @desc    Add note to campaign
// @access  Private
router.post('/:id/notes', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;

  if (!content || content.trim().length === 0) {
    throw businessError('Note content is required');
  }

  const campaign = await Campaign.findById(id);
  if (!campaign) {
    throw businessError('Campaign not found', 404);
  }

  // Add note
  campaign.notes.push({
    content: content.trim(),
    createdBy: req.user._id
  });

  await campaign.save();

  // Populate note creator
  await campaign.populate('notes.createdBy', 'firstName lastName');

  logger.logBusinessEvent('campaign_note_added', {
    campaignId: campaign._id,
    campaignName: campaign.name,
    addedBy: req.user._id
  });

  res.json({
    success: true,
    message: 'Note added successfully',
    data: {
      campaignId: campaign._id,
      note: campaign.notes[campaign.notes.length - 1]
    }
  });
}));

module.exports = router;
