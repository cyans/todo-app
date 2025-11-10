// @TEST:TAG-DEPLOY-SECURITY-001
// Security hardening and middleware tests

import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import http from 'http';
import express from 'express';

// Import security middleware after it's created
import securityMiddleware from './security.js';

describe('Security Middleware System', () => {
  let app;
  let server;

  beforeEach(() => {
    app = express();
    app.use(securityMiddleware);
    app.get('/test', (req, res) => res.json({ message: 'test' }));
    app.post('/test', (req, res) => res.json({ received: req.body }));
  });

  afterEach(() => {
    if (server) {
      server.close();
    }
  });

  describe('Security Headers', () => {
    it('should set security headers', (done) => {
      server = app.listen(0, () => {
        const port = server.address().port;

        http.get(`http://localhost:${port}/test`, (res) => {
          assert.strictEqual(res.statusCode, 200);

          // Check for important security headers
          assert.ok(res.headers['x-frame-options'], 'Should set X-Frame-Options');
          assert.ok(res.headers['x-content-type-options'], 'Should set X-Content-Type-Options');
          assert.ok(res.headers['x-xss-protection'], 'Should set X-XSS-Protection');
          assert.ok(res.headers['strict-transport-security'], 'Should set HSTS');

          res.resume();
          server.close();
          done();
        });
      });
    });

    it('should prevent content type sniffing', (done) => {
      server = app.listen(0, () => {
        const port = server.address().port;

        http.get(`http://localhost:${port}/test`, (res) => {
          assert.strictEqual(res.headers['x-content-type-options'], 'nosniff');
          res.resume();
          server.close();
          done();
        });
      });
    });

    it('should set proper CSP headers', (done) => {
      server = app.listen(0, () => {
        const port = server.address().port;

        http.get(`http://localhost:${port}/test`, (res) => {
          const csp = res.headers['content-security-policy'];
          assert.ok(csp, 'Should set Content-Security-Policy');
          assert.ok(csp.includes("default-src 'self'"), 'Should have restrictive default source');
          res.resume();
          server.close();
          done();
        });
      });
    });
  });

  describe('Rate Limiting', () => {
    it('should allow requests within rate limit', (done) => {
      server = app.listen(0, () => {
        const port = server.address().port;
        let requestCount = 0;

        // Make 5 requests quickly (should be allowed)
        for (let i = 0; i < 5; i++) {
          http.get(`http://localhost:${port}/test`, (res) => {
            assert.strictEqual(res.statusCode, 200);
            requestCount++;

            if (requestCount === 5) {
              res.resume();
              server.close();
              done();
            }
            res.resume();
          });
        }
      });
    });

    it('should have rate limiting headers', (done) => {
      server = app.listen(0, () => {
        const port = server.address().port;

        http.get(`http://localhost:${port}/test`, (res) => {
          assert.ok(res.headers['x-ratelimit-limit'], 'Should have rate limit header');
          assert.ok(res.headers['x-ratelimit-remaining'], 'Should have rate remaining header');
          assert.ok(res.headers['x-ratelimit-reset'], 'Should have rate reset header');

          res.resume();
          server.close();
          done();
        });
      });
    });
  });

  describe('Input Validation', () => {
    it('should sanitize request inputs', (done) => {
      const maliciousScript = '<script>alert("xss")</script>';

      server = app.listen(0, () => {
        const port = server.address().port;
        const postData = JSON.stringify({ input: maliciousScript });

        const options = {
          hostname: 'localhost',
          port: port,
          path: '/test',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData)
          }
        };

        const req = http.request(options, (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => {
            // Input should be sanitized
            const response = JSON.parse(data);
            assert.ok(!response.received.input.includes('<script>'), 'Should sanitize script tags');
            server.close();
            done();
          });
        });

        req.write(postData);
        req.end();
      });
    });

    it('should reject oversized requests', (done) => {
      // Create very large payload (should be rejected)
      const largePayload = {
        data: 'x'.repeat(10 * 1024 * 1024) // 10MB
      };

      server = app.listen(0, () => {
        const port = server.address().port;
        const postData = JSON.stringify(largePayload);

        const options = {
          hostname: 'localhost',
          port: port,
          path: '/test',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData)
          }
        };

        const req = http.request(options, (res) => {
          // Should reject oversized requests
          assert.ok(res.statusCode >= 400, 'Should reject oversized requests');
          server.close();
          done();
        });

        req.on('error', () => {
          // Connection errors are acceptable for oversized requests
          server.close();
          done();
        });

        req.write(postData);
        req.end();
      });
    });
  });

  describe('CORS Configuration', () => {
    it('should handle CORS headers properly', (done) => {
      server = app.listen(0, () => {
        const port = server.address().port;

        const options = {
          hostname: 'localhost',
          port: port,
          path: '/test',
          method: 'OPTIONS',
          headers: {
            'Origin': 'http://localhost:3000',
            'Access-Control-Request-Method': 'POST'
          }
        };

        const req = http.request(options, (res) => {
          assert.ok(res.headers['access-control-allow-origin'], 'Should set CORS origin');
          assert.ok(res.headers['access-control-allow-methods'], 'Should set CORS methods');
          assert.strictEqual(res.statusCode, 200, 'Should handle OPTIONS requests');

          res.resume();
          server.close();
          done();
        });

        req.end();
      });
    });
  });

  describe('IP Blocking', () => {
    it('should handle suspicious IPs', () => {
      // Test IP blocking functionality
      assert.strictEqual(typeof securityMiddleware.blockIP, 'function', 'Should have IP blocking method');
      assert.strictEqual(typeof securityMiddleware.unblockIP, 'function', 'Should have IP unblocking method');
    });

    it('should track failed attempts', () => {
      // Test failed attempt tracking
      assert.strictEqual(typeof securityMiddleware.recordFailedAttempt, 'function', 'Should record failed attempts');
      assert.strictEqual(typeof securityMiddleware.isIPBlocked, 'function', 'Should check IP blocking status');
    });
  });

  describe('Security Configuration', () => {
    it('should provide security configuration', () => {
      const config = securityMiddleware.getSecurityConfig();
      assert.ok(typeof config === 'object', 'Should return security configuration');
      assert.ok(config.headers, 'Should have headers configuration');
      assert.ok(config.rateLimit, 'Should have rate limiting configuration');
      assert.ok(config.cors, 'Should have CORS configuration');
    });

    it('should allow configuration updates', () => {
      const newConfig = {
        rateLimit: { windowMs: 900000, max: 150 },
        headers: { hsts: { maxAge: 31536000 } }
      };

      assert.doesNotThrow(() => {
        securityMiddleware.updateConfig(newConfig);
      }, 'Should allow configuration updates');

      const updatedConfig = securityMiddleware.getSecurityConfig();
      assert.strictEqual(updatedConfig.rateLimit.windowMs, 900000, 'Should update rate limit config');
    });
  });

  describe('Security Audit', () => {
    it('should provide security audit log', () => {
      const auditLog = securityMiddleware.getSecurityAudit();
      assert.ok(Array.isArray(auditLog), 'Should return audit log array');
      assert.ok(typeof auditLog.getSecurityEvents === 'function', 'Should have security events getter');
    });

    it('should log security events', () => {
      // Test security event logging
      assert.doesNotThrow(() => {
        securityMiddleware.logSecurityEvent('test_event', { ip: '127.0.0.1' });
      }, 'Should log security events');
    });
  });

  describe('Middleware Integration', () => {
    it('should work as Express middleware', () => {
      // Test that middleware can be applied to Express app
      assert.strictEqual(typeof securityMiddleware, 'function', 'Should be a middleware function');
    });

    it('should handle error cases gracefully', () => {
      // Test error handling
      const mockReq = {
        method: 'GET',
        url: '/test',
        ip: '127.0.0.1',
        get: () => 'test'
      };

      const mockRes = {
        setHeader: () => {},
        status: () => mockRes,
        json: () => {}
      };

      const mockNext = () => {};

      assert.doesNotThrow(() => {
        securityMiddleware(mockReq, mockRes, mockNext);
      }, 'Should handle requests without errors');
    });
  });
});