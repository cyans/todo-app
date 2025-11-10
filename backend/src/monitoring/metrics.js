// @CODE:TAG-DEPLOY-HEALTH-001
// Metrics collection and monitoring system

import EventEmitter from 'events';

class MetricsCollector extends EventEmitter {
  constructor() {
    super();
    this.resetMetrics();
    this.startPeriodicCollection();
  }

  // Reset all metrics
  resetMetrics() {
    this.metrics = {
      // HTTP metrics
      requests: {
        total: 0,
        successful: 0,
        failed: 0,
        methods: {
          GET: 0,
          POST: 0,
          PUT: 0,
          DELETE: 0,
          PATCH: 0
        }
      },
      response_time: {
        total: 0,
        count: 0,
        min: Infinity,
        max: 0,
        recent: [] // Keep last 100 response times
      },
      // Error metrics
      errors: {
        total: 0,
        by_type: {},
        by_status_code: {}
      },
      // System metrics
      system: {
        memory: {
          rss: 0,
          heap_total: 0,
          heap_used: 0,
          external: 0
        },
        cpu: {
          usage: 0,
          load_average: []
        },
        disk: {
          total: 0,
          used: 0,
          free: 0
        },
        uptime: 0
      },
      // Application metrics
      database: {
        connections: 0,
        queries: 0,
        query_time: 0,
        errors: 0
      },
      cache: {
        hits: 0,
        misses: 0,
        ratio: 0
      }
    };
  }

  // Record HTTP request
  recordRequest(method, statusCode, responseTime) {
    this.metrics.requests.total++;

    // Track by method
    if (this.metrics.requests.methods[method]) {
      this.metrics.requests.methods[method]++;
    }

    // Track success/failure
    if (statusCode >= 200 && statusCode < 400) {
      this.metrics.requests.successful++;
    } else {
      this.metrics.requests.failed++;
    }

    // Track response time
    this.recordResponseTime(responseTime);

    // Track errors by status code
    if (statusCode >= 400) {
      this.recordError(statusCode, 'HTTP_ERROR');
    }

    this.emit('request:recorded', { method, statusCode, responseTime });
  }

  // Record response time
  recordResponseTime(time) {
    this.metrics.response_time.total += time;
    this.metrics.response_time.count++;
    this.metrics.response_time.min = Math.min(this.metrics.response_time.min, time);
    this.metrics.response_time.max = Math.max(this.metrics.response_time.max, time);

    // Keep recent response times (last 100)
    this.metrics.response_time.recent.push(time);
    if (this.metrics.response_time.recent.length > 100) {
      this.metrics.response_time.recent.shift();
    }

    // Emit event for monitoring
    this.emit('response_time:recorded', time);
  }

  // Record error
  recordError(statusCode, errorType, error = null) {
    this.metrics.errors.total++;

    // Track by type
    if (!this.metrics.errors.by_type[errorType]) {
      this.metrics.errors.by_type[errorType] = 0;
    }
    this.metrics.errors.by_type[errorType]++;

    // Track by status code
    if (!this.metrics.errors.by_status_code[statusCode]) {
      this.metrics.errors.by_status_code[statusCode] = 0;
    }
    this.metrics.errors.by_status_code[statusCode]++;

    this.emit('error:recorded', { statusCode, errorType, error });
  }

  // Record database metrics
  recordDatabaseMetrics(connections, queries, queryTime, errors) {
    this.metrics.database.connections = connections;
    this.metrics.database.queries += queries;
    this.metrics.database.query_time += queryTime;
    this.metrics.database.errors += errors;

    this.emit('database:metrics', { connections, queries, queryTime, errors });
  }

  // Record cache metrics
  recordCacheMetrics(hits, misses) {
    this.metrics.cache.hits += hits;
    this.metrics.cache.misses += misses;

    const total = this.metrics.cache.hits + this.metrics.cache.misses;
    this.metrics.cache.ratio = total > 0 ? (this.metrics.cache.hits / total) * 100 : 0;

    this.emit('cache:metrics', { hits, misses, ratio: this.metrics.cache.ratio });
  }

