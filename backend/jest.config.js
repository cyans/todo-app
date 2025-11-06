// @CONFIG:TODO-CRUD-001:TEST
/**
 * Jest Configuration for To-Do List Backend
 *
 * Test Environment Setup:
 * - Uses Node environment for backend testing
 * - Integrates MongoDB Memory Server for isolated database tests
 * - Configures coverage thresholds (≥90% requirement)
 */

export default {
  // Test environment
  testEnvironment: 'node',

  // Use ES modules
  transform: {},

  // Test match patterns
  testMatch: [
    '**/__tests__/**/*.test.js',
    '**/?(*.)+(spec|test).js'
  ],

  // Coverage configuration
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.test.js',
    '!**/node_modules/**'
  ],

  coverageThreshold: {
    global: {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90
    }
  },

  // Setup files
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],

  // Module paths
  moduleDirectories: ['node_modules', 'src'],

  // Timeout for tests
  testTimeout: 10000,

  // Verbose output
  verbose: true
};
