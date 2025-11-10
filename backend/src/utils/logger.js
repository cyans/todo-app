// @CODE:UI-UX-DEPLOY-005:MONITORING
// Structured logging system using Winston

import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Determine log directory
const logDir = path.join(__dirname, '../../logs');

// Custom log format for structured logging
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss.SSS'
  }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const logEntry = {
      timestamp,
      level,
      message,
      ...meta
    };

    // Add environment if available
    if (process.env.NODE_ENV) {
      logEntry.environment = process.env.NODE_ENV;
    }

    // Add service information
    logEntry.service = 'todo-backend';
    logEntry.version = process.env.npm_package_version || '1.0.0';

    return JSON.stringify(logEntry);
  })
);

// Console format for development
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({
    format: 'HH:mm:ss'
  }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const metaStr = Object.keys(meta).length > 0 ? JSON.stringify(meta, null, 2) : '';
    return `${timestamp} [${level}]: ${message} ${metaStr}`;
  })
);

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  format: logFormat,
  defaultMeta: {
    service: 'todo-backend',
    environment: process.env.NODE_ENV || 'development'
  },
  transports: [
    // Error log file with rotation
    new DailyRotateFile({
      filename: path.join(logDir, 'error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxSize: '20m',
      maxFiles: '14d',
      zippedArchive: true,
      format: logFormat
    }),

    // Combined log file with rotation
    new DailyRotateFile({
      filename: path.join(logDir, 'combined-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
      zippedArchive: true,
      format: logFormat
    }),

    // Security-specific log file
    new DailyRotateFile({
      filename: path.join(logDir, 'security-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      level: 'warn',
      maxSize: '20m',
      maxFiles: '30d',
      zippedArchive: true,
      format: logFormat
    })
  ],

  // Handle uncaught exceptions and rejections
  exceptionHandlers: [
    new DailyRotateFile({
      filename: path.join(logDir, 'exceptions-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
      zippedArchive: true,
      format: logFormat
    })
  ],

  rejectionHandlers: [
    new DailyRotateFile({
      filename: path.join(logDir, 'rejections-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
      zippedArchive: true,
      format: logFormat
    })
  ]
});

// Add console transport for non-production environments
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: consoleFormat,
    level: 'debug'
  }));
}

// Custom logging methods for specific use cases

// Performance logging
logger.performance = (operation, duration, metadata = {}) => {
  logger.info('Performance metrics', {
    operation,
    duration,
    ...metadata,
    category: 'performance'
  });
};

// Security event logging
logger.security = (event, metadata = {}) => {
  logger.warn('Security event', {
    event,
    ...metadata,
    category: 'security'
  });
};

// HTTP request logging
logger.request = (req, res, responseTime) => {
  logger.info('HTTP Request', {
    method: req.method,
    url: req.originalUrl || req.url,
    statusCode: res.statusCode,
    responseTime,
    userAgent: req.get('User-Agent'),
    ip: req.ip || req.connection.remoteAddress,
    userId: req.user ? req.user.id : null,
    category: 'http'
  });
};

// Database operation logging
logger.database = (operation, collection, duration, metadata = {}) => {
  logger.info('Database operation', {
    operation,
    collection,
    duration,
    ...metadata,
    category: 'database'
  });
};

// Authentication logging
logger.auth = (event, userId, metadata = {}) => {
  logger.info('Authentication event', {
    event,
    userId,
    ...metadata,
    category: 'authentication'
  });
};

// Business logic logging
logger.business = (event, metadata = {}) => {
  logger.info('Business event', {
    event,
    ...metadata,
    category: 'business'
  });
};

// Error logging with enhanced context
logger.enhancedError = (message, error, context = {}) => {
  logger.error(message, {
    error: {
      message: error.message,
      stack: error.stack,
      code: error.code,
      name: error.name
    },
    ...context,
    category: 'error'
  });
};

// Create a stream for Morgan HTTP request logging
logger.stream = {
  write: (message) => {
    logger.info(message.trim(), {
      category: 'http',
      source: 'morgan'
    });
  }
};

// Add levels property for testing compatibility
logger.levels = winston.config.npm.levels;

// Export the logger
export default logger;

// Also export a factory function for creating loggers with different configurations
export const createLogger = (options = {}) => {
  return winston.createLogger({
    ...logger,
    ...options
  });
};