  // Collect system metrics
  collectSystemMetrics() {
    const memUsage = process.memoryUsage();
    const uptime = process.uptime();

    this.metrics.system.memory = {
      rss: memUsage.rss,
      heap_total: memUsage.heapTotal,
      heap_used: memUsage.heapUsed,
      external: memUsage.external
    };

    this.metrics.system.uptime = uptime;

    // CPU usage (simplified)
    this.metrics.system.cpu.usage = process.cpuUsage().user / 1000000; // Convert to seconds

    this.emit('system:metrics', this.metrics.system);
  }

  // Get current metrics
  getMetrics() {
    // Calculate derived metrics
    const avgResponseTime = this.metrics.response_time.count > 0
      ? this.metrics.response_time.total / this.metrics.response_time.count
      : 0;

    const errorRate = this.metrics.requests.total > 0
      ? (this.metrics.requests.failed / this.metrics.requests.total) * 100
      : 0;

    const successRate = this.metrics.requests.total > 0
      ? (this.metrics.requests.successful / this.metrics.requests.total) * 100
      : 0;

    // Calculate percentiles for response time
    const recentTimes = this.metrics.response_time.recent.sort((a, b) => a - b);
    const p50 = this.getPercentile(recentTimes, 50);
    const p95 = this.getPercentile(recentTimes, 95);
    const p99 = this.getPercentile(recentTimes, 99);

    return {
      ...this.metrics,
      derived: {
        avg_response_time: avgResponseTime,
        error_rate: errorRate,
        success_rate: successRate,
        response_time_p50: p50,
        response_time_p95: p95,
        response_time_p99: p99,
        requests_per_second: this.calculateRPS()
      },
      timestamp: new Date().toISOString()
    };
  }

  // Calculate percentile
  getPercentile(sortedArray, percentile) {
    if (sortedArray.length === 0) return 0;

    const index = Math.ceil((percentile / 100) * sortedArray.length) - 1;
    return sortedArray[Math.max(0, index)];
  }

  // Calculate requests per second
  calculateRPS() {
    const timeWindow = 60; // 1 minute window
    const now = Date.now();

    // In a real implementation, you'd track timestamps of requests
    // For now, return a simple calculation
    return this.metrics.requests.total / (process.uptime() || 1);
  }

  // Start periodic collection
  startPeriodicCollection() {
    // Collect system metrics every 30 seconds
    setInterval(() => {
      this.collectSystemMetrics();
    }, 30000);

    // Emit metrics every minute for monitoring
    setInterval(() => {
      this.emit('metrics:updated', this.getMetrics());
    }, 60000);
  }

  // Reset metrics (useful for testing or periodic resets)
  reset() {
    this.resetMetrics();
    this.emit('metrics:reset');
  }

  // Get health status based on metrics
  getHealthStatus() {
    const metrics = this.getMetrics();
    const issues = [];

    // Check error rate
    if (metrics.derived.error_rate > 5) {
      issues.push(`High error rate: ${metrics.derived.error_rate.toFixed(2)}%`);
    }

    // Check response time
    if (metrics.derived.avg_response_time > 5000) {
      issues.push(`High average response time: ${metrics.derived.avg_response_time.toFixed(2)}ms`);
    }

    // Check memory usage
    const memoryUsagePercent = (metrics.system.memory.heap_used / metrics.system.memory.heap_total) * 100;
    if (memoryUsagePercent > 90) {
      issues.push(`High memory usage: ${memoryUsagePercent.toFixed(2)}%`);
    }

    return {
      status: issues.length === 0 ? 'healthy' : issues.length > 2 ? 'unhealthy' : 'degraded',
      issues,
      metrics: {
        error_rate: metrics.derived.error_rate,
        avg_response_time: metrics.derived.avg_response_time,
        memory_usage_percent: memoryUsagePercent,
        requests_per_second: metrics.derived.requests_per_second
      }
    };
  }
}

// Create and export singleton instance
const metricsCollector = new MetricsCollector();

export default metricsCollector;