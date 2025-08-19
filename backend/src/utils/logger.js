const winston = require('winston');

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

// Tell winston that you want to link the colors
winston.addColors(colors);

// Define which level to log based on environment
const level = () => {
  const env = process.env.NODE_ENV || 'development';
  const isDevelopment = env === 'development';
  return isDevelopment ? 'debug' : 'warn';
};

// Define format for logs
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`,
  ),
);

// Define format for file logs (without colors)
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Define transports
const transports = [
  // Console transport
  new winston.transports.Console({
    format,
  }),
  
  // File transport for errors
  new winston.transports.File({
    filename: 'logs/error.log',
    level: 'error',
    format: fileFormat,
  }),
  
  // File transport for all logs
  new winston.transports.File({
    filename: 'logs/all.log',
    format: fileFormat,
  }),
];

// Add HTTP transport for structured logging (optional)
if (process.env.LOG_HTTP_ENDPOINT) {
  const httpTransport = new winston.transports.Http({
    host: process.env.LOG_HTTP_HOST || 'localhost',
    port: process.env.LOG_HTTP_PORT || 3000,
    path: process.env.LOG_HTTP_ENDPOINT || '/logs',
    ssl: process.env.LOG_HTTP_SSL === 'true'
  });
  
  transports.push(httpTransport);
}

// Create the logger
const logger = winston.createLogger({
  level: level(),
  levels,
  format: fileFormat,
  transports,
  exitOnError: false,
});

// Create a stream object for Morgan HTTP logging
logger.stream = {
  write: (message) => {
    logger.http(message.trim());
  },
};

// Add request logging middleware
logger.logRequest = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      responseTime: duration,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userId: req.user?.id,
      requestId: req.headers['x-request-id'],
      environment: process.env.NODE_ENV
    };

    if (res.statusCode >= 400) {
      logger.warn('HTTP Request', logData);
    } else {
      logger.info('HTTP Request', logData);
    }
  });

  next();
};

// Add error logging helper
logger.logError = (error, req = null) => {
  const errorData = {
    message: error.message,
    stack: error.stack,
    code: error.code,
    name: error.name,
    environment: process.env.NODE_ENV
  };

  if (req) {
    errorData.request = {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userId: req.user?.id,
      requestId: req.headers['x-request-id']
    };
  }

  logger.error('Application Error', errorData);
};

// Add performance logging helper
logger.logPerformance = (operation, duration, metadata = {}) => {
  logger.info('Performance', {
    operation,
    duration,
    ...metadata,
    environment: process.env.NODE_ENV
  });
};

// Add business event logging helper
logger.logBusinessEvent = (event, data = {}) => {
  logger.info('Business Event', {
    event,
    ...data,
    environment: process.env.NODE_ENV
  });
};

module.exports = logger;
