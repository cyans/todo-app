// @TEST:TODO-HEALTH-001 | SPEC: SPEC-UI-UX-DEPLOY-005 | CODE: backend/src/monitoring/health.js
/**
 * @TEST:TAG-DEPLOY-HEALTH-001
 * Tests for health checks and monitoring systems
 */

const { execSync } = require('child_process');
const { existsSync, readFileSync } = require('fs');
const { join } = require('path');

describe('Health Checks - TAG-DEPLOY-HEALTH-001', () => {
  const projectRoot = process.cwd();

  describe('Health Check Endpoints', () => {
    it('should have backend health check endpoint', () => {
      const serverFile = readFileSync(join(projectRoot, 'backend', 'server.js'), 'utf8');
      expect(serverFile).toMatch(/\/health/);
      expect(serverFile).toMatch(/status.*OK/);
      expect(serverFile).toMatch(/timestamp/);
    });

    it('should have comprehensive health check module', () => {
      const healthCheckPath = join(projectRoot, 'backend', 'src', 'monitoring', 'health.js');
      expect(existsSync(healthCheckPath)).toBe(true);

      const healthCheck = readFileSync(healthCheckPath, 'utf8');
      expect(healthCheck).toMatch(/database/);
      expect(healthCheck).toMatch(/memory/);
      expect(healthCheck).toMatch(/uptime/);
    });

    it('should have detailed health status reporting', () => {
      const healthCheckPath = join(projectRoot, 'backend', 'src', 'monitoring', 'health.js');
      const healthCheck = readFileSync(healthCheckPath, 'utf8');

      expect(healthCheck).toMatch(/status.*healthy|unhealthy|degraded/);
      expect(healthCheck).toMatch(/timestamp/);
      expect(healthCheck).toMatch(/version/);
    });
  });

  describe('Monitoring System', () => {
    it('should have monitoring infrastructure', () => {
      const monitoringPath = join(projectRoot, 'backend', 'src', 'monitoring', 'index.js');
      expect(existsSync(monitoringPath)).toBe(true);

      const monitoring = readFileSync(monitoringPath, 'utf8');
      expect(monitoring).toMatch(/metrics/);
      expect(monitoring).toMatch(/health/);
    });

    it('should have metrics collection system', () => {
      const metricsPath = join(projectRoot, 'backend', 'src', 'monitoring', 'metrics.js');
      expect(existsSync(metricsPath)).toBe(true);

      const metrics = readFileSync(metricsPath, 'utf8');
      expect(metrics).toMatch(/requests/);
      expect(metrics).toMatch(/response_time/);
      expect(metrics).toMatch(/error_rate/);
    });

    it('should have system resource monitoring', () => {
      const metricsPath = join(projectRoot, 'backend', 'src', 'monitoring', 'metrics.js');
      const metrics = readFileSync(metricsPath, 'utf8');

      expect(metrics).toMatch(/cpu/);
      expect(metrics).toMatch(/memory/);
      expect(metrics).toMatch(/disk/);
    });
  });

  describe('Alerting System', () => {
    it('should have alerting configuration', () => {
      const alertingPath = join(projectRoot, 'backend', 'src', 'monitoring', 'alerts.js');
      expect(existsSync(alertingPath)).toBe(true);

      const alerting = readFileSync(alertingPath, 'utf8');
      expect(alerting).toMatch(/threshold/);
      expect(alerting).toMatch(/notification/);
    });

    it('should have health status alerting', () => {
      const alertingPath = join(projectRoot, 'backend', 'src', 'monitoring', 'alerts.js');
      const alerting = readFileSync(alertingPath, 'utf8');

      expect(alerting).toMatch(/database.*disconnected/);
      expect(alerting).toMatch(/high.*memory/);
      expect(alerting).toMatch(/high.*error.*rate/);
    });
  });

  describe('Docker Health Checks', () => {
    it('should have health check scripts in Docker', () => {
      const backendDockerfile = readFileSync(join(projectRoot, 'backend', 'Dockerfile'), 'utf8');
      expect(backendDockerfile).toMatch(/HEALTHCHECK/);
      expect(backendDockerfile).toMatch(/healthcheck\.js/);
    });

    it('should have frontend health checks in Docker', () => {
      const frontendDockerfile = readFileSync(join(projectRoot, 'frontend', 'Dockerfile'), 'utf8');
      expect(frontendDockerfile).toMatch(/HEALTHCHECK/);
      expect(frontendDockerfile).toMatch(/wget.*--spider/);
    });

    it('should have health checks in docker-compose', () => {
      const dockerComposeFile = readFileSync(join(projectRoot, 'docker-compose.yml'), 'utf8');
      expect(dockerComposeFile).toMatch(/healthcheck:/);
      expect(dockerComposeFile).toMatch(/test:/);
      expect(dockerComposeFile).toMatch(/interval:/);
      expect(dockerComposeFile).toMatch(/timeout:/);
    });
  });

  describe('Health Check Response Format', () => {
    it('should return standardized health response format', () => {
      const healthCheckPath = join(projectRoot, 'backend', 'src', 'monitoring', 'health.js');
      const healthCheck = readFileSync(healthCheckPath, 'utf8');

      expect(healthCheck).toMatch(/status/);
      expect(healthCheck).toMatch(/timestamp/);
      expect(healthCheck).toMatch(/uptime/);
      expect(healthCheck).toMatch(/version/);
      expect(healthCheck).toMatch(/checks/);
    });

    it('should include service dependency checks', () => {
      const healthCheckPath = join(projectRoot, 'backend', 'src', 'monitoring', 'health.js');
      const healthCheck = readFileSync(healthCheckPath, 'utf8');

      expect(healthCheck).toMatch(/database.*check/);
      expect(healthCheck).toMatch(/external.*api.*check/);
      expect(healthCheck).toMatch(/cache.*check/);
    });
  });

  describe('Readiness and Liveness Probes', () => {
    it('should have readiness probe endpoint', () => {
      const serverFile = readFileSync(join(projectRoot, 'backend', 'server.js'), 'utf8');
      expect(serverFile).toMatch(/\/ready/);
    });

    it('should have liveness probe endpoint', () => {
      const serverFile = readFileSync(join(projectRoot, 'backend', 'server.js'), 'utf8');
      expect(serverFile).toMatch(/\/live/);
    });

    it('should have startup probe configuration', () => {
      const serverFile = readFileSync(join(projectRoot, 'backend', 'server.js'), 'utf8');
      expect(serverFile).toMatch(/startup/);
    });
  });
});