// @TEST:TODO-CRUD-001:API
/**
 * Integration Tests for Todo API
 *
 * Test Coverage:
 * - POST /api/todos (Create)
 * - GET /api/todos (Read All)
 * - GET /api/todos/:id (Read One)
 * - PUT /api/todos/:id (Update)
 * - DELETE /api/todos/:id (Delete)
 * - Error handling and validation
 * - API response formats
 *
 * @phase RED - Writing failing tests first
 */

import request from 'supertest';
import express from 'express';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { connectDB, disconnectDB } from '../../src/config/database.js';
import Todo from '../../src/models/todo.model.js';

describe('Todo API Integration', () => {
  let app;
  let mongoServer;

  beforeAll(async () => {
    // Create in-memory MongoDB instance
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await connectDB(uri);

    // Import and use the created app
    const createApp = (await import('../../src/app.js')).default;
    app = createApp();
  });

  afterAll(async () => {
    // Clean up
    await disconnectDB();
    if (mongoServer) {
      await mongoServer.stop();
    }
  });

  beforeEach(async () => {
    // Clear all collections before each test
    await Todo.deleteMany({});
  });

  describe('Health Check', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('POST /api/todos', () => {
    it('should create a new todo with valid data', async () => {
      const todoData = {
        title: 'Test Todo',
        description: 'Test Description',
        priority: 'high'
      };

      const response = await request(app)
        .post('/api/todos')
        .send(todoData)
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('message', 'Todo created successfully');

      const todo = response.body.data;
      expect(todo).toHaveProperty('id');
      expect(todo).toHaveProperty('title', todoData.title);
      expect(todo).toHaveProperty('description', todoData.description);
      expect(todo).toHaveProperty('priority', todoData.priority);
      expect(todo).toHaveProperty('completed', false);
      expect(todo).toHaveProperty('createdAt');
      expect(todo).toHaveProperty('updatedAt');
    });

    it('should create todo with default priority when not specified', async () => {
      const todoData = {
        title: 'Test Todo'
      };

      const response = await request(app)
        .post('/api/todos')
        .send(todoData)
        .expect(201);

      expect(response.body.data.priority).toBe('medium');
    });

    it('should return 400 for empty title', async () => {
      const todoData = {
        title: '',
        priority: 'high'
      };

      const response = await request(app)
        .post('/api/todos')
        .send(todoData)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Validation failed');
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Title');
    });

    it('should return 400 for title exceeding 200 characters', async () => {
      const todoData = {
        title: 'a'.repeat(201),
        priority: 'high'
      };

      const response = await request(app)
        .post('/api/todos')
        .send(todoData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.message).toContain('200 characters');
    });

    it('should return 400 for invalid priority', async () => {
      const todoData = {
        title: 'Test Todo',
        priority: 'urgent'
      };

      const response = await request(app)
        .post('/api/todos')
        .send(todoData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.message).toContain('Priority');
    });

    it('should return 400 for missing title', async () => {
      const todoData = {
        description: 'Test Description',
        priority: 'high'
      };

      const response = await request(app)
        .post('/api/todos')
        .send(todoData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 for invalid JSON', async () => {
      const response = await request(app)
        .post('/api/todos')
        .send('invalid json')
        .set('Content-Type', 'application/json')
        .expect(400);
    });
  });

  describe('GET /api/todos', () => {
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
      const response = await request(app)
        .get('/api/todos')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('todos');
      expect(response.body.data).toHaveProperty('total');

      const todos = response.body.data.todos;
      expect(Array.isArray(todos)).toBe(true);
      expect(todos).toHaveLength(4);
      expect(response.body.data.total).toBe(4);

      // Check sorting: high -> medium -> low
      expect(todos[0].priority).toBe('high');
      expect(todos[1].priority).toBe('high');
      expect(todos[2].priority).toBe('medium');
      expect(todos[3].priority).toBe('low');
    });

    it('should return empty array when no todos exist', async () => {
      await Todo.deleteMany({});

      const response = await request(app)
        .get('/api/todos')
        .expect(200);

      expect(response.body.data.todos).toHaveLength(0);
      expect(response.body.data.total).toBe(0);
    });
  });

  describe('GET /api/todos/:id', () => {
    let testTodo;

    beforeEach(async () => {
      testTodo = await Todo.create({
        title: 'Test Todo',
        description: 'Test Description',
        priority: 'high'
      });
    });

    it('should return todo by valid ID', async () => {
      const response = await request(app)
        .get(`/api/todos/${testTodo.id}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');

      const todo = response.body.data;
      expect(todo).toHaveProperty('id', testTodo.id.toString());
      expect(todo).toHaveProperty('title', testTodo.title);
      expect(todo).toHaveProperty('description', testTodo.description);
      expect(todo).toHaveProperty('priority', testTodo.priority);
      expect(todo).toHaveProperty('completed', false);
    });

    it('should return 404 for non-existent ID', async () => {
      const fakeId = '507f1f77bcf86cd799439011';

      const response = await request(app)
        .get(`/api/todos/${fakeId}`)
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Not Found');
    });

    it('should return 400 for invalid ID format', async () => {
      const invalidId = 'invalid-id';

      const response = await request(app)
        .get(`/api/todos/${invalidId}`)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Invalid ID');
    });
  });

  describe('PUT /api/todos/:id', () => {
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

      const response = await request(app)
        .put(`/api/todos/${testTodo.id}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('message', 'Todo updated successfully');

      const todo = response.body.data;
      expect(todo).toHaveProperty('id', testTodo.id.toString());
      expect(todo).toHaveProperty('title', updateData.title);
      expect(todo).toHaveProperty('priority', updateData.priority);
      expect(todo).toHaveProperty('description', 'Original Description'); // unchanged
      expect(new Date(todo.updatedAt).getTime())
        .toBeGreaterThan(new Date(testTodo.updatedAt).getTime());
    });

    it('should return 404 for non-existent todo', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const updateData = { title: 'Updated Title' };

      const response = await request(app)
        .put(`/api/todos/${fakeId}`)
        .send(updateData)
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Not Found');
    });

    it('should return 400 for invalid update data', async () => {
      const updateData = {
        title: '', // invalid
        priority: 'urgent' // invalid
      };

      const response = await request(app)
        .put(`/api/todos/${testTodo.id}`)
        .send(updateData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 for invalid ID format', async () => {
      const invalidId = 'invalid-id';
      const updateData = { title: 'Updated Title' };

      const response = await request(app)
        .put(`/api/todos/${invalidId}`)
        .send(updateData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Invalid ID');
    });
  });

  describe('DELETE /api/todos/:id', () => {
    let testTodo;

    beforeEach(async () => {
      testTodo = await Todo.create({
        title: 'Test Todo',
        priority: 'high'
      });
    });

    it('should delete existing todo', async () => {
      await request(app)
        .delete(`/api/todos/${testTodo.id}`)
        .expect(204);

      // Verify todo is deleted
      const deletedTodo = await Todo.findById(testTodo.id);
      expect(deletedTodo).toBeNull();
    });

    it('should return 404 for non-existent todo', async () => {
      const fakeId = '507f1f77bcf86cd799439011';

      const response = await request(app)
        .delete(`/api/todos/${fakeId}`)
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Not Found');
    });

    it('should return 400 for invalid ID format', async () => {
      const invalidId = 'invalid-id';

      const response = await request(app)
        .delete(`/api/todos/${invalidId}`)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Invalid ID');
    });
  });

  describe('Additional API Endpoints', () => {
    beforeEach(async () => {
      const todos = [
        { title: 'Completed 1', priority: 'high', completed: true },
        { title: 'Completed 2', priority: 'medium', completed: true },
        { title: 'Incomplete 1', priority: 'low', completed: false },
        { title: 'Incomplete 2', priority: 'high', completed: false }
      ];
      await Todo.insertMany(todos);
    });

    it('should GET /api/todos/stats return statistics', async () => {
      const response = await request(app)
        .get('/api/todos/stats')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');

      const stats = response.body.data;
      expect(stats).toHaveProperty('total', 4);
      expect(stats).toHaveProperty('completed', 2);
      expect(stats).toHaveProperty('incomplete', 2);
      expect(stats).toHaveProperty('byPriority');
      expect(stats.byPriority).toHaveProperty('high', 2);
      expect(stats.byPriority).toHaveProperty('medium', 1);
      expect(stats.byPriority).toHaveProperty('low', 1);
      expect(stats).toHaveProperty('completionRate', 50);
    });

    it('should PATCH /api/todos/:id/toggle toggle completion status', async () => {
      const todo = await Todo.findOne({ completed: false });

      const response = await request(app)
        .patch(`/api/todos/${todo.id}/toggle`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('message');

      const updatedTodo = response.body.data;
      expect(updatedTodo.completed).toBe(true);
      expect(new Date(updatedTodo.updatedAt).getTime())
        .toBeGreaterThan(new Date(todo.updatedAt).getTime());
    });

    it('should GET /api/todos/search?q=query search todos', async () => {
      const response = await request(app)
        .get('/api/todos/search?q=Completed')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('meta');

      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(2);
      expect(response.body.data[0].title).toContain('Completed');
      expect(response.body.meta.query).toBe('Completed');
      expect(response.body.meta.count).toBe(2);
    });
  });

  describe('Error Handling', () => {
    it('should handle 404 for unknown routes', async () => {
      const response = await request(app)
        .get('/api/unknown')
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Not Found');
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('not found');
    });

    it('should handle unsupported methods', async () => {
      const response = await request(app)
        .patch('/api/todos')
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Not Found');
    });

    it('should handle malformed JSON', async () => {
      const response = await request(app)
        .post('/api/todos')
        .set('Content-Type', 'application/json')
        .send('{"invalid": json}')
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });
});