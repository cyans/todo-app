import { Todo, TODO_STATUS } from '../models/todo-model.js';

/**
 * Search Service - Advanced search functionality for todos
 * Handles text search, filtering, sorting, and pagination with performance optimization
 */
class SearchService {
  // Simple in-memory cache for frequent searches
  static #cache = new Map();
  static #CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  static #MAX_CACHE_SIZE = 100; // Maximum number of cached entries

  // Default search options
  static #DEFAULT_OPTIONS = {
    limit: 10,
    skip: 0,
    sortBy: 'createdAt',
    sortOrder: -1
  };

  /**
   * Validate search criteria parameters
   * @param {Object} criteria - Search criteria
   * @private
   */
  static _validateCriteria(criteria) {
    const validPriorities = ['low', 'medium', 'high'];
    const validStatuses = Object.values(TODO_STATUS);

    if (criteria.priority && !validPriorities.includes(criteria.priority)) {
      throw new Error(`Invalid priority value: ${criteria.priority}`);
    }

    if (criteria.status && !validStatuses.includes(criteria.status)) {
      throw new Error(`Invalid status value: ${criteria.status}`);
    }

    if (criteria.tags && !Array.isArray(criteria.tags)) {
      throw new Error('Tags must be an array');
    }

    if (criteria.limit && (criteria.limit < 1 || criteria.limit > 100)) {
      throw new Error('Limit must be between 1 and 100');
    }

    if (criteria.skip && criteria.skip < 0) {
      throw new Error('Skip must be non-negative');
    }
  }

  /**
   * Generate cache key for search criteria
   * @param {Object} criteria - Search criteria
   * @param {Object} options - Search options
   * @returns {string} - Cache key
   * @private
   */
  static _generateCacheKey(criteria, options = {}) {
    const keyData = {
      criteria,
      options
    };
    return JSON.stringify(keyData);
  }

  /**
   * Get cached search results
   * @param {string} cacheKey - Cache key
   * @returns {Object|null} - Cached results or null
   * @private
   */
  static #getCachedResults(cacheKey) {
    const cached = this.#cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.#CACHE_TTL) {
      return cached.data;
    }
    return null;
  }

  /**
   * Cache search results
   * @param {string} cacheKey - Cache key
   * @param {Object} data - Results to cache
   * @private
   */
  static #setCachedResults(cacheKey, data) {
    this.#cache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });

    // Limit cache size to prevent memory issues
    if (this.#cache.size > this.#MAX_CACHE_SIZE) {
      const firstKey = this.#cache.keys().next().value;
      this.#cache.delete(firstKey);
    }
  }

  /**
   * Build search query from criteria
   * @param {Object} criteria - Search criteria
   * @returns {Object} - MongoDB query object
   * @private
   */
  static _buildQuery(criteria) {
    const query = {};

    // Text search
    if (criteria.text) {
      query.$text = { $search: criteria.text };
    }

    // Priority filter
    if (criteria.priority) {
      query.priority = criteria.priority;
    }

    // Status filter
    if (criteria.status) {
      query.status = criteria.status;
    }

    // Tags filter (match any of the provided tags)
    if (criteria.tags && criteria.tags.length > 0) {
      query.tags = { $in: criteria.tags };
    }

    // Due date range filter
    if (criteria.dueDateFrom || criteria.dueDateTo) {
      query.dueDate = {};
      if (criteria.dueDateFrom) {
        query.dueDate.$gte = criteria.dueDateFrom;
      }
      if (criteria.dueDateTo) {
        query.dueDate.$lte = criteria.dueDateTo;
      }
    }

    // Assigned to filter
    if (criteria.assignedTo) {
      query.assignedTo = criteria.assignedTo;
    }

    return query;
  }

  /**
   * Build sort options
   * @param {Object} options - Sort options
   * @returns {Object} - Sort object
   * @private
   */
  static _buildSortOptions(options) {
    const sortBy = options.sortBy || 'createdAt';
    const sortOrder = options.sortOrder || -1;

    // For text search, prioritize relevance score by default
    if (options.text && !options.sortBy) {
      return { score: { $meta: 'textScore' } };
    }

    return { [sortBy]: sortOrder };
  }

  /**
   * Search todos with basic criteria
   * @param {Object} criteria - Search criteria
   * @param {Object} options - Search options (sorting, pagination)
   * @returns {Promise<Array>} - Array of todos
   */
  static async searchTodos(criteria = {}, options = {}) {
    try {
      // Validate inputs
      this._validateCriteria(criteria);

      // Check cache first
      const cacheKey = this._generateCacheKey(criteria, options);
      const cachedResults = this.#getCachedResults(cacheKey);
      if (cachedResults) {
        return cachedResults;
      }

      // Build query and options
      const query = this._buildQuery(criteria);
      const sortOptions = this._buildSortOptions({ ...options, text: criteria.text });

      // Build query
      let dbQuery = Todo.find(query);

      // Add projection for text search score
      if (criteria.text) {
        dbQuery = dbQuery.select({ score: { $meta: 'textScore' } });
      }

      // Add sorting
      dbQuery = dbQuery.sort(sortOptions);

      // Add pagination
      if (options.limit) {
        dbQuery = dbQuery.limit(options.limit);
      }
      if (options.skip) {
        dbQuery = dbQuery.skip(options.skip);
      }

      // Execute query
      const results = await dbQuery.exec();

      // Cache results
      this.#setCachedResults(cacheKey, results);

      return results;
    } catch (error) {
      throw new Error(`Search failed: ${error.message}`);
    }
  }

  /**
   * Search todos with metadata (total count, pagination info)
   * @param {Object} criteria - Search criteria
   * @param {Object} options - Search options
   * @returns {Promise<Object>} - Search results with metadata
   */
  static async searchTodosWithMetadata(criteria = {}, options = {}) {
    try {
      // Validate inputs
      this._validateCriteria(criteria);

      const limit = options.limit || 10;
      const skip = options.skip || 0;
      const page = Math.floor(skip / limit) + 1;

      // Get total count
      const query = this._buildQuery(criteria);
      const totalCount = await Todo.countDocuments(query);

      // Get paginated results
      const results = await this.searchTodos(criteria, { ...options, limit, skip });

      // Calculate pagination metadata
      const totalPages = Math.ceil(totalCount / limit);
      const hasNextPage = page < totalPages;
      const hasPreviousPage = page > 1;

      return {
        results,
        metadata: {
          totalCount,
          currentPage: page,
          totalPages,
          limit,
          skip,
          hasNextPage,
          hasPreviousPage
        }
      };
    } catch (error) {
      throw new Error(`Search with metadata failed: ${error.message}`);
    }
  }

  /**
   * Get search suggestions based on partial input
   * @param {string} partialText - Partial search text
   * @param {Object} options - Search options
   * @returns {Promise<Array>} - Array of suggestions
   */
  static async getSearchSuggestions(partialText, options = {}) {
    try {
      if (!partialText || partialText.length < 2) {
        return [];
      }

      const limit = options.limit || 5;

      // Search for todos containing the partial text
      const results = await Todo.find({
        $or: [
          { title: { $regex: partialText, $options: 'i' } },
          { description: { $regex: partialText, $options: 'i' } }
        ]
      })
      .select('title description tags')
      .limit(limit)
      .exec();

      // Extract unique suggestions
      const suggestions = new Set();

      results.forEach(todo => {
        // Add title suggestions
        if (todo.title.toLowerCase().includes(partialText.toLowerCase())) {
          suggestions.add(todo.title);
        }

        // Add tag suggestions
        todo.tags.forEach(tag => {
          if (tag.toLowerCase().includes(partialText.toLowerCase())) {
            suggestions.add(tag);
          }
        });
      });

      return Array.from(suggestions).slice(0, limit);
    } catch (error) {
      throw new Error(`Failed to get search suggestions: ${error.message}`);
    }
  }

  /**
   * Get popular search terms
   * @param {Object} options - Query options
   * @returns {Promise<Array>} - Array of popular terms
   */
  static async getPopularSearchTerms(options = {}) {
    try {
      const limit = options.limit || 10;

      // Aggregate to find most common words in titles and descriptions
      const pipeline = [
        {
          $match: {
            title: { $exists: true, $ne: '' },
            description: { $exists: true, $ne: '' }
          }
        },
        {
          $project: {
            words: {
              $concatArrays: [
                { $split: [{ $toLower: '$title' }, ' '] },
                { $split: [{ $toLower: '$description' }, ' '] }
              ]
            }
          }
        },
        { $unwind: '$words' },
        {
          $match: {
            words: { $regex: '^[a-z]{3,}$' } // Only words with 3+ characters
          }
        },
        {
          $group: {
            _id: '$words',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } },
        { $limit: limit },
        {
          $project: {
            term: '$_id',
            count: 1,
            _id: 0
          }
        }
      ];

      const results = await Todo.aggregate(pipeline);
      return results;
    } catch (error) {
      throw new Error(`Failed to get popular search terms: ${error.message}`);
    }
  }

  /**
   * Clear the search cache
   */
  static clearCache() {
    this.#cache.clear();
  }

  /**
   * Get cache statistics
   * @returns {Object} - Cache statistics
   */
  static getCacheStats() {
    const now = Date.now();
    let validEntries = 0;
    let expiredEntries = 0;

    for (const [key, value] of this.#cache.entries()) {
      if (now - value.timestamp < this.#CACHE_TTL) {
        validEntries++;
      } else {
        expiredEntries++;
      }
    }

    return {
      totalEntries: this.#cache.size,
      validEntries,
      expiredEntries,
      ttlMinutes: this.#CACHE_TTL / (60 * 1000),
      maxSize: this.#MAX_CACHE_SIZE
    };
  }
}

export default SearchService;

// @CODE:FILTER-SEARCH-004:SERVICE