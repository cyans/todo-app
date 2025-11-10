// @CODE:UI-UX-DEPLOY-005:MONITORING
// Performance Monitoring Middleware

import logger from '../utils/logger.js';
import os from 'os';

// Performance metrics storage
const metrics = {
  requests: {
    total: 0,
    successful: 0,
    failed: 0,
    slow: 0
  },
  responseTimes: [],
  memory: {
    samples: [],
    maxSamples: 100
  },
  cpu: {
    samples: [],
    maxSamples: 100
  },
  errors: {
    total: 0,
    byType: {}
  }
};

// Performance thresholds
const THRESHOLDS = {
  SLOW_REQUEST_MS: 1000,
  VERY_SLOW_REQUEST_MS: 5000,
  MEMORY_WARNING_MB: 500,
  MEMORY_CRITICAL_MB: 1000,
  CPU_WARNING_PERCENT: 80,
  CPU_CRITICAL_PERCENT: 95
};

// Get memory usage in MB
function getMemoryUsageMB() {
  const usage = process.memoryUsage();
  return {
    rss: Math.round(usage.rss / 1024 / 1024),
    heapTotal: Math.round(usage.heapTotal / 1024 / 1024),
    heapUsed: Math.round(usage.heapUsed / 1024 / 1024),
    external: Math.round(usage.external / 1024 / 1024)
  };
}

// Get CPU usage
function getCpuUsage() {
  const cpus = os.cpus();
  let totalIdle = 0;
  let totalTick = 0;

  cpus.forEach(cpu => {
    for (const type in cpu.times) {
      totalTick += cpu.times[type];
    }
    totalIdle += cpu.times.idle;
  });

  return {
    idle: totalIdle / cpus.length,
    total: totalTick / cpus.length,
    loadAverage: os.loadavg(),
    count: cpus.length
  };
}

// Sample system metrics
function sampleSystemMetrics() {
  try {
    const memoryUsage = getMemoryUsageMB();
    const cpuUsage = getCpuUsage();

    // Store memory samples
    metrics.memory.samples.push({
      timestamp: Date.now(),
      ...memoryUsage
    });

    if (metrics.memory.samples.length > metrics.memory.maxSamples) {
      metrics.memory.samples.shift();
    }

    // Store CPU samples
    metrics.cpu.samples.push({
      timestamp: Date.now(),
      ...cpuUsage
    });

    if (metrics.cpu.samples.length > metrics.cpu.maxSamples) {
      metrics.cpu.samples.shift();
    }

    // Check for performance warnings
    if (memoryUsage.heapUsed > THRESHOLDS.MEMORY_CRITICAL_MB) {
      logger.error('Critical memory usage detected', {
        memoryUsage,
        threshold: THRESHOLDS.MEMORY_CRITICAL_MB,
        category: 'performance'
      });
    } else if (memoryUsage.heapUsed > THRESHOLDS.MEMORY_WARNING_MB) {
      logger.warn('High memory usage detected', {
        memoryUsage,
        threshold: THRESHOLDS.MEMORY_WARNING_MB,
        category: 'performance'
      });
    }

  } catch (error) {
    logger.error('Failed to sample system metrics', {
      error: error.message,
      category: 'performance'
    });
  }
}

// Get current metrics
export const getMetrics = () => {
  return {
    ...metrics,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    system: {
      platform: os.platform(),
      arch: os.arch(),
      totalMemory: Math.round(os.totalmem() / 1024 / 1024),
      freeMemory: Math.round(os.freemem() / 1024 / 1024),
      loadAverage: os.loadavg(),
      cpuCount: os.cpus().length
    }
  };
};

// Reset metrics
export const resetMetrics = () => {
  metrics.requests.total = 0;
  metrics.requests.successful = 0;
  metrics.requests.failed = 0;
  metrics.requests.slow = 0;
  metrics.responseTimes = [];
  metrics.memory.samples = [];
  metrics.cpu.samples = [];
  metrics.errors.total = 0;
  metrics.errors.byType = {};

  logger.info('Performance metrics reset', { category: 'performance' });
};

