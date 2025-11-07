import SearchService from '../services/search-service.js';

/**
 * Search Controller - Handles HTTP requests for todo search functionality
 * Provides RESTful endpoints for search, filtering, suggestions, and cache management
 */
class SearchController {
  /**
   * Search todos with various criteria
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async searchTodos(req, res) {
    try {
      // Validate search criteria
      const validationError = SearchController.validateSearchCriteria(req.body);
      if (validationError) {
        return res.status(400).json({
          success: false,
          error: validationError,
          message: 'Invalid search criteria'
        });
      }

      const searchCriteria = req.body || {};
      const searchOptions = {
        limit: searchCriteria.limit,
        skip: searchCriteria.skip,
        sortBy: searchCriteria.sortBy,
        sortOrder: searchCriteria.sortOrder
      };

      // Remove pagination and sorting from criteria for service
      const { limit, skip, sortBy, sortOrder, ...cleanCriteria } = searchCriteria;

      const results = await SearchService.searchTodos(cleanCriteria, searchOptions);

      res.status(200).json({
        success: true,
        data: results,
        message: 'Todos retrieved successfully'
      });
    } catch (error) {
      console.error('Search todos error:', error);

      // Determine status code based on error type
      let statusCode = 500;
      if (error.message.includes('Invalid') || error.message.includes('must be') || error.message.includes('required')) {
        statusCode = 400; // Client validation errors
      } else if (error.message.includes('not found') || error.message.includes('Database') || error.message.includes('timeout')) {
        statusCode = 500; // Server/database errors
      }

      res.status(statusCode).json({
        success: false,
        error: error.message,
        message: 'Search failed'
      });
    }
  }

  /**
   * Search todos with metadata (pagination info)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async searchTodosWithMetadata(req, res) {
    try {
      const searchCriteria = req.body || {};
      const searchOptions = {
        limit: searchCriteria.limit,
        skip: searchCriteria.skip,
        sortBy: searchCriteria.sortBy,
        sortOrder: searchCriteria.sortOrder
      };

      // Remove pagination and sorting from criteria for service
      const { limit, skip, sortBy, sortOrder, ...cleanCriteria } = searchCriteria;

      const results = await SearchService.searchTodosWithMetadata(cleanCriteria, searchOptions);

      res.status(200).json({
        success: true,
        data: results,
        message: 'Search results with metadata retrieved successfully'
      });
    } catch (error) {
      console.error('Search todos with metadata error:', error);
      res.status(400).json({
        success: false,
        error: error.message,
        message: 'Search with metadata failed'
      });
    }
  }

  /**
   * Get search suggestions based on partial input
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async getSearchSuggestions(req, res) {
    try {
      const { q: query, limit } = req.query;

      // Validate query parameter
      if (!query) {
        return res.status(400).json({
          success: false,
          error: 'Query parameter is required',
          message: 'Missing required parameter: q'
        });
      }

      if (query.length < 2) {
        return res.status(400).json({
          success: false,
          error: 'Query parameter must be at least 2 characters',
          message: 'Query too short'
        });
      }

      const suggestions = await SearchService.getSearchSuggestions(query, {
        limit: limit ? parseInt(limit, 10) : undefined
      });

      res.status(200).json({
        success: true,
        data: suggestions,
        message: 'Search suggestions retrieved successfully'
      });
    } catch (error) {
      console.error('Get search suggestions error:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        message: 'Failed to get search suggestions'
      });
    }
  }

  /**
   * Get popular search terms
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async getPopularSearchTerms(req, res) {
    try {
      const { limit } = req.query;
      const popularTerms = await SearchService.getPopularSearchTerms({
        limit: limit ? parseInt(limit, 10) : undefined
      });

      res.status(200).json({
        success: true,
        data: popularTerms,
        message: 'Popular search terms retrieved successfully'
      });
    } catch (error) {
      console.error('Get popular search terms error:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        message: 'Failed to get popular search terms'
      });
    }
  }

  /**
   * Clear search cache
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async clearSearchCache(req, res) {
    try {
      SearchService.clearCache();

      res.status(200).json({
        success: true,
        message: 'Search cache cleared successfully'
      });
    } catch (error) {
      console.error('Clear search cache error:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        message: 'Failed to clear search cache'
      });
    }
  }

  /**
   * Get cache statistics
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async getCacheStats(req, res) {
    try {
      const stats = SearchService.getCacheStats();

      res.status(200).json({
        success: true,
        data: stats,
        message: 'Cache statistics retrieved successfully'
      });
    } catch (error) {
      console.error('Get cache stats error:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        message: 'Failed to get cache statistics'
      });
    }
  }

  /**
   * Validate search criteria
   * @param {Object} criteria - Search criteria
   * @returns {string|null} - Error message or null if valid
   * @private
   */
  static validateSearchCriteria(criteria) {
    if (!criteria) return null;

    const { limit, skip, priority, status, tags } = criteria;

    // Validate limit
    if (limit !== undefined) {
      if (typeof limit !== 'number' || limit < 1 || limit > 100) {
        return 'Limit must be a number between 1 and 100';
      }
    }

    // Validate skip
    if (skip !== undefined) {
      if (typeof skip !== 'number' || skip < 0) {
        return 'Skip must be a non-negative number';
      }
    }

    // Validate priority if provided
    if (priority) {
      const validPriorities = ['low', 'medium', 'high'];
      if (!validPriorities.includes(priority)) {
        return 'Priority must be one of: low, medium, high';
      }
    }

    // Validate status if provided
    if (status) {
      const { TODO_STATUS } = require('../models/todo-model.js');
      const validStatuses = Object.values(TODO_STATUS);
      if (!validStatuses.includes(status)) {
        return `Status must be one of: ${validStatuses.join(', ')}`;
      }
    }

    // Validate tags if provided
    if (tags && !Array.isArray(tags)) {
      return 'Tags must be an array';
    }

    return null;
  }

