// @CODE:TODO-CRUD-001:API
/**
 * Express Application Setup
 *
 * Main application configuration with middleware, routes, and error handling.
 * Provides the foundation for the Todo API.
 *
 * Features:
 * - Middleware configuration
 * - Route registration
 * - Error handling
 * - Security headers
 * - Request logging
 *
 * @module app
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { connectDB } from './config/database.js';
import {
  errorHandler,
  notFoundHandler,
  requestIdHandler
} from './middleware/errorHandler.js';
import todoRouter from './routes/todos.js';

/**
 * Create and configure Express application
 * @returns {Object} Configured Express app
 */
const createApp = () => {
  const app = express();

  // Security middleware
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
  }));

  // CORS configuration
  app.use(cors({
    origin: process.env.CORS_ORIGIN || ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5176', 'http://localhost:5177'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID']
  }));

  // Request parsing middleware
  app.use(express.json({
    limit: '10mb',
    strict: true
  }));
  app.use(express.urlencoded({
    extended: true,
    limit: '10mb'
  }));

  // JSON parsing error handler
  app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
      return res.status(400).json({
        error: 'Invalid JSON',
        message: 'Request body contains invalid JSON',
        timestamp: new Date().toISOString(),
        requestId: req.id
      });
    }
    next(err);
  });

  // Request ID and logging middleware
  app.use(requestIdHandler);

  // Request logging middleware (skip in test mode)
  if (process.env.NODE_ENV !== 'test') {
    app.use((req, res, next) => {
      const start = Date.now();

      res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms - ${req.ip}`);
      });

      next();
    });
  }

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      requestId: req.id,
      version: process.env.npm_package_version || '1.0.0'
    });
  });

  // API routes
  app.use('/api/todos', todoRouter);

  // API documentation endpoint
  app.get('/api', (req, res) => {
    res.json({
      name: 'Todo API',
      version: '1.0.0',
      description: 'RESTful API for Todo CRUD operations',
      endpoints: {
        todos: {
          'GET /api/todos': 'Get all todos with optional filtering',
          'POST /api/todos': 'Create a new todo',
          'GET /api/todos/stats': 'Get todo statistics',
          'GET /api/todos/search': 'Search todos',
          'GET /api/todos/:id': 'Get specific todo',
          'PUT /api/todos/:id': 'Update specific todo',
          'DELETE /api/todos/:id': 'Delete specific todo',
          'PATCH /api/todos/:id/toggle': 'Toggle todo completion'
        }
      },
      documentation: '/api/docs'
    });
  });

  // 404 handler for undefined routes
  app.use(notFoundHandler);

  // Global error handler (must be last)
  app.use(errorHandler);

  return app;
};

export default createApp;