// Main performance monitoring middleware
const performanceMonitor = (req, res, next) => {
  try {
    const startTime = process.hrtime.bigint();
    const startMemory = getMemoryUsageMB();

    // Add unique request ID for tracking
    req.requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    req.startTime = startTime;

    // Increment request counter
    metrics.requests.total++;

    // Log incoming request with system context
    logger.info('Request started', {
      requestId: req.requestId,
      method: req.method,
      url: req.url,
      userAgent: req.get('User-Agent'),
      ip: req.ip || req.connection.remoteAddress,
      memoryUsage: startMemory,
      timestamp: new Date().toISOString(),
      category: 'performance'
    });

    // Capture response metrics
    res.on('finish', () => {
      try {
        const endTime = process.hrtime.bigint();
        const duration = Number(endTime - startTime) / 1000000; // Convert nanoseconds to milliseconds
        const endMemory = getMemoryUsageMB();

        // Update metrics
        metrics.responseTimes.push(duration);
        if (metrics.responseTimes.length > 1000) {
          metrics.responseTimes.shift();
        }

        if (res.statusCode >= 200 && res.statusCode < 400) {
          metrics.requests.successful++;
        } else {
          metrics.requests.failed++;
        }

        if (duration > THRESHOLDS.SLOW_REQUEST_MS) {
          metrics.requests.slow++;
        }

        // Log request completion with performance data
        const logData = {
          requestId: req.requestId,
          method: req.method,
          url: req.url,
          statusCode: res.statusCode,
          duration: Math.round(duration),
          startMemory,
          endMemory,
          memoryDelta: {
            rss: endMemory.rss - startMemory.rss,
            heapUsed: endMemory.heapUsed - startMemory.heapUsed
          },
          userAgent: req.get('User-Agent'),
          ip: req.ip || req.connection.remoteAddress,
          timestamp: new Date().toISOString(),
          category: 'performance'
        };

        // Log based on performance thresholds
        if (duration > THRESHOLDS.VERY_SLOW_REQUEST_MS) {
          logger.error('Very slow request detected', logData);
        } else if (duration > THRESHOLDS.SLOW_REQUEST_MS) {
          logger.warn('Slow request detected', logData);
        } else {
          logger.info('Request completed', logData);
        }

        // Sample system metrics periodically
        if (metrics.requests.total % 10 === 0) {
          sampleSystemMetrics();
        }

      } catch (error) {
        logger.error('Error in performance monitoring finish handler', {
          requestId: req.requestId,
          error: error.message,
          category: 'performance'
        });
      }
    });

    // Handle request errors
    res.on('error', (error) => {
      metrics.errors.total++;
      const errorType = error.name || 'Unknown';
      metrics.errors.byType[errorType] = (metrics.errors.byType[errorType] || 0) + 1;

      logger.error('Request error detected', {
        requestId: req.requestId,
        error: error.message,
        errorType,
        category: 'performance'
      });
    });

    next();

  } catch (error) {
    logger.error('Error in performance monitoring middleware', {
      error: error.message,
      stack: error.stack,
      category: 'performance'
    });
    next(); // Continue even if monitoring fails
  }
};

// Enhanced performance monitor with additional features
export const advancedPerformanceMonitor = (options = {}) => {
  const config = {
    sampleRate: options.sampleRate || 1.0, // Sample 100% of requests by default
    slowRequestThreshold: options.slowRequestThreshold || THRESHOLDS.SLOW_REQUEST_MS,
    enableMemoryTracking: options.enableMemoryTracking !== false,
    enableCpuTracking: options.enableCpuTracking !== false,
    ...options
  };

  return (req, res, next) => {
    // Skip monitoring based on sample rate
    if (Math.random() > config.sampleRate) {
      return next();
    }

    return performanceMonitor(req, res, next);
  };
};

export default performanceMonitor;