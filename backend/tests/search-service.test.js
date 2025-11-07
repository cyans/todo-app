import mongoose from 'mongoose';
import { Todo } from '../src/models/todo-model.js';
import SearchService from '../src/services/search-service.js';

describe('Search Service', () => {
  beforeEach(async () => {
    // Clear collection before each test
    await Todo.deleteMany({});
  });

  describe('Basic Search Functionality', () => {
    test('should search todos by text', async () => {
      // Create test data
      await Todo.create({
        title: 'Important Project Meeting',
        description: 'Discuss project timeline and deliverables',
        status: 'todo',
        priority: 'high'
      });

      await Todo.create({
        title: 'Regular Task',
        description: 'Complete daily tasks',
        status: 'in_progress',
        priority: 'medium'
      });

      const searchResults = await SearchService.searchTodos({ text: 'project' });
      expect(searchResults).toHaveLength(1);
      expect(searchResults[0].title).toContain('Project');
    });

    test('should search todos by priority', async () => {
      await Todo.create({
        title: 'High Priority Task 1',
        description: 'Urgent task',
        priority: 'high'
      });

      await Todo.create({
        title: 'Low Priority Task 1',
        description: 'Not urgent task',
        priority: 'low'
      });

      const searchResults = await SearchService.searchTodos({ priority: 'high' });
      expect(searchResults).toHaveLength(1);
      expect(searchResults[0].priority).toBe('high');
    });

    test('should search todos by status', async () => {
      await Todo.create({
        title: 'Pending Task',
        description: 'Task to be done',
        status: 'todo'
      });

      await Todo.create({
        title: 'Completed Task',
        description: 'Task finished',
        status: 'done'
      });

      const searchResults = await SearchService.searchTodos({ status: 'done' });
      expect(searchResults).toHaveLength(1);
      expect(searchResults[0].status).toBe('done');
    });

    test('should search todos by tags', async () => {
      await Todo.create({
        title: 'Backend Task',
        description: 'API development',
        tags: ['backend', 'api']
      });

      await Todo.create({
        title: 'Frontend Task',
        description: 'UI development',
        tags: ['frontend', 'ui']
      });

      const searchResults = await SearchService.searchTodos({ tags: ['backend'] });
      expect(searchResults).toHaveLength(1);
      expect(searchResults[0].tags).toContain('backend');
    });

    test('should search todos by due date range', async () => {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);

      await Todo.create({
        title: 'Task Due Today',
        dueDate: today
      });

      await Todo.create({
        title: 'Task Due Next Week',
        dueDate: nextWeek
      });

      const searchResults = await SearchService.searchTodos({
        dueDateFrom: today,
        dueDateTo: tomorrow
      });
      expect(searchResults).toHaveLength(1);
      expect(searchResults[0].title).toContain('Today');
    });
  });

  describe('Complex Search Functionality', () => {
    test('should search todos with multiple criteria', async () => {
      await Todo.create({
        title: 'High Priority Backend Project',
        description: 'Implement search functionality',
        priority: 'high',
        status: 'todo',
        tags: ['backend', 'search']
      });

      await Todo.create({
        title: 'Low Priority Frontend Task',
        description: 'Design UI components',
        priority: 'low',
        status: 'in_progress',
        tags: ['frontend', 'ui']
      });

      const searchCriteria = {
        text: 'search',
        priority: 'high',
        status: 'todo',
        tags: ['backend']
      };

      const searchResults = await SearchService.searchTodos(searchCriteria);
      expect(searchResults).toHaveLength(1);
      expect(searchResults[0].title).toContain('Project'); // MongoDB text search is case-insensitive
      expect(searchResults[0].priority).toBe('high');
    });

    test('should support sorting by different fields', async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      await Todo.create({
        title: 'Z Task',
        priority: 'low',
        dueDate: yesterday
      });

      await Todo.create({
        title: 'A Task',
        priority: 'high',
        dueDate: tomorrow
      });

      // Test sorting by priority (alphabetical order: high > low > medium)
      const resultsByPriority = await SearchService.searchTodos({}, {
        sortBy: 'priority',
        sortOrder: -1
      });
      expect(resultsByPriority[0].priority).toBe('low'); // 'low' comes first alphabetically

      // Test sorting by title alphabetically
      const resultsByTitle = await SearchService.searchTodos({}, {
        sortBy: 'title',
        sortOrder: 1
      });
      expect(resultsByTitle[0].title).toBe('A Task');
    });

    test('should support pagination', async () => {
      // Create 20 todos
      for (let i = 0; i < 20; i++) {
        await Todo.create({
          title: `Task ${i}`,
          description: `Description for task ${i}`,
          status: 'todo'
        });
      }

      // Get first page (limit 10)
      const firstPage = await SearchService.searchTodos({}, {
        limit: 10,
        skip: 0
      });
      expect(firstPage).toHaveLength(10);

      // Get second page
      const secondPage = await SearchService.searchTodos({}, {
        limit: 10,
        skip: 10
      });
      expect(secondPage).toHaveLength(10);

      // Ensure pages have different content
      expect(firstPage[0].title).not.toBe(secondPage[0].title);
    });
  });

  describe('Search Result Processing', () => {
    test('should return search metadata', async () => {
      for (let i = 0; i < 15; i++) {
        await Todo.create({
          title: `Test Task ${i}`,
          description: `Description ${i}`,
          status: i % 2 === 0 ? 'todo' : 'done'
        });
      }

      const searchResults = await SearchService.searchTodosWithMetadata({
        text: 'test',
        limit: 10,
        skip: 0
      });

      expect(searchResults.results).toHaveLength(10);
      expect(searchResults.metadata.totalCount).toBe(15);
      expect(searchResults.metadata.currentPage).toBe(1);
      expect(searchResults.metadata.totalPages).toBe(2);
      expect(searchResults.metadata.hasNextPage).toBe(true);
      expect(searchResults.metadata.hasPreviousPage).toBe(false);
    });

    test('should handle empty search results', async () => {
      const searchResults = await SearchService.searchTodos({ text: 'nonexistent' });
      expect(searchResults).toHaveLength(0);
    });

    test('should validate search criteria', async () => {
      await expect(SearchService.searchTodos({ priority: 'invalid' }))
        .rejects.toThrow('Invalid priority value');

      await expect(SearchService.searchTodos({ status: 'invalid' }))
        .rejects.toThrow('Invalid status value');
    });
  });

  describe('Performance Optimization', () => {
    test('should cache frequent searches', async () => {
      // Create test data
      for (let i = 0; i < 50; i++) {
        await Todo.create({
          title: `Searchable Task ${i}`,
          description: `Description with search keyword ${i}`,
          status: 'todo'
        });
      }

      // First search
      const startTime1 = Date.now();
      const results1 = await SearchService.searchTodos({ text: 'search' });
      const endTime1 = Date.now();

      // Second search (should be faster due to caching)
      const startTime2 = Date.now();
      const results2 = await SearchService.searchTodos({ text: 'search' });
      const endTime2 = Date.now();

      expect(results1).toEqual(results2);
      expect(endTime2 - startTime2).toBeLessThanOrEqual(endTime1 - startTime1);
    });

    test('should return results within performance threshold', async () => {
      // Create performance test data
      for (let i = 0; i < 100; i++) {
        await Todo.create({
          title: `Performance Task ${i}`,
          description: `Description for performance testing ${i}`,
          priority: ['low', 'medium', 'high'][i % 3],
          tags: [`tag${i % 10}`]
        });
      }

      const startTime = Date.now();
      const results = await SearchService.searchTodos({
        text: 'performance',
        priority: 'high',
        limit: 20
      });
      const endTime = Date.now();

      const responseTime = endTime - startTime;
      expect(responseTime).toBeLessThan(200); // 200ms threshold
      expect(results.length).toBeGreaterThan(0);
    });
  });
});

// @TEST:FILTER-SEARCH-004:SERVICE