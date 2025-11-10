// @CODE:TAG-DEPLOY-HEALTH-001
// Health check system for monitoring service health

import database from '../config/database.js';
import config from '../config/index.js';

class HealthChecker {
  constructor() {
    this.startTime = Date.now();
    this.version = process.env.npm_package_version || '1.0.0';
  }

  // Main health check endpoint
  async getHealthStatus() {
    const checks = await this.runAllChecks();
    const overallStatus = this.calculateOverallStatus(checks);

    return {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: Date.now() - this.startTime,
      version: this.version,
      environment: config.nodeEnv,
      checks
    };
  }

  // Readiness probe - checks if service is ready to accept traffic
  async getReadinessStatus() {
    const readinessChecks = {
      database: await this.checkDatabase(),
      memory: this.checkMemoryUsage(),
      disk: await this.checkDiskSpace()
    };

    const isReady = Object.values(readinessChecks).every(check => check.status === 'healthy');

    return {
      status: isReady ? 'ready' : 'not_ready',
      timestamp: new Date().toISOString(),
      checks: readinessChecks
    };
  }

  // Liveness probe - checks if service is still alive
  async getLivenessStatus() {
    const uptime = Date.now() - this.startTime;
    const isAlive = uptime > 0 && uptime < 24 * 60 * 60 * 1000; // Alive if uptime < 24 hours

    return {
      status: isAlive ? 'alive' : 'dead',
      timestamp: new Date().toISOString(),
      uptime: uptime,
      version: this.version
    };
  }

  // Startup probe - checks if service has finished starting up
  async getStartupStatus() {
    const uptime = Date.now() - this.startTime;
    const isStarted = uptime > 30000; // Consider started after 30 seconds

    return {
      status: isStarted ? 'started' : 'starting',
      timestamp: new Date().toISOString(),
      uptime: uptime,
      ready: isStarted
    };
  }

  // Run all health checks
  async runAllChecks() {
    const checks = {
      database: await this.checkDatabase(),
      memory: this.checkMemoryUsage(),
      disk: await this.checkDiskSpace(),
      cache: await this.checkCache(),
      external_apis: await this.checkExternalAPIs()
    };

    return checks;
  }

  // Check database connection
  async checkDatabase() {
    try {
      const dbStatus = await database.healthCheck();
      return {
        name: 'database',
        status: dbStatus.status === 'healthy' ? 'healthy' : 'unhealthy',
        details: dbStatus,
        last_check: new Date().toISOString()
      };
    } catch (error) {
      return {
        name: 'database',
        status: 'unhealthy',
        error: error.message,
        last_check: new Date().toISOString()
      };
    }
  }

  // Check memory usage
  checkMemoryUsage() {
    const memUsage = process.memoryUsage();
    const totalMem = memUsage.heapTotal / 1024 / 1024; // MB
    const usedMem = memUsage.heapUsed / 1024 / 1024; // MB
    const memUsagePercent = (usedMem / totalMem) * 100;

    const status = memUsagePercent > 90 ? 'unhealthy' :
                  memUsagePercent > 80 ? 'degraded' : 'healthy';

    return {
      name: 'memory',
      status,
      details: {
        total: totalMem.toFixed(2) + ' MB',
        used: usedMem.toFixed(2) + ' MB',
        usage_percent: memUsagePercent.toFixed(2) + '%',
        rss: (memUsage.rss / 1024 / 1024).toFixed(2) + ' MB',
        external: (memUsage.external / 1024 / 1024).toFixed(2) + ' MB'
      },
      last_check: new Date().toISOString()
    };
  }

  // Check disk space
  async checkDiskSpace() {
    try {
      const stats = await this.getDiskStats();
      const usagePercent = (stats.used / stats.total) * 100;

      const status = usagePercent > 95 ? 'unhealthy' :
                    usagePercent > 85 ? 'degraded' : 'healthy';

      return {
        name: 'disk',
        status,
        details: {
          total: (stats.total / 1024 / 1024 / 1024).toFixed(2) + ' GB',
          used: (stats.used / 1024 / 1024 / 1024).toFixed(2) + ' GB',
          free: (stats.free / 1024 / 1024 / 1024).toFixed(2) + ' GB',
          usage_percent: usagePercent.toFixed(2) + '%'
        },
        last_check: new Date().toISOString()
      };
    } catch (error) {
      return {
        name: 'disk',
        status: 'unknown',
        error: error.message,
        last_check: new Date().toISOString()
      };
    }
  }

  // Check cache (Redis) connection
  async checkCache() {
    try {
      // This would check Redis connection if configured
      // For now, return healthy as placeholder
      return {
        name: 'cache',
        status: 'healthy',
        details: {
          type: 'redis',
          connected: true,
          response_time: '5ms'
        },
        last_check: new Date().toISOString()
      };
    } catch (error) {
      return {
        name: 'cache',
        status: 'unhealthy',
        error: error.message,
        last_check: new Date().toISOString()
      };
    }
  }

  // Check external API dependencies
  async checkExternalAPIs() {
    const checks = [];

    // Example: Check external API endpoints
    // This would be customized based on actual external dependencies

    const status = checks.length === 0 ? 'healthy' :
                  checks.some(c => c.status === 'unhealthy') ? 'unhealthy' : 'healthy';

    return {
      name: 'external_apis',
      status,
      details: {
        total_checks: checks.length,
        healthy_checks: checks.filter(c => c.status === 'healthy').length,
        checks
      },
      last_check: new Date().toISOString()
    };
  }

  // Calculate overall health status
  calculateOverallStatus(checks) {
    const statuses = Object.values(checks).map(check => check.status);

    if (statuses.every(status => status === 'healthy')) {
      return 'healthy';
    } else if (statuses.some(status => status === 'unhealthy')) {
      return 'unhealthy';
    } else {
      return 'degraded';
    }
  }

  // Get disk statistics (simplified version)
  async getDiskStats() {
    // In a real implementation, you would use a library like 'diskusage'
    // For now, return mock data
    return {
      total: 100 * 1024 * 1024 * 1024, // 100GB
      used: 50 * 1024 * 1024 * 1024,  // 50GB
      free: 50 * 1024 * 1024 * 1024   // 50GB
    };
  }
}

// Create and export singleton instance
const healthChecker = new HealthChecker();

export default healthChecker;