const { existsSync, readFileSync } = require('fs');
const { join } = require('path');

describe('deploy.yml Workflow Tests', () => {
  const workflowPath = join(__dirname, '../.github/workflows/deploy.yml');

  it('should exist', () => {
    expect(existsSync(workflowPath)).toBe(true);
  });

  it('should have proper workflow name', () => {
    const content = readFileSync(workflowPath, 'utf-8');
    expect(content).toMatch(/name:/);
  });

  it('should trigger on push to main', () => {
    const content = readFileSync(workflowPath, 'utf-8');
    expect(content).toMatch(/on:\s*\n\s*push:\s*\n\s*branches:\s*\n\s*- main/);
  });

  it('should trigger on workflow dispatch', () => {
    const content = readFileSync(workflowPath, 'utf-8');
    expect(content).toMatch(/workflow_dispatch:/);
  });

  it('should have jobs section', () => {
    const content = readFileSync(workflowPath, 'utf-8');
    expect(content).toMatch(/jobs:/);
  });

  it('should have build job', () => {
    const content = readFileSync(workflowPath, 'utf-8');
    expect(content).toMatch(/build:/);
  });

  it('should use ubuntu runner', () => {
    const content = readFileSync(workflowPath, 'utf-8');
    expect(content).toMatch(/runs-on: ubuntu-latest/);
  });

  it('should checkout code', () => {
    const content = readFileSync(workflowPath, 'utf-8');
    expect(content).toMatch(/uses: actions\/checkout@/);
  });

  it('should setup Node.js', () => {
    const content = readFileSync(workflowPath, 'utf-8');
    expect(content).toMatch(/uses: actions\/setup-node@/);
  });

  it('should setup Docker Buildx', () => {
    const content = readFileSync(workflowPath, 'utf-8');
    const dockerSetup = content.includes('docker/setup-buildx-action@') ||
                       content.includes('docker/setup-buildx-action@');
    expect(dockerSetup).toBe(true);
  });

  it('should login to container registry', () => {
    const content = readFileSync(workflowPath, 'utf-8');
    const dockerLogin = content.includes('docker/login-action@') ||
                       content.includes('docker login');
    expect(dockerLogin).toBe(true);
  });

  it('should build and push Docker images', () => {
    const content = readFileSync(workflowPath, 'utf-8');
    const buildPush = content.includes('docker/build-push-action@') ||
                     content.includes('docker build') ||
                     content.includes('docker push');
    expect(buildPush).toBe(true);
  });

  it('should have deploy job', () => {
    const content = readFileSync(workflowPath, 'utf-8');
    expect(content).toMatch(/deploy:/);
  });

  it('should deploy to production', () => {
    const content = readFileSync(workflowPath, 'utf-8');
    const deployment = content.includes('deploy.sh') ||
                      content.includes('docker-compose up') ||
                      content.includes('kubectl apply');
    expect(deployment).toBe(true);
  });

  it('should have proper environment variables', () => {
    const content = readFileSync(workflowPath, 'utf-8');
    const envVars = content.includes('env:') ||
                   content.includes('NODE_ENV') ||
                   content.includes('secrets.');
    expect(envVars).toBe(true);
  });

  it('should use the correct TAG', () => {
    const content = readFileSync(workflowPath, 'utf-8');
    expect(content).toMatch(/@CODE:UI-UX-DEPLOY-005:DEPLOY-INFRA/);
  });
});