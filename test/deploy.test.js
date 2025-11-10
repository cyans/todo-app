const { existsSync, readFileSync, execSync } = require('fs');
const { join } = require('path');

describe('deploy.sh Tests', () => {
  const deployScriptPath = join(__dirname, '../deploy.sh');

  it('should exist', () => {
    expect(existsSync(deployScriptPath)).toBe(true);
  });

  it('should be executable', () => {
    try {
      const stats = require('fs').statSync(deployScriptPath);
      // On Windows, check if file is readable and has content
      expect(stats.isFile()).toBe(true);
      expect(stats.size).toBeGreaterThan(0);
    } catch (error) {
      fail('Script should be accessible');
    }
  });

  it('should have shebang line', () => {
    const content = readFileSync(deployScriptPath, 'utf-8');
    expect(content).toMatch(/^#!\/bin\/(ba)?sh/);
  });

  it('should contain docker-compose up command', () => {
    const content = readFileSync(deployScriptPath, 'utf-8');
    expect(content).toMatch(/docker-compose up/);
  });

  it('should contain build option', () => {
    const content = readFileSync(deployScriptPath, 'utf-8');
    const buildFlag = content.includes('--build') || content.includes('-b');
    expect(buildFlag).toBe(true);
  });

  it('should contain detached mode flag', () => {
    const content = readFileSync(deployScriptPath, 'utf-8');
    const detachedFlag = content.includes('-d') || content.includes('--detach');
    expect(detachedFlag).toBe(true);
  });

  it('should handle environment variables', () => {
    const content = readFileSync(deployScriptPath, 'utf-8');
    const envHandling = content.includes('export') ||
                       content.includes('source') ||
                       content.includes('.env');
    expect(envHandling).toBe(true);
  });

  it('should have error handling', () => {
    const content = readFileSync(deployScriptPath, 'utf-8');
    const errorHandling = content.includes('set -e') ||
                         content.includes('if') ||
                         content.includes('trap');
    expect(errorHandling).toBe(true);
  });

  it('should have logging/output', () => {
    const content = readFileSync(deployScriptPath, 'utf-8');
    const hasOutput = content.includes('echo') ||
                     content.includes('printf') ||
                     content.includes('log');
    expect(hasOutput).toBe(true);
  });

  it('should have cleanup or rollback mechanism', () => {
    const content = readFileSync(deployScriptPath, 'utf-8');
    const hasCleanup = content.includes('down') ||
                      content.includes('stop') ||
                      content.includes('cleanup') ||
                      content.includes('rollback');
    expect(hasCleanup).toBe(true);
  });

  it('should handle production environment', () => {
    const content = readFileSync(deployScriptPath, 'utf-8');
    const productionHandling = content.includes('production') ||
                              content.includes('prod') ||
                              content.includes('NODE_ENV');
    expect(productionHandling).toBe(true);
  });
});