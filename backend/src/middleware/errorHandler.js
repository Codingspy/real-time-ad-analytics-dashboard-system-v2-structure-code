const logger = require('../utils/logger');

// Error handler middleware
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  logger.logError(err, req);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = { message, statusCode: 404 };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `Duplicate field value: ${field}`;
    error = { message, statusCode: 400 };
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = { message, statusCode: 400 };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = { message, statusCode: 401 };
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = { message, statusCode: 401 };
  }

  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    const message = 'File too large';
    error = { message, statusCode: 400 };
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    const message = 'Unexpected file field';
    error = { message, statusCode: 400 };
  }

  // Rate limit errors
  if (err.status === 429) {
    const message = 'Too many requests';
    error = { message, statusCode: 429 };
  }

  // Default error
  const statusCode = error.statusCode || err.statusCode || 500;
  const message = error.message || err.message || 'Server Error';

  // Don't leak error details in production
  const response = {
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
      details: err
    })
  };

  res.status(statusCode).json(response);
};

// Async error wrapper
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Not found handler
const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

// Validation error handler
const validationError = (errors) => {
  const error = new Error('Validation Error');
  error.statusCode = 400;
  error.details = errors;
  return error;
};

// Business logic error handler
const businessError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.isBusinessError = true;
  return error;
};

// Database error handler
const databaseError = (err) => {
  const error = new Error('Database operation failed');
  error.statusCode = 500;
  error.originalError = err;
  return error;
};

// External API error handler
const externalApiError = (service, err) => {
  const error = new Error(`${service} service error`);
  error.statusCode = 502;
  error.service = service;
  error.originalError = err;
  return error;
};

module.exports = {
  errorHandler,
  asyncHandler,
  notFound,
  validationError,
  businessError,
  databaseError,
  externalApiError
};
