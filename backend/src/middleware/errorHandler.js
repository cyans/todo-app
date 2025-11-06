// @CODE:TODO-CRUD-001:API
/**
 * Error Handling Middleware
 *
 * Provides centralized error handling for the Todo API.
 * Ensures consistent error response format and proper logging.
 *
 * Features:
 * - Centralized error handling
 * - Consistent error response format
 * - Error logging and monitoring
 * - Development vs production error responses
 *
 * @module middleware/errorHandler
 */

/**
 * Custom error classes for different types of errors
 */
export class AppError extends Error {
  constructor(message, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.timestamp = new Date().toISOString();

    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message, details = null) {
    super(message, 400, true);
    this.name = 'ValidationError';
    this.details = details;
  }
}

export class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404, true);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends AppError {
  constructor(message) {
    super(message, 409, true);
    this.name = 'ConflictError';
  }
}

export class DatabaseError extends AppError {
  constructor(message) {
    super(`Database error: ${message}`, 500, true);
    this.name = 'DatabaseError';
  }
}

/**
 * Check if error is operational (expected)
 * @param {Error} error - Error to check
 * @returns {boolean} Whether error is operational
 */
const isOperationalError = (error) => {
  if (error instanceof AppError) {
    return error.isOperational;
  }
  return false;
};

/**
 * Send error response to client
 * @param {Object} res - Express response object
 * @param {Error} error - Error object
 * @param {boolean} isProduction - Whether in production mode
 */
const sendErrorResponse = (res, error, isProduction = false) => {
  let statusCode = 500;
  let message = 'Internal Server Error';
  let details = null;

  // Handle known error types
  if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
    details = error.details || null;
  } else if (error.name === 'ValidationError') {
    statusCode = 400;
    message = error.message;
    details = error.details || null;
  } else if (error.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID format';
  } else if (error.code === 11000) {
    // MongoDB duplicate key error
    statusCode = 409;
    message = 'Duplicate entry';
    details = {
      field: Object.keys(error.keyValue)[0],
      value: Object.values(error.keyValue)[0]
    };
  } else if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  } else if (error.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }

  // Build error response
  const errorResponse = {
    error: getErrorType(statusCode),
    message,
    timestamp: new Date().toISOString()
  };

  // Include stack trace in development
  if (!isProduction && error.stack) {
    errorResponse.stack = error.stack;
  }

  // Include additional details if available
  if (details) {
    errorResponse.details = details;
  }

  // Include request ID if available
  if (res.locals.requestId) {
    errorResponse.requestId = res.locals.requestId;
  }

  res.status(statusCode).json(errorResponse);
};

/**
 * Get error type name from status code
 * @param {number} statusCode - HTTP status code
 * @returns {string} Error type name
 */
const getErrorType = (statusCode) => {
  const errorTypes = {
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not Found',
    405: 'Method Not Allowed',
    409: 'Conflict',
    422: 'Unprocessable Entity',
    429: 'Too Many Requests',
    500: 'Internal Server Error',
    502: 'Bad Gateway',
    503: 'Service Unavailable'
  };

  return errorTypes[statusCode] || 'Error';
};

/**
 * Log error for monitoring and debugging
 * @param {Error} error - Error to log
 * @param {Object} req - Express request object
 */
const logError = (error, req) => {
  const logData = {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString(),
    requestId: req.headers['x-request-id'] || req.id
  };

  if (process.env.NODE_ENV !== 'test') {
    console.error('[API Error]', JSON.stringify(logData, null, 2));
  }

  // In production, you would send this to a logging service
  // Examples: Winston, Loggly, Datadog, etc.
};

/**
 * Main error handling middleware
 * @param {Error} error - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const errorHandler = (error, req, res, next) => {
  // Log the error
  logError(error, req);

  // Determine if we're in production
  const isProduction = process.env.NODE_ENV === 'production';

  // Send error response
  sendErrorResponse(res, error, isProduction);
};

/**
 * 404 Not Found middleware
 * Handles requests to undefined routes
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const notFoundHandler = (req, res, next) => {
  const error = new NotFoundError(`Route ${req.method} ${req.originalUrl}`);
  next(error);
};

/**
 * Async error wrapper
 * Wraps async route handlers to catch errors automatically
 * @param {Function} fn - Async function to wrap
 * @returns {Function} Wrapped function
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Request ID middleware
 * Adds unique request ID for tracing
 */
const requestIdHandler = (req, res, next) => {
  req.id = req.headers['x-request-id'] || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  res.locals.requestId = req.id;
  res.setHeader('X-Request-ID', req.id);
  next();
};

export {
  errorHandler,
  notFoundHandler,
  asyncHandler,
  requestIdHandler,
  isOperationalError,
  sendErrorResponse
};