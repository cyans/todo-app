// @CODE:TAG-DEPLOY-SECURITY-001
// Security hardening and middleware system

import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import logger from '../utils/logger.js';
import performanceMonitor from '../utils/performanceMonitor.js';

class SecurityMiddleware {
  constructor() {
    this.config = {
      headers: {
        // Helmet configuration
        contentSecurityPolicy: {
          directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'"],
            fontSrc: ["'self'"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"],
            childSrc: ["'none'"],
            workerSrc: ["'self'"],
            manifestSrc: ["'self'"],
            upgradeInsecureRequests: []
          }
        },
        crossOriginEmbedderPolicy: false,
        hsts: {
          maxAge: 31536000,
          includeSubDomains: true,
          preload: true
        }
      },
      rateLimit: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100, // limit each IP to 100 requests per windowMs
        message: {
          error: 'Too many requests from this IP, please try again later.',
          retryAfter: '15 minutes'
        },
        standardHeaders: true,
        legacyHeaders: false,
        handler: (req, res) => {
          logger.security('rate_limit_exceeded', {
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            url: req.originalUrl,
            method: req.method
          });

          res.status(429).json({
            error: 'Too many requests',
            message: 'Rate limit exceeded. Please try again later.',
            retryAfter: Math.ceil(this.config.rateLimit.windowMs / 1000)
          });
        }
      },
      cors: {
        origin: function (origin, callback) {
          // Allow requests with no origin (like mobile apps or curl requests)
          if (!origin) return callback(null, true);

          const allowedOrigins = process.env.ALLOWED_ORIGINS
            ? process.env.ALLOWED_ORIGINS.split(',')
            : ['http://localhost:3000', 'http://localhost:3001'];

          if (process.env.NODE_ENV === 'development' || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
          } else {
            logger.security('cors_origin_blocked', {
              origin,
              ip: req.ip,
              userAgent: req.get('User-Agent')
            });
            callback(new Error('Not allowed by CORS'));
          }
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: [
          'Origin',
          'X-Requested-With',
          'Content-Type',
          'Accept',
          'Authorization',
          'Cache-Control',
          'X-API-Key'
        ],
        exposedHeaders: ['X-Total-Count'],
        maxAge: 86400 // 24 hours
      },
      ipBlocking: {
        maxFailedAttempts: 10,
        blockDuration: 60 * 60 * 1000, // 1 hour
        suspiciousPatterns: [
          /sql/i,
          /union.*select/i,
          /script.*>/i,
          /javascript:/i,
          /<.*iframe/i,
          /document\.cookie/i,
          /eval\(/i
        ]
      },
      inputSanitization: {
        maxPayloadSize: '10mb',
        allowedMimeTypes: [
          'application/json',
          'application/x-www-form-urlencoded',
          'multipart/form-data'
        ],
        sanitizationRules: {
          // Remove or escape dangerous characters
          '<script': '&lt;script',
          '</script>': '&lt;/script&gt;',
          'javascript:': 'removed:',
          'on\\w+\\s*=': 'removed=' // onclick=, onload=, etc.
        }
      }
    };

    this.blockedIPs = new Map(); // IP -> { blockedAt, reason, attempts }
    this.failedAttempts = new Map(); // IP -> { count, lastAttempt }
    this.securityAudit = [];
    this.suspiciousActivity = new Map(); // IP -> activity count
  }

  // Main middleware function
  middleware() {
    const securityMiddleware = (req, res, next) => {
      const startTime = Date.now();

      // Add security methods to request object
      req.security = {
        logEvent: (event, metadata) => this.logSecurityEvent(event, { ...metadata, req }),
        recordFailedAttempt: (reason) => this.recordFailedAttempt(req.ip, reason),
        isIPBlocked: () => this.isIPBlocked(req.ip)
      };

      // Check if IP is blocked
      if (this.isIPBlocked(req.ip)) {
        this.logSecurityEvent('blocked_ip_access_attempt', {
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          url: req.originalUrl,
          method: req.method
        });

        return res.status(403).json({
          error: 'Access Denied',
          message: 'Your IP address has been blocked due to suspicious activity.'
        });
      }

      // Check for suspicious patterns in request
      if (this.isSuspiciousRequest(req)) {
        this.logSecurityEvent('suspicious_request_detected', {
          ip: req.ip,
          url: req.originalUrl,
          method: req.method,
          userAgent: req.get('User-Agent'),
          headers: req.headers
        });

        this.recordFailedAttempt(req.ip, 'suspicious_pattern');
      }

      // Log security events for monitoring
      this.logSecurityEvent('request_started', {
        ip: req.ip,
        method: req.method,
        url: req.originalUrl,
        userAgent: req.get('User-Agent'),
        referer: req.get('Referer')
      });

      // Override res.end to log response completion
      const originalEnd = res.end;
      res.end = function(...args) {
        const duration = Date.now() - startTime;

        // Log completion with security context
        this.logSecurityEvent('request_completed', {
          ip: req.ip,
          method: req.method,
          url: req.originalUrl,
          statusCode: res.statusCode,
          duration,
          responseSize: res.get('Content-Length') || 0
        });

        // Log errors for security monitoring
        if (res.statusCode >= 400) {
          this.logSecurityEvent('error_response', {
            ip: req.ip,
            method: req.method,
            url: req.originalUrl,
            statusCode: res.statusCode,
            userAgent: req.get('User-Agent')
          });
        }

        originalEnd.apply(this, args);
      }.bind(this);

      // Apply input sanitization
      this.sanitizeInput(req);

      next();
    };

    return securityMiddleware;
  }

  // Security headers middleware using Helmet
  getHelmetMiddleware() {
    return helmet(this.config.headers);
  }

  // Rate limiting middleware
  getRateLimitMiddleware() {
    return rateLimit(this.config.rateLimit);
  }

  // CORS middleware
  getCorsMiddleware() {
    return cors(this.config.cors);
  }

  // Complete security middleware stack
  getSecurityStack() {
    return [
      this.getHelmetMiddleware(),
      this.getCorsMiddleware(),
      this.getRateLimitMiddleware(),
      this.middleware()
    ];
  }

  // Check if request contains suspicious patterns
  isSuspiciousRequest(req) {
    const suspiciousPatterns = this.config.ipBlocking.suspiciousPatterns;
    const contentToCheck = [
      req.url,
      req.get('User-Agent') || '',
      req.get('Referer') || '',
      JSON.stringify(req.headers)
    ].join(' ').toLowerCase();

    return suspiciousPatterns.some(pattern => pattern.test(contentToCheck));
  }

  // Sanitize request input
  sanitizeInput(req) {
    // Sanitize query parameters
    if (req.query) {
      req.query = this.sanitizeObject(req.query);
    }

    // Sanitize body if it exists
    if (req.body) {
      req.body = this.sanitizeObject(req.body);
    }

    // Sanitize URL parameters
    if (req.params) {
      req.params = this.sanitizeObject(req.params);
    }
  }

  // Sanitize object properties recursively
  sanitizeObject(obj) {
    if (typeof obj !== 'object' || obj === null) {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitizeObject(item));
    }

    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        sanitized[key] = this.sanitizeString(value);
      } else if (typeof value === 'object') {
        sanitized[key] = this.sanitizeObject(value);
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  // Sanitize string input
  sanitizeString(str) {
    let sanitized = str;

    const rules = this.config.inputSanitization.sanitizationRules;
    for (const [pattern, replacement] of Object.entries(rules)) {
      const regex = new RegExp(pattern, 'gi');
      sanitized = sanitized.replace(regex, replacement);
    }

    return sanitized;
  }

  // Record failed attempt for IP
  recordFailedAttempt(ip, reason) {
    const current = this.failedAttempts.get(ip) || { count: 0, lastAttempt: null };
    current.count++;
    current.lastAttempt = new Date();
    current.reasons = current.reasons || [];
    current.reasons.push(reason);

    this.failedAttempts.set(ip, current);

    // Block IP if too many failed attempts
    if (current.count >= this.config.ipBlocking.maxFailedAttempts) {
      this.blockIP(ip, 'too_many_failed_attempts');
    }

    this.logSecurityEvent('failed_attempt_recorded', {
      ip,
      reason,
      attemptCount: current.count,
      maxAttempts: this.config.ipBlocking.maxFailedAttempts
    });
  }

  // Block an IP address
  blockIP(ip, reason = 'manual_block') {
    this.blockedIPs.set(ip, {
      blockedAt: new Date(),
      reason,
      attempts: this.failedAttempts.get(ip)?.count || 0
    });

    this.logSecurityEvent('ip_blocked', {
      ip,
      reason,
      blockedAt: new Date(),
      attempts: this.failedAttempts.get(ip)?.count || 0
    });

    logger.warn('IP address blocked', { ip, reason });
  }

  // Unblock an IP address
  unblockIP(ip) {
    const wasBlocked = this.blockedIPs.has(ip);
    this.blockedIPs.delete(ip);
    this.failedAttempts.delete(ip);

    if (wasBlocked) {
      this.logSecurityEvent('ip_unblocked', {
        ip,
        unblockedAt: new Date()
      });

      logger.info('IP address unblocked', { ip });
    }
  }

  // Check if IP is blocked
  isIPBlocked(ip) {
    const blocked = this.blockedIPs.get(ip);
    if (!blocked) {
      return false;
    }

    // Check if block has expired
    const blockDuration = this.config.ipBlocking.blockDuration;
    const now = Date.now();
    const blockedAt = new Date(blocked.blockedAt).getTime();

    if (now - blockedAt > blockDuration) {
      this.blockedIPs.delete(ip);
      return false;
    }

    return true;
  }

  // Log security event
  logSecurityEvent(event, metadata = {}) {
    const securityEvent = {
      event,
      timestamp: new Date().toISOString(),
      ...metadata
    };

    // Add to audit log
    this.securityAudit.push(securityEvent);

    // Keep audit log size manageable
    if (this.securityAudit.length > 10000) {
      this.securityAudit = this.securityAudit.slice(-5000);
    }

    // Log with structured logger
    logger.security(event, securityEvent);

    // Track suspicious activity by IP
    const ip = metadata.ip;
    if (ip) {
      const current = this.suspiciousActivity.get(ip) || 0;
      this.suspiciousActivity.set(ip, current + 1);
    }
  }

  // Get security configuration
  getSecurityConfig() {
    return { ...this.config };
  }

  // Update security configuration
  updateConfig(newConfig) {
    this.config = {
      ...this.config,
      ...newConfig,
      headers: { ...this.config.headers, ...newConfig.headers },
      rateLimit: { ...this.config.rateLimit, ...newConfig.rateLimit },
      cors: { ...this.config.cors, ...newConfig.cors },
      ipBlocking: { ...this.config.ipBlocking, ...newConfig.ipBlocking },
      inputSanitization: { ...this.config.inputSanitization, ...newConfig.inputSanitization }
    };

    this.logSecurityEvent('security_config_updated', {
      updatedKeys: Object.keys(newConfig)
    });
  }

  // Get security audit log
  getSecurityAudit(options = {}) {
    const {
      limit = 100,
      offset = 0,
      event,
      ip,
      startDate,
      endDate
    } = options;

    let filtered = [...this.securityAudit];

    // Apply filters
    if (event) {
      filtered = filtered.filter(entry => entry.event === event);
    }

    if (ip) {
      filtered = filtered.filter(entry => entry.ip === ip);
    }

    if (startDate) {
      filtered = filtered.filter(entry => new Date(entry.timestamp) >= new Date(startDate));
    }

    if (endDate) {
      filtered = filtered.filter(entry => new Date(entry.timestamp) <= new Date(endDate));
    }

    // Sort by timestamp (newest first)
    filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Apply pagination
    return {
      total: filtered.length,
      entries: filtered.slice(offset, offset + limit),
      summary: this.getSecuritySummary()
    };
  }

  // Get security summary
  getSecuritySummary() {
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last1h = new Date(now.getTime() - 60 * 60 * 1000);

    const recentEvents = this.securityAudit.filter(event => new Date(event.timestamp) > last24h);
    const recentEvents1h = this.securityAudit.filter(event => new Date(event.timestamp) > last1h);

    const eventsByType = {};
    recentEvents.forEach(event => {
      eventsByType[event.event] = (eventsByType[event.event] || 0) + 1;
    });

    const topIPs = {};
    recentEvents.forEach(event => {
      if (event.ip) {
        topIPs[event.ip] = (topIPs[event.ip] || 0) + 1;
      }
    });

    return {
      totalEvents: recentEvents.length,
      eventsLastHour: recentEvents1h.length,
      blockedIPs: this.blockedIPs.size,
      failedAttempts: this.failedAttempts.size,
      eventsByType,
      topIPs: Object.entries(topIPs)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([ip, count]) => ({ ip, count })),
      generatedAt: now.toISOString()
    };
  }

