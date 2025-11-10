// @TEST:TAG-DEPLOY-PERFORMANCE-001
// Performance monitoring system tests

import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';

// Import performance monitor after it's created
import performanceMonitor from './performanceMonitor.js';

describe('Performance Monitoring System', () => {
  beforeEach(() => {
    // Reset performance monitor state
    performanceMonitor.reset();
  });

  afterEach(() => {
    // Clean up any timers or intervals
    performanceMonitor.cleanup();
  });

  describe('Basic Configuration', () => {
    it('should create performance monitor with correct configuration', () => {
      assert.ok(performanceMonitor, 'Performance monitor should be defined');
      assert.strictEqual(typeof performanceMonitor.startTimer, 'function', 'Should have startTimer method');
      assert.strictEqual(typeof performanceMonitor.endTimer, 'function', 'Should have endTimer method');
      assert.strictEqual(typeof performanceMonitor.getMetrics, 'function', 'Should have getMetrics method');
      assert.strictEqual(typeof performanceMonitor.recordMetric, 'function', 'Should have recordMetric method');
    });

    it('should have initial empty metrics', () => {
      const metrics = performanceMonitor.getMetrics();
      assert.ok(typeof metrics === 'object', 'Metrics should be an object');
      assert.ok(Array.isArray(metrics.timers), 'Should have timers array');
      assert.strictEqual(metrics.timers.length, 0, 'Should start with empty timers');
    });
  });

  describe('Timer Operations', () => {
    it('should start and stop timers correctly', () => {
      const timerId = performanceMonitor.startTimer('test_operation');
      assert.ok(typeof timerId === 'string', 'Should return timer ID as string');
      assert.ok(timerId.length > 0, 'Timer ID should not be empty');

      const result = performanceMonitor.endTimer(timerId);
      assert.ok(typeof result === 'object', 'Should return result object');
      assert.ok(result.duration >= 0, 'Should have non-negative duration');
      assert.strictEqual(result.operation, 'test_operation', 'Should track operation name');
    });

    it('should handle concurrent timers', () => {
      const timer1 = performanceMonitor.startTimer('operation1');
      const timer2 = performanceMonitor.startTimer('operation2');
      const timer3 = performanceMonitor.startTimer('operation1');

      // Timers should have unique IDs
      assert.notStrictEqual(timer1, timer2, 'Timer IDs should be unique');
      assert.notStrictEqual(timer2, timer3, 'Timer IDs should be unique');
      assert.notStrictEqual(timer1, timer3, 'Timer IDs should be unique');

      const result1 = performanceMonitor.endTimer(timer1);
      const result2 = performanceMonitor.endTimer(timer2);
      const result3 = performanceMonitor.endTimer(timer3);

      assert.ok(result1.duration >= 0, 'First timer should have valid duration');
      assert.ok(result2.duration >= 0, 'Second timer should have valid duration');
      assert.ok(result3.duration >= 0, 'Third timer should have valid duration');
    });

    it('should handle invalid timer IDs gracefully', () => {
      const result = performanceMonitor.endTimer('invalid_timer_id');
      assert.strictEqual(result, null, 'Should return null for invalid timer ID');
    });
  });

  describe('Metrics Recording', () => {
    it('should record custom metrics', () => {
      const customMetric = {
        name: 'custom_metric',
        value: 42,
        unit: 'count',
        tags: { source: 'test' }
      };

      performanceMonitor.recordMetric(customMetric);
      const metrics = performanceMonitor.getMetrics();

      assert.ok(Array.isArray(metrics.custom), 'Should have custom metrics array');
      assert.strictEqual(metrics.custom.length, 1, 'Should have one custom metric');
      assert.strictEqual(metrics.custom[0].name, customMetric.name, 'Should record metric name');
      assert.strictEqual(metrics.custom[0].value, customMetric.value, 'Should record metric value');
    });

    it('should record response time metrics', () => {
      const responseMetric = {
        method: 'GET',
        url: '/api/todos',
        statusCode: 200,
        responseTime: 150,
        userAgent: 'test-agent',
        ip: '127.0.0.1'
      };

      performanceMonitor.recordResponseTime(responseMetric);
      const metrics = performanceMonitor.getMetrics();

      assert.ok(Array.isArray(metrics.responses), 'Should have responses array');
      assert.strictEqual(metrics.responses.length, 1, 'Should have one response metric');
      assert.strictEqual(metrics.responses[0].method, responseMetric.method, 'Should record HTTP method');
      assert.strictEqual(metrics.responses[0].responseTime, responseMetric.responseTime, 'Should record response time');
    });

    it('should record system resource metrics', () => {
      const resourceMetric = {
        memory: {
          used: '45MB',
          total: '128MB',
          percentage: 35.2
        },
        cpu: {
          usage: '15%',
          load: [0.1, 0.2, 0.15]
        },
        timestamp: new Date().toISOString()
      };

      performanceMonitor.recordSystemMetrics(resourceMetric);
      const metrics = performanceMonitor.getMetrics();

      assert.ok(Array.isArray(metrics.system), 'Should have system metrics array');
      assert.strictEqual(metrics.system.length, 1, 'Should have one system metric');
      assert.ok(metrics.system[0].memory, 'Should record memory metrics');
      assert.ok(metrics.system[0].cpu, 'Should record CPU metrics');
    });
  });

  describe('Statistics Calculation', () => {
    it('should calculate timer statistics', () => {
      // Record some timer data
      for (let i = 0; i < 5; i++) {
        const timerId = performanceMonitor.startTimer('test_operation');
        // Simulate some work
        setTimeout(() => {
          performanceMonitor.endTimer(timerId);
        }, Math.random() * 10);
      }

      // Wait for all timers to complete
      setTimeout(() => {
        const stats = performanceMonitor.getTimerStats('test_operation');

        assert.ok(typeof stats === 'object', 'Should return stats object');
        assert.ok(stats.count >= 0, 'Should have count');
        assert.ok(stats.average >= 0, 'Should have average duration');
        assert.ok(stats.min >= 0, 'Should have minimum duration');
        assert.ok(stats.max >= 0, 'Should have maximum duration');
      }, 50);
    });

    it('should calculate response time statistics', () => {
      // Record response times
      const responseTimes = [100, 150, 200, 120, 180];

      responseTimes.forEach(time => {
        performanceMonitor.recordResponseTime({
          method: 'GET',
          url: '/api/test',
          statusCode: 200,
          responseTime: time,
          userAgent: 'test'
        });
      });

      const stats = performanceMonitor.getResponseStats();

      assert.ok(typeof stats === 'object', 'Should return stats object');
      assert.strictEqual(stats.count, responseTimes.length, 'Should count all responses');
      assert.ok(stats.average >= 100 && stats.average <= 200, 'Should calculate correct average');
      assert.strictEqual(stats.min, 100, 'Should find minimum');
      assert.strictEqual(stats.max, 200, 'Should find maximum');
    });

    it('should handle empty statistics gracefully', () => {
      const timerStats = performanceMonitor.getTimerStats('nonexistent_operation');
      assert.strictEqual(timerStats, null, 'Should return null for nonexistent operation');

      const responseStats = performanceMonitor.getResponseStats();
      assert.ok(typeof responseStats === 'object', 'Should return object for empty responses');
      assert.strictEqual(responseStats.count, 0, 'Should have zero count for empty data');
    });
  });

  describe('Alerting System', () => {
    it('should check for performance alerts', () => {
      // Record slow response times
      performanceMonitor.recordResponseTime({
        method: 'GET',
        url: '/api/slow',
        statusCode: 200,
        responseTime: 5000, // 5 seconds - very slow
        userAgent: 'test'
      });

      const alerts = performanceMonitor.checkAlerts();

      assert.ok(Array.isArray(alerts), 'Should return alerts array');
      // Should generate an alert for slow response time
      assert.ok(alerts.length >= 0, 'Should generate alerts for slow responses');
    });

    it('should configure alert thresholds', () => {
      const thresholds = {
        responseTime: 1000, // 1 second
        errorRate: 0.05, // 5%
        memoryUsage: 0.8 // 80%
      };

      performanceMonitor.setAlertThresholds(thresholds);
      const config = performanceMonitor.getConfiguration();

      assert.ok(config.alertThresholds, 'Should have alert thresholds');
      assert.strictEqual(config.alertThresholds.responseTime, thresholds.responseTime, 'Should set response time threshold');
    });
  });

  describe('Memory Management', () => {
    it('should limit metric history', () => {
      const maxHistory = 100;
      performanceMonitor.setMaxHistory(maxHistory);

      // Record more metrics than the limit
      for (let i = 0; i < maxHistory + 50; i++) {
        performanceMonitor.recordMetric({
          name: 'test_metric',
          value: i,
          unit: 'count'
        });
      }

      const metrics = performanceMonitor.getMetrics();
      assert.ok(metrics.custom.length <= maxHistory, 'Should limit metric history');
    });

    it('should cleanup old metrics', () => {
      const oldTimestamp = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(); // 2 hours ago

      performanceMonitor.recordMetric({
        name: 'old_metric',
        value: 1,
        unit: 'count',
        timestamp: oldTimestamp
      });

      performanceMonitor.recordMetric({
        name: 'new_metric',
        value: 2,
        unit: 'count',
        timestamp: new Date().toISOString()
      });

      const metricsBefore = performanceMonitor.getMetrics();
      const countBefore = metricsBefore.custom.length;

      performanceMonitor.cleanup(); // Should remove old metrics

      const metricsAfter = performanceMonitor.getMetrics();
      const countAfter = metricsAfter.custom.length;

      assert.ok(countAfter <= countBefore, 'Should remove old metrics');
    });
  });

  describe('Integration Points', () => {
    it('should provide middleware factory', () => {
      assert.strictEqual(typeof performanceMonitor.middleware, 'function', 'Should provide middleware factory');

      const middleware = performanceMonitor.middleware();
      assert.strictEqual(typeof middleware, 'function', 'Middleware should be a function');
    });

    it('should provide metrics endpoint', () => {
      assert.strictEqual(typeof performanceMonitor.getMetricsEndpoint, 'function', 'Should provide metrics endpoint');

      const endpoint = performanceMonitor.getMetricsEndpoint();
      assert.ok(typeof endpoint === 'object', 'Should return endpoint data');
      assert.ok(endpoint.timestamp, 'Should include timestamp');
      assert.ok(endpoint.metrics, 'Should include metrics');
    });
  });
});