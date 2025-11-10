const { existsSync, readFileSync } = require('fs');
const { join } = require('path');

describe('docker-compose.yml Tests', () => {
  const composeFilePath = join(__dirname, '../docker-compose.yml');

  it('should exist', () => {
    expect(existsSync(composeFilePath)).toBe(true);
  });

  it('should have version 3.x or higher', () => {
    const content = readFileSync(composeFilePath, 'utf-8');
    expect(content).toMatch(/version: ['"]?3\./);
  });

  it('should define services section', () => {
    const content = readFileSync(composeFilePath, 'utf-8');
    expect(content).toMatch(/services:/);
  });

  it('should define frontend service', () => {
    const content = readFileSync(composeFilePath, 'utf-8');
    expect(content).toMatch(/frontend:/);
  });

  it('should define backend service', () => {
    const content = readFileSync(composeFilePath, 'utf-8');
    expect(content).toMatch(/backend:/);
  });

  it('should map frontend port 3000', () => {
    const content = readFileSync(composeFilePath, 'utf-8');
    expect(content).toMatch(/["']?300[0-9]:300[0-9]["']?/);
  });

  it('should map backend port 5000', () => {
    const content = readFileSync(composeFilePath, 'utf-8');
    expect(content).toMatch(/["']?500[0-9]:500[0-9]["']?/);
  });

  it('should use build context for frontend', () => {
    const content = readFileSync(composeFilePath, 'utf-8');
    expect(content).toMatch(/build:\s*\n\s*context:\s*\.\/frontend/);
  });

  it('should use build context for backend', () => {
    const content = readFileSync(composeFilePath, 'utf-8');
    expect(content).toMatch(/build:\s*\n\s*context:\s*\.\/backend/);
  });

  it('should have environment variables', () => {
    const content = readFileSync(composeFilePath, 'utf-8');
    expect(content).toMatch(/environment:/);
  });

  it('should have health checks', () => {
    const content = readFileSync(composeFilePath, 'utf-8');
    const healthCheck = content.includes('healthcheck:') ||
                       content.includes('HEALTHCHECK') ||
                       content.includes('healthcheck:');
    expect(healthCheck).toBe(true);
  });

  it('should have restart policy', () => {
    const content = readFileSync(composeFilePath, 'utf-8');
    const restartPolicy = content.includes('restart:') ||
                         content.includes('unless-stopped') ||
                         content.includes('always');
    expect(restartPolicy).toBe(true);
  });

  it('should have volumes for data persistence', () => {
    const content = readFileSync(composeFilePath, 'utf-8');
    const hasVolumes = content.includes('volumes:') || content.includes('node_modules');
    expect(hasVolumes).toBe(true);
  });
});