  // Clean up old security data
  cleanup() {
    const cutoffTime = Date.now() - (7 * 24 * 60 * 60 * 1000); // 7 days ago

    // Clean audit log
    this.securityAudit = this.securityAudit.filter(
      event => new Date(event.timestamp).getTime() > cutoffTime
    );

    // Clean failed attempts
    for (const [ip, attempts] of this.failedAttempts.entries()) {
      if (new Date(attempts.lastAttempt).getTime() < cutoffTime) {
        this.failedAttempts.delete(ip);
      }
    }

    // Clean suspicious activity
    for (const [ip] of this.suspiciousActivity.entries()) {
      // Keep suspicious activity data longer for analysis
      if (this.suspiciousActivity.get(ip) < 5) { // Low activity IPs
        this.suspiciousActivity.delete(ip);
      }
    }

    this.logSecurityEvent('security_cleanup_completed', {
      auditLogSize: this.securityAudit.length,
      failedAttemptsCount: this.failedAttempts.size,
      suspiciousActivityCount: this.suspiciousActivity.size
    });
  }

  // Get metrics for monitoring
  getMetrics() {
    return {
      blockedIPs: this.blockedIPs.size,
      failedAttempts: Array.from(this.failedAttempts.entries()).map(([ip, data]) => ({
        ip,
        ...data
      })),
      suspiciousActivity: Object.fromEntries(this.suspiciousActivity),
      auditLogSize: this.securityAudit.length,
      recentSecurityEvents: this.securityAudit.slice(-50)
    };
  }
}

// Create and export singleton instance
const securityMiddlewareInstance = new SecurityMiddleware();

// Start automatic cleanup (daily)
setInterval(() => {
  securityMiddlewareInstance.cleanup();
}, 24 * 60 * 60 * 1000);

export default securityMiddlewareInstance;