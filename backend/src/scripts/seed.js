const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import models
const User = require('../models/User');
const Campaign = require('../models/Campaign');
const Event = require('../models/Event');

// Sample data
const sampleUsers = [
  {
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@adanalytics.com',
    password: 'admin123',
    role: 'admin',
    isEmailVerified: true,
    isActive: true,
    profile: {
      company: 'AdAnalytics Pro',
      position: 'System Administrator',
      timezone: 'UTC'
    }
  },
  {
    firstName: 'Manager',
    lastName: 'User',
    email: 'manager@adanalytics.com',
    password: 'manager123',
    role: 'manager',
    isEmailVerified: true,
    isActive: true,
    profile: {
      company: 'AdAnalytics Pro',
      position: 'Marketing Manager',
      timezone: 'America/New_York'
    }
  },
  {
    firstName: 'Analyst',
    lastName: 'User',
    email: 'analyst@adanalytics.com',
    password: 'analyst123',
    role: 'analyst',
    isEmailVerified: true,
    isActive: true,
    profile: {
      company: 'AdAnalytics Pro',
      position: 'Data Analyst',
      timezone: 'Europe/London'
    }
  },
  {
    firstName: 'Viewer',
    lastName: 'User',
    email: 'viewer@adanalytics.com',
    password: 'viewer123',
    role: 'viewer',
    isEmailVerified: true,
    isActive: true,
    profile: {
      company: 'AdAnalytics Pro',
      position: 'Marketing Assistant',
      timezone: 'America/Los_Angeles'
    }
  }
];

const sampleCampaigns = [
  {
    name: 'Summer Sale 2024',
    description: 'Promote summer collection with special discounts',
    status: 'active',
    platform: 'google',
    type: 'search',
    budget: {
      daily: 500,
      total: 5000,
      currency: 'USD'
    },
    schedule: {
      startDate: new Date('2024-06-01'),
      endDate: new Date('2024-08-31'),
      timezone: 'UTC'
    },
    targeting: {
      locations: [
        { country: 'United States', region: 'California' },
        { country: 'United States', region: 'New York' }
      ],
      demographics: {
        ageRange: { min: 25, max: 45 },
        gender: 'all',
        languages: ['en'],
        interests: ['fashion', 'shopping', 'lifestyle']
      },
      devices: {
        desktop: true,
        mobile: true,
        tablet: true
      }
    },
    bidding: {
      strategy: 'target_cpa',
      defaultBid: 2.5,
      targetCPA: 15
    },
    tracking: {
      trackingId: 'summer-sale-2024',
      conversionActions: [
        {
          name: 'Purchase',
          type: 'purchase',
          value: 50,
          count: 'every'
        }
      ],
      utmParameters: {
        source: 'google',
        medium: 'cpc',
        campaign: 'summer-sale-2024'
      }
    },
    performance: {
      impressions: 125000,
      clicks: 2500,
      conversions: 125,
      spend: 3250,
      revenue: 6250,
      ctr: 2.0,
      cpc: 1.3,
      cpa: 26.0,
      roas: 1.92
    }
  },
  {
    name: 'Brand Awareness Q3',
    description: 'Increase brand visibility and awareness',
    status: 'active',
    platform: 'facebook',
    type: 'social',
    budget: {
      daily: 800,
      total: 8000,
      currency: 'USD'
    },
    schedule: {
      startDate: new Date('2024-07-01'),
      endDate: new Date('2024-09-30'),
      timezone: 'UTC'
    },
    targeting: {
      locations: [
        { country: 'United States' },
        { country: 'Canada' },
        { country: 'United Kingdom' }
      ],
      demographics: {
        ageRange: { min: 18, max: 55 },
        gender: 'all',
        languages: ['en'],
        interests: ['technology', 'innovation', 'business']
      },
      devices: {
        desktop: true,
        mobile: true,
        tablet: true
      }
    },
    bidding: {
      strategy: 'maximize_clicks',
      defaultBid: 1.5
    },
    tracking: {
      trackingId: 'brand-awareness-q3',
      conversionActions: [
        {
          name: 'Page View',
          type: 'page_view',
          value: 1,
          count: 'one'
        }
      ],
      utmParameters: {
        source: 'facebook',
        medium: 'social',
        campaign: 'brand-awareness-q3'
      }
    },
    performance: {
      impressions: 200000,
      clicks: 3200,
      conversions: 96,
      spend: 4200,
      revenue: 0,
      ctr: 1.6,
      cpc: 1.31,
      cpa: 43.75,
      roas: 0
    }
  },
  {
    name: 'Product Launch Campaign',
    description: 'Launch new product with exclusive offers',
    status: 'paused',
    platform: 'instagram',
    type: 'social',
    budget: {
      daily: 300,
      total: 3000,
      currency: 'USD'
    },
    schedule: {
      startDate: new Date('2024-05-15'),
      endDate: new Date('2024-07-15'),
      timezone: 'UTC'
    },
    targeting: {
      locations: [
        { country: 'United States' },
        { country: 'Canada' }
      ],
      demographics: {
        ageRange: { min: 18, max: 35 },
        gender: 'all',
        languages: ['en'],
        interests: ['technology', 'gadgets', 'innovation']
      },
      devices: {
        desktop: false,
        mobile: true,
        tablet: true
      }
    },
    bidding: {
      strategy: 'target_roas',
      defaultBid: 2.0,
      targetROAS: 3.0
    },
    tracking: {
      trackingId: 'product-launch-2024',
      conversionActions: [
        {
          name: 'Sign Up',
          type: 'sign_up',
          value: 10,
          count: 'one'
        },
        {
          name: 'Purchase',
          type: 'purchase',
          value: 100,
          count: 'every'
        }
      ],
      utmParameters: {
        source: 'instagram',
        medium: 'social',
        campaign: 'product-launch-2024'
      }
    },
    performance: {
      impressions: 75000,
      clicks: 1200,
      conversions: 48,
      spend: 1800,
      revenue: 4800,
      ctr: 1.6,
      cpc: 1.5,
      cpa: 37.5,
      roas: 2.67
    }
  },
  {
    name: 'Holiday Promotion',
    description: 'Holiday season special promotions',
    status: 'draft',
    platform: 'google',
    type: 'display',
    budget: {
      daily: 1000,
      total: 10000,
      currency: 'USD'
    },
    schedule: {
      startDate: new Date('2024-11-01'),
      endDate: new Date('2024-12-31'),
      timezone: 'UTC'
    },
    targeting: {
      locations: [
        { country: 'United States' },
        { country: 'Canada' },
        { country: 'United Kingdom' },
        { country: 'Germany' },
        { country: 'France' }
      ],
      demographics: {
        ageRange: { min: 25, max: 65 },
        gender: 'all',
        languages: ['en', 'de', 'fr'],
        interests: ['shopping', 'holidays', 'gifts']
      },
      devices: {
        desktop: true,
        mobile: true,
        tablet: true
      }
    },
    bidding: {
      strategy: 'manual',
      defaultBid: 1.8
    },
    tracking: {
      trackingId: 'holiday-promotion-2024',
      conversionActions: [
        {
          name: 'Purchase',
          type: 'purchase',
          value: 75,
          count: 'every'
        }
      ],
      utmParameters: {
        source: 'google',
        medium: 'display',
        campaign: 'holiday-promotion-2024'
      }
    },
    performance: {
      impressions: 0,
      clicks: 0,
      conversions: 0,
      spend: 0,
      revenue: 0,
      ctr: 0,
      cpc: 0,
      cpa: 0,
      roas: 0
    }
  }
];

