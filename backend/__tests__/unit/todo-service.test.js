// @TEST:TODO-CRUD-001:SERVICE
/**
 * Unit Tests for Todo Service
 *
 * Test Coverage:
 * - Todo creation with validation
 * - Todo retrieval operations
 * - Todo update operations
 * - Todo deletion operations
 * - Error handling and edge cases
 * - Business logic validation
 *
 * @phase RED - Writing failing tests first
 */

import { MongoMemoryServer } from 'mongodb-memory-server';
import { connectDB, disconnectDB } from '../../src/config/database.js';
import Todo from '../../src/models/todo.model.js';
import TodoService from '../../src/services/todo-service.js';

describe('TodoService', () => {
  let mongoServer;
  let todoService;

  beforeAll(async () => {
    // Create in-memory MongoDB instance
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await connectDB(uri);
    todoService = new TodoService();
  });

  afterAll(async () => {
    // Clean up
    await disconnectDB();
    if (mongoServer) {
      await mongoServer.stop();
    }
  });

  afterEach(async () => {
    // Clear all collections after each test
    await Todo.deleteMany({});
    // Clear TodoService cache
    todoService._clearStatsCache();
  });

  describe('createTodo', () => {
    it('should create a todo with valid data', async () => {
      const todoData = {
        title: 'Test Todo',
        description: 'Test Description',
        priority: 'high'
      };

      const createdTodo = await todoService.createTodo(todoData);

      expect(createdTodo).toBeDefined();
      expect(createdTodo.title).toBe(todoData.title);
      expect(createdTodo.description).toBe(todoData.description);
      expect(createdTodo.priority).toBe(todoData.priority);
      expect(createdTodo.completed).toBe(false);
      expect(createdTodo.id).toBeDefined();
      expect(createdTodo.createdAt).toBeDefined();
      expect(createdTodo.updatedAt).toBeDefined();
    });

    it('should create todo with default priority when not specified', async () => {
      const todoData = {
        title: 'Test Todo'
      };

      const createdTodo = await todoService.createTodo(todoData);

      expect(createdTodo.priority).toBe('medium');
    });

    it('should throw error for empty title', async () => {
      const todoData = {
        title: '',
        priority: 'high'
      };

      await expect(todoService.createTodo(todoData))
        .rejects
        .toThrow('Title is required');
    });

    it('should throw error for title exceeding 200 characters', async () => {
      const todoData = {
        title: 'a'.repeat(201),
        priority: 'high'
      };

      await expect(todoService.createTodo(todoData))
        .rejects
        .toThrow('Title cannot exceed 200 characters');
    });

    it('should throw error for invalid priority', async () => {
      const todoData = {
        title: 'Test Todo',
        priority: 'urgent'
      };

      await expect(todoService.createTodo(todoData))
        .rejects
        .toThrow('Priority must be either low, medium, or high');
    });

    it('should throw error for description exceeding 1000 characters', async () => {
      const todoData = {
        title: 'Test Todo',
        description: 'a'.repeat(1001)
      };

      await expect(todoService.createTodo(todoData))
        .rejects
        .toThrow('Description cannot exceed 1000 characters');
    });
  });

  describe('getAllTodos', () => {
    beforeEach(async () => {
      const todos = [
        { title: 'High Priority 1', priority: 'high' },
        { title: 'Medium Priority 1', priority: 'medium' },
        { title: 'Low Priority 1', priority: 'low' },
        { title: 'High Priority 2', priority: 'high', completed: true }
      ];
      await Todo.insertMany(todos);
    });

    it('should return all todos sorted by priority and creation date', async () => {
      const todos = await todoService.getAllTodos();

      expect(todos).toHaveLength(4);
      expect(todos[0].priority).toBe('high');
      expect(todos[1].priority).toBe('high');
      expect(todos[2].priority).toBe('medium');
      expect(todos[3].priority).toBe('low');
    });

    it('should return empty array when no todos exist', async () => {
      await Todo.deleteMany({});
      const todos = await todoService.getAllTodos();

      expect(todos).toHaveLength(0);
    });
  });

  describe('getTodoById', () => {
    let testTodo;

    beforeEach(async () => {
      testTodo = await Todo.create({
        title: 'Test Todo',
        description: 'Test Description',
        priority: 'high'
      });
    });

    it('should return todo by valid ID', async () => {
      const foundTodo = await todoService.getTodoById(testTodo.id);

      expect(foundTodo).toBeDefined();
      expect(foundTodo.id).toBe(testTodo.id.toString());
      expect(foundTodo.title).toBe(testTodo.title);
    });

    it('should return null for non-existent ID', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const foundTodo = await todoService.getTodoById(fakeId);

      expect(foundTodo).toBeNull();
    });

    it('should throw error for invalid ID format', async () => {
      const invalidId = 'invalid-id';

      await expect(todoService.getTodoById(invalidId))
        .rejects
        .toThrow('Invalid todo ID format');
    });
  });

  describe('updateTodo', () => {
    let testTodo;

    beforeEach(async () => {
      testTodo = await Todo.create({
        title: 'Original Title',
        description: 'Original Description',
        priority: 'medium'
      });
    });

    it('should update todo with valid data', async () => {
      const updateData = {
        title: 'Updated Title',
        priority: 'high'
      };

      const updatedTodo = await todoService.updateTodo(testTodo.id, updateData);

      expect(updatedTodo.title).toBe(updateData.title);
      expect(updatedTodo.priority).toBe(updateData.priority);
      expect(updatedTodo.description).toBe('Original Description'); // unchanged
      expect(updatedTodo.updatedAt.getTime()).toBeGreaterThan(testTodo.updatedAt.getTime());
    });

    it('should return null when updating non-existent todo', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const updateData = { title: 'Updated Title' };

      const result = await todoService.updateTodo(fakeId, updateData);

      expect(result).toBeNull();
    });

    it('should throw error for invalid update data', async () => {
      const updateData = {
        title: '', // invalid
        priority: 'urgent' // invalid
      };

      await expect(todoService.updateTodo(testTodo.id, updateData))
        .rejects
        .toThrow();
    });
  });

  describe('deleteTodo', () => {
    let testTodo;

    beforeEach(async () => {
      testTodo = await Todo.create({
        title: 'Test Todo',
        priority: 'high'
      });
    });

    it('should delete existing todo', async () => {
      const result = await todoService.deleteTodo(testTodo.id);

      expect(result).toBe(true);

      const deletedTodo = await Todo.findById(testTodo.id);
      expect(deletedTodo).toBeNull();
    });

    it('should return false when deleting non-existent todo', async () => {
      const fakeId = '507f1f77bcf86cd799439011';

      const result = await todoService.deleteTodo(fakeId);

      expect(result).toBe(false);
    });

    it('should throw error for invalid ID format', async () => {
      const invalidId = 'invalid-id';

      await expect(todoService.deleteTodo(invalidId))
        .rejects
        .toThrow('Invalid todo ID format');
    });
  });

  describe('getTodosByStatus', () => {
    beforeEach(async () => {
      const todos = [
        { title: 'Completed 1', priority: 'high', completed: true },
        { title: 'Completed 2', priority: 'medium', completed: true },
        { title: 'Incomplete 1', priority: 'low', completed: false },
        { title: 'Incomplete 2', priority: 'high', completed: false }
      ];
      await Todo.insertMany(todos);
    });

    it('should return only completed todos', async () => {
      const completedTodos = await todoService.getTodosByStatus(true);

      expect(completedTodos).toHaveLength(2);
      expect(completedTodos.every(todo => todo.completed)).toBe(true);
    });

    it('should return only incomplete todos', async () => {
      const incompleteTodos = await todoService.getTodosByStatus(false);

      expect(incompleteTodos).toHaveLength(2);
      expect(incompleteTodos.every(todo => !todo.completed)).toBe(true);
    });
  });

  describe('getTodosByPriority', () => {
    beforeEach(async () => {
      const todos = [
        { title: 'High 1', priority: 'high' },
        { title: 'High 2', priority: 'high' },
        { title: 'Medium 1', priority: 'medium' },
        { title: 'Low 1', priority: 'low' }
      ];
      await Todo.insertMany(todos);
    });

    it('should return todos with specified priority', async () => {
      const highPriorityTodos = await todoService.getTodosByPriority('high');

      expect(highPriorityTodos).toHaveLength(2);
      expect(highPriorityTodos.every(todo => todo.priority === 'high')).toBe(true);
    });

    it('should return empty array for priority with no todos', async () => {
      const todos = await todoService.getTodosByPriority('medium');

      expect(todos).toHaveLength(1);
    });
  });

  describe('getTodoStats', () => {
    beforeEach(async () => {
      const todos = [
        { title: 'High Complete', priority: 'high', completed: true },
        { title: 'High Incomplete', priority: 'high', completed: false },
        { title: 'Medium Complete', priority: 'medium', completed: true },
        { title: 'Low Incomplete', priority: 'low', completed: false }
      ];
      await Todo.insertMany(todos);
    });

    it('should return accurate statistics', async () => {
      const stats = await todoService.getTodoStats();

      expect(stats.total).toBe(4);
      expect(stats.completed).toBe(2);
      expect(stats.incomplete).toBe(2);
      expect(stats.byPriority.high).toBe(2);
      expect(stats.byPriority.medium).toBe(1);
      expect(stats.byPriority.low).toBe(1);
    });

    it('should return zero stats for empty collection', async () => {
      await Todo.deleteMany({});
      const stats = await todoService.getTodoStats();

      expect(stats.total).toBe(0);
      expect(stats.completed).toBe(0);
      expect(stats.incomplete).toBe(0);
      expect(stats.byPriority.high).toBe(0);
      expect(stats.byPriority.medium).toBe(0);
      expect(stats.byPriority.low).toBe(0);
    });
  });

  describe('toggleTodoStatus', () => {
    let testTodo;

    beforeEach(async () => {
      testTodo = await Todo.create({
        title: 'Test Todo',
        priority: 'high',
        completed: false
      });
    });

    it('should mark incomplete todo as completed', async () => {
      const updatedTodo = await todoService.toggleTodoStatus(testTodo.id);

      expect(updatedTodo.completed).toBe(true);
      expect(updatedTodo.updatedAt.getTime()).toBeGreaterThan(testTodo.updatedAt.getTime());
    });

    it('should mark completed todo as incomplete', async () => {
      testTodo.completed = true;
      await testTodo.save();

      const updatedTodo = await todoService.toggleTodoStatus(testTodo.id);

      expect(updatedTodo.completed).toBe(false);
    });

    it('should return null for non-existent todo', async () => {
      const fakeId = '507f1f77bcf86cd799439011';

      const result = await todoService.toggleTodoStatus(fakeId);

      expect(result).toBeNull();
    });
  });
});