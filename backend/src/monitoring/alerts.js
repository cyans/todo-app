// @CODE:TAG-DEPLOY-HEALTH-001
// Alerting system for monitoring and notifications

import EventEmitter from 'events';

class AlertManager extends EventEmitter {
  constructor() {
    super();
    this.thresholds = {
      error_rate: 5, // percentage
      response_time: 5000, // milliseconds
      memory_usage: 90, // percentage
      disk_usage: 95, // percentage
      cpu_usage: 80, // percentage
      database_connections: 80, // percentage of max connections
      cache_hit_rate: 70 // minimum percentage
    };

    this.alertHistory = [];
    this.alertCooldowns = new Map(); // Prevent alert spam
    this.setupDefaultHandlers();
  }

  // Set custom thresholds
  setThresholds(newThresholds) {
    this.thresholds = { ...this.thresholds, ...newThresholds };
    this.emit('thresholds:updated', this.thresholds);
  }

  // Check metrics against thresholds and trigger alerts
  checkMetrics(metrics) {
    const alerts = [];

    // Check error rate
    if (metrics.derived.error_rate > this.thresholds.error_rate) {
      alerts.push(this.createAlert('high_error_rate', {
        current: metrics.derived.error_rate,
        threshold: this.thresholds.error_rate,
        severity: this.calculateSeverity('high_error_rate', metrics.derived.error_rate)
      }));
    }

    // Check response time
    if (metrics.derived.avg_response_time > this.thresholds.response_time) {
      alerts.push(this.createAlert('high_response_time', {
        current: metrics.derived.avg_response_time,
        threshold: this.thresholds.response_time,
        severity: this.calculateSeverity('high_response_time', metrics.derived.avg_response_time)
      }));
    }

    // Check memory usage
    const memoryUsagePercent = (metrics.system.memory.heap_used / metrics.system.memory.heap_total) * 100;
    if (memoryUsagePercent > this.thresholds.memory_usage) {
      alerts.push(this.createAlert('high_memory_usage', {
        current: memoryUsagePercent,
        threshold: this.thresholds.memory_usage,
        severity: this.calculateSeverity('high_memory_usage', memoryUsagePercent)
      }));
    }

    // Check cache hit rate
    if (metrics.cache.ratio < this.thresholds.cache_hit_rate) {
      alerts.push(this.createAlert('low_cache_hit_rate', {
        current: metrics.cache.ratio,
        threshold: this.thresholds.cache_hit_rate,
        severity: this.calculateSeverity('low_cache_hit_rate', metrics.cache.ratio)
      }));
    }

    // Process and emit alerts
    alerts.forEach(alert => this.processAlert(alert));

    return alerts;
  }

  // Check health status and trigger alerts
  checkHealthStatus(healthStatus) {
    const alerts = [];

    // Check overall status
    if (healthStatus.status === 'unhealthy') {
      alerts.push(this.createAlert('service_unhealthy', {
        status: healthStatus.status,
        checks: Object.entries(healthStatus.checks)
          .filter(([name, check]) => check.status !== 'healthy')
          .map(([name, check]) => ({ name, status: check.status })),
        severity: 'critical'
      }));
    }

    // Check specific service dependencies
    Object.entries(healthStatus.checks).forEach(([name, check]) => {
      if (check.status === 'unhealthy') {
        alerts.push(this.createAlert(`dependency_${name}`, {
          dependency: name,
          status: check.status,
          error: check.error,
          severity: 'high'
        }));
      }
    });

    // Process and emit alerts
    alerts.forEach(alert => this.processAlert(alert));

    return alerts;
  }

  // Create alert object
  createAlert(type, data) {
    return {
      id: this.generateAlertId(),
      type,
      timestamp: new Date().toISOString(),
      severity: data.severity || 'medium',
      message: this.generateAlertMessage(type, data),
      data,
      acknowledged: false,
      resolved: false
    };
  }

