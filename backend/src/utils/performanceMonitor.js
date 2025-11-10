// @CODE:TAG-DEPLOY-PERFORMANCE-001
// Performance monitoring and APM system

import logger from './logger.js';

class PerformanceMonitor {
  constructor() {
    this.timers = new Map(); // Active timers
    this.metrics = {
      timers: [], // Completed timers
      responses: [], // HTTP response times
      custom: [], // Custom metrics
      system: [], // System resource metrics
      errors: [] // Error metrics
    };
    this.config = {
      maxHistory: 1000, // Maximum metrics to keep in memory
      maxAge: 60 * 60 * 1000, // Maximum age of metrics (1 hour)
      alertThresholds: {
        responseTime: 2000, // 2 seconds
        errorRate: 0.05, // 5%
        memoryUsage: 0.85, // 85%
        cpuUsage: 0.8 // 80%
      }
    };
    this.statsCache = new Map(); // Cache for calculated stats
    this.cleanupInterval = null;
  }

  // Start a new timer for performance measurement
  startTimer(operation, metadata = {}) {
    const timerId = this.generateTimerId();
    const startTime = process.hrtime.bigint();

    this.timers.set(timerId, {
      id: timerId,
      operation,
      startTime,
      metadata,
      timestamp: new Date().toISOString()
    });

    return timerId;
  }

  // End a timer and record the duration
  endTimer(timerId, additionalMetadata = {}) {
    const timer = this.timers.get(timerId);
    if (!timer) {
      logger.warn('Attempted to end non-existent timer', { timerId });
      return null;
    }

    const endTime = process.hrtime.bigint();
    const duration = Number(endTime - timer.startTime) / 1000000; // Convert to milliseconds

    const completedTimer = {
      ...timer,
      endTime,
      duration: Math.round(duration * 100) / 100, // Round to 2 decimal places
      ...additionalMetadata
    };

    // Move timer from active to completed
    this.timers.delete(timerId);
    this.metrics.timers.push(completedTimer);

    // Log slow operations
    if (duration > this.config.alertThresholds.responseTime) {
      logger.performance(timer.operation, duration, {
        category: 'slow_operation',
        ...timer.metadata,
        ...additionalMetadata
      });
    }

    // Clear cache for this operation
    this.statsCache.delete(timer.operation);

    return completedTimer;
  }

  // Record a custom metric
  recordMetric(metric) {
    const enrichedMetric = {
      ...metric,
      timestamp: metric.timestamp || new Date().toISOString()
    };

    this.metrics.custom.push(enrichedMetric);
    this.cleanupMetrics();
  }

  // Record HTTP response time
  recordResponseTime(responseData) {
    const responseMetric = {
      method: responseData.method,
      url: responseData.url,
      statusCode: responseData.statusCode,
      responseTime: responseData.responseTime,
      userAgent: responseData.userAgent,
      ip: responseData.ip,
      userId: responseData.userId,
      timestamp: new Date().toISOString(),
      category: 'http_response'
    };

    this.metrics.responses.push(responseMetric);

    // Log slow responses
    if (responseData.responseTime > this.config.alertThresholds.responseTime) {
      logger.warn('Slow HTTP response detected', {
        method: responseData.method,
        url: responseData.url,
        responseTime: responseData.responseTime,
        statusCode: responseData.statusCode
      });
    }

    this.cleanupMetrics();
  }

  // Record system resource metrics
  recordSystemMetrics(systemData) {
    const systemMetric = {
      memory: systemData.memory,
      cpu: systemData.cpu,
      disk: systemData.disk,
      network: systemData.network,
      timestamp: new Date().toISOString(),
      category: 'system_resources'
    };

    this.metrics.system.push(systemMetric);

    // Check for alerts
    this.checkSystemAlerts(systemData);

    this.cleanupMetrics();
  }

  // Record error metrics
  recordError(errorData) {
    const errorMetric = {
      message: errorData.message,
      stack: errorData.stack,
      code: errorData.code,
      operation: errorData.operation,
      userId: errorData.userId,
      ip: errorData.ip,
      userAgent: errorData.userAgent,
      timestamp: new Date().toISOString(),
      category: 'error'
    };

    this.metrics.errors.push(errorMetric);
    this.cleanupMetrics();
  }

