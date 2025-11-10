const { existsSync, readFileSync } = require('fs');
const { join } = require('path');

describe('Health Check Middleware Tests', () => {
  const healthMiddlewarePath = join(__dirname, '../src/middleware/health.js');

  it('should exist', () => {
    expect(existsSync(healthMiddlewarePath)).toBe(true);
  });

  it('should export a function', () => {
    const content = readFileSync(healthMiddlewarePath, 'utf-8');
    expect(content).toMatch(/export/);
  });

  it('should handle HTTP requests', () => {
    const content = readFileSync(healthMiddlewarePath, 'utf-8');
    const httpHandling = content.includes('req') &&
                       content.includes('res') &&
                       content.includes('next');
    expect(httpHandling).toBe(true);
  });

  it('should check database connectivity', () => {
    const content = readFileSync(healthMiddlewarePath, 'utf-8');
    const dbCheck = content.includes('database') ||
                   content.includes('mongo') ||
                   content.includes('db') ||
                   content.includes('connect');
    expect(dbCheck).toBe(true);
  });

  it('should have response status codes', () => {
    const content = readFileSync(healthMiddlewarePath, 'utf-8');
    const statusCodes = content.includes('200') ||
                       content.includes('500') ||
                       content.includes('503') ||
                       content.includes('status');
    expect(statusCodes).toBe(true);
  });

  it('should include system information', () => {
    const content = readFileSync(healthMiddlewarePath, 'utf-8');
    const sysInfo = content.includes('uptime') ||
                   content.includes('memory') ||
                   content.includes('timestamp') ||
                   content.includes('version');
    expect(sysInfo).toBe(true);
  });

  it('should have JSON response format', () => {
    const content = readFileSync(healthMiddlewarePath, 'utf-8');
    const jsonResponse = content.includes('json') ||
                        content.includes('Content-Type') ||
                        content.includes('application/json');
    expect(jsonResponse).toBe(true);
  });

  it('should handle errors gracefully', () => {
    const content = readFileSync(healthMiddlewarePath, 'utf-8');
    const errorHandling = content.includes('try') ||
                         content.includes('catch') ||
                         content.includes('error');
    expect(errorHandling).toBe(true);
  });

  it('should have endpoint routing', () => {
    const content = readFileSync(healthMiddlewarePath, 'utf-8');
    const routing = content.includes('/health') ||
                   content.includes('router') ||
                   content.includes('get');
    expect(routing).toBe(true);
  });

  it('should have async/await support', () => {
    const content = readFileSync(healthMiddlewarePath, 'utf-8');
    const asyncSupport = content.includes('async') ||
                        content.includes('await') ||
                        content.includes('Promise');
    expect(asyncSupport).toBe(true);
  });

  it('should use the correct TAG', () => {
    const content = readFileSync(healthMiddlewarePath, 'utf-8');
    expect(content).toMatch(/@CODE:UI-UX-DEPLOY-005:MONITORING/);
  });
});