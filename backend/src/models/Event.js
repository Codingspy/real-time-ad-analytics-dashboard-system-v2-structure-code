const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  eventId: {
    type: String,
    required: true,
    unique: true
  },
  eventType: {
    type: String,
    enum: ['impression', 'click', 'conversion', 'view', 'scroll', 'hover', 'form_submit', 'purchase'],
    required: true
  },
  campaignId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campaign',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  sessionId: String,
  timestamp: {
    type: Date,
    default: Date.now,
    required: true
  },
  value: {
    type: Number,
    default: 0,
    min: 0
  },
  currency: {
    type: String,
    default: 'USD',
    enum: ['USD', 'EUR', 'GBP', 'CAD', 'AUD']
  },
  platform: {
    type: String,
    enum: ['google', 'facebook', 'instagram', 'linkedin', 'twitter', 'tiktok', 'youtube', 'other'],
    required: true
  },
  device: {
    type: String,
    enum: ['desktop', 'mobile', 'tablet', 'other'],
    required: true
  },
  browser: {
    name: String,
    version: String,
    engine: String
  },
  os: {
    name: String,
    version: String,
    platform: String
  },
  location: {
    country: String,
    region: String,
    city: String,
    latitude: Number,
    longitude: Number,
    timezone: String
  },
  ip: {
    type: String,
    required: true
  },
  userAgent: String,
  referrer: String,
  landingPage: String,
  conversionValue: {
    type: Number,
    default: 0
  },
  conversionData: {
    conversionId: String,
    conversionType: String,
    conversionCategory: String,
    conversionLabel: String
  },
  adData: {
    adId: String,
    adGroupId: String,
    keyword: String,
    placement: String,
    creativeId: String,
    adFormat: String
  },
  pageData: {
    pageUrl: String,
    pageTitle: String,
    pageCategory: String,
    pageType: String
  },
  userData: {
    isNewUser: {
      type: Boolean,
      default: true
    },
    userSegment: String,
    userInterest: [String],
    userBehavior: [String]
  },
  technicalData: {
    loadTime: Number,
    connectionType: String,
    screenResolution: String,
    viewportSize: String,
    language: String,
    cookiesEnabled: Boolean,
    javascriptEnabled: Boolean
  },
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  },
  isProcessed: {
    type: Boolean,
    default: false
  },
  processingStatus: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  errorMessage: String
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for event age in minutes
eventSchema.virtual('ageInMinutes').get(function() {
  return Math.floor((Date.now() - this.timestamp.getTime()) / (1000 * 60));
});

// Virtual for event age in hours
eventSchema.virtual('ageInHours').get(function() {
  return Math.floor((Date.now() - this.timestamp.getTime()) / (1000 * 60 * 60));
});

// Virtual for event age in days
eventSchema.virtual('ageInDays').get(function() {
  return Math.floor((Date.now() - this.timestamp.getTime()) / (1000 * 60 * 60 * 24));
});

// Indexes for performance
eventSchema.index({ eventType: 1 });
eventSchema.index({ campaignId: 1 });
eventSchema.index({ timestamp: -1 });
eventSchema.index({ platform: 1 });
eventSchema.index({ device: 1 });
eventSchema.index({ 'location.country': 1 });
eventSchema.index({ 'location.city': 1 });
eventSchema.index({ sessionId: 1 });
eventSchema.index({ userId: 1 });
eventSchema.index({ isProcessed: 1 });
eventSchema.index({ processingStatus: 1 });

// Compound indexes for common queries
eventSchema.index({ campaignId: 1, eventType: 1 });
eventSchema.index({ campaignId: 1, timestamp: -1 });
eventSchema.index({ eventType: 1, timestamp: -1 });
eventSchema.index({ platform: 1, eventType: 1 });
eventSchema.index({ device: 1, eventType: 1 });

// Text index for search
eventSchema.index({
  'adData.keyword': 'text',
  'pageData.pageTitle': 'text',
  'conversionData.conversionLabel': 'text'
});

// Pre-save middleware to generate event ID if not provided
eventSchema.pre('save', function(next) {
  if (!this.eventId) {
    this.eventId = require('crypto').randomUUID();
  }
  next();
});

// Pre-save middleware to update processing status
eventSchema.pre('save', function(next) {
  if (this.isModified('isProcessed') && this.isProcessed) {
    this.processingStatus = 'completed';
  }
  next();
});

// Instance method to mark as processed
eventSchema.methods.markAsProcessed = function() {
  this.isProcessed = true;
  this.processingStatus = 'completed';
  return this.save();
};

