const express = require('express');
const { body, validationResult } = require('express-validator');
const { asyncHandler, validationError, businessError } = require('../middleware/errorHandler');
const { authorize } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// @route   GET /api/v1/settings
// @desc    Get application settings
// @access  Private
router.get('/', asyncHandler(async (req, res) => {
  // Return application settings
  const settings = {
    analytics: {
      realTimeUpdateInterval: 3000, // 3 seconds
      maxDataPoints: 1000,
      defaultTimeRange: '24h',
      availableTimeRanges: ['1h', '24h', '7d', '30d']
    },
    notifications: {
      email: {
        enabled: true,
        frequency: 'daily',
        types: ['performance_alerts', 'budget_alerts', 'campaign_updates']
      },
      push: {
        enabled: true,
        types: ['real_time_events', 'critical_alerts']
      }
    },
    display: {
      currency: 'USD',
      timezone: 'UTC',
      dateFormat: 'YYYY-MM-DD',
      numberFormat: 'en-US'
    },
    security: {
      sessionTimeout: 3600, // 1 hour
      maxLoginAttempts: 5,
      passwordPolicy: {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: true
      }
    },
    integrations: {
      googleAnalytics: {
        enabled: false,
        trackingId: null
      },
      facebookPixel: {
        enabled: false,
        pixelId: null
      },
      googleAds: {
        enabled: false,
        customerId: null
      }
    }
  };

  res.json({
    success: true,
    data: settings
  });
}));

// @route   PUT /api/v1/settings
// @desc    Update application settings
// @access  Private (Admin only)
router.put('/', authorize('admin'), asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw validationError(errors.array());
  }

  const { settings } = req.body;

  // Validate settings structure
  if (!settings || typeof settings !== 'object') {
    throw businessError('Settings object is required');
  }

  // Here you would typically save settings to database
  // For now, we'll just log the update
  logger.logBusinessEvent('settings_updated', {
    updatedBy: req.user._id,
    changes: Object.keys(settings)
  });

  res.json({
    success: true,
    message: 'Settings updated successfully',
    data: settings
  });
}));

// @route   GET /api/v1/settings/user
// @desc    Get user preferences
// @access  Private
router.get('/user', asyncHandler(async (req, res) => {
  const user = req.user;

  const preferences = {
    theme: user.profile?.preferences?.theme || 'system',
    notifications: {
      email: user.profile?.preferences?.notifications?.email ?? true,
      push: user.profile?.preferences?.notifications?.push ?? true,
      reports: user.profile?.preferences?.notifications?.reports ?? true
    },
    timezone: user.profile?.timezone || 'UTC',
    language: 'en',
    currency: 'USD'
  };

  res.json({
    success: true,
    data: preferences
  });
}));

// @route   PUT /api/v1/settings/user
// @desc    Update user preferences
// @access  Private
router.put('/user', asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw validationError(errors.array());
  }

  const { preferences } = req.body;

  if (!preferences || typeof preferences !== 'object') {
    throw businessError('Preferences object is required');
  }

  // Update user preferences
  const User = require('../models/User');
  const user = await User.findById(req.user._id);

  if (preferences.theme) {
    user.profile.preferences.theme = preferences.theme;
  }

  if (preferences.notifications) {
    user.profile.preferences.notifications = {
      ...user.profile.preferences.notifications,
      ...preferences.notifications
    };
  }

  if (preferences.timezone) {
    user.profile.timezone = preferences.timezone;
  }

  await user.save();

  logger.logBusinessEvent('user_preferences_updated', {
    userId: user._id,
    changes: Object.keys(preferences)
  });

  res.json({
    success: true,
    message: 'Preferences updated successfully',
    data: {
      theme: user.profile.preferences.theme,
      notifications: user.profile.preferences.notifications,
      timezone: user.profile.timezone
    }
  });
}));

