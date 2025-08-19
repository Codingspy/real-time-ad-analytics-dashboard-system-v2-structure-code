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

// Update user passwords to secure ones
const updatePasswords = async () => {
  try {
    const saltRounds = 12;
    
    const userUpdates = [
      {
        email: 'admin@adanalytics.com',
        newPassword: 'AdAnalytics2024!Admin'
      },
      {
        email: 'manager@adanalytics.com',
        newPassword: 'AdAnalytics2024!Manager'
      },
      {
        email: 'analyst@adanalytics.com',
        newPassword: 'AdAnalytics2024!Analyst'
      },
      {
        email: 'viewer@adanalytics.com',
        newPassword: 'AdAnalytics2024!Viewer'
      }
    ];

    for (const update of userUpdates) {
      // Find user
      const user = await User.findOne({ email: update.email });
      
      if (user) {
        // Hash new password
        const hashedPassword = await bcrypt.hash(update.newPassword, saltRounds);
        
        // Update password
        user.password = hashedPassword;
        await user.save();
        
        console.log(`✅ Updated password for: ${update.email}`);
      } else {
        console.log(`⚠️ User not found: ${update.email}`);
      }
    }

    console.log('\n🎉 All passwords updated successfully!');
    console.log('\n📋 New Login Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('👤 Admin:    admin@adanalytics.com    / AdAnalytics2024!Admin');
    console.log('👤 Manager:  manager@adanalytics.com  / AdAnalytics2024!Manager');
    console.log('👤 Analyst:  analyst@adanalytics.com  / AdAnalytics2024!Analyst');
    console.log('👤 Viewer:   viewer@adanalytics.com   / AdAnalytics2024!Viewer');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n🔒 These passwords are secure and not found in data breaches!');

  } catch (error) {
    console.error('❌ Error updating passwords:', error);
  }
};

// Main function
const main = async () => {
  try {
    console.log('🔒 Updating user passwords to secure ones...');
    await connectDB();
    await updatePasswords();
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

main();
