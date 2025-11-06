import request from 'supertest';
import app from '../server.js';
import TodoService from '../src/services/todo-service.js';

// Mock TodoService
jest.mock('../src/services/todo-service.js');

describe('Todo Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('PUT /api/v1/todos/:id/status', () => {
    test('should update todo status successfully', async () => {
      const mockTodo = {
        _id: '123',
        title: 'Test Todo',
        status: 'in_progress',
        statusHistory: [
          { status: 'todo', changedAt: new Date() },
          { status: 'in_progress', changedAt: new Date(), changedBy: 'user123', reason: 'Started working' }
        ]
      };

      TodoService.updateTodoStatus = jest.fn().mockResolvedValue(true);
      TodoService.getTodoById = jest.fn().mockResolvedValue(mockTodo);

      const response = await request(app)
        .put('/api/v1/todos/123/status')
        .send({ status: 'in_progress', changedBy: 'user123', reason: 'Started working' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Status updated successfully');
      expect(TodoService.updateTodoStatus).toHaveBeenCalledWith('123', 'in_progress', 'user123', 'Started working');
    });

    test('should return 400 for invalid status', async () => {
      const response = await request(app)
        .put('/api/v1/todos/123/status')
        .send({ status: 'invalid_status' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Invalid status');
    });

    test('should return 404 for non-existent todo', async () => {
      TodoService.updateTodoStatus = jest.fn().mockRejectedValue(new Error('Todo not found'));

      const response = await request(app)
        .put('/api/v1/todos/999/status')
        .send({ status: 'done' })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Todo not found');
    });

    test('should return 400 for invalid status transition', async () => {
      TodoService.updateTodoStatus = jest.fn().mockRejectedValue(new Error('Invalid status transition'));

      const response = await request(app)
        .put('/api/v1/todos/123/status')
        .send({ status: 'done' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Invalid status transition');
    });
  });

  describe('POST /api/v1/todos', () => {
    test('should create a new todo successfully', async () => {
      const newTodo = {
        title: 'New Task',
        description: 'Task description',
        status: 'todo'
      };

      const createdTodo = {
        _id: '456',
        ...newTodo,
        createdAt: new Date(),
        statusHistory: [{ status: 'todo', changedAt: new Date(), reason: 'Initial creation' }]
      };

      TodoService.createTodo = jest.fn().mockResolvedValue(createdTodo);

      const response = await request(app)
        .post('/api/v1/todos')
        .send(newTodo)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(newTodo.title);
      expect(response.body.data.status).toBe(newTodo.status);
      expect(TodoService.createTodo).toHaveBeenCalledWith({
        title: 'New Task',
        description: 'Task description',
        status: 'todo',
        priority: undefined,
        dueDate: undefined,
        tags: []
      });
    });

    test('should create todo with default status', async () => {
      const todoData = {
        title: 'Task without status',
        description: 'Description'
      };

      const createdTodo = {
        _id: '456',
        ...todoData,
        status: 'todo',
        createdAt: new Date()
      };

      TodoService.createTodo = jest.fn().mockResolvedValue(createdTodo);

      const response = await request(app)
        .post('/api/v1/todos')
        .send(todoData)
        .expect(201);

      expect(response.body.data.status).toBe('todo');
    });

    test('should return 400 for missing title', async () => {
      const response = await request(app)
        .post('/api/v1/todos')
        .send({ description: 'No title provided' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Title is required');
    });
  });

  describe('GET /api/v1/todos', () => {
    test('should get all todos', async () => {
      const mockTodos = [
        { _id: '1', title: 'Todo 1', status: 'todo' },
        { _id: '2', title: 'Todo 2', status: 'done' }
      ];

      TodoService.getAllTodos = jest.fn().mockResolvedValue(mockTodos);

      const response = await request(app)
        .get('/api/v1/todos')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0].title).toBe('Todo 1');
    });

    test('should get todos filtered by status', async () => {
      const mockTodos = [
        { _id: '1', title: 'Todo 1', status: 'todo' }
      ];

      TodoService.getTodosByStatus = jest.fn().mockResolvedValue(mockTodos);

      const response = await request(app)
        .get('/api/v1/todos?status=todo')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].status).toBe('todo');
      expect(TodoService.getTodosByStatus).toHaveBeenCalledWith('todo');
    });

    test('should return 400 for invalid status filter', async () => {
      const response = await request(app)
        .get('/api/v1/todos?status=invalid_status')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Invalid status');
    });
  });

  describe('GET /api/v1/todos/:id', () => {
    test('should get a single todo by ID', async () => {
      const mockTodo = {
        _id: '123',
        title: 'Test Todo',
        status: 'in_progress',
        statusHistory: [{ status: 'todo', changedAt: new Date() }]
      };

      TodoService.getTodoById = jest.fn().mockResolvedValue(mockTodo);

      const response = await request(app)
        .get('/api/v1/todos/123')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('Test Todo');
      expect(TodoService.getTodoById).toHaveBeenCalledWith('123');
    });

    test('should return 404 for non-existent todo', async () => {
      TodoService.getTodoById = jest.fn().mockRejectedValue(new Error('Todo not found'));

      const response = await request(app)
        .get('/api/v1/todos/999')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Todo not found');
    });
  });

  describe('GET /api/v1/todos/:id/history', () => {
    test('should get todo status history', async () => {
      const mockHistory = {
        currentStatus: 'in_progress',
        statusHistory: [
          { status: 'todo', changedAt: new Date(), reason: 'Initial creation' },
          { status: 'in_progress', changedAt: new Date(), changedBy: 'user123', reason: 'Started work' }
        ],
        validTransitions: ['todo', 'review', 'archived']
      };

      TodoService.getTodoStatusHistory = jest.fn().mockResolvedValue(mockHistory);

      const response = await request(app)
        .get('/api/v1/todos/123/history')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.currentStatus).toBe('in_progress');
      expect(response.body.data.statusHistory).toHaveLength(2);
      expect(TodoService.getTodoStatusHistory).toHaveBeenCalledWith('123');
    });
  });

  describe('GET /api/v1/todos/stats', () => {
    test('should get todo statistics', async () => {
      const mockStats = {
        byStatus: {
          todo: 5,
          in_progress: 3,
          review: 2,
          done: 10,
          archived: 1
        },
        total: 21
      };

      TodoService.getTodoStatistics = jest.fn().mockResolvedValue(mockStats);

      const response = await request(app)
        .get('/api/v1/todos/stats')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.total).toBe(21);
      expect(response.body.data.byStatus.todo).toBe(5);
      expect(TodoService.getTodoStatistics).toHaveBeenCalled();
    });
  });
});

// @TEST:TODO-STATUS-API-001