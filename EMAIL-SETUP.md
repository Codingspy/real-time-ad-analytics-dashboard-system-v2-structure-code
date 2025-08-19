# 📧 Email Setup Guide

This guide will help you configure email functionality for the AdAnalytics Pro application.

## 🚀 Quick Start (Development)

For development, you can use the **fallback mode** which logs emails instead of sending them:

```bash
# No configuration needed - emails will be logged to console
npm run dev
```

## 📧 Email Service Options

### Option 1: Gmail SMTP (Recommended for Production)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate an App Password**:
   - Go to Google Account Settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
3. **Update your `.env` file**:

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-digit-app-password
EMAIL_FROM=AdAnalytics <noreply@adanalytics.com>
```

### Option 2: Mailtrap (Recommended for Development)

1. **Sign up** at [mailtrap.io](https://mailtrap.io) (free)
2. **Create an inbox** and get SMTP credentials
3. **Update your `.env` file**:

```env
EMAIL_HOST=smtp.mailtrap.io
EMAIL_PORT=2525
EMAIL_USER=your-mailtrap-user
EMAIL_PASS=your-mailtrap-password
EMAIL_FROM=AdAnalytics <noreply@adanalytics.com>
```

### Option 3: SendGrid

1. **Sign up** at [sendgrid.com](https://sendgrid.com)
2. **Create an API key**
3. **Update your `.env` file**:

```env
SENDGRID_API_KEY=your-sendgrid-api-key
EMAIL_FROM=AdAnalytics <noreply@adanalytics.com>
```

## 🧪 Testing Email Configuration

Run the email test script to verify your configuration:

```bash
cd backend
node test-email.js
```

This will:
- Test your email configuration
- Show current email service status
- Provide troubleshooting tips

## 🔧 Email Templates

The application includes these email templates:

1. **Verification Email** - Sent when users register
2. **Password Reset Email** - Sent when users request password reset
3. **Welcome Email** - Sent after email verification

## 🐛 Troubleshooting

### Common Issues:

1. **"Email sending failed"**
   - Check your `.env` file configuration
   - Verify email credentials
   - For Gmail, ensure you're using App Password, not regular password

2. **"Authentication failed"**
   - Gmail: Use App Password, enable "Less secure app access" is deprecated
   - Mailtrap: Check credentials in your Mailtrap inbox
   - SendGrid: Verify API key permissions

3. **"Connection timeout"**
   - Check firewall settings
   - Verify port numbers (587 for Gmail, 2525 for Mailtrap)
   - Try different email service

### Development Mode:

If you don't want to configure email services for development:

```bash
# Emails will be logged to console instead of sent
# Check backend logs for email content
```

## 📋 Email Features

- ✅ Email verification for new registrations
- ✅ Password reset functionality
- ✅ Welcome emails
- ✅ Professional HTML templates
- ✅ Multiple email service support
- ✅ Fallback logging for development

## 🔒 Security Notes

- Never commit email credentials to version control
- Use environment variables for all email configuration
- For production, use dedicated email services (SendGrid, AWS SES, etc.)
- Gmail App Passwords are more secure than regular passwords

## 📞 Support

If you need help with email configuration:

1. Run `node test-email.js` to diagnose issues
2. Check the backend logs for error messages
3. Verify your email service credentials
4. Test with a simple email service like Mailtrap first