// @route   GET /api/v1/settings/integrations
// @desc    Get integration settings
// @access  Private
router.get('/integrations', asyncHandler(async (req, res) => {
  const integrations = {
    googleAnalytics: {
      enabled: false,
      trackingId: null,
      connected: false,
      lastSync: null
    },
    facebookPixel: {
      enabled: false,
      pixelId: null,
      connected: false,
      lastSync: null
    },
    googleAds: {
      enabled: false,
      customerId: null,
      connected: false,
      lastSync: null
    },
    facebookAds: {
      enabled: false,
      adAccountId: null,
      connected: false,
      lastSync: null
    },
    twitterAds: {
      enabled: false,
      accountId: null,
      connected: false,
      lastSync: null
    }
  };

  res.json({
    success: true,
    data: integrations
  });
}));

// @route   POST /api/v1/settings/integrations/:platform
// @desc    Connect integration
// @access  Private (Admin only)
router.post('/integrations/:platform', authorize('admin'), asyncHandler(async (req, res) => {
  const { platform } = req.params;
  const { credentials } = req.body;

  const validPlatforms = ['googleAnalytics', 'facebookPixel', 'googleAds', 'facebookAds', 'twitterAds'];
  
  if (!validPlatforms.includes(platform)) {
    throw businessError('Invalid platform');
  }

  if (!credentials || typeof credentials !== 'object') {
    throw businessError('Credentials are required');
  }

  // Here you would typically validate and store credentials
  // For now, we'll just log the connection attempt
  logger.logBusinessEvent('integration_connected', {
    platform,
    connectedBy: req.user._id
  });

  res.json({
    success: true,
    message: `${platform} integration connected successfully`,
    data: {
      platform,
      connected: true,
      lastSync: new Date().toISOString()
    }
  });
}));

// @route   DELETE /api/v1/settings/integrations/:platform
// @desc    Disconnect integration
// @access  Private (Admin only)
router.delete('/integrations/:platform', authorize('admin'), asyncHandler(async (req, res) => {
  const { platform } = req.params;

  const validPlatforms = ['googleAnalytics', 'facebookPixel', 'googleAds', 'facebookAds', 'twitterAds'];
  
  if (!validPlatforms.includes(platform)) {
    throw businessError('Invalid platform');
  }

  // Here you would typically remove stored credentials
  logger.logBusinessEvent('integration_disconnected', {
    platform,
    disconnectedBy: req.user._id
  });

  res.json({
    success: true,
    message: `${platform} integration disconnected successfully`
  });
}));

// @route   GET /api/v1/settings/notifications
// @desc    Get notification settings
// @access  Private
router.get('/notifications', asyncHandler(async (req, res) => {
  const user = req.user;

  const notificationSettings = {
    email: {
      enabled: user.profile?.preferences?.notifications?.email ?? true,
      frequency: 'daily',
      types: {
        performance_alerts: true,
        budget_alerts: true,
        campaign_updates: true,
        system_notifications: true
      }
    },
    push: {
      enabled: user.profile?.preferences?.notifications?.push ?? true,
      types: {
        real_time_events: true,
        critical_alerts: true,
        campaign_milestones: true
      }
    },
    inApp: {
      enabled: true,
      types: {
        all: true
      }
    }
  };

  res.json({
    success: true,
    data: notificationSettings
  });
}));

// @route   PUT /api/v1/settings/notifications
// @desc    Update notification settings
// @access  Private
router.put('/notifications', asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw validationError(errors.array());
  }

  const { notifications } = req.body;

  if (!notifications || typeof notifications !== 'object') {
    throw businessError('Notifications object is required');
  }

  // Update user notification preferences
  const User = require('../models/User');
  const user = await User.findById(req.user._id);

  if (notifications.email) {
    user.profile.preferences.notifications.email = notifications.email.enabled;
  }

  if (notifications.push) {
    user.profile.preferences.notifications.push = notifications.push.enabled;
  }

  await user.save();

  logger.logBusinessEvent('notification_settings_updated', {
    userId: user._id,
    changes: Object.keys(notifications)
  });

  res.json({
    success: true,
    message: 'Notification settings updated successfully',
    data: {
      email: user.profile.preferences.notifications.email,
      push: user.profile.preferences.notifications.push
    }
  });
}));

module.exports = router;