  /**
   * Validate search request parameters
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  static validateSearchRequest(req, res, next) {
    try {
      const { limit, skip } = req.body || {};

      // Validate limit
      if (limit !== undefined) {
        if (typeof limit !== 'number' || limit < 1 || limit > 100) {
          return res.status(400).json({
            success: false,
            error: 'Limit must be a number between 1 and 100',
            message: 'Invalid limit parameter'
          });
        }
      }

      // Validate skip
      if (skip !== undefined) {
        if (typeof skip !== 'number' || skip < 0) {
          return res.status(400).json({
            success: false,
            error: 'Skip must be a non-negative number',
            message: 'Invalid skip parameter'
          });
        }
      }

      // Validate priority if provided
      const { priority } = req.body || {};
      if (priority) {
        const validPriorities = ['low', 'medium', 'high'];
        if (!validPriorities.includes(priority)) {
          return res.status(400).json({
            success: false,
            error: 'Priority must be one of: low, medium, high',
            message: 'Invalid priority parameter'
          });
        }
      }

      // Validate status if provided
      const { status } = req.body || {};
      if (status) {
        const { TODO_STATUS } = require('../models/todo-model.js');
        const validStatuses = Object.values(TODO_STATUS);
        if (!validStatuses.includes(status)) {
          return res.status(400).json({
            success: false,
            error: `Status must be one of: ${validStatuses.join(', ')}`,
            message: 'Invalid status parameter'
          });
        }
      }

      // Validate tags if provided
      const { tags } = req.body || {};
      if (tags && !Array.isArray(tags)) {
        return res.status(400).json({
          success: false,
          error: 'Tags must be an array',
          message: 'Invalid tags parameter'
        });
      }

      next();
    } catch (error) {
      console.error('Search request validation error:', error);
      res.status(400).json({
        success: false,
        error: error.message,
        message: 'Invalid search request'
      });
    }
  }

  /**
   * Handle search performance monitoring
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  static async monitorSearchPerformance(req, res, next) {
    const startTime = Date.now();

    // Override res.json to capture response time
    const originalJson = res.json;
    res.json = function(data) {
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      // Log performance metrics
      console.log(`Search Performance - ${req.method} ${req.path}: ${responseTime}ms`);

      // Add performance header
      res.set('X-Response-Time', `${responseTime}ms`);

      return originalJson.call(this, data);
    };

    next();
  }
}

export default SearchController;

// @CODE:FILTER-SEARCH-004:API