// Instance method to mark as failed
eventSchema.methods.markAsFailed = function(errorMessage) {
  this.processingStatus = 'failed';
  this.errorMessage = errorMessage;
  return this.save();
};

// Instance method to get event summary
eventSchema.methods.getSummary = function() {
  return {
    eventId: this.eventId,
    eventType: this.eventType,
    campaignId: this.campaignId,
    timestamp: this.timestamp,
    value: this.value,
    platform: this.platform,
    device: this.device,
    location: this.location,
    conversionValue: this.conversionValue
  };
};

// Static method to find events by campaign
eventSchema.statics.findByCampaign = function(campaignId, options = {}) {
  const query = { campaignId };
  
  if (options.eventType) {
    query.eventType = options.eventType;
  }
  
  if (options.startDate && options.endDate) {
    query.timestamp = {
      $gte: new Date(options.startDate),
      $lte: new Date(options.endDate)
    };
  }
  
  return this.find(query).sort({ timestamp: -1 });
};

// Static method to find events by type
eventSchema.statics.findByType = function(eventType, options = {}) {
  const query = { eventType };
  
  if (options.campaignId) {
    query.campaignId = options.campaignId;
  }
  
  if (options.startDate && options.endDate) {
    query.timestamp = {
      $gte: new Date(options.startDate),
      $lte: new Date(options.endDate)
    };
  }
  
  return this.find(query).sort({ timestamp: -1 });
};

// Static method to find unprocessed events
eventSchema.statics.findUnprocessed = function(limit = 100) {
  return this.find({
    isProcessed: false,
    processingStatus: { $ne: 'processing' }
  })
  .sort({ timestamp: 1 })
  .limit(limit);
};

// Static method to get event statistics
eventSchema.statics.getEventStats = function(filters = {}) {
  const matchStage = {};
  
  if (filters.campaignId) {
    matchStage.campaignId = filters.campaignId;
  }
  
  if (filters.eventType) {
    matchStage.eventType = filters.eventType;
  }
  
  if (filters.startDate && filters.endDate) {
    matchStage.timestamp = {
      $gte: new Date(filters.startDate),
      $lte: new Date(filters.endDate)
    };
  }
  
  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: {
          eventType: '$eventType',
          platform: '$platform',
          device: '$device'
        },
        count: { $sum: 1 },
        totalValue: { $sum: '$value' },
        totalConversionValue: { $sum: '$conversionValue' },
        avgValue: { $avg: '$value' },
        avgConversionValue: { $avg: '$conversionValue' }
      }
    },
    {
      $group: {
        _id: '$_id.eventType',
        platforms: {
          $push: {
            platform: '$_id.platform',
            device: '$_id.device',
            count: '$count',
            totalValue: '$totalValue',
            totalConversionValue: '$totalConversionValue',
            avgValue: '$avgValue',
            avgConversionValue: '$avgConversionValue'
          }
        },
        totalCount: { $sum: '$count' },
        totalValue: { $sum: '$totalValue' },
        totalConversionValue: { $sum: '$totalConversionValue' }
      }
    }
  ]);
};

// Static method to get hourly event distribution
eventSchema.statics.getHourlyDistribution = function(filters = {}) {
  const matchStage = {};
  
  if (filters.campaignId) {
    matchStage.campaignId = filters.campaignId;
  }
  
  if (filters.eventType) {
    matchStage.eventType = filters.eventType;
  }
  
  if (filters.startDate && filters.endDate) {
    matchStage.timestamp = {
      $gte: new Date(filters.startDate),
      $lte: new Date(filters.endDate)
    };
  }
  
  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: {
          year: { $year: '$timestamp' },
          month: { $month: '$timestamp' },
          day: { $dayOfMonth: '$timestamp' },
          hour: { $hour: '$timestamp' }
        },
        count: { $sum: 1 },
        totalValue: { $sum: '$value' },
        totalConversionValue: { $sum: '$conversionValue' }
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
};

// Static method to get geographic distribution
eventSchema.statics.getGeographicDistribution = function(filters = {}) {
  const matchStage = {};
  
  if (filters.campaignId) {
    matchStage.campaignId = filters.campaignId;
  }
  
  if (filters.eventType) {
    matchStage.eventType = filters.eventType;
  }
  
  if (filters.startDate && filters.endDate) {
    matchStage.timestamp = {
      $gte: new Date(filters.startDate),
      $lte: new Date(filters.endDate)
    };
  }
  
  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: {
          country: '$location.country',
          region: '$location.region',
          city: '$location.city'
        },
        count: { $sum: 1 },
        totalValue: { $sum: '$value' },
        totalConversionValue: { $sum: '$conversionValue' }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);
};

module.exports = mongoose.model('Event', eventSchema);