  // Generate unique alert ID
  generateAlertId() {
    return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Generate alert message
  generateAlertMessage(type, data) {
    const messages = {
      high_error_rate: `Error rate is ${data.current.toFixed(2)}%, exceeding threshold of ${data.threshold}%`,
      high_response_time: `Average response time is ${data.current.toFixed(2)}ms, exceeding threshold of ${data.threshold}ms`,
      high_memory_usage: `Memory usage is ${data.current.toFixed(2)}%, exceeding threshold of ${data.threshold}%`,
      low_cache_hit_rate: `Cache hit rate is ${data.current.toFixed(2)}%, below threshold of ${data.threshold}%`,
      service_unhealthy: `Service is ${data.status}. Unhealthy checks: ${data.checks.map(c => c.name).join(', ')}`,
      dependency_database: 'Database connection is unhealthy',
      dependency_database_disconnected: 'Database connection is unhealthy',
      dependency_cache: 'Cache connection is unhealthy',
      dependency_external_apis: 'External API dependencies are unhealthy',
      database_disconnected: 'Database connection is unhealthy',
      high_memory: 'High memory usage detected',
      high_error_rate_alert: 'High error rate detected'
    };

    return messages[type] || `Alert: ${type}`;
  }

  // Calculate alert severity based on how much threshold is exceeded
  calculateSeverity(type, currentValue) {
    const threshold = this.thresholds[type.replace('high_', '').replace('low_', '')];
    if (!threshold) return 'medium';

    const ratio = currentValue / threshold;

    if (type.includes('high')) {
      if (ratio > 2) return 'critical';
      if (ratio > 1.5) return 'high';
      return 'medium';
    } else if (type.includes('low')) {
      if (ratio < 0.5) return 'critical';
      if (ratio < 0.7) return 'high';
      return 'medium';
    }

    return 'medium';
  }

  // Process alert (check cooldowns, emit events)
  processAlert(alert) {
    // Check if we should suppress this alert due to cooldown
    if (this.isAlertSuppressed(alert)) {
      return;
    }

    // Add to history
    this.alertHistory.push(alert);

    // Keep only last 1000 alerts
    if (this.alertHistory.length > 1000) {
      this.alertHistory = this.alertHistory.slice(-1000);
    }

    // Set cooldown
    this.setAlertCooldown(alert);

    // Emit alert event
    this.emit('alert', alert);

    // Emit severity-specific events
    this.emit(`alert:${alert.severity}`, alert);

    // Log alert
    this.logAlert(alert);
  }

  // Check if alert should be suppressed
  isAlertSuppressed(alert) {
    const cooldownKey = `${alert.type}_${alert.severity}`;
    const cooldown = this.alertCooldowns.get(cooldownKey);

    if (cooldown && Date.now() - cooldown < this.getCooldownDuration(alert.severity)) {
      return true;
    }

    return false;
  }

  // Set alert cooldown
  setAlertCooldown(alert) {
    const cooldownKey = `${alert.type}_${alert.severity}`;
    this.alertCooldowns.set(cooldownKey, Date.now());

    // Clean up old cooldowns
    setTimeout(() => {
      this.alertCooldowns.delete(cooldownKey);
    }, this.getCooldownDuration(alert.severity));
  }

  // Get cooldown duration based on severity
  getCooldownDuration(severity) {
    const durations = {
      low: 5 * 60 * 1000,      // 5 minutes
      medium: 15 * 60 * 1000,   // 15 minutes
      high: 30 * 60 * 1000,     // 30 minutes
      critical: 60 * 60 * 1000  // 1 hour
    };

    return durations[severity] || durations.medium;
  }

  // Log alert
  logAlert(alert) {
    const logLevel = this.getLogLevel(alert.severity);
    const message = `[ALERT:${alert.severity.toUpperCase()}] ${alert.message}`;

    console[logLevel](message, alert.data);
  }

  // Get log level based on severity
  getLogLevel(severity) {
    const levels = {
      low: 'log',
      medium: 'warn',
      high: 'warn',
      critical: 'error'
    };

    return levels[severity] || 'log';
  }

  // Acknowledge alert
  acknowledgeAlert(alertId, acknowledgedBy = 'system') {
    const alert = this.alertHistory.find(a => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
      alert.acknowledgedBy = acknowledgedBy;
      alert.acknowledgedAt = new Date().toISOString();

      this.emit('alert:acknowledged', alert);
      return true;
    }
    return false;
  }

  // Resolve alert
  resolveAlert(alertId, resolvedBy = 'system') {
    const alert = this.alertHistory.find(a => a.id === alertId);
    if (alert) {
      alert.resolved = true;
      alert.resolvedBy = resolvedBy;
      alert.resolvedAt = new Date().toISOString();

      this.emit('alert:resolved', alert);
      return true;
    }
    return false;
  }

  // Get active alerts
  getActiveAlerts() {
    return this.alertHistory.filter(alert => !alert.resolved);
  }

  // Get alert statistics
  getAlertStats() {
    const now = Date.now();
    const last24Hours = now - (24 * 60 * 60 * 1000);
    const last1Hour = now - (60 * 60 * 1000);

    const recentAlerts = this.alertHistory.filter(alert =>
      new Date(alert.timestamp).getTime() > last24Hours
    );

    const lastHourAlerts = recentAlerts.filter(alert =>
      new Date(alert.timestamp).getTime() > last1Hour
    );

    return {
      total: this.alertHistory.length,
      last_24_hours: recentAlerts.length,
      last_hour: lastHourAlerts.length,
      active: this.getActiveAlerts().length,
      by_severity: {
        critical: recentAlerts.filter(a => a.severity === 'critical').length,
        high: recentAlerts.filter(a => a.severity === 'high').length,
        medium: recentAlerts.filter(a => a.severity === 'medium').length,
        low: recentAlerts.filter(a => a.severity === 'low').length
      },
      by_type: this.getAlertsByType(recentAlerts)
    };
  }

  // Get alerts grouped by type
  getAlertsByType(alerts) {
    const grouped = {};
    alerts.forEach(alert => {
      if (!grouped[alert.type]) {
        grouped[alert.type] = 0;
      }
      grouped[alert.type]++;
    });
    return grouped;
  }

  // Setup default event handlers
  setupDefaultHandlers() {
    // Default handler for critical alerts
    this.on('alert:critical', (alert) => {
      // In a real implementation, you might send notifications here
      console.error('🚨 CRITICAL ALERT:', alert.message);
    });

    // Default handler for high severity alerts
    this.on('alert:high', (alert) => {
      console.warn('⚠️ HIGH ALERT:', alert.message);
    });
  }
}

// Create and export singleton instance
const alertManager = new AlertManager();

export default alertManager;