// Connect to MongoDB
const connectDB = async () => {
  try {
    const mongoURI = process.env.NODE_ENV === 'production' 
      ? process.env.MONGODB_URI_PROD 
      : process.env.MONGODB_URI;

    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('MongoDB connected for seeding');
  } catch (error) {
    console.error('MongoDB connection failed:', error);
    process.exit(1);
  }
};

// Seed users
const seedUsers = async () => {
  try {
    console.log('Seeding users...');
    
    for (const userData of sampleUsers) {
      const existingUser = await User.findOne({ email: userData.email });
      
      if (!existingUser) {
        const user = new User(userData);
        await user.save();
        console.log(`Created user: ${user.email}`);
      } else {
        console.log(`User already exists: ${userData.email}`);
      }
    }
    
    console.log('Users seeded successfully');
  } catch (error) {
    console.error('Error seeding users:', error);
  }
};

// Seed campaigns
const seedCampaigns = async () => {
  try {
    console.log('Seeding campaigns...');
    
    const adminUser = await User.findOne({ email: 'admin@adanalytics.com' });
    if (!adminUser) {
      console.error('Admin user not found. Please seed users first.');
      return;
    }

    for (const campaignData of sampleCampaigns) {
      const existingCampaign = await Campaign.findOne({ name: campaignData.name });
      
      if (!existingCampaign) {
        const campaign = new Campaign({
          ...campaignData,
          createdBy: adminUser._id
        });
        await campaign.save();
        console.log(`Created campaign: ${campaign.name}`);
      } else {
        console.log(`Campaign already exists: ${campaignData.name}`);
      }
    }
    
    console.log('Campaigns seeded successfully');
  } catch (error) {
    console.error('Error seeding campaigns:', error);
  }
};

