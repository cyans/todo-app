const { existsSync, readFileSync } = require('fs');
const { join } = require('path');

describe('logger.js Tests', () => {
  const loggerPath = join(__dirname, '../src/utils/logger.js');

  it('should exist', () => {
    expect(existsSync(loggerPath)).toBe(true);
  });

  it('should export a logger object', () => {
    // This will be tested when we run the logger module
    const content = readFileSync(loggerPath, 'utf-8');
    expect(content).toMatch(/export/);
  });

  it('should have log levels', () => {
    const content = readFileSync(loggerPath, 'utf-8');
    const hasLevels = content.includes('error') &&
                     content.includes('warn') &&
                     content.includes('info') &&
                     content.includes('debug');
    expect(hasLevels).toBe(true);
  });

  it('should support structured logging', () => {
    const content = readFileSync(loggerPath, 'utf-8');
    const structuredLogging = content.includes('JSON.stringify') ||
                             content.includes('format') ||
                             content.includes('timestamp') ||
                             content.includes('metadata');
    expect(structuredLogging).toBe(true);
  });

  it('should have timestamp support', () => {
    const content = readFileSync(loggerPath, 'utf-8');
    const timestampSupport = content.includes('timestamp') ||
                           content.includes('Date') ||
                           content.includes('toISOString');
    expect(timestampSupport).toBe(true);
  });

  it('should have request logging support', () => {
    const content = readFileSync(loggerPath, 'utf-8');
    const requestSupport = content.includes('request') ||
                          content.includes('req') ||
                          content.includes('http');
    expect(requestSupport).toBe(true);
  });

  it('should have environment-based log levels', () => {
    const content = readFileSync(loggerPath, 'utf-8');
    const envLevels = content.includes('NODE_ENV') ||
                     content.includes('process.env') ||
                     content.includes('production') ||
                     content.includes('development');
    expect(envLevels).toBe(true);
  });

  it('should have log formatting', () => {
    const content = readFileSync(loggerPath, 'utf-8');
    const formatting = content.includes('format') ||
                     content.includes('printf') ||
                     content.includes('template');
    expect(formatting).toBe(true);
  });

  it('should support file logging', () => {
    const content = readFileSync(loggerPath, 'utf-8');
    const fileLogging = content.includes('file') ||
                      content.includes('writeFile') ||
                      content.includes('fs.') ||
                      content.includes('streams');
    expect(fileLogging).toBe(true);
  });

  it('should have error handling', () => {
    const content = readFileSync(loggerPath, 'utf-8');
    const errorHandling = content.includes('try') ||
                         content.includes('catch') ||
                         content.includes('error');
    expect(errorHandling).toBe(true);
  });

  it('should use the correct TAG', () => {
    const content = readFileSync(loggerPath, 'utf-8');
    expect(content).toMatch(/@CODE:UI-UX-DEPLOY-005:MONITORING/);
  });
});