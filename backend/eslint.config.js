// @CONFIG:TODO-CRUD-001:QUALITY
/**
 * ESLint Configuration (v9.x format)
 *
 * Code quality rules for backend JavaScript code
 */

import js from '@eslint/js';

export default [
  js.configs.recommended,
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'module',
      globals: {
        // Node.js globals
        console: 'readonly',
        process: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        Buffer: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        // Jest globals
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        jest: 'readonly',
      },
    },
    rules: {
      // Best practices
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-console': 'off', // Allow console in backend
      'no-debugger': 'error',
      'no-alert': 'error',

      // ES6+
      'prefer-const': 'error',
      'no-var': 'error',
      'prefer-arrow-callback': 'warn',
      'prefer-template': 'warn',

      // Code style
      semi: ['error', 'always'],
      quotes: ['error', 'single', { avoidEscape: true }],
      'comma-dangle': ['error', 'only-multiline'],
      indent: ['error', 2],
      'linebreak-style': ['error', 'unix'],
    },
  },
  {
    ignores: ['node_modules/**', 'coverage/**', 'dist/**'],
  },
];
