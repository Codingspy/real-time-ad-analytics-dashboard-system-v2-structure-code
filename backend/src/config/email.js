const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

// Email configuration with multiple options
const createTransporter = () => {
  // Option 1: Gmail SMTP (requires app password)
  if (process.env.EMAIL_HOST === 'smtp.gmail.com' && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT || 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  // Option 2: Ethereal Email (for development/testing)
  if (process.env.NODE_ENV === 'development' && !process.env.EMAIL_USER) {
    logger.info('Using Ethereal Email for development');
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: 'ethereal-test@ethereal.email',
        pass: 'ethereal-test-password'
      }
    });
  }

  // Option 3: Mailtrap (for development/testing)
  if (process.env.EMAIL_HOST === 'smtp.mailtrap.io') {
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT || 2525,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  // Option 4: SendGrid
  if (process.env.SENDGRID_API_KEY) {
    return nodemailer.createTransport({
      host: 'smtp.sendgrid.net',
      port: 587,
      secure: false,
      auth: {
        user: 'apikey',
        pass: process.env.SENDGRID_API_KEY
      }
    });
  }

  // Fallback: Log emails instead of sending (for development)
  logger.warn('No email configuration found. Emails will be logged instead of sent.');
  return {
    sendMail: async (mailOptions) => {
      logger.info('📧 Email would be sent:', {
        to: mailOptions.to,
        subject: mailOptions.subject,
        html: mailOptions.html?.substring(0, 100) + '...'
      });
      
      // Return a mock success response
      return {
        messageId: 'mock-message-id',
        response: 'Email logged (not sent)'
      };
    }
  };
};

const transporter = createTransporter();

// Email templates
const emailTemplates = {
  verification: (verificationUrl, firstName) => ({
    subject: 'Verify your email address - AdAnalytics Pro',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Welcome to AdAnalytics Pro!</h2>
        <p>Hi ${firstName},</p>
        <p>Thank you for signing up! Please click the button below to verify your email address:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" 
             style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Verify Email Address
          </a>
        </div>
        <p>Or copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #6b7280;">${verificationUrl}</p>
        <p>This link will expire in 24 hours.</p>
        <p>If you didn't create an account, you can safely ignore this email.</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 14px;">
          This is an automated email from AdAnalytics Pro. Please do not reply to this email.
        </p>
      </div>
    `
  }),

  passwordReset: (resetUrl, firstName) => ({
    subject: 'Reset your password - AdAnalytics Pro',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">Reset Your Password</h2>
        <p>Hi ${firstName},</p>
        <p>We received a request to reset your password. Click the button below to create a new password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" 
             style="background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p>Or copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #6b7280;">${resetUrl}</p>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request a password reset, you can safely ignore this email.</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 14px;">
          This is an automated email from AdAnalytics Pro. Please do not reply to this email.
        </p>
      </div>
    `
  }),

  welcome: (firstName) => ({
    subject: 'Welcome to AdAnalytics Pro!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #059669;">Welcome to AdAnalytics Pro!</h2>
        <p>Hi ${firstName},</p>
        <p>Your email has been verified successfully! You can now access all features of AdAnalytics Pro.</p>
        <p>Here's what you can do:</p>
        <ul>
          <li>Create and manage advertising campaigns</li>
          <li>Track real-time analytics and performance</li>
          <li>Generate detailed reports</li>
          <li>Monitor conversions and ROI</li>
        </ul>
        <p>If you have any questions, feel free to contact our support team.</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 14px;">
          This is an automated email from AdAnalytics Pro. Please do not reply to this email.
        </p>
      </div>
    `
  })
};

// Send email function
const sendEmail = async (to, template, data = {}) => {
  try {
    const emailTemplate = emailTemplates[template];
    if (!emailTemplate) {
      throw new Error(`Email template '${template}' not found`);
    }

    const { subject, html } = emailTemplate(data.url, data.firstName);
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'AdAnalytics <noreply@adanalytics.com>',
      to,
      subject,
      html
    };

    const result = await transporter.sendMail(mailOptions);
    logger.info('Email sent successfully', { to, subject, messageId: result.messageId });
    return result;
  } catch (error) {
    logger.error('Email sending failed:', error);
    throw error;
  }
};

module.exports = {
  transporter,
  sendEmail,
  emailTemplates
};
