const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import User model
const User = require('./src/models/User');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Create users with proper credentials
const createUsers = async () => {
  try {
    const saltRounds = 12;
    
    const users = [
      {
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@adanalytics.com',
        password: 'AdAnalytics2024!Admin',
        role: 'admin'
      },
      {
        firstName: 'Manager',
        lastName: 'User',
        email: 'manager@adanalytics.com',
        password: 'AdAnalytics2024!Manager',
        role: 'manager'
      },
      {
        firstName: 'Analyst',
        lastName: 'User',
        email: 'analyst@adanalytics.com',
        password: 'AdAnalytics2024!Analyst',
        role: 'analyst'
      },
      {
        firstName: 'Viewer',
        lastName: 'User',
        email: 'viewer@adanalytics.com',
        password: 'AdAnalytics2024!Viewer',
        role: 'viewer'
      }
    ];

    for (const userData of users) {
      // Check if user exists
      const existingUser = await User.findOne({ email: userData.email });
      
      if (existingUser) {
        console.log(`✅ User ${userData.email} already exists`);
        continue;
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

      // Create user
      const user = new User({
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        password: hashedPassword,
        role: userData.role,
        isEmailVerified: true,
        isActive: true,
        profile: {
          company: 'AdAnalytics Pro',
          position: `${userData.role.charAt(0).toUpperCase() + userData.role.slice(1)}`,
          timezone: 'UTC'
        }
      });

      await user.save();
      console.log(`✅ Created user: ${userData.email} (${userData.password})`);
    }

    console.log('\n🎉 All users created successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('👤 Admin:    admin@adanalytics.com    / AdAnalytics2024!Admin');
    console.log('👤 Manager:  manager@adanalytics.com  / AdAnalytics2024!Manager');
    console.log('👤 Analyst:  analyst@adanalytics.com  / AdAnalytics2024!Analyst');
    console.log('👤 Viewer:   viewer@adanalytics.com   / AdAnalytics2024!Viewer');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  } catch (error) {
    console.error('❌ Error creating users:', error);
  }
};

// Main function
const main = async () => {
  try {
    console.log('🚀 Starting user creation...');
    await connectDB();
    await createUsers();
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

main();
