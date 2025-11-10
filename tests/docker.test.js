// @TEST:TODO-DOCKER-001 | SPEC: SPEC-UI-UX-DEPLOY-005 | CODE: backend/Dockerfile, frontend/Dockerfile
/**
 * @TEST:TAG-DEPLOY-DOCKER-001
 * Tests for Docker containerization and multi-stage builds
 */

const { execSync } = require('child_process');
const { existsSync, readFileSync } = require('fs');
const { join } = require('path');

describe('Docker Configuration - TAG-DEPLOY-DOCKER-001', () => {
  const projectRoot = process.cwd();

  describe('Dockerfile Requirements', () => {
    it('should have backend Dockerfile with multi-stage build', () => {
      const dockerfilePath = join(projectRoot, 'backend', 'Dockerfile');
      expect(existsSync(dockerfilePath)).toBe(true);

      const dockerfile = readFileSync(dockerfilePath, 'utf8');

      // Should have multi-stage build
      expect(dockerfile).toMatch(/FROM.*node.*AS.*builder/i);
      expect(dockerfile).toMatch(/FROM.*node.*AS.*production/i);

      // Should use non-root user
      expect(dockerfile).toMatch(/USER.*node/i);

      // Should have health check
      expect(dockerfile).toMatch(/HEALTHCHECK/i);

      // Should expose correct port
      expect(dockerfile).toMatch(/EXPOSE.*5000/i);
    });

    it('should have frontend Dockerfile with multi-stage build', () => {
      const dockerfilePath = join(projectRoot, 'frontend', 'Dockerfile');
      expect(existsSync(dockerfilePath)).toBe(true);

      const dockerfile = readFileSync(dockerfilePath, 'utf8');

      // Should have multi-stage build
      expect(dockerfile).toMatch(/FROM.*node.*AS.*builder/i);
      expect(dockerfile).toMatch(/FROM.*nginx.*AS.*production/i);

      // Should use Nginx for production
      expect(dockerfile).toMatch(/FROM.*nginx/i);

      // Should copy built assets
      expect(dockerfile).toMatch(/COPY.*dist/i);

      // Should expose port 80
      expect(dockerfile).toMatch(/EXPOSE.*80/i);
    });

    it('should have optimized Docker configuration', () => {
      const backendDockerfile = readFileSync(join(projectRoot, 'backend', 'Dockerfile'), 'utf8');
      const frontendDockerfile = readFileSync(join(projectRoot, 'frontend', 'Dockerfile'), 'utf8');

      // Backend optimizations
      expect(backendDockerfile).toMatch(/NODE_ENV.*production/i);
      expect(backendDockerfile).toMatch(/npm.*ci.*only.*production/i);

      // Frontend optimizations
      expect(frontendDockerfile).toMatch(/VITE_*API_URL/i);
    });
  });

  describe('Docker Compose Configuration', () => {
    it('should have production docker-compose file', () => {
      const composePath = join(projectRoot, 'docker-compose.prod.yml');
      expect(existsSync(composePath)).toBe(true);

      const composeFile = readFileSync(composePath, 'utf8');

      // Should have backend service
      expect(composeFile).toMatch(/backend:/i);

      // Should have frontend service
      expect(composeFile).toMatch(/frontend:/i);

      // Should have database service
      expect(composeFile).toMatch(/mongo:/i);

      // Should use production images
      expect(composeFile).toMatch(/build:/i);

      // Should have health checks
      expect(composeFile).toMatch(/healthcheck:/i);

      // Should have restart policy
      expect(composeFile).toMatch(/restart.*unless-stopped/i);
    });

    it('should have development docker-compose file', () => {
      const composePath = join(projectRoot, 'docker-compose.yml');
      expect(existsSync(composePath)).toBe(true);

      const composeFile = readFileSync(composePath, 'utf8');

      // Should mount volumes for development
      expect(composeFile).toMatch(/volumes:/i);

      // Should have environment files
      expect(composeFile).toMatch(/env_file:/i);
    });
  });

  describe('.dockerignore Files', () => {
    it('should have backend .dockerignore', () => {
      const dockerignorePath = join(projectRoot, 'backend', '.dockerignore');
      expect(existsSync(dockerignorePath)).toBe(true);

      const dockerignore = readFileSync(dockerignorePath, 'utf8');

      // Should exclude node_modules
      expect(dockerignore).toMatch(/node_modules/i);

      // Should exclude development files
      expect(dockerignore).toMatch(/test/i);
      expect(dockerignore).toMatch(/coverage/i);
    });

    it('should have frontend .dockerignore', () => {
      const dockerignorePath = join(projectRoot, 'frontend', '.dockerignore');
      expect(existsSync(dockerignorePath)).toBe(true);

      const dockerignore = readFileSync(dockerignorePath, 'utf8');

      // Should exclude node_modules
      expect(dockerignore).toMatch(/node_modules/i);

      // Should exclude build artifacts
      expect(dockerignore).toMatch(/dist/i);
    });
  });

  describe('Container Build Validation', () => {
    it('should be able to build backend container', () => {
      const buildCommand = 'docker build -t todo-backend:test ./backend';
      expect(() => {
        execSync(buildCommand, { stdio: 'pipe' });
      }).not.toThrow();
    });

    it('should be able to build frontend container', () => {
      const buildCommand = 'docker build -t todo-frontend:test ./frontend';
      expect(() => {
        execSync(buildCommand, { stdio: 'pipe' });
      }).not.toThrow();
    });

    it('should create production containers with correct labels', () => {
      const inspectCommand = 'docker inspect todo-backend:test';
      const output = execSync(inspectCommand, { encoding: 'utf8' });

      const containerInfo = JSON.parse(output);
      const labels = containerInfo[0].Config.Labels || {};

      // Should have maintenance labels
      expect(labels).toHaveProperty('maintainer');
      expect(labels).toHaveProperty('version');
    });
  });

  describe('Security Configuration', () => {
    it('should use non-root user in backend container', () => {
      const inspectCommand = 'docker inspect todo-backend:test';
      const output = execSync(inspectCommand, { encoding: 'utf8' });

      const containerInfo = JSON.parse(output);
      const user = containerInfo[0].Config.User;

      // Should run as non-root user
      expect(user).toBe('nodejs');
    });

    it('should have minimal attack surface', () => {
      const backendDockerfile = readFileSync(join(projectRoot, 'backend', 'Dockerfile'), 'utf8');
      const frontendDockerfile = readFileSync(join(projectRoot, 'frontend', 'Dockerfile'), 'utf8');

      // Should not include development tools
      expect(backendDockerfile).not.toMatch(/npm.*install.*-g/i);
      expect(frontendDockerfile).not.toMatch(/npm.*install.*-g/i);

      // Should clean up package manager cache
      expect(backendDockerfile).toMatch(/npm.*cache.*clean.*--force/i);
    });
  });
});