const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { authMiddleware, logout } = require('../middleware/auth');
const { asyncHandler, validationError, businessError } = require('../middleware/errorHandler');
const { cache } = require('../config/redis');
const logger = require('../utils/logger');
const { sendEmail } = require('../config/email');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Validation rules
const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
];

const signupValidation = [
  body('firstName').trim().isLength({ min: 2, max: 50 }).withMessage('First name must be between 2 and 50 characters'),
  body('lastName').trim().isLength({ min: 2, max: 50 }).withMessage('Last name must be between 2 and 50 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
  body('role').optional().isIn(['admin', 'manager', 'analyst', 'viewer']).withMessage('Invalid role')
];

const passwordResetValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email')
];

const newPasswordValidation = [
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Password confirmation does not match password');
    }
    return true;
  })
];

// @route   POST /api/v1/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', signupValidation, asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw validationError(errors.array());
  }

  const { firstName, lastName, email, password, role } = req.body;

  // Check if user already exists
  const existingUser = await User.findByEmail(email);
  if (existingUser) {
    throw businessError('User with this email already exists');
  }

  // Create user
  const user = new User({
    firstName,
    lastName,
    email,
    password,
    role: role || 'viewer'
  });

  await user.save();

  // Generate email verification token
  const verificationToken = user.generateEmailVerificationToken();
  await user.save();

  // Send verification email
  try {
    const verificationUrl = `${process.env.CORS_ORIGIN}/auth/verify-email?token=${verificationToken}`;
    
    await sendEmail(user.email, 'verification', {
      url: verificationUrl,
      firstName: user.firstName
    });
  } catch (error) {
    logger.error('Email sending failed:', error);
    // Don't fail registration if email fails
  }

  // Generate tokens
  const token = user.generateAuthToken();
  const refreshToken = user.generateRefreshToken();

  logger.logBusinessEvent('user_registered', {
    userId: user._id,
    email: user.email,
    role: user.role
  });

  res.status(201).json({
    success: true,
    message: 'User registered successfully. Please check your email to verify your account.',
    data: {
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified
      },
      token,
      refreshToken
    }
  });
}));

// @route   POST /api/v1/auth/login
// @desc    Login user
// @access  Public
router.post('/login', loginValidation, asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw validationError(errors.array());
  }

  const { email, password } = req.body;

  // Find user by email
  const user = await User.findByEmail(email).select('+password');
  if (!user) {
    throw businessError('Invalid credentials');
  }

  // Check if account is locked
  if (user.isLocked) {
    throw businessError('Account is temporarily locked. Please try again later.');
  }

  // Check if account is active
  if (!user.isActive) {
    throw businessError('Account is deactivated. Please contact support.');
  }

  // Check password
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    // Increment login attempts
    await user.incLoginAttempts();
    throw businessError('Invalid credentials');
  }

  // Reset login attempts on successful login
  await user.resetLoginAttempts();

  // Generate tokens
  const token = user.generateAuthToken();
  const refreshToken = user.generateRefreshToken();

  logger.logBusinessEvent('user_login', {
    userId: user._id,
    email: user.email,
    ip: req.ip
  });

  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        profile: user.profile
      },
      token,
      refreshToken
    }
  });
}));

// @route   POST /api/v1/auth/refresh
// @desc    Refresh access token
// @access  Public
router.post('/refresh', asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw businessError('Refresh token is required');
  }

  try {
    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    
    // Find user
    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) {
      throw businessError('Invalid refresh token');
    }

    // Generate new tokens
    const newToken = user.generateAuthToken();
    const newRefreshToken = user.generateRefreshToken();

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        token: newToken,
        refreshToken: newRefreshToken
      }
    });
  } catch (error) {
    throw businessError('Invalid refresh token');
  }
}));

// @route   POST /api/v1/auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', authMiddleware, logout, asyncHandler(async (req, res) => {
  logger.logBusinessEvent('user_logout', {
    userId: req.user._id,
    email: req.user.email
  });

  res.json({
    success: true,
    message: 'Logged out successfully'
  });
}));

// @route   POST /api/v1/auth/forgot-password
// @desc    Send password reset email
// @access  Public
router.post('/forgot-password', passwordResetValidation, asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw validationError(errors.array());
  }

  const { email } = req.body;

  const user = await User.findByEmail(email);
  if (!user) {
    // Don't reveal if user exists or not
    return res.json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.'
    });
  }

  // Generate password reset token
  const resetToken = user.generatePasswordResetToken();
  await user.save();

  // Send reset email
  try {
    const resetUrl = `${process.env.CORS_ORIGIN}/auth/reset-password?token=${resetToken}`;
    
    await sendEmail(user.email, 'passwordReset', {
      url: resetUrl,
      firstName: user.firstName
    });
  } catch (error) {
    logger.error('Password reset email sending failed:', error);
    throw businessError('Failed to send password reset email');
  }

  logger.logBusinessEvent('password_reset_requested', {
    userId: user._id,
    email: user.email
  });

  res.json({
    success: true,
    message: 'If an account with that email exists, a password reset link has been sent.'
  });
}));

