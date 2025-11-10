// @CODE:UI-UX-DEPLOY-005:MONITORING - Todo Backend Main Server with Monitoring
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import morgan from 'morgan';

// Load environment variables FIRST
dotenv.config();

// Import monitoring components AFTER dotenv config
import logger from './src/utils/logger.js';
import performanceMonitor, { getMetrics, resetMetrics } from './src/middleware/performance.js';
import {
  healthCheck,
  readinessCheck,
  livenessCheck,
  detailedHealthCheck,
  healthCheckLogger
} from './src/middleware/health.js';

// Import API routes AFTER dotenv config
import todoRoutes from './src/routes/todo-routes.js';
// import workingTodoRoutes from './src/routes/working-todos.js'; // Legacy backup route

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware - Order matters!
app.use(helmet()); // Security headers first

// Request logging with Morgan and our logger
app.use(morgan('combined', { stream: logger.stream }));

// Performance monitoring middleware
app.use(performanceMonitor);

// Health check logging middleware
app.use(healthCheckLogger);

// CORS configuration
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'http://localhost:5176',
    'http://localhost:3000',
    'http://localhost:8080'
  ],
  credentials: true
}));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enhanced monitoring endpoints
app.get('/health', healthCheck);
app.get('/ready', readinessCheck);
app.get('/live', livenessCheck);
app.get('/health/detailed', detailedHealthCheck);

// Performance metrics endpoint
app.get('/metrics', (req, res) => {
  try {
    const metrics = getMetrics();
    res.status(200).json(metrics);
  } catch (error) {
    logger.error('Failed to get metrics', {
      error: error.message,
      category: 'monitoring'
    });
    res.status(500).json({
      error: 'Failed to retrieve metrics',
      message: error.message
    });
  }
});

// Reset metrics endpoint (for testing/debugging)
app.post('/metrics/reset', (req, res) => {
  try {
    resetMetrics();
    logger.info('Metrics reset via API', { category: 'monitoring' });
    res.status(200).json({
      message: 'Metrics reset successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Failed to reset metrics', {
      error: error.message,
      category: 'monitoring'
    });
    res.status(500).json({
      error: 'Failed to reset metrics',
      message: error.message
    });
  }
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to To-Do List API',
    version: '1.0.0',
    endpoints: {
      health: 'GET /api/todos/health',
      create: 'POST /api/todos',
      list: 'GET /api/todos',
      get: 'GET /api/todos/:id',
      update: 'PUT /api/todos/:id',
      delete: 'DELETE /api/todos/:id',
      status: 'PATCH /api/todos/:id/status',
      history: 'GET /api/todos/:id/history',
      search: 'GET /api/todos/search/:query',
      stats: 'GET /api/todos/stats/overview'
    }
  });
});

// API Routes
app.use('/api/todos', todoRoutes);
// app.use('/api/todos', workingTodoRoutes); // Legacy backup route

// Enhanced error handling middleware with logging
app.use((err, req, res, next) => {
  // Log the error with our structured logger
  logger.enhancedError('Unhandled error in request', err, {
    requestId: req.requestId,
    method: req.method,
    url: req.url,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
    category: 'error'
  });

  res.status(err.status || 500).json({
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
    requestId: req.requestId,
    timestamp: new Date().toISOString()
  });
});

// 404 handler with logging
app.use((req, res) => {
  logger.warn('Route not found', {
    requestId: req.requestId,
    method: req.method,
    url: req.url,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
    category: 'http'
  });

  res.status(404).json({
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.url}`,
    requestId: req.requestId,
    timestamp: new Date().toISOString()
  });
});

// Graceful shutdown handling
const gracefulShutdown = (signal) => {
  logger.info(`Received ${signal}, starting graceful shutdown`, {
    category: 'system'
  });

  // TODO: Add database connection cleanup here
  // await db.close();

  logger.info('Graceful shutdown completed', {
    category: 'system'
  });
  process.exit(0);
};

// Start server with enhanced logging
const server = app.listen(PORT, () => {
  logger.info('Server started successfully', {
    port: PORT,
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0',
    nodeVersion: process.version,
    platform: process.platform,
    category: 'system'
  });

  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`📊 Metrics: http://localhost:${PORT}/metrics`);
  console.log(`🔍 Detailed health: http://localhost:${PORT}/health/detailed`);
});

// Handle graceful shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.enhancedError('Uncaught Exception', error, {
    category: 'system'
  });
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Promise Rejection', {
    reason: reason.toString(),
    promise: promise.toString(),
    category: 'system'
  });
  process.exit(1);
});

export default app;