// Seed events
const seedEvents = async () => {
  try {
    console.log('Seeding events...');
    
    const campaigns = await Campaign.find();
    if (campaigns.length === 0) {
      console.error('No campaigns found. Please seed campaigns first.');
      return;
    }

    const eventTypes = ['impression', 'click', 'conversion'];
    const devices = ['desktop', 'mobile', 'tablet'];
    const platforms = ['google', 'facebook', 'instagram'];
    
    // Generate events for the last 30 days
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const events = [];
    
    for (const campaign of campaigns) {
      if (campaign.status === 'draft') continue;
      
      // Generate events for each day
      for (let day = 0; day < 30; day++) {
        const eventDate = new Date(thirtyDaysAgo.getTime() + day * 24 * 60 * 60 * 1000);
        
        // Generate impressions (more frequent)
        const impressionsCount = Math.floor(Math.random() * 1000) + 500;
        for (let i = 0; i < impressionsCount; i++) {
          events.push({
            eventId: `imp_${campaign._id}_${day}_${i}`,
            eventType: 'impression',
            campaignId: campaign._id,
            timestamp: new Date(eventDate.getTime() + Math.random() * 24 * 60 * 60 * 1000),
            value: 0,
            currency: campaign.budget.currency,
            platform: campaign.platform,
            device: devices[Math.floor(Math.random() * devices.length)],
            browser: {
              name: 'Chrome',
              version: '120.0.0.0',
              engine: 'Blink'
            },
            os: {
              name: 'Windows',
              version: '10',
              platform: 'desktop'
            },
            ip: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            referrer: 'https://www.google.com/',
            landingPage: 'https://example.com/landing',
            conversionValue: 0
          });
        }
        
        // Generate clicks (less frequent)
        const clicksCount = Math.floor(impressionsCount * (Math.random() * 0.03 + 0.01)); // 1-4% CTR
        for (let i = 0; i < clicksCount; i++) {
          events.push({
            eventId: `click_${campaign._id}_${day}_${i}`,
            eventType: 'click',
            campaignId: campaign._id,
            timestamp: new Date(eventDate.getTime() + Math.random() * 24 * 60 * 60 * 1000),
            value: Math.random() * 3 + 0.5, // $0.5 - $3.5 per click
            currency: campaign.budget.currency,
            platform: campaign.platform,
            device: devices[Math.floor(Math.random() * devices.length)],
            browser: {
              name: 'Chrome',
              version: '120.0.0.0',
              engine: 'Blink'
            },
            os: {
              name: 'Windows',
              version: '10',
              platform: 'desktop'
            },
            ip: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            referrer: 'https://www.google.com/',
            landingPage: 'https://example.com/landing',
            conversionValue: 0
          });
        }
        
        // Generate conversions (even less frequent)
        const conversionsCount = Math.floor(clicksCount * (Math.random() * 0.1 + 0.05)); // 5-15% conversion rate
        for (let i = 0; i < conversionsCount; i++) {
          events.push({
            eventId: `conv_${campaign._id}_${day}_${i}`,
            eventType: 'conversion',
            campaignId: campaign._id,
            timestamp: new Date(eventDate.getTime() + Math.random() * 24 * 60 * 60 * 1000),
            value: 0,
            currency: campaign.budget.currency,
            platform: campaign.platform,
            device: devices[Math.floor(Math.random() * devices.length)],
            browser: {
              name: 'Chrome',
              version: '120.0.0.0',
              engine: 'Blink'
            },
            os: {
              name: 'Windows',
              version: '10',
              platform: 'desktop'
            },
            ip: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            referrer: 'https://www.google.com/',
            landingPage: 'https://example.com/landing',
            conversionValue: Math.random() * 200 + 50 // $50 - $250 conversion value
          });
        }
      }
    }
    
    // Insert events in batches
    const batchSize = 1000;
    for (let i = 0; i < events.length; i += batchSize) {
      const batch = events.slice(i, i + batchSize);
      await Event.insertMany(batch);
      console.log(`Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(events.length / batchSize)}`);
    }
    
    console.log(`Events seeded successfully. Total events: ${events.length}`);
  } catch (error) {
    console.error('Error seeding events:', error);
  }
};

// Main seeding function
const seedDatabase = async () => {
  try {
    await connectDB();
    
    console.log('Starting database seeding...');
    
    await seedUsers();
    await seedCampaigns();
    await seedEvents();
    
    console.log('Database seeding completed successfully!');
    
    // Close connection
    await mongoose.connection.close();
    console.log('Database connection closed');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };
