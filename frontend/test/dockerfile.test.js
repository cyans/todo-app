import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { describe, it, expect } from 'vitest';

describe('Dockerfile.frontend Tests', () => {
  const dockerfilePath = join(__dirname, '../Dockerfile');

  it('should exist', () => {
    expect(existsSync(dockerfilePath)).toBe(true);
  });

  it('should contain production-ready Node.js base image', () => {
    const content = readFileSync(dockerfilePath, 'utf-8');
    expect(content).toMatch(/FROM node:.*-alpine/);
  });

  it('should set working directory', () => {
    const content = readFileSync(dockerfilePath, 'utf-8');
    expect(content).toMatch(/WORKDIR \/app/);
  });

  it('should copy package files first for caching', () => {
    const content = readFileSync(dockerfilePath, 'utf-8');
    const packageJsonCopy = content.includes('COPY package*.json ./');
    expect(packageJsonCopy).toBe(true);
  });

  it('should run npm ci for production', () => {
    const content = readFileSync(dockerfilePath, 'utf-8');
    expect(content).toMatch(/RUN npm ci --only=production/);
  });

  it('should copy source code', () => {
    const content = readFileSync(dockerfilePath, 'utf-8');
    expect(content).toMatch(/COPY \. ./);
  });

  it('should build the application', () => {
    const content = readFileSync(dockerfilePath, 'utf-8');
    expect(content).toMatch(/RUN npm run build/);
  });

  it('should expose port 3000', () => {
    const content = readFileSync(dockerfilePath, 'utf-8');
    expect(content).toMatch(/EXPOSE 3000/);
  });

  it('should set non-root user', () => {
    const content = readFileSync(dockerfilePath, 'utf-8');
    expect(content).toMatch(/USER node/);
  });

  it('should use nginx for serving', () => {
    const content = readFileSync(dockerfilePath, 'utf-8');
    const nginxMatch = content.includes('nginx') || content.includes('serve');
    expect(nginxMatch).toBe(true);
  });

  it('should have health check', () => {
    const content = readFileSync(dockerfilePath, 'utf-8');
    const healthCheck = content.includes('HEALTHCHECK') || content.includes('healthcheck');
    expect(healthCheck).toBe(true);
  });
});