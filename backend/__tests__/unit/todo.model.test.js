// @TEST:TODO-CRUD-001:DATA
/**
 * Unit Tests for Todo Model
 *
 * Test Coverage:
 * - Todo schema validation
 * - Required fields validation
 * - Default values
 * - Data types validation
 * - Model CRUD operations
 *
 * @phase RED - Writing failing tests first
 */

import { MongoMemoryServer } from 'mongodb-memory-server';
import { connectDB, disconnectDB } from '../../src/config/database.js';
import Todo from '../../src/models/todo.model.js';

describe('Todo Model', () => {
  let mongoServer;

  beforeAll(async () => {
    // Create in-memory MongoDB instance
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await connectDB(uri);
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
  });

  describe('Schema Validation', () => {
    it('should create a valid todo with all required fields', async () => {
      const todoData = {
        title: 'Test Todo',
        description: 'Test Description',
      };

      const todo = new Todo(todoData);
      const savedTodo = await todo.save();

      expect(savedTodo._id).toBeDefined();
      expect(savedTodo.title).toBe(todoData.title);
      expect(savedTodo.description).toBe(todoData.description);
      expect(savedTodo.completed).toBe(false); // default value
      expect(savedTodo.createdAt).toBeDefined();
      expect(savedTodo.updatedAt).toBeDefined();
    });

    it('should fail to create todo without title', async () => {
      const todoData = {
        description: 'Test Description',
      };

      const todo = new Todo(todoData);

      await expect(todo.save()).rejects.toThrow();
    });

    it('should create todo without description (optional field)', async () => {
      const todoData = {
        title: 'Test Todo',
      };

      const todo = new Todo(todoData);
      const savedTodo = await todo.save();

      expect(savedTodo._id).toBeDefined();
      expect(savedTodo.title).toBe(todoData.title);
      expect(savedTodo.description).toBeUndefined();
      expect(savedTodo.completed).toBe(false);
    });

    it('should validate title length (max 200 characters)', async () => {
      const longTitle = 'a'.repeat(201);
      const todoData = {
        title: longTitle,
      };

      const todo = new Todo(todoData);

      await expect(todo.save()).rejects.toThrow();
    });

    it('should validate completed field as boolean', async () => {
      const todoData = {
        title: 'Test Todo',
        completed: 'invalid', // should be boolean
      };

      const todo = new Todo(todoData);

      await expect(todo.save()).rejects.toThrow();
    });

    it('should set default value for completed field', async () => {
      const todoData = {
        title: 'Test Todo',
      };

      const todo = new Todo(todoData);
      const savedTodo = await todo.save();

      expect(savedTodo.completed).toBe(false);
    });

    it('should automatically set timestamps', async () => {
      const todoData = {
        title: 'Test Todo',
      };

      const todo = new Todo(todoData);
      const savedTodo = await todo.save();

      expect(savedTodo.createdAt).toBeInstanceOf(Date);
      expect(savedTodo.updatedAt).toBeInstanceOf(Date);
    });

    it('should update updatedAt timestamp on modification', async () => {
      const todoData = {
        title: 'Test Todo',
      };

      const todo = new Todo(todoData);
      const savedTodo = await todo.save();
      const originalUpdatedAt = savedTodo.updatedAt;

      // Wait a bit to ensure timestamp difference
      await new Promise((resolve) => setTimeout(resolve, 10));

      savedTodo.completed = true;
      const updatedTodo = await savedTodo.save();

      expect(updatedTodo.updatedAt.getTime()).toBeGreaterThan(
        originalUpdatedAt.getTime()
      );
    });

    // RED: Tests for priority field (will fail initially)
    it('should create todo with priority field', async () => {
      const todoData = {
        title: 'Test Todo',
        priority: 'high',
      };

      const todo = new Todo(todoData);
      const savedTodo = await todo.save();

      expect(savedTodo.priority).toBe('high');
    });

    it('should set default priority to medium when not specified', async () => {
      const todoData = {
        title: 'Test Todo',
      };

      const todo = new Todo(todoData);
      const savedTodo = await todo.save();

      expect(savedTodo.priority).toBe('medium');
    });

    it('should validate priority field values (low, medium, high)', async () => {
      const validPriorities = ['low', 'medium', 'high'];

      for (const priority of validPriorities) {
        const todoData = {
          title: 'Test Todo',
          priority,
        };

        const todo = new Todo(todoData);
        const savedTodo = await todo.save();

        expect(savedTodo.priority).toBe(priority);
      }
    });

    it('should reject invalid priority values', async () => {
      const todoData = {
        title: 'Test Todo',
        priority: 'urgent', // invalid value
      };

      const todo = new Todo(todoData);

      await expect(todo.save()).rejects.toThrow();
    });
  });

  describe('CRUD Operations', () => {
    it('should find todo by id', async () => {
      const todoData = {
        title: 'Test Todo',
        description: 'Test Description',
      };

      const todo = new Todo(todoData);
      const savedTodo = await todo.save();

      const foundTodo = await Todo.findById(savedTodo._id);

      expect(foundTodo).toBeDefined();
      expect(foundTodo.title).toBe(todoData.title);
    });

    it('should find all todos', async () => {
      const todos = [
        { title: 'Todo 1' },
        { title: 'Todo 2' },
        { title: 'Todo 3' },
      ];

      await Todo.insertMany(todos);

      const allTodos = await Todo.find();

      expect(allTodos).toHaveLength(3);
    });

    it('should update todo', async () => {
      const todoData = {
        title: 'Original Title',
      };

      const todo = new Todo(todoData);
      const savedTodo = await todo.save();

      savedTodo.title = 'Updated Title';
      savedTodo.completed = true;
      const updatedTodo = await savedTodo.save();

      expect(updatedTodo.title).toBe('Updated Title');
      expect(updatedTodo.completed).toBe(true);
    });

    it('should delete todo', async () => {
      const todoData = {
        title: 'Test Todo',
      };

      const todo = new Todo(todoData);
      const savedTodo = await todo.save();

      await Todo.findByIdAndDelete(savedTodo._id);

      const foundTodo = await Todo.findById(savedTodo._id);
      expect(foundTodo).toBeNull();
    });

    it('should find completed todos', async () => {
      const todos = [
        { title: 'Todo 1', completed: true },
        { title: 'Todo 2', completed: false },
        { title: 'Todo 3', completed: true },
      ];

      await Todo.insertMany(todos);

      const completedTodos = await Todo.find({ completed: true });

      expect(completedTodos).toHaveLength(2);
    });

    it('should find incomplete todos', async () => {
      const todos = [
        { title: 'Todo 1', completed: true },
        { title: 'Todo 2', completed: false },
        { title: 'Todo 3', completed: false },
      ];

      await Todo.insertMany(todos);

      const incompleteTodos = await Todo.find({ completed: false });

      expect(incompleteTodos).toHaveLength(2);
    });
  });

  describe('Instance Methods', () => {
    let testTodo;

    beforeEach(async () => {
      testTodo = new Todo({
        title: 'Test Todo',
        priority: 'high'
      });
      await testTodo.save();
    });

    it('should mark todo as completed', async () => {
      await testTodo.markAsCompleted();
      expect(testTodo.completed).toBe(true);
    });

    it('should mark todo as incomplete', async () => {
      testTodo.completed = true;
      await testTodo.markAsIncomplete();
      expect(testTodo.completed).toBe(false);
    });

    it('should update todo priority', async () => {
      await testTodo.updatePriority('low');
      expect(testTodo.priority).toBe('low');
    });

    it('should return todo summary', () => {
      const summary = testTodo.getSummary();

      expect(summary).toHaveProperty('id');
      expect(summary).toHaveProperty('title', 'Test Todo');
      expect(summary).toHaveProperty('priority', 'high');
      expect(summary).toHaveProperty('completed', false);
      expect(summary).toHaveProperty('createdAt');
      expect(summary).toHaveProperty('updatedAt');
    });
  });

  describe('Static Methods', () => {
    beforeEach(async () => {
      const todos = [
        { title: 'High Priority 1', priority: 'high', completed: false },
        { title: 'High Priority 2', priority: 'high', completed: true },
        { title: 'Medium Priority', priority: 'medium', completed: false },
        { title: 'Low Priority', priority: 'low', completed: false }
      ];
      await Todo.insertMany(todos);
    });

    it('should find todos sorted by priority and creation date', async () => {
      const todos = await Todo.findByPriority();
      const priorities = todos.map(todo => todo.priority);

      // Should be sorted: high -> medium -> low
      expect(priorities[0]).toBe('high');
      expect(priorities[1]).toBe('high');
      expect(priorities[2]).toBe('medium');
      expect(priorities[3]).toBe('low');
    });

    it('should find todos by completion status', async () => {
      const completedTodos = await Todo.findByStatus(true);
      const incompleteTodos = await Todo.findByStatus(false);

      expect(completedTodos).toHaveLength(1);
      expect(incompleteTodos).toHaveLength(3);
    });

    it('should return accurate statistics', async () => {
      const stats = await Todo.getStats();

      expect(stats.total).toBe(4);
      expect(stats.completed).toBe(1);
      expect(stats.incomplete).toBe(3);
      expect(stats.highPriority).toBe(2);
      expect(stats.mediumPriority).toBe(1);
      expect(stats.lowPriority).toBe(1);
    });

    it('should return zero stats for empty collection', async () => {
      await Todo.deleteMany({});
      const stats = await Todo.getStats();

      expect(stats.total).toBe(0);
      expect(stats.completed).toBe(0);
      expect(stats.incomplete).toBe(0);
      expect(stats.highPriority).toBe(0);
      expect(stats.mediumPriority).toBe(0);
      expect(stats.lowPriority).toBe(0);
    });
  });
});
