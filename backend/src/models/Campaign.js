const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Campaign name is required'],
    trim: true,
    maxlength: [100, 'Campaign name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'paused', 'completed', 'archived'],
    default: 'draft'
  },
  platform: {
    type: String,
    enum: ['google', 'facebook', 'instagram', 'linkedin', 'twitter', 'tiktok', 'youtube', 'other'],
    required: [true, 'Platform is required']
  },
  type: {
    type: String,
    enum: ['search', 'display', 'social', 'video', 'remarketing', 'affiliate'],
    required: [true, 'Campaign type is required']
  },
  budget: {
    daily: {
      type: Number,
      min: [0, 'Daily budget cannot be negative']
    },
    total: {
      type: Number,
      min: [0, 'Total budget cannot be negative'],
      required: [true, 'Total budget is required']
    },
    currency: {
      type: String,
      default: 'USD',
      enum: ['USD', 'EUR', 'GBP', 'CAD', 'AUD']
    }
  },
  schedule: {
    startDate: {
      type: Date,
      required: [true, 'Start date is required']
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required']
    },
    timezone: {
      type: String,
      default: 'UTC'
    },
    activeHours: {
      start: {
        type: String,
        default: '00:00'
      },
      end: {
        type: String,
        default: '23:59'
      }
    },
    activeDays: {
      type: [String],
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
      default: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    }
  },
  targeting: {
    locations: [{
      country: String,
      region: String,
      city: String,
      radius: Number
    }],
    demographics: {
      ageRange: {
        min: {
          type: Number,
          min: 13,
          max: 65
        },
        max: {
          type: Number,
          min: 13,
          max: 65
        }
      },
      gender: {
        type: String,
        enum: ['all', 'male', 'female']
      },
      languages: [String],
      interests: [String],
      behaviors: [String]
    },
    devices: {
      desktop: {
        type: Boolean,
        default: true
      },
      mobile: {
        type: Boolean,
        default: true
      },
      tablet: {
        type: Boolean,
        default: true
      }
    },
    audiences: [{
      name: String,
      type: String,
      id: String
    }]
  },
  bidding: {
    strategy: {
      type: String,
      enum: ['manual', 'automatic', 'target_cpa', 'target_roas', 'maximize_clicks', 'maximize_conversions'],
      default: 'manual'
    },
    defaultBid: {
      type: Number,
      min: [0, 'Default bid cannot be negative']
    },
    targetCPA: Number,
    targetROAS: Number
  },
  tracking: {
    trackingId: String,
    conversionActions: [{
      name: String,
      type: String,
      value: Number,
      count: {
        type: String,
        enum: ['one', 'every'],
        default: 'one'
      }
    }],
    pixels: [{
      name: String,
      type: String,
      code: String,
      isActive: {
        type: Boolean,
        default: true
      }
    }],
    utmParameters: {
      source: String,
      medium: String,
      campaign: String,
      term: String,
      content: String
    }
  },
  performance: {
    impressions: {
      type: Number,
      default: 0
    },
    clicks: {
      type: Number,
      default: 0
    },
    conversions: {
      type: Number,
      default: 0
    },
    spend: {
      type: Number,
      default: 0
    },
    revenue: {
      type: Number,
      default: 0
    },
    ctr: {
      type: Number,
      default: 0
    },
    cpc: {
      type: Number,
      default: 0
    },
    cpa: {
      type: Number,
      default: 0
    },
    roas: {
      type: Number,
      default: 0
    }
  },
  settings: {
    isActive: {
      type: Boolean,
      default: true
    },
    autoOptimize: {
      type: Boolean,
      default: false
    },
    notifications: {
      budgetAlerts: {
        type: Boolean,
        default: true
      },
      performanceAlerts: {
        type: Boolean,
        default: true
      }
    }
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedTo: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  tags: [String],
  notes: [{
    content: String,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for campaign duration
campaignSchema.virtual('duration').get(function() {
  if (!this.schedule.startDate || !this.schedule.endDate) return 0;
  return Math.ceil((this.schedule.endDate - this.schedule.startDate) / (1000 * 60 * 60 * 24));
});

// Virtual for budget spent percentage
campaignSchema.virtual('budgetSpentPercentage').get(function() {
  if (!this.budget.total || this.budget.total === 0) return 0;
  return (this.performance.spend / this.budget.total) * 100;
});

// Virtual for remaining budget
campaignSchema.virtual('remainingBudget').get(function() {
  return Math.max(0, this.budget.total - this.performance.spend);
});

// Virtual for campaign efficiency
campaignSchema.virtual('efficiency').get(function() {
  if (this.performance.spend === 0) return 0;
  return this.performance.revenue / this.performance.spend;
});

// Indexes
campaignSchema.index({ status: 1 });
campaignSchema.index({ platform: 1 });
campaignSchema.index({ 'schedule.startDate': 1 });
campaignSchema.index({ 'schedule.endDate': 1 });
campaignSchema.index({ createdBy: 1 });
campaignSchema.index({ tags: 1 });
campaignSchema.index({ name: 'text', description: 'text' });

// Pre-save middleware to calculate performance metrics
campaignSchema.pre('save', function(next) {
  // Calculate CTR
  if (this.performance.impressions > 0) {
    this.performance.ctr = (this.performance.clicks / this.performance.impressions) * 100;
  }
  
  // Calculate CPC
  if (this.performance.clicks > 0) {
    this.performance.cpc = this.performance.spend / this.performance.clicks;
  }
  
  // Calculate CPA
  if (this.performance.conversions > 0) {
    this.performance.cpa = this.performance.spend / this.performance.conversions;
  }
  
  // Calculate ROAS
  if (this.performance.spend > 0) {
    this.performance.roas = this.performance.revenue / this.performance.spend;
  }
  
  next();
});

// Instance method to update performance
campaignSchema.methods.updatePerformance = function(metrics) {
  Object.keys(metrics).forEach(key => {
    if (this.performance.hasOwnProperty(key)) {
      this.performance[key] += metrics[key];
    }
  });
  
  return this.save();
};

// Instance method to check if campaign is active
campaignSchema.methods.isActive = function() {
  const now = new Date();
  return (
    this.status === 'active' &&
    this.settings.isActive &&
    this.schedule.startDate <= now &&
    this.schedule.endDate >= now
  );
};

// Instance method to check budget status
campaignSchema.methods.checkBudgetStatus = function() {
  const spentPercentage = this.budgetSpentPercentage;
  
  if (spentPercentage >= 100) {
    return 'exhausted';
  } else if (spentPercentage >= 90) {
    return 'critical';
  } else if (spentPercentage >= 75) {
    return 'warning';
  } else {
    return 'healthy';
  }
};

// Static method to find active campaigns
campaignSchema.statics.findActive = function() {
  const now = new Date();
  return this.find({
    status: 'active',
    'settings.isActive': true,
    'schedule.startDate': { $lte: now },
    'schedule.endDate': { $gte: now }
  });
};

// Static method to find campaigns by platform
campaignSchema.statics.findByPlatform = function(platform) {
  return this.find({ platform });
};

// Static method to find campaigns by status
campaignSchema.statics.findByStatus = function(status) {
  return this.find({ status });
};

// Static method to find campaigns by date range
campaignSchema.statics.findByDateRange = function(startDate, endDate) {
  return this.find({
    'schedule.startDate': { $lte: endDate },
    'schedule.endDate': { $gte: startDate }
  });
};

// Static method to get performance summary
campaignSchema.statics.getPerformanceSummary = function(filters = {}) {
  return this.aggregate([
    { $match: filters },
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
};

module.exports = mongoose.model('Campaign', campaignSchema);
