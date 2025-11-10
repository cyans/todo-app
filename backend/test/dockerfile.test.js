const { existsSync, readFileSync } = require('fs');
const { join } = require('path');

describe('Dockerfile.backend Tests', () => {
  const dockerfilePath = join(__dirname, '../Dockerfile');

  it('should exist', () => {
    expect(existsSync(dockerfilePath)).toBe(true);
  });

  it('should contain Node.js base image', () => {
    const content = readFileSync(dockerfilePath, 'utf-8');
    expect(content).toMatch(/FROM node:/);
  });

  it('should set working directory', () => {
    const content = readFileSync(dockerfilePath, 'utf-8');
    expect(content).toMatch(/WORKDIR \/app/);
  });

  it('should copy package files first for caching', () => {
    const content = readFileSync(dockerfilePath, 'utf-8');
    expect(content).toMatch(/COPY package\*.json \./);
  });

  it('should install dependencies', () => {
    const content = readFileSync(dockerfilePath, 'utf-8');
    expect(content).toMatch(/RUN npm ci/);
  });

  it('should copy source code', () => {
    const content = readFileSync(dockerfilePath, 'utf-8');
    expect(content).toMatch(/COPY \. ./);
  });

  it('should expose port 5000', () => {
    const content = readFileSync(dockerfilePath, 'utf-8');
    expect(content).toMatch(/EXPOSE 5000/);
  });

  it('should set non-root user', () => {
    const content = readFileSync(dockerfilePath, 'utf-8');
    expect(content).toMatch(/USER node/);
  });

  it('should have health check', () => {
    const content = readFileSync(dockerfilePath, 'utf-8');
    const healthCheck = content.includes('HEALTHCHECK') || content.includes('healthcheck');
    expect(healthCheck).toBe(true);
  });

  it('should set environment variables', () => {
    const content = readFileSync(dockerfilePath, 'utf-8');
    expect(content).toMatch(/ENV NODE_ENV=production/);
  });

  it('should use dockerignore file', () => {
    const content = readFileSync(dockerfilePath, 'utf-8');
    const dockerignoreCheck = content.includes('.dockerignore') ||
      (existsSync(join(__dirname, '../.dockerignore')) && true);
    expect(dockerignoreCheck).toBe(true);
  });

  it('should have security best practices', () => {
    const content = readFileSync(dockerfilePath, 'utf-8');
    const hasSecurity = content.includes('USER node') ||
      content.includes('adduser') ||
      content.includes('addgroup');
    expect(hasSecurity).toBe(true);
  });
});