  // Get all metrics
  getMetrics() {
    return {
      ...this.metrics,
      activeTimers: this.timers.size,
      generatedAt: new Date().toISOString()
    };
  }

  // Get statistics for a specific operation
  getTimerStats(operation) {
    if (this.statsCache.has(operation)) {
      return this.statsCache.get(operation);
    }

    const operationTimers = this.metrics.timers.filter(timer => timer.operation === operation);

    if (operationTimers.length === 0) {
      return null;
    }

    const durations = operationTimers.map(timer => timer.duration);
    const stats = {
      operation,
      count: durations.length,
      total: durations.reduce((sum, duration) => sum + duration, 0),
      average: durations.reduce((sum, duration) => sum + duration, 0) / durations.length,
      min: Math.min(...durations),
      max: Math.max(...durations),
      median: this.calculateMedian(durations),
      p95: this.calculatePercentile(durations, 95),
      p99: this.calculatePercentile(durations, 99)
    };

    // Cache the stats
    this.statsCache.set(operation, stats);

    return stats;
  }

  // Get response time statistics
  getResponseStats() {
    const responseTimes = this.metrics.responses.map(response => response.responseTime);

    if (responseTimes.length === 0) {
      return {
        count: 0,
        average: 0,
        min: 0,
        max: 0,
        median: 0,
        p95: 0,
        p99: 0
      };
    }

    const statusCodes = this.metrics.responses.reduce((acc, response) => {
      acc[response.statusCode] = (acc[response.statusCode] || 0) + 1;
      return acc;
    }, {});

    const errorCount = Object.keys(statusCodes)
      .filter(code => parseInt(code) >= 400)
      .reduce((sum, code) => sum + statusCodes[code], 0);

    return {
      count: responseTimes.length,
      errorCount,
      errorRate: errorCount / responseTimes.length,
      statusCodes,
      average: responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length,
      min: Math.min(...responseTimes),
      max: Math.max(...responseTimes),
      median: this.calculateMedian(responseTimes),
      p95: this.calculatePercentile(responseTimes, 95),
      p99: this.calculatePercentile(responseTimes, 99)
    };
  }

  // Check for performance alerts
  checkAlerts() {
    const alerts = [];
    const now = Date.now();
    const recentThreshold = 5 * 60 * 1000; // Last 5 minutes

    // Check response times
    const recentResponses = this.metrics.responses.filter(
      response => new Date(response.timestamp).getTime() > now - recentThreshold
    );

    if (recentResponses.length > 0) {
      const avgResponseTime = recentResponses.reduce((sum, r) => sum + r.responseTime, 0) / recentResponses.length;

      if (avgResponseTime > this.config.alertThresholds.responseTime) {
        alerts.push({
          type: 'slow_response_time',
          severity: 'warning',
          message: `Average response time (${avgResponseTime.toFixed(2)}ms) exceeds threshold`,
          value: avgResponseTime,
          threshold: this.config.alertThresholds.responseTime
        });
      }
    }

    // Check error rates
    const recentErrors = this.metrics.errors.filter(
      error => new Date(error.timestamp).getTime() > now - recentThreshold
    );

    if (recentResponses.length > 0) {
      const errorRate = recentErrors.length / recentResponses.length;

      if (errorRate > this.config.alertThresholds.errorRate) {
        alerts.push({
          type: 'high_error_rate',
          severity: 'critical',
          message: `Error rate (${(errorRate * 100).toFixed(2)}%) exceeds threshold`,
          value: errorRate,
          threshold: this.config.alertThresholds.errorRate
        });
      }
    }

    return alerts;
  }

  // Check system resource alerts
  checkSystemAlerts(systemData) {
    if (systemData.memory && systemData.memory.percentage) {
      if (systemData.memory.percentage > this.config.alertThresholds.memoryUsage) {
        logger.warn('High memory usage detected', {
          usage: systemData.memory.percentage,
          threshold: this.config.alertThresholds.memoryUsage
        });
      }
    }

    if (systemData.cpu && systemData.cpu.usage) {
      const cpuUsage = parseFloat(systemData.cpu.usage.replace('%', '')) / 100;
      if (cpuUsage > this.config.alertThresholds.cpuUsage) {
        logger.warn('High CPU usage detected', {
          usage: systemData.cpu.usage,
          threshold: this.config.alertThresholds.cpuUsage
        });
      }
    }
  }

