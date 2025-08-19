const { sendEmail } = require('./src/config/email');
const logger = require('./src/utils/logger');

const testEmail = async () => {
  console.log('📧 Testing Email Configuration...');
  console.log('===================================');
  
  try {
    // Test email to a dummy address
    const testEmail = 'test@example.com';
    
    console.log('📋 Sending test verification email...');
    
    const result = await sendEmail(testEmail, 'verification', {
      url: 'http://localhost:3000/auth/verify-email?token=test-token',
      firstName: 'Test User'
    });
    
    console.log('✅ Email test completed successfully!');
    console.log('📧 Email details:', {
      to: testEmail,
      messageId: result.messageId,
      response: result.response
    });
    
    console.log('\n📋 Email Configuration Status:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    if (process.env.EMAIL_HOST === 'smtp.gmail.com' && process.env.EMAIL_USER) {
      console.log('✅ Gmail SMTP configured');
      console.log('   Host:', process.env.EMAIL_HOST);
      console.log('   User:', process.env.EMAIL_USER);
      console.log('   ⚠️  Make sure to use App Password, not regular password');
    } else if (process.env.EMAIL_HOST === 'smtp.mailtrap.io') {
      console.log('✅ Mailtrap configured (for development)');
      console.log('   Host:', process.env.EMAIL_HOST);
      console.log('   User:', process.env.EMAIL_USER);
    } else if (process.env.SENDGRID_API_KEY) {
      console.log('✅ SendGrid configured');
      console.log('   API Key: [HIDDEN]');
    } else {
      console.log('⚠️  No email service configured');
      console.log('   Emails will be logged instead of sent');
    }
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    console.log('\n💡 To configure real email sending:');
    console.log('1. Gmail: Set EMAIL_USER and EMAIL_PASS (use App Password)');
    console.log('2. Mailtrap: Set EMAIL_HOST=smtp.mailtrap.io and credentials');
    console.log('3. SendGrid: Set SENDGRID_API_KEY');
    console.log('4. Update your .env file with the chosen configuration');
    
  } catch (error) {
    console.error('❌ Email test failed:', error.message);
    console.log('\n💡 Troubleshooting:');
    console.log('- Check your .env file email configuration');
    console.log('- For Gmail, use App Password instead of regular password');
    console.log('- For development, consider using Mailtrap');
  }
};

testEmail();
