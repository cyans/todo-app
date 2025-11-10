const { existsSync, readFileSync } = require('fs');
const { join } = require('path');

describe('healthcheck.js Tests', () => {
  const healthcheckPath = join(__dirname, '../healthcheck.js');

  it('should exist', () => {
    expect(existsSync(healthcheckPath)).toBe(true);
  });

  it('should import http module', () => {
    const content = readFileSync(healthcheckPath, 'utf-8');
    expect(content).toMatch(/import.*http/);
  });

  it('should define request options', () => {
    const content = readFileSync(healthcheckPath, 'utf-8');
    expect(content).toMatch(/const options = \{/);
  });

  it('should use localhost as host', () => {
    const content = readFileSync(healthcheckPath, 'utf-8');
    expect(content).toMatch(/host: ['"']localhost['"']/);
  });

  it('should use port 5000 or environment variable', () => {
    const content = readFileSync(healthcheckPath, 'utf-8');
    expect(content).toMatch(/port: process\.env\.PORT.*5000/);
  });

  it('should check /health endpoint', () => {
    const content = readFileSync(healthcheckPath, 'utf-8');
    expect(content).toMatch(/path: ['"']\/health['"']/);
  });

  it('should have timeout configuration', () => {
    const content = readFileSync(healthcheckPath, 'utf-8');
    expect(content).toMatch(/timeout:/);
  });

  it('should handle successful response', () => {
    const content = readFileSync(healthcheckPath, 'utf-8');
    expect(content).toMatch(/if.*res\.statusCode === 200/);
  });

  it('should handle errors', () => {
    const content = readFileSync(healthcheckPath, 'utf-8');
    expect(content).toMatch(/request\.on\(['"']error['"']/);
  });

  it('should handle timeouts', () => {
    const content = readFileSync(healthcheckPath, 'utf-8');
    expect(content).toMatch(/request\.on\(['"']timeout['"']/);
  });

  it('should exit with appropriate codes', () => {
    const content = readFileSync(healthcheckPath, 'utf-8');
    expect(content).toMatch(/process\.exit\(0\)/);  // Success
    expect(content).toMatch(/process\.exit\(1\)/);  // Failure
  });

  it('should use the correct TAG', () => {
    const content = readFileSync(healthcheckPath, 'utf-8');
    expect(content).toMatch(/@CODE:UI-UX-DEPLOY-005:DEPLOY-INFRA/);
  });
});