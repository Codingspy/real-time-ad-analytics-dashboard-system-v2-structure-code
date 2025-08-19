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
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Create admin user
const createAdminUser = async () => {
  try {
    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: 'admin@adanalytics.com' });
    
    if (existingAdmin) {
      console.log('Admin user already exists');
      return;
    }

    // Hash password
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    const hashedPassword = await bcrypt.hash('admin123', saltRounds);

    // Create admin user
    const adminUser = new User({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@adanalytics.com',
      password: hashedPassword,
      role: 'admin',
      isEmailVerified: true,
      isActive: true,
      profile: {
        company: 'AdAnalytics Pro',
        position: 'System Administrator',
        timezone: 'UTC'
      }
    });

    await adminUser.save();
    console.log('Admin user created successfully!');
    console.log('Email: admin@adanalytics.com');
    console.log('Password: admin123');

  } catch (error) {
    console.error('Error creating admin user:', error);
  }
};

// Create other users
const createOtherUsers = async () => {
  try {
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    
    const users = [
      {
        firstName: 'Manager',
        lastName: 'User',
        email: 'manager@adanalytics.com',
        password: 'manager123',
        role: 'manager',
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
        profile: {
          company: 'AdAnalytics Pro',
          position: 'Marketing Assistant',
          timezone: 'America/Los_Angeles'
        }
      }
    ];

    for (const userData of users) {
      const existingUser = await User.findOne({ email: userData.email });
      
      if (!existingUser) {
        const hashedPassword = await bcrypt.hash(userData.password, saltRounds);
        const user = new User({
          ...userData,
          password: hashedPassword,
          isEmailVerified: true,
          isActive: true
        });
        
        await user.save();
        console.log(`User ${userData.email} created successfully!`);
      } else {
        console.log(`User ${userData.email} already exists`);
      }
    }

  } catch (error) {
    console.error('Error creating users:', error);
  }
};

// Main function
const main = async () => {
  try {
    await connectDB();
    await createAdminUser();
    await createOtherUsers();
    console.log('All users created successfully!');
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

main();
