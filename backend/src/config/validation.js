// @CODE:TAG-DEPLOY-CONFIG-001
// Environment variable validation using Joi

import Joi from 'joi';

// Configuration validation schema
const configSchema = Joi.object({
  // Server Configuration
  port: Joi.number().port().required(),
  nodeEnv: Joi.string().valid('development', 'production', 'test').required(),

  // Database Configuration
  database: Joi.object({
    uri: Joi.string().uri().required(),
    testUri: Joi.string().uri().optional(),
    options: Joi.object().optional(),
  }).required(),

  // JWT Configuration
  jwt: Joi.object({
    secret: Joi.string().min(32).required(),
    expiresIn: Joi.string().required(),
  }).required(),

  // CORS Configuration
  cors: Joi.object({
    origin: Joi.alternatives().try(
      Joi.string(),
      Joi.array().items(Joi.string())
    ).required(),
    credentials: Joi.boolean().required(),
  }).required(),

  // Logging Configuration
  logging: Joi.object({
    level: Joi.string().valid('error', 'warn', 'info', 'debug').required(),
    file: Joi.string().required(),
  }).required(),

  // Rate Limiting Configuration
  rateLimit: Joi.object({
    windowMs: Joi.number().positive().required(),
    max: Joi.number().positive().required(),
    message: Joi.string().required(),
  }).required(),

  // Session Configuration
  session: Joi.object({
    secret: Joi.string().min(32).required(),
    maxAge: Joi.number().positive().required(),
  }).required(),

  // Security Configuration
  security: Joi.object({
    bcryptRounds: Joi.number().integer().min(10).max(15).required(),
    enableHelmet: Joi.boolean().required(),
    enableRateLimit: Joi.boolean().required(),
  }).required(),

  // File Upload Configuration
  upload: Joi.object({
    maxSize: Joi.number().positive().required(),
    path: Joi.string().required(),
  }).required(),

  // API Configuration
  api: Joi.object({
    version: Joi.string().required(),
    prefix: Joi.string().required(),
  }).required(),

  // Monitoring Configuration
  monitoring: Joi.object({
    enabled: Joi.boolean().required(),
    port: Joi.number().port().required(),
  }).required(),

  // Redis Configuration
  redis: Joi.object({
    url: Joi.string().uri().required(),
    password: Joi.string().allow(null).optional(),
  }).required(),
});

// Production-specific validation rules
const productionSchema = configSchema.keys({
  jwt: Joi.object({
    secret: Joi.string().min(64).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/).required(),
  }).required(),
  session: Joi.object({
    secret: Joi.string().min(64).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/).required(),
  }).required(),
  database: Joi.object({
    uri: Joi.string().uri().custom((value, helpers) => {
      if (value.includes('localhost') || value.includes('127.0.0.1')) {
        return helpers.error('custom.localDB');
      }
      return value;
    }, 'Production database validation').messages({
      'custom.localDB': 'Database URI cannot point to localhost in production',
    }).required(),
  }).required(),
});

// Validate configuration function
export function validateConfig(config) {
  const isProduction = config.nodeEnv === 'production';
  const schema = isProduction ? productionSchema : configSchema;

  const { error, value } = schema.validate(config, {
    allowUnknown: true,
    stripUnknown: true,
  });

  if (error) {
    const errorMessages = error.details.map(detail => detail.message);
    throw new Error(`Configuration validation failed: ${errorMessages.join(', ')}`);
  }

  return value;
}

// Validate specific environment variables
export function validateEnvVars() {
  const requiredEnvVars = [
    'NODE_ENV',
    'MONGODB_URI',
    'JWT_SECRET',
    'SESSION_SECRET',
  ];

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }

  // Validate JWT secret strength in production
  if (process.env.NODE_ENV === 'production') {
    const jwtSecret = process.env.JWT_SECRET;
    if (jwtSecret.length < 64 || !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(jwtSecret)) {
      throw new Error('JWT secret must be at least 64 characters long and contain uppercase, lowercase, numbers, and special characters in production');
    }

    const sessionSecret = process.env.SESSION_SECRET;
    if (sessionSecret.length < 64 || !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(sessionSecret)) {
      throw new Error('Session secret must be at least 64 characters long and contain uppercase, lowercase, numbers, and special characters in production');
    }
  }

  return true;
}

export default {
  validateConfig,
  validateEnvVars,
};