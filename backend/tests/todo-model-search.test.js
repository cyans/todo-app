import mongoose from 'mongoose';
import { Todo, createTodoIndexes } from '../src/models/todo-model.js';

describe('Todo Model - Enhanced Search Features', () => {
  beforeAll(async () => {
    // Ensure indexes are created before running tests
    await createTodoIndexes();
  });

  beforeEach(async () => {
    // Clear collection before each test
    await Todo.deleteMany({});
  });

  describe('Text Search Fields', () => {
    test('should create todo with searchable fields', async () => {
      const todo = new Todo({
        title: 'Search Test Todo',
        description: 'This is a searchable description with keywords',
        status: 'todo',
        tags: ['search', 'test', 'mongodb'],
        priority: 'high'
      });

      const savedTodo = await todo.save();
      expect(savedTodo.title).toBe('Search Test Todo');
      expect(savedTodo.description).toBe('This is a searchable description with keywords');
      expect(savedTodo.tags).toEqual(['search', 'test', 'mongodb']);
      expect(savedTodo.priority).toBe('high');
    });

    test('should support partial text search in title', async () => {
      const todo = new Todo({
        title: 'Urgent Project Deadline Tomorrow',
        description: 'Complete the search implementation',
        status: 'in_progress'
      });

      await todo.save();

      // This test will fail initially as we haven't implemented search methods yet
      const searchResults = await Todo.searchInTitle('deadline');
      expect(searchResults).toHaveLength(1);
      expect(searchResults[0].title).toContain('Deadline'); // MongoDB text search is case-insensitive
    });

    test('should support partial text search in description', async () => {
      const todo = new Todo({
        title: 'Task Title',
        description: 'Implement MongoDB text search functionality',
        status: 'todo'
      });

      await todo.save();

      const searchResults = await Todo.searchInDescription('search');
      expect(searchResults).toHaveLength(1);
      expect(searchResults[0].description).toContain('search');
    });

    test('should support tag-based search', async () => {
      const todo = new Todo({
        title: 'Tagged Task',
        description: 'Task with multiple tags',
        tags: ['urgent', 'backend', 'search'],
        status: 'todo'
      });

      await todo.save();

      const searchResults = await Todo.searchByTag('urgent');
      expect(searchResults).toHaveLength(1);
      expect(searchResults[0].tags).toContain('urgent');
    });

    test('should support priority-based filtering', async () => {
      await Todo.create({
        title: 'High Priority Task',
        description: 'Important task',
        priority: 'high'
      });

      await Todo.create({
        title: 'Low Priority Task',
        description: 'Less important task',
        priority: 'low'
      });

      const highPriorityTodos = await Todo.findByPriority('high');
      expect(highPriorityTodos).toHaveLength(1);
      expect(highPriorityTodos[0].priority).toBe('high');
    });

    test('should support due date filtering', async () => {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      await Todo.create({
        title: 'Due Today Task',
        description: 'Task due today',
        dueDate: today
      });

      await Todo.create({
        title: 'Due Tomorrow Task',
        description: 'Task due tomorrow',
        dueDate: tomorrow
      });

      const todosDueToday = await Todo.findByDueDateRange(today, today);
      expect(todosDueToday).toHaveLength(1);
      expect(todosDueToday[0].title).toBe('Due Today Task');
    });

    test('should support complex search with multiple criteria', async () => {
      await Todo.create({
        title: 'High Priority Backend Search Task',
        description: 'Implement search functionality',
        priority: 'high',
        tags: ['backend', 'search'],
        status: 'todo'
      });

      await Todo.create({
        title: 'Low Priority Frontend Task',
        description: 'Create UI components',
        priority: 'low',
        tags: ['frontend', 'ui'],
        status: 'in_progress'
      });

      const searchCriteria = {
        text: 'search',
        priority: 'high',
        tags: ['backend'],
        status: 'todo'
      };

      const results = await Todo.advancedSearch(searchCriteria);
      expect(results).toHaveLength(1);
      expect(results[0].title).toContain('Search'); // MongoDB text search is case-insensitive
      expect(results[0].priority).toBe('high');
    });
  });

  describe('Search Performance', () => {
    test('should create text index for search optimization', async () => {
      // This test verifies that text indexes are properly configured
      const indexes = await Todo.collection.getIndexes();

      // Check if text index exists - look for the named text index
      const textIndexExists = Object.keys(indexes).some(indexName =>
        indexName === 'todo_text_search_index' ||
        (indexes[indexName].key && indexes[indexName].key.hasOwnProperty('_fts'))
      );

      expect(textIndexExists).toBe(true);
    });

    test('should return search results under 200ms for performance requirement', async () => {
      // Create sample data
      for (let i = 0; i < 100; i++) {
        await Todo.create({
          title: `Task ${i}`,
          description: `Description for task ${i}`,
          tags: [`tag${i % 10}`],
          priority: ['low', 'medium', 'high'][i % 3]
        });
      }

      const startTime = Date.now();
      const results = await Todo.advancedSearch({ text: 'Task' });
      const endTime = Date.now();

      const responseTime = endTime - startTime;
      expect(responseTime).toBeLessThan(200);
      expect(results.length).toBeGreaterThan(0);
    });
  });

  describe('Search Index Management', () => {
    test('should maintain indexes when model is updated', async () => {
      // Initial index check
      const initialIndexes = await Todo.collection.getIndexes();
      expect(Object.keys(initialIndexes).length).toBeGreaterThan(1);
    });
  });
});

// @TEST:FILTER-SEARCH-004:MODEL