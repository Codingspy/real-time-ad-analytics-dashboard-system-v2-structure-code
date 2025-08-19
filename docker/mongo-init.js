// MongoDB initialization script for Ad Analytics Dashboard
db = db.getSiblingDB('ad-analytics');

// Create application user
db.createUser({
  user: 'adanalytics',
  pwd: 'adanalytics123',
  roles: [
    {
      role: 'readWrite',
      db: 'ad-analytics'
    }
  ]
});

// Create collections with indexes
db.createCollection('users');
db.createCollection('campaigns');
db.createCollection('events');

// Create indexes for better performance
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "role": 1 });
db.users.createIndex({ "isActive": 1 });

db.campaigns.createIndex({ "status": 1 });
db.campaigns.createIndex({ "platform": 1 });
db.campaigns.createIndex({ "createdBy": 1 });
db.campaigns.createIndex({ "createdAt": -1 });

db.events.createIndex({ "eventId": 1 }, { unique: true });
db.events.createIndex({ "campaignId": 1 });
db.events.createIndex({ "eventType": 1 });
db.events.createIndex({ "timestamp": -1 });
db.events.createIndex({ "userId": 1 });
db.events.createIndex({ "platform": 1 });

print('MongoDB initialization completed successfully!');