  // Express middleware factory
  middleware() {
    const self = this;
    return (req, res, next) => {
      const timerId = self.startTimer(`${req.method} ${req.originalUrl}`, {
        method: req.method,
        url: req.originalUrl,
        userAgent: req.get('User-Agent'),
        ip: req.ip
      });

      // Override res.end to capture response time
      const originalEnd = res.end;
      res.end = function(...args) {
        const responseTime = self.endTimer(timerId, {
          statusCode: res.statusCode,
          userId: req.user ? req.user.id : null
        });

        if (responseTime) {
          self.recordResponseTime({
            method: req.method,
            url: req.originalUrl,
            statusCode: res.statusCode,
            responseTime: responseTime.duration,
            userAgent: req.get('User-Agent'),
            ip: req.ip,
            userId: req.user ? req.user.id : null
          });
        }

        originalEnd.apply(this, args);
      };

      next();
    };
  }

  // Get metrics for API endpoint
  getMetricsEndpoint() {
    return {
      timestamp: new Date().toISOString(),
      metrics: {
        performance: {
          timers: this.getTimerStatsSummary(),
          responses: this.getResponseStats()
        },
        system: this.getLatestSystemMetrics(),
        alerts: this.checkAlerts(),
        activeTimers: this.timers.size
      }
    };
  }

  // Helper methods
  generateTimerId() {
    return `timer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  calculateMedian(values) {
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0
      ? (sorted[mid - 1] + sorted[mid]) / 2
      : sorted[mid];
  }

  calculatePercentile(values, percentile) {
    const sorted = [...values].sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[Math.max(0, index)];
  }

  getTimerStatsSummary() {
    const operations = [...new Set(this.metrics.timers.map(timer => timer.operation))];
    return operations.map(operation => this.getTimerStats(operation)).filter(Boolean);
  }

  getLatestSystemMetrics() {
    return this.metrics.system.length > 0
      ? this.metrics.system[this.metrics.system.length - 1]
      : null;
  }

  // Configuration methods
  setAlertThresholds(thresholds) {
    this.config.alertThresholds = { ...this.config.alertThresholds, ...thresholds };
  }

  setMaxHistory(maxHistory) {
    this.config.maxHistory = maxHistory;
    this.cleanupMetrics();
  }

  getConfiguration() {
    return { ...this.config };
  }

  // Cleanup methods
  cleanupMetrics() {
    const now = Date.now();
    const cutoffTime = now - this.config.maxAge;

    // Clean up old metrics
    Object.keys(this.metrics).forEach(metricType => {
      if (Array.isArray(this.metrics[metricType])) {
        const originalLength = this.metrics[metricType].length;
        this.metrics[metricType] = this.metrics[metricType].filter(metric => {
          const metricTime = new Date(metric.timestamp).getTime();
          return metricTime > cutoffTime;
        });

        // Limit by count
        if (this.metrics[metricType].length > this.config.maxHistory) {
          this.metrics[metricType] = this.metrics[metricType].slice(-this.config.maxHistory);
        }
      }
    });
  }

  reset() {
    this.timers.clear();
    this.metrics = {
      timers: [],
      responses: [],
      custom: [],
      system: [],
      errors: []
    };
    this.statsCache.clear();
  }

  cleanup() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  // Start automatic cleanup
  startAutoCleanup(intervalMs = 5 * 60 * 1000) { // Default: 5 minutes
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }

    this.cleanupInterval = setInterval(() => {
      this.cleanupMetrics();
    }, intervalMs);
  }

  // Stop automatic cleanup
  stopAutoCleanup() {
    this.cleanup();
  }
}

// Create and export singleton instance
const performanceMonitor = new PerformanceMonitor();

// Start automatic cleanup
performanceMonitor.startAutoCleanup();

export default performanceMonitor;