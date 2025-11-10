// @CODE:TAG-DEPLOY-HEALTH-001
// Main monitoring system that orchestrates health checks, metrics, and alerts

import healthChecker from './health.js';
import metricsCollector from './metrics.js';
import alertManager from './alerts.js';
import config from '../config/index.js';

class MonitoringSystem {
  constructor() {
    this.isInitialized = false;
    this.checkInterval = null;
    this.setupEventListeners();
  }

  // Initialize monitoring system
  async initialize() {
    if (this.isInitialized) {
      console.log('📊 Monitoring system already initialized');
      return;
    }

    try {
      console.log('📊 Initializing monitoring system...');

      // Start periodic health checks
      this.startPeriodicHealthChecks();

      // Setup metrics collection for system resources
      this.setupSystemMonitoring();

      // Setup error monitoring
      this.setupErrorMonitoring();

      this.isInitialized = true;
      console.log('✅ Monitoring system initialized successfully');

      // Emit initialization event
      this.emitEvent('monitoring:initialized', {
        timestamp: new Date().toISOString(),
        config: {
          health_check_interval: 30000,
          metrics_interval: 60000
        }
      });

    } catch (error) {
      console.error('❌ Failed to initialize monitoring system:', error);
      throw error;
    }
  }

  // Start periodic health checks
  startPeriodicHealthChecks() {
    const interval = 30000; // 30 seconds

    this.checkInterval = setInterval(async () => {
      try {
        const healthStatus = await healthChecker.getHealthStatus();
        const metrics = metricsCollector.getMetrics();

        // Check for alerts based on health status
        alertManager.checkHealthStatus(healthStatus);

        // Check for alerts based on metrics
        alertManager.checkMetrics(metrics);

        // Emit health status event
        this.emitEvent('health:check', healthStatus);

      } catch (error) {
        console.error('❌ Error during periodic health check:', error);
        this.emitEvent('health:error', { error: error.message, timestamp: new Date().toISOString() });
      }
    }, interval);

    console.log(`📊 Health checks scheduled every ${interval / 1000} seconds`);
  }

  // Setup system monitoring
  setupSystemMonitoring() {
    // Listen for metrics updates
    metricsCollector.on('metrics:updated', (metrics) => {
      this.emitEvent('metrics:updated', metrics);
    });

    // Listen for database metrics
    metricsCollector.on('database:metrics', (dbMetrics) => {
      this.emitEvent('database:metrics', dbMetrics);
    });

    // Listen for cache metrics
    metricsCollector.on('cache:metrics', (cacheMetrics) => {
      this.emitEvent('cache:metrics', cacheMetrics);
    });
  }

  // Setup error monitoring
  setupErrorMonitoring() {
    // Listen for alerts
    alertManager.on('alert', (alert) => {
      this.emitEvent('alert:triggered', alert);
    });

    // Listen for critical alerts
    alertManager.on('alert:critical', (alert) => {
      this.emitEvent('alert:critical', alert);
    });

    // Setup global error handlers
    this.setupGlobalErrorHandlers();
  }

  // Setup global error handlers
  setupGlobalErrorHandlers() {
    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      console.error('💥 Uncaught Exception:', error);

      metricsCollector.recordError(500, 'UNCAUGHT_EXCEPTION', error);

      const alert = alertManager.createAlert('uncaught_exception', {
        error: error.message,
        stack: error.stack,
        severity: 'critical'
      });
      alertManager.processAlert(alert);

      this.emitEvent('error:uncaught', { error: error.message, stack: error.stack });
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      console.error('💥 Unhandled Promise Rejection at:', promise, 'reason:', reason);

      metricsCollector.recordError(500, 'UNHANDLED_REJECTION', reason);

      const alert = alertManager.createAlert('unhandled_rejection', {
        reason: reason.toString(),
        promise: promise.toString(),
        severity: 'critical'
      });
      alertManager.processAlert(alert);

      this.emitEvent('error:unhandled_rejection', { reason, promise });
    });

    // Handle process signals
    process.on('SIGINT', () => {
      console.log('📊 Monitoring system shutting down...');
      this.shutdown();
    });

    process.on('SIGTERM', () => {
      console.log('📊 Monitoring system shutting down...');
      this.shutdown();
    });
  }

  // Setup event listeners for monitoring events
  setupEventListeners() {
    // This method can be used to setup additional event listeners
    // For now, it's a placeholder for future extensions
  }

  // Emit monitoring events
  emitEvent(event, data) {
    // Emit to custom event handlers if they exist
    if (this.eventHandlers && this.eventHandlers[event]) {
      this.eventHandlers[event].forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error(`❌ Error in event handler for ${event}:`, error);
        }
      });
    }

    // Log important events
    if (config.nodeEnv === 'development') {
      console.log(`📊 Event: ${event}`, data);
    }
  }

  // Register event handler
  on(event, handler) {
    if (!this.eventHandlers) {
      this.eventHandlers = {};
    }

    if (!this.eventHandlers[event]) {
      this.eventHandlers[event] = [];
    }

    this.eventHandlers[event].push(handler);
  }

  // Get comprehensive monitoring status
  async getStatus() {
    if (!this.isInitialized) {
      return {
        status: 'not_initialized',
        message: 'Monitoring system has not been initialized'
      };
    }

    try {
      const [healthStatus, metrics, alerts] = await Promise.all([
        healthChecker.getHealthStatus(),
        Promise.resolve(metricsCollector.getMetrics()),
        Promise.resolve(alertManager.getActiveAlerts())
      ]);

      const alertStats = alertManager.getAlertStats();

      return {
        status: 'running',
        timestamp: new Date().toISOString(),
        health: healthStatus,
        metrics: metrics,
        alerts: {
          active: alerts,
          statistics: alertStats
        },
        system: {
          initialized: this.isInitialized,
          uptime: process.uptime(),
          memory: process.memoryUsage(),
          environment: config.nodeEnv
        }
      };
    } catch (error) {
      return {
        status: 'error',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  // Middleware for Express to collect request metrics
  requestMetricsMiddleware() {
    return (req, res, next) => {
      const startTime = Date.now();

      // Listen for response finish
      res.on('finish', () => {
        const responseTime = Date.now() - startTime;

        metricsCollector.recordRequest(
          req.method,
          res.statusCode,
          responseTime
        );
      });

      next();
    };
  }

  // Middleware for Express to add health endpoints
  healthEndpointsMiddleware() {
    return (app) => {
      // Main health check endpoint
      app.get('/health', async (req, res) => {
        try {
          const healthStatus = await healthChecker.getHealthStatus();
          const statusCode = healthStatus.status === 'healthy' ? 200 :
                           healthStatus.status === 'degraded' ? 200 : 503;

          res.status(statusCode).json(healthStatus);
        } catch (error) {
          res.status(503).json({
            status: 'error',
            message: 'Health check failed',
            error: error.message,
            timestamp: new Date().toISOString()
          });
        }
      });

      // Readiness probe endpoint
      app.get('/ready', async (req, res) => {
        try {
          const readinessStatus = await healthChecker.getReadinessStatus();
          const statusCode = readinessStatus.status === 'ready' ? 200 : 503;

          res.status(statusCode).json(readinessStatus);
        } catch (error) {
          res.status(503).json({
            status: 'error',
            message: 'Readiness check failed',
            error: error.message,
            timestamp: new Date().toISOString()
          });
        }
      });

      // Liveness probe endpoint
      app.get('/live', async (req, res) => {
        try {
          const livenessStatus = await healthChecker.getLivenessStatus();
          const statusCode = livenessStatus.status === 'alive' ? 200 : 503;

          res.status(statusCode).json(livenessStatus);
        } catch (error) {
          res.status(503).json({
            status: 'error',
            message: 'Liveness check failed',
            error: error.message,
            timestamp: new Date().toISOString()
          });
        }
      });

      // Startup probe endpoint
      app.get('/startup', async (req, res) => {
        try {
          const startupStatus = await healthChecker.getStartupStatus();
          const statusCode = startupStatus.status === 'started' ? 200 : 503;

          res.status(statusCode).json(startupStatus);
        } catch (error) {
          res.status(503).json({
            status: 'error',
            message: 'Startup check failed',
            error: error.message,
            timestamp: new Date().toISOString()
          });
        }
      });

      // Metrics endpoint
      app.get('/metrics', (req, res) => {
        try {
          const metrics = metricsCollector.getMetrics();
          res.json(metrics);
        } catch (error) {
          res.status(500).json({
            error: error.message,
            timestamp: new Date().toISOString()
          });
        }
      });

      // Alerts endpoint
      app.get('/alerts', (req, res) => {
        try {
          const activeAlerts = alertManager.getActiveAlerts();
          const alertStats = alertManager.getAlertStats();

          res.json({
            active: activeAlerts,
            statistics: alertStats,
            timestamp: new Date().toISOString()
          });
        } catch (error) {
          res.status(500).json({
            error: error.message,
            timestamp: new Date().toISOString()
          });
        }
      });
    };
  }

  // Shutdown monitoring system
  shutdown() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }

    this.isInitialized = false;
    console.log('✅ Monitoring system shut down successfully');
  }
}

// Create and export singleton instance
const monitoringSystem = new MonitoringSystem();

export default monitoringSystem;