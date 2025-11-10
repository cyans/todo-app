// @CODE:UI-UX-DEPLOY-005:MONITORING
// Health check middleware for monitoring system status

import logger from '../utils/logger.js';
import os from 'os';

let databaseStatus = 'unknown';
let lastDatabaseCheck = null;

// Database health check function
async function checkDatabaseHealth() {
  try {
    // This would be implemented with your actual database connection
    // For MongoDB, you would check the connection status
    const now = Date.now();

    // Cache database status for 30 seconds to avoid excessive checks
    if (lastDatabaseCheck && (now - lastDatabaseCheck) < 30000) {
      return databaseStatus;
    }

    // Simulate database check - replace with actual database ping
    // const db = getDatabaseConnection();
    // await db.admin().ping();

    // For now, simulate successful connection
    databaseStatus = 'connected';
    lastDatabaseCheck = now;

    logger.info('Database health check passed', { category: 'health' });
    return databaseStatus;
  } catch (error) {
    databaseStatus = 'disconnected';
    lastDatabaseCheck = Date.now();

    logger.error('Database health check failed', {
      error: error.message,
      category: 'health'
    });
    return databaseStatus;
  }
}

// Get system information
function getSystemInfo() {
  return {
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    nodeVersion: process.version,
    platform: os.platform(),
    arch: os.arch(),
    totalMemory: os.totalmem(),
    freeMemory: os.freemem(),
    loadAverage: os.loadavg(),
    cpuCount: os.cpus().length,
    pid: process.pid
  };
}

// Main health check middleware
export const healthCheck = async (req, res) => {
  try {
    const startTime = Date.now();

    // Check database health
    const dbStatus = await checkDatabaseHealth();

    // Get system information
    const systemInfo = getSystemInfo();

    // Calculate response time
    const responseTime = Date.now() - startTime;

    // Determine overall health status
    const isHealthy = dbStatus === 'connected';
    const statusCode = isHealthy ? 200 : 503;

    // Create health response
    const healthResponse = {
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      responseTime: `${responseTime}ms`,
      uptime: systemInfo.uptime,
      version: systemInfo.version,
      environment: systemInfo.environment,
      checks: {
        database: {
          status: dbStatus,
          lastCheck: new Date(lastDatabaseCheck).toISOString()
        },
        system: {
          status: 'operational',
          memory: {
            total: Math.round(systemInfo.totalMemory / 1024 / 1024) + 'MB',
            free: Math.round(systemInfo.freeMemory / 1024 / 1024) + 'MB',
            used: Math.round((systemInfo.totalMemory - systemInfo.freeMemory) / 1024 / 1024) + 'MB'
          },
          cpu: {
            count: systemInfo.cpuCount,
            loadAverage: systemInfo.loadAverage
          }
        },
        api: {
          status: 'operational',
          responseTime: `${responseTime}ms`
        }
      }
    };

    // Log health check
    logger.info('Health check completed', {
      status: healthResponse.status,
      responseTime,
      databaseStatus: dbStatus,
      category: 'health'
    });

    // Set appropriate headers
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'Content-Type': 'application/json'
    });

    // Send response
    res.status(statusCode).json(healthResponse);

  } catch (error) {
    logger.error('Health check failed', {
      error: error.message,
      stack: error.stack,
      category: 'health'
    });

    // Send error response
    res.status(500).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: 'Health check failed',
      message: error.message
    });
  }
};

// Simple readiness check (for Kubernetes readiness probes)
export const readinessCheck = async (req, res) => {
  try {
    const dbStatus = await checkDatabaseHealth();
    const isReady = dbStatus === 'connected';

    if (isReady) {
      res.status(200).json({
        status: 'ready',
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(503).json({
        status: 'not ready',
        timestamp: new Date().toISOString(),
        reason: 'Database not connected'
      });
    }
  } catch (error) {
    res.status(503).json({
      status: 'not ready',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
};

// Simple liveness check (for Kubernetes liveness probes)
export const livenessCheck = (req, res) => {
  try {
    res.status(200).json({
      status: 'alive',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
};

// Detailed health check with additional metrics
export const detailedHealthCheck = async (req, res) => {
  try {
    const basicHealth = await healthCheck(req, res);

    // Add additional detailed metrics
    const detailedMetrics = {
      ...basicHealth,
      detailed: {
        memoryUsage: process.memoryUsage(),
        cpuUsage: process.cpuUsage(),
        resourceUsage: {
          heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB',
          heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + 'MB',
          external: Math.round(process.memoryUsage().external / 1024 / 1024) + 'MB',
          rss: Math.round(process.memoryUsage().rss / 1024 / 1024) + 'MB'
        },
        network: {
          serverListening: true // This would be checked dynamically
        }
      }
    };

    // Override the response with detailed info
    if (res.headersSent) {
      return; // Response already sent by basicHealthCheck
    }

    res.status(200).json(detailedMetrics);
  } catch (error) {
    if (!res.headersSent) {
      res.status(500).json({
        status: 'error',
        timestamp: new Date().toISOString(),
        error: error.message
      });
    }
  }
};

// Middleware to log health check requests
export const healthCheckLogger = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info('Health check request', {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      category: 'health',
      source: 'middleware'
    });
  });

  next();
};

export default {
  healthCheck,
  readinessCheck,
  livenessCheck,
  detailedHealthCheck,
  healthCheckLogger
};