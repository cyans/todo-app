import mongoose from 'mongoose';
import { Todo } from '../src/models/todo-model.js';
import TodoService from '../src/services/todo-service.js';

// Mock Todo model methods
jest.mock('../src/models/todo-model.js');

describe('Todo Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Status Transition Logic', () => {
    test('should allow transition from todo to in_progress', async () => {
      const mockTodo = {
        _id: '123',
        title: 'Test Todo',
        status: 'todo',
        updateStatus: jest.fn().mockResolvedValue(true),
        save: jest.fn().mockResolvedValue(true),
        getValidTransitions: jest.fn().mockReturnValue(['in_progress', 'archived'])
      };

      Todo.findById = jest.fn().mockResolvedValue(mockTodo);

      const result = await TodoService.updateTodoStatus('123', 'in_progress');

      expect(mockTodo.updateStatus).toHaveBeenCalledWith('in_progress', undefined, '');
      expect(result).toBe(true);
    });

    test('should reject invalid status transition from todo to done', async () => {
      const mockTodo = {
        _id: '123',
        title: 'Test Todo',
        status: 'todo',
        getValidTransitions: jest.fn().mockReturnValue(['in_progress', 'archived'])
      };

      Todo.findById = jest.fn().mockResolvedValue(mockTodo);

      // This test should throw an error for invalid transition
      await expect(TodoService.updateTodoStatus('123', 'done'))
        .rejects
        .toThrow('Invalid status transition');
    });

    test('should allow transition from in_progress to review', async () => {
      const mockTodo = {
        _id: '123',
        title: 'Test Todo',
        status: 'in_progress',
        updateStatus: jest.fn().mockResolvedValue(true),
        getValidTransitions: jest.fn().mockReturnValue(['todo', 'review', 'archived'])
      };

      Todo.findById = jest.fn().mockResolvedValue(mockTodo);

      const result = await TodoService.updateTodoStatus('123', 'review', 'user123', 'Ready for review');

      expect(mockTodo.updateStatus).toHaveBeenCalledWith('review', 'user123', 'Ready for review');
      expect(result).toBe(true);
    });

    test('should allow transition from review to done', async () => {
      const mockTodo = {
        _id: '123',
        title: 'Test Todo',
        status: 'review',
        updateStatus: jest.fn().mockResolvedValue(true),
        getValidTransitions: jest.fn().mockReturnValue(['in_progress', 'done', 'todo'])
      };

      Todo.findById = jest.fn().mockResolvedValue(mockTodo);

      const result = await TodoService.updateTodoStatus('123', 'done');

      expect(mockTodo.updateStatus).toHaveBeenCalledWith('done', undefined, '');
      expect(result).toBe(true);
    });

    test('should throw error when todo not found', async () => {
      Todo.findById = jest.fn().mockResolvedValue(null);

      await expect(TodoService.updateTodoStatus('999', 'in_progress'))
        .rejects
        .toThrow('Todo not found');
    });
  });

  describe('Create Todo with Initial Status', () => {
    test('should create todo with default status', async () => {
      const todoData = {
        title: 'New Todo',
        description: 'Description'
      };

      const mockCreatedTodo = {
        _id: '456',
        title: todoData.title,
        description: todoData.description,
        status: 'todo',
        statusHistory: [{
          status: 'todo',
          changedAt: new Date(),
          reason: 'Initial creation'
        }]
      };

      Todo.create = jest.fn().mockResolvedValue(mockCreatedTodo);

      const result = await TodoService.createTodo(todoData);

      expect(Todo.create).toHaveBeenCalledWith({
        ...todoData,
        status: 'todo'
      });
      expect(result.status).toBe('todo');
    });

    test('should create todo with specified status', async () => {
      const todoData = {
        title: 'New Todo',
        description: 'Description',
        status: 'in_progress'
      };

      const mockCreatedTodo = {
        _id: '456',
        ...todoData,
        statusHistory: [{
          status: 'in_progress',
          changedAt: new Date(),
          reason: 'Initial creation'
        }]
      };

      Todo.create = jest.fn().mockResolvedValue(mockCreatedTodo);

      const result = await TodoService.createTodo(todoData);

      expect(Todo.create).toHaveBeenCalledWith(todoData);
      expect(result.status).toBe('in_progress');
    });
  });

  describe('Get Todos by Status', () => {
    test('should return todos filtered by status', async () => {
      const mockTodos = [
        { _id: '1', title: 'Todo 1', status: 'todo' },
        { _id: '2', title: 'Todo 2', status: 'todo' }
      ];

      Todo.findByStatus = jest.fn().mockResolvedValue(mockTodos);

      const result = await TodoService.getTodosByStatus('todo');

      expect(Todo.findByStatus).toHaveBeenCalledWith('todo');
      expect(result).toHaveLength(2);
      expect(result[0].status).toBe('todo');
    });

    test('should return empty array for status with no todos', async () => {
      Todo.findByStatus = jest.fn().mockResolvedValue([]);

      const result = await TodoService.getTodosByStatus('done');

      expect(Todo.findByStatus).toHaveBeenCalledWith('done');
      expect(result).toHaveLength(0);
    });
  });
});

// @TEST:TODO-STATUS-SERVICE-001