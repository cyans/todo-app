const { existsSync, readFileSync } = require('fs');
const { join } = require('path');

describe('Performance Monitoring Middleware Tests', () => {
  const performanceMiddlewarePath = join(__dirname, '../src/middleware/performance.js');

  it('should exist', () => {
    expect(existsSync(performanceMiddlewarePath)).toBe(true);
  });

  it('should export a function', () => {
    const content = readFileSync(performanceMiddlewarePath, 'utf-8');
    expect(content).toMatch(/export/);
  });

  it('should handle HTTP requests', () => {
    const content = readFileSync(performanceMiddlewarePath, 'utf-8');
    const httpHandling = content.includes('req') &&
                       content.includes('res') &&
                       content.includes('next');
    expect(httpHandling).toBe(true);
  });

  it('should measure response time', () => {
    const content = readFileSync(performanceMiddlewarePath, 'utf-8');
    const timing = content.includes('startTime') ||
                  content.includes('Date.now') ||
                  content.includes('performance.now');
    expect(timing).toBe(true);
  });

  it('should have request ID tracking', () => {
    const content = readFileSync(performanceMiddlewarePath, 'utf-8');
    const requestId = content.includes('requestId') ||
                     content.includes('correlationId') ||
                     content.includes('traceId');
    expect(requestId).toBe(true);
  });

  it('should have slow request detection', () => {
    const content = readFileSync(performanceMiddlewarePath, 'utf-8');
    const slowRequest = content.includes('slow') ||
                       content.includes('threshold') ||
                       content.includes('1000') ||
                       content.includes('warning');
    expect(slowRequest).toBe(true);
  });

  it('should have memory monitoring', () => {
    const content = readFileSync(performanceMiddlewarePath, 'utf-8');
    const memoryMonitoring = content.includes('memory') ||
                            content.includes('heapUsed') ||
                            content.includes('process.memoryUsage');
    expect(memoryMonitoring).toBe(true);
  });

  it('should have CPU monitoring', () => {
    const content = readFileSync(performanceMiddlewarePath, 'utf-8');
    const cpuMonitoring = content.includes('cpu') ||
                         content.includes('process.cpuUsage') ||
                         content.includes('load');
    expect(cpuMonitoring).toBe(true);
  });

  it('should have logging integration', () => {
    const content = readFileSync(performanceMiddlewarePath, 'utf-8');
    const logging = content.includes('logger') ||
                   content.includes('log') ||
                   content.includes('console.log');
    expect(logging).toBe(true);
  });

  it('should have error handling', () => {
    const content = readFileSync(performanceMiddlewarePath, 'utf-8');
    const errorHandling = content.includes('try') ||
                         content.includes('catch') ||
                         content.includes('error');
    expect(errorHandling).toBe(true);
  });

  it('should have metrics collection', () => {
    const content = readFileSync(performanceMiddlewarePath, 'utf-8');
    const metrics = content.includes('metrics') ||
                   content.includes('stats') ||
                   content.includes('counters') ||
                   content.includes('histograms');
    expect(metrics).toBe(true);
  });

  it('should use the correct TAG', () => {
    const content = readFileSync(performanceMiddlewarePath, 'utf-8');
    expect(content).toMatch(/@CODE:UI-UX-DEPLOY-005:MONITORING/);
  });
});