// @route   POST /api/v1/auth/reset-password
// @desc    Reset password with token
// @access  Public
router.post('/reset-password', newPasswordValidation, asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw validationError(errors.array());
  }

  const { token, password } = req.body;

  if (!token) {
    throw businessError('Reset token is required');
  }

  // Find user with valid reset token
  const user = await User.findOne({
    passwordResetToken: token,
    passwordResetExpires: { $gt: Date.now() }
  });

  if (!user) {
    throw businessError('Invalid or expired reset token');
  }

  // Update password
  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // Invalidate all existing sessions
  await cache.del(`auth:*`);

  logger.logBusinessEvent('password_reset_completed', {
    userId: user._id,
    email: user.email
  });

  res.json({
    success: true,
    message: 'Password reset successfully'
  });
}));

// @route   POST /api/v1/auth/verify-email
// @desc    Verify email with token
// @access  Public
router.post('/verify-email', asyncHandler(async (req, res) => {
  const { token } = req.body;

  if (!token) {
    throw businessError('Verification token is required');
  }

  // Find user with valid verification token
  const user = await User.findOne({
    emailVerificationToken: token,
    emailVerificationExpires: { $gt: Date.now() }
  });

  if (!user) {
    throw businessError('Invalid or expired verification token');
  }

  // Verify email
  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save();

  logger.logBusinessEvent('email_verified', {
    userId: user._id,
    email: user.email
  });

  res.json({
    success: true,
    message: 'Email verified successfully'
  });
}));

// @route   POST /api/v1/auth/resend-verification
// @desc    Resend email verification
// @access  Private
router.post('/resend-verification', authMiddleware, asyncHandler(async (req, res) => {
  const user = req.user;

  if (user.isEmailVerified) {
    throw businessError('Email is already verified');
  }

  // Generate new verification token
  const verificationToken = user.generateEmailVerificationToken();
  await user.save();

  // Send verification email
  try {
    const verificationUrl = `${process.env.CORS_ORIGIN}/auth/verify-email?token=${verificationToken}`;
    
    await sendEmail(user.email, 'verification', {
      url: verificationUrl,
      firstName: user.firstName
    });
  } catch (error) {
    logger.error('Email sending failed:', error);
    throw businessError('Failed to send verification email');
  }

  res.json({
    success: true,
    message: 'Verification email sent successfully'
  });
}));

// @route   GET /api/v1/auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me', authMiddleware, asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: {
      user: {
        id: req.user._id,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        email: req.user.email,
        role: req.user.role,
        isEmailVerified: req.user.isEmailVerified,
        profile: req.user.profile,
        permissions: req.user.permissions,
        lastLogin: req.user.lastLogin
      }
    }
  });
}));

// @route   PUT /api/v1/auth/me
// @desc    Update current user profile
// @access  Private
router.put('/me', authMiddleware, asyncHandler(async (req, res) => {
  const { firstName, lastName, profile } = req.body;

  const user = await User.findById(req.user._id);
  
  if (firstName) user.firstName = firstName;
  if (lastName) user.lastName = lastName;
  if (profile) user.profile = { ...user.profile, ...profile };

  await user.save();

  // Update cache
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (token) {
    await cache.set(`auth:${token}`, user, 300);
  }

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: {
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        profile: user.profile
      }
    }
  });
}));

// @route   POST /api/v1/auth/change-password
// @desc    Change password
// @access  Private
router.post('/change-password', authMiddleware, asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    throw businessError('Current password and new password are required');
  }

  const user = await User.findById(req.user._id).select('+password');
  
  // Verify current password
  const isCurrentPasswordValid = await user.comparePassword(currentPassword);
  if (!isCurrentPasswordValid) {
    throw businessError('Current password is incorrect');
  }

  // Update password
  user.password = newPassword;
  await user.save();

  // Invalidate all sessions for this user
  await cache.del(`auth:*`);

  logger.logBusinessEvent('password_changed', {
    userId: user._id,
    email: user.email
  });

  res.json({
    success: true,
    message: 'Password changed successfully'
  });
}));

module.exports = router;
