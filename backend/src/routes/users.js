const express = require('express');
const { body, query, validationResult } = require('express-validator');
const User = require('../models/User');
const { asyncHandler, validationError, businessError } = require('../middleware/errorHandler');
const { authorize } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// @route   GET /api/v1/users
// @desc    Get all users with filters
// @access  Private (Admin only)
router.get('/', authorize('admin'), asyncHandler(async (req, res) => {
  const {
    role,
    isActive,
    search,
    page = 1,
    limit = 20,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;

  // Build query
  const query = {};
  
  if (role) query.role = role;
  if (isActive !== undefined) query.isActive = isActive === 'true';
  if (search) {
    query.$or = [
      { firstName: { $regex: search, $options: 'i' } },
      { lastName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }

  // Build sort
  const sort = {};
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

  // Pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);

  // Get users
  const users = await User.find(query)
    .select('-password')
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit));

  // Get total count
  const total = await User.countDocuments(query);

  // Calculate pagination info
  const totalPages = Math.ceil(total / parseInt(limit));
  const hasNextPage = parseInt(page) < totalPages;
  const hasPrevPage = parseInt(page) > 1;

  res.json({
    success: true,
    data: {
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages,
        hasNextPage,
        hasPrevPage
      }
    }
  });
}));

// @route   GET /api/v1/users/:id
// @desc    Get user by ID
// @access  Private (Admin or self)
router.get('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Check permissions
  if (req.user.role !== 'admin' && req.user._id.toString() !== id) {
    throw businessError('Access denied', 403);
  }

  const user = await User.findById(id).select('-password');
  if (!user) {
    throw businessError('User not found', 404);
  }

  res.json({
    success: true,
    data: user
  });
}));

// @route   PUT /api/v1/users/:id
// @desc    Update user
// @access  Private (Admin or self)
router.put('/:id', authorize('admin'), asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  // Check permissions
  if (req.user.role !== 'admin' && req.user._id.toString() !== id) {
    throw businessError('Access denied', 403);
  }

  const user = await User.findById(id);
  if (!user) {
    throw businessError('User not found', 404);
  }

  // Update user
  Object.assign(user, updateData);
  await user.save();

  // Return user without password
  const userResponse = user.toObject();
  delete userResponse.password;

  logger.logBusinessEvent('user_updated', {
    userId: user._id,
    updatedBy: req.user._id,
    changes: Object.keys(updateData)
  });

  res.json({
    success: true,
    message: 'User updated successfully',
    data: userResponse
  });
}));

// @route   DELETE /api/v1/users/:id
// @desc    Delete user
// @access  Private (Admin only)
router.delete('/:id', authorize('admin'), asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await User.findById(id);
  if (!user) {
    throw businessError('User not found', 404);
  }

  // Prevent deleting self
  if (req.user._id.toString() === id) {
    throw businessError('Cannot delete your own account');
  }

  await User.findByIdAndDelete(id);

  logger.logBusinessEvent('user_deleted', {
    userId: user._id,
    deletedBy: req.user._id
  });

  res.json({
    success: true,
    message: 'User deleted successfully'
  });
}));

// @route   PATCH /api/v1/users/:id/status
// @desc    Update user status
// @access  Private (Admin only)
router.patch('/:id/status', authorize('admin'), asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { isActive } = req.body;

  if (typeof isActive !== 'boolean') {
    throw businessError('isActive must be a boolean');
  }

  const user = await User.findById(id);
  if (!user) {
    throw businessError('User not found', 404);
  }

  // Prevent deactivating self
  if (req.user._id.toString() === id && !isActive) {
    throw businessError('Cannot deactivate your own account');
  }

  user.isActive = isActive;
  await user.save();

  logger.logBusinessEvent('user_status_changed', {
    userId: user._id,
    newStatus: isActive,
    changedBy: req.user._id
  });

  res.json({
    success: true,
    message: 'User status updated successfully',
    data: {
      id: user._id,
      isActive: user.isActive
    }
  });
}));

module.exports = router;
