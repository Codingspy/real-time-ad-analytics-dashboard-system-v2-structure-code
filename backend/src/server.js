const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const { createServer } = require('http');
const { Server } = require('socket.io');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/auth');
const campaignRoutes = require('./routes/campaigns');
const analyticsRoutes = require('./routes/analytics');
const eventsRoutes = require('./routes/events');
const reportsRoutes = require('./routes/reports');
const usersRoutes = require('./routes/users');
const settingsRoutes = require('./routes/settings');

// Import middleware
const { errorHandler } = require('./middleware/errorHandler');
const { authMiddleware } = require('./middleware/auth');

// Import database connection
const { connectDB } = require('./config/database');

// Import Elasticsearch client
const { elasticsearchClient, initializeElasticsearch } = require('./config/elasticsearch');

// Import Redis client
const { redisClient } = require('./config/redis');

// Import logger
const logger = require('./utils/logger');

const app = express();
const server = createServer(app);

// Socket.IO setup for real-time updates
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  }
});

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:3000",
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));
app.use(limiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});

// API Routes
const apiVersion = process.env.API_VERSION || 'v1';
app.use(`/api/${apiVersion}/auth`, authRoutes);
app.use(`/api/${apiVersion}/campaigns`, authMiddleware, campaignRoutes);
app.use(`/api/${apiVersion}/analytics`, authMiddleware, analyticsRoutes);
app.use(`/api/${apiVersion}/events`, eventsRoutes); // Public endpoint for event tracking
app.use(`/api/${apiVersion}/reports`, authMiddleware, reportsRoutes);
app.use(`/api/${apiVersion}/users`, authMiddleware, usersRoutes);
app.use(`/api/${apiVersion}/settings`, authMiddleware, settingsRoutes);

// Socket.IO connection handling
io.on('connection', (socket) => {
  logger.info(`Client connected: ${socket.id}`);

  // Join user to their specific room for real-time updates
  socket.on('join-user', (userId) => {
    socket.join(`user-${userId}`);
    logger.info(`User ${userId} joined their room`);
  });

  // Join campaign room for real-time campaign updates
  socket.on('join-campaign', (campaignId) => {
    socket.join(`campaign-${campaignId}`);
    logger.info(`Client joined campaign room: ${campaignId}`);
  });

  socket.on('disconnect', () => {
    logger.info(`Client disconnected: ${socket.id}`);
  });
});

// Make io available to routes
app.set('io', io);

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl
  });
});

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    logger.info('Connected to MongoDB');

    // Connect to Redis
    await redisClient.connect();
    logger.info('Connected to Redis');

    // Test Elasticsearch connection and initialize
    try {
      const esInfo = await elasticsearchClient.info();
      if (esInfo && esInfo.body && esInfo.body.version) {
        logger.info('Connected to Elasticsearch', { version: esInfo.body.version.number });
        
        // Initialize Elasticsearch index
        await initializeElasticsearch();
        logger.info('Elasticsearch index initialized successfully');
      } else {
        logger.info('Connected to Elasticsearch (version info not available)');
        await initializeElasticsearch();
        logger.info('Elasticsearch index initialized successfully');
      }
    } catch (esError) {
      logger.warn('Elasticsearch connection failed, continuing without it:', esError.message);
      logger.info('Server will run without Elasticsearch functionality');
    }

    // Start server
    server.listen(PORT, () => {
      logger.info(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
      logger.info(`API available at http://localhost:${PORT}/api/${apiVersion}`);
      logger.info(`Health check at http://localhost:${PORT}/health`);
    });

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Promise Rejection:', err);
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  server.close(() => {
    process.exit(1);
  });
});

startServer();

module.exports = { app, server, io };
