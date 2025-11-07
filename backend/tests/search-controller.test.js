import request from 'supertest';
import express from 'express';
import SearchController from '../src/controllers/search-controller.js';
import SearchService from '../src/services/search-service.js';

// Mock the search service
jest.mock('../src/services/search-service.js');

describe('Search Controller', () => {
  let app;
  let server;

  beforeAll(() => {
    app = express();
    app.use(express.json());

    // Add error handling middleware for malformed JSON
    app.use((err, req, res, next) => {
      if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return res.status(400).json({
          success: false,
          error: 'Malformed JSON in request body',
          message: 'Invalid JSON format'
        });
      }
      next(err);
    });

    // Register search routes
    app.post('/api/todos/search', SearchController.searchTodos);
    app.post('/api/todos/search/metadata', SearchController.searchTodosWithMetadata);
    app.get('/api/todos/search/suggestions', SearchController.getSearchSuggestions);
    app.get('/api/todos/search/popular', SearchController.getPopularSearchTerms);
    app.delete('/api/todos/search/cache', SearchController.clearSearchCache);
    app.get('/api/todos/search/cache/stats', SearchController.getCacheStats);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/todos/search', () => {
    test('should search todos with criteria', async () => {
      const mockResults = [
        { _id: '1', title: 'Search Result 1', priority: 'high' },
        { _id: '2', title: 'Search Result 2', priority: 'medium' }
      ];

      SearchService.searchTodos.mockResolvedValue(mockResults);

      const response = await request(app)
        .post('/api/todos/search')
        .send({
          text: 'search',
          priority: 'high',
          limit: 10,
          skip: 0
        });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        data: mockResults,
        message: 'Todos retrieved successfully'
      });
      expect(SearchService.searchTodos).toHaveBeenCalledWith({
        text: 'search',
        priority: 'high'
      }, {
        limit: 10,
        skip: 0
      });
    });

    test('should handle empty search criteria', async () => {
      const mockResults = [{ _id: '1', title: 'Todo 1' }];
      SearchService.searchTodos.mockResolvedValue(mockResults);

      const response = await request(app)
        .post('/api/todos/search')
        .send({});

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual(mockResults);
      expect(SearchService.searchTodos).toHaveBeenCalledWith({}, {});
    });

    test('should validate search criteria', async () => {
      SearchService.searchTodos.mockRejectedValue(new Error('Invalid priority value'));

      const response = await request(app)
        .post('/api/todos/search')
        .send({
          priority: 'invalid'
        });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        success: false,
        error: 'Priority must be one of: low, medium, high',
        message: 'Invalid search criteria'
      });
    });

    test('should handle service errors gracefully', async () => {
      SearchService.searchTodos.mockRejectedValue(new Error('Database connection failed'));

      const response = await request(app)
        .post('/api/todos/search')
        .send({ text: 'test' });

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Database connection failed');
    });

    test('should validate limit parameter', async () => {
      const response = await request(app)
        .post('/api/todos/search')
        .send({
          text: 'test',
          limit: 150 // Exceeds maximum
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Limit must be a number between 1 and 100');
    });

    test('should validate skip parameter', async () => {
      const response = await request(app)
        .post('/api/todos/search')
        .send({
          text: 'test',
          skip: -1 // Negative value
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Skip must be a non-negative number');
    });
  });

  describe('POST /api/todos/search/metadata', () => {
    test('should return search results with metadata', async () => {
      const mockResults = [
        { _id: '1', title: 'Search Result 1' },
        { _id: '2', title: 'Search Result 2' }
      ];

      const mockMetadata = {
        results: mockResults,
        metadata: {
          totalCount: 25,
          currentPage: 1,
          totalPages: 3,
          limit: 10,
          skip: 0,
          hasNextPage: true,
          hasPreviousPage: false
        }
      };

      SearchService.searchTodosWithMetadata.mockResolvedValue(mockMetadata);

      const response = await request(app)
        .post('/api/todos/search/metadata')
        .send({
          text: 'search',
          limit: 10,
          skip: 0
        });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        data: mockMetadata,
        message: 'Search results with metadata retrieved successfully'
      });
    });
  });

  describe('GET /api/todos/search/suggestions', () => {
    test('should return search suggestions', async () => {
      const mockSuggestions = ['search functionality', 'backend search', 'search optimization'];

      SearchService.getSearchSuggestions.mockResolvedValue(mockSuggestions);

      const response = await request(app)
        .get('/api/todos/search/suggestions')
        .query({ q: 'search' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        data: mockSuggestions,
        message: 'Search suggestions retrieved successfully'
      });
      expect(SearchService.getSearchSuggestions).toHaveBeenCalledWith('search', {});
    });

    test('should handle suggestions with limit', async () => {
      const mockSuggestions = ['suggestion1', 'suggestion2'];
      SearchService.getSearchSuggestions.mockResolvedValue(mockSuggestions);

      const response = await request(app)
        .get('/api/todos/search/suggestions')
        .query({ q: 'test', limit: 5 });

      expect(response.status).toBe(200);
      expect(SearchService.getSearchSuggestions).toHaveBeenCalledWith('test', { limit: 5 });
    });

    test('should validate query parameter length', async () => {
      const response = await request(app)
        .get('/api/todos/search/suggestions')
        .query({ q: 'a' }); // Too short

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Query parameter must be at least 2 characters');
    });
  });

  describe('GET /api/todos/search/popular', () => {
    test('should return popular search terms', async () => {
      const mockPopularTerms = [
        { term: 'project', count: 15 },
        { term: 'meeting', count: 12 },
        { term: 'deadline', count: 8 }
      ];

      SearchService.getPopularSearchTerms.mockResolvedValue(mockPopularTerms);

      const response = await request(app)
        .get('/api/todos/search/popular')
        .query({ limit: 10 });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        data: mockPopularTerms,
        message: 'Popular search terms retrieved successfully'
      });
      expect(SearchService.getPopularSearchTerms).toHaveBeenCalledWith({ limit: 10 });
    });
  });

  describe('DELETE /api/todos/search/cache', () => {
    test('should clear search cache', async () => {
      SearchService.clearCache.mockImplementation(() => {});

      const response = await request(app)
        .delete('/api/todos/search/cache');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        message: 'Search cache cleared successfully'
      });
      expect(SearchService.clearCache).toHaveBeenCalled();
    });
  });

  describe('GET /api/todos/search/cache/stats', () => {
    test('should return cache statistics', async () => {
      const mockStats = {
        totalEntries: 25,
        validEntries: 20,
        expiredEntries: 5,
        ttlMinutes: 5,
        maxSize: 100
      };

      SearchService.getCacheStats.mockReturnValue(mockStats);

      const response = await request(app)
        .get('/api/todos/search/cache/stats');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        data: mockStats,
        message: 'Cache statistics retrieved successfully'
      });
      expect(SearchService.getCacheStats).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    test('should handle malformed JSON', async () => {
      const response = await request(app)
        .post('/api/todos/search')
        .send('invalid json')
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test('should handle missing query parameter for suggestions', async () => {
      const response = await request(app)
        .get('/api/todos/search/suggestions');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Query parameter is required');
    });

    test('should handle timeout errors', async () => {
      SearchService.searchTodos.mockImplementation(() => {
        return new Promise((resolve, reject) => {
          setTimeout(() => reject(new Error('Request timeout')), 100);
        });
      });

      const response = await request(app)
        .post('/api/todos/search')
        .send({ text: 'test' });

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
    });
  });
});

// @TEST:FILTER-SEARCH-004:API