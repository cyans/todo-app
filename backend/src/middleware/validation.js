// @CODE:TODO-CRUD-001:API
/**
 * Validation Middleware
 *
 * Provides request validation middleware for Todo API endpoints.
 * Uses Joi schema validation for consistent error handling.
 *
 * Features:
 * - Request body validation
 * - Route parameter validation
 * - Query parameter validation
 * - Consistent error response format
 *
 * @module middleware/validation
 */

import Joi from 'joi';

/**
 * Todo validation schemas
 */
const todoSchemas = {
  // Schema for creating a new todo
  create: Joi.object({
    title: Joi.string()
      .trim()
      .min(1)
      .max(200)
      .required()
      .messages({
        'string.empty': 'Title cannot be empty',
        'string.min': 'Title cannot be empty',
        'string.max': 'Title cannot exceed 200 characters',
        'any.required': 'Title is required'
      }),
    description: Joi.string()
      .max(1000)
      .allow('')
      .optional()
      .messages({
        'string.max': 'Description cannot exceed 1000 characters'
      }),
    priority: Joi.string()
      .valid('low', 'medium', 'high')
      .default('medium')
      .messages({
        'any.only': 'Priority must be either low, medium, or high'
      }),
    completed: Joi.boolean()
      .optional()
  }),

  // Schema for updating an existing todo
  update: Joi.object({
    title: Joi.string()
      .trim()
      .min(1)
      .max(200)
      .optional()
      .messages({
        'string.empty': 'Title cannot be empty',
        'string.min': 'Title cannot be empty',
        'string.max': 'Title cannot exceed 200 characters'
      }),
    description: Joi.string()
      .max(1000)
      .allow('')
      .optional()
      .messages({
        'string.max': 'Description cannot exceed 1000 characters'
      }),
    priority: Joi.string()
      .valid('low', 'medium', 'high')
      .optional()
      .messages({
        'any.only': 'Priority must be either low, medium, or high'
      }),
    completed: Joi.boolean()
      .optional()
  }).min(1).messages({
    'object.min': 'At least one field must be provided for update'
  }),

  // Schema for MongoDB ObjectId validation
  objectId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.pattern.base': 'Invalid ID',
      'any.required': 'ID is required'
    }),

  // Schema for search query parameter
  searchQuery: Joi.string()
    .min(1)
    .max(100)
    .required()
    .messages({
      'string.empty': 'Search query cannot be empty',
      'string.min': 'Search query cannot be empty',
      'string.max': 'Search query cannot exceed 100 characters',
      'any.required': 'Search query is required'
    })
};

/**
 * Validation middleware factory
 * Creates middleware that validates request against a Joi schema
 * @param {Object} schema - Joi validation schema
 * @param {string} source - Request property to validate ('body', 'params', 'query')
 * @returns {Function} Express middleware function
 */
const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[source], {
      abortEarly: false,
      stripUnknown: true,
      convert: true
    });

    if (error) {
      const errorMessage = error.details
        .map(detail => detail.message)
        .join(', ');

      return res.status(400).json({
        error: 'Validation failed',
        message: errorMessage,
        details: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message,
          value: detail.context.value
        }))
      });
    }

    // Replace the request property with validated and sanitized data
    if (source === 'query') {
      // req.query is read-only, so we need to merge properties
      Object.assign(req.query, value);
    } else {
      req[source] = value;
    }
    next();
  };
};

/**
 * Predefined validation middleware functions
 */
const validateTodoCreation = validate(todoSchemas.create, 'body');
const validateTodoUpdate = validate(todoSchemas.update, 'body');
const validateObjectId = (req, res, next) => {
  const { error, value } = todoSchemas.objectId.validate(req.params.id, {
    abortEarly: false,
    stripUnknown: true,
    convert: true
  });

  if (error) {
    const errorMessage = error.details
      .map(detail => detail.message)
      .join(', ');

    return res.status(400).json({
      error: errorMessage.includes('Invalid ID') ? 'Invalid ID' : 'Validation failed',
      message: errorMessage,
      details: error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context.value
      }))
    });
  }

  // Replace the ID with validated value
  req.params.id = value;
  next();
};
const validateSearchQuery = (req, res, next) => {
  const { error, value } = todoSchemas.searchQuery.validate(req.query.q, {
    abortEarly: false,
    stripUnknown: true,
    convert: true
  });

  if (error) {
    const errorMessage = error.details
      .map(detail => detail.message)
      .join(', ');

    return res.status(400).json({
      error: 'Validation failed',
      message: errorMessage,
      details: error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context.value
      }))
    });
  }

  // Replace the query with validated value
  req.query.q = value;
  next();
};

/**
 * Custom validation middleware for specific use cases
 */

/**
 * Validate that request body is valid JSON
 * This is mainly for catching malformed JSON before Express parses it
 */
const validateJSON = (err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      error: 'Invalid JSON',
      message: 'Request body contains invalid JSON'
    });
  }
  next();
};

/**
 * Validate content-type for API endpoints
 */
const validateContentType = (req, res, next) => {
  if (req.method === 'POST' || req.method === 'PUT') {
    if (!req.is('application/json')) {
      return res.status(400).json({
        error: 'Invalid content type',
        message: 'Content-Type must be application/json'
      });
    }
  }
  // PATCH requests for /api/todos/:id/toggle don't need body validation
  // PATCH requests to /api/todos without body should be allowed to proceed to 404 handler
  next();
};

/**
 * Validate query parameters for pagination and filtering
 */
const validateTodoQuery = validate(Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  sort: Joi.string().valid('createdAt', 'updatedAt', 'priority', 'title').default('createdAt'),
  order: Joi.string().valid('asc', 'desc').default('desc'),
  completed: Joi.boolean().optional(),
  priority: Joi.string().valid('low', 'medium', 'high').optional()
}), 'query');

/**
 * Validate query parameters for pagination (legacy, use validateTodoQuery)
 */
const validatePagination = validateTodoQuery;

/**
 * Validate query parameters for filtering by completion status (legacy, use validateTodoQuery)
 */
const validateStatusFilter = validateTodoQuery;

export {
  // Schemas
  todoSchemas,

  // Factory function
  validate,

  // Predefined middleware
  validateTodoCreation,
  validateTodoUpdate,
  validateObjectId,
  validateSearchQuery,
  validateTodoQuery,
  validatePagination,
  validateStatusFilter,

  // Utility middleware
  validateJSON,
  